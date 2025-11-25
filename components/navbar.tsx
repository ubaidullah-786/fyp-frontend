"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
import { Settings } from "lucide-react";
import { getToken, onTokenChange, onProjectsChange, getUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

const navItems = [
  { name: "Dashboard", path: "/dashboard", showWhen: "loggedInWithProjects" },
  { name: "Projects", path: "/projects", showWhen: "loggedInWithProjects" },
  { name: "Teams", path: "/teams", showWhen: "loggedIn" },
  { name: "Upload", path: "/upload", showWhen: "loggedIn" },
];

export function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasProjects, setHasProjects] = useState(false);
  const [projectsChecked, setProjectsChecked] = useState(false);
  const [underlineStyle, setUnderlineStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const navRef = useRef<HTMLDivElement>(null);

  // Check if we're on a report page or code editor page
  const isReportPage = pathname?.startsWith("/report/");
  const isCodeEditorPage = pathname?.startsWith("/code-editor/");
  const isReportSection = isReportPage || isCodeEditorPage;

  // Extract project ID from path
  const projectId = isReportPage
    ? pathname.split("/report/")[1]
    : isCodeEditorPage
    ? pathname.split("/code-editor/")[1]
    : null;

  const activeTab = searchParams?.get("tab") || "overview";

  // Get current user and check ownership for Settings tab
  const currentUser = getUser();
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (isReportSection && currentUser && projectId) {
      checkProjectOwnership(projectId);
    }
  }, [isReportSection, projectId, currentUser]);

  const checkProjectOwnership = async (projectId: string) => {
    try {
      const response = await apiFetch<any>(
        `/api/v1/projects/get-project/${projectId}`,
        { auth: true }
      );
      if (response.ok && response.data) {
        const projectData =
          response.data.data?.project || response.data.project || response.data;
        if (projectData && currentUser?.id) {
          // Handle owner comparison - owner might be ObjectId or populated object
          const ownerId =
            typeof projectData.owner === "string"
              ? projectData.owner
              : projectData.owner?._id || projectData.owner?.toString();
          const isProjectOwner = currentUser.id === ownerId;
          console.log("Ownership check:", {
            currentUserId: currentUser.id,
            ownerId,
            isProjectOwner,
          });
          setIsOwner(isProjectOwner);
        }
      }
    } catch (err) {
      console.error("Error checking project ownership:", err);
    }
  };

  useEffect(() => {
    const token = !!getToken();
    setIsLoggedIn(token);

    if (token) {
      // Fetch fresh data from API
      checkUserProjects();
    } else {
      setProjectsChecked(true);
    }

    const unsub = onTokenChange((t) => {
      const loggedIn = !!t;
      setIsLoggedIn(loggedIn);
      if (loggedIn) {
        checkUserProjects();
      } else {
        setHasProjects(false);
        setProjectsChecked(true);
      }
    });

    const unsubProjects = onProjectsChange((hasProj) => {
      setHasProjects(hasProj);
      setProjectsChecked(true);
    });

    return () => {
      unsub();
      unsubProjects();
    };
  }, []);

  const checkUserProjects = async () => {
    try {
      const response = await apiFetch<{
        totalProjects: number;
        data: { projects: any[] };
      }>("/api/v1/projects", { auth: true });

      if (response.ok && response.data) {
        const totalProjects = response.data.totalProjects || 0;
        const hasProjectsValue = totalProjects > 0;
        setHasProjects(hasProjectsValue);
      }
    } catch (err) {
      console.error("Error checking projects:", err);
      setHasProjects(false);
    } finally {
      setProjectsChecked(true);
    }
  };

  // Memoize filtered items to prevent recreating array on every render
  const visibleItems = useMemo(() => {
    if (!projectsChecked) return [];

    return navItems.filter((item) => {
      if (item.showWhen === "always") return true;
      if (item.showWhen === "loggedIn" && isLoggedIn) return true;
      if (item.showWhen === "loggedInWithProjects" && isLoggedIn && hasProjects)
        return true;
      if (item.showWhen === "loggedOut" && !isLoggedIn) return true;
      return false;
    });
  }, [isLoggedIn, hasProjects, projectsChecked]);

  // Calculate underline position
  useEffect(() => {
    const calculateUnderline = () => {
      if (!navRef.current) return;

      let selector = `[data-path="${pathname}"]`;
      if (isReportPage) {
        selector = `[data-path="${pathname}?tab=${activeTab}"]`;
      } else if (isCodeEditorPage) {
        // For code editor, highlight the "View Code" tab
        selector = `[data-path="/report/${projectId}?tab=code"]`;
      }

      const activeLink = navRef.current.querySelector(selector) as HTMLElement;

      if (activeLink) {
        const navRect = navRef.current.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        // Calculate position relative to nav container using full link width
        const adjustedWidth = linkRect.width;
        const adjustedLeft = linkRect.left - navRect.left;
        setUnderlineStyle({
          left: adjustedLeft,
          width: adjustedWidth,
          opacity: 1,
        });
      } else {
        setUnderlineStyle({ left: 0, width: 0, opacity: 0 });
      }
    };

    // Use requestAnimationFrame for better performance
    requestAnimationFrame(calculateUnderline);

    // Recalculate on window resize (debounced)
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(calculateUnderline, 100);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
    };
  }, [
    pathname,
    activeTab,
    isReportPage,
    isCodeEditorPage,
    projectId,
    isLoggedIn,
    hasProjects,
    projectsChecked,
    isOwner,
  ]);

  // If on report page or code editor page, show all navigation items with report tabs in the middle
  if (isReportSection && projectId) {
    const reportTabs = [
      {
        name: "Dashboard",
        path: "/dashboard",
        showWhen: "loggedInWithProjects",
      },
      { name: "Projects", path: "/projects", showWhen: "loggedInWithProjects" },
      {
        name: "Overview",
        value: "overview",
        href: `/report/${projectId}?tab=overview`,
      },
      {
        name: "View Code",
        value: "code",
        href: `/report/${projectId}?tab=code`,
      },
      ...(isOwner
        ? [
            {
              name: "Settings",
              value: "settings",
              href: `/report/${projectId}?tab=settings`,
            },
          ]
        : []),
      { name: "Teams", path: "/teams", showWhen: "loggedIn" },
      { name: "Upload", path: "/upload", showWhen: "loggedIn" },
    ];

    // Filter items based on visibility rules
    const visibleReportTabs = reportTabs.filter((item: any) => {
      if (!projectsChecked) return false;
      if (!item.showWhen) return true; // Report-specific tabs (Overview, View Code, Settings)
      if (item.showWhen === "always") return true;
      if (item.showWhen === "loggedIn" && isLoggedIn) return true;
      if (item.showWhen === "loggedInWithProjects" && isLoggedIn && hasProjects)
        return true;
      if (item.showWhen === "loggedOut" && !isLoggedIn) return true;
      return false;
    });

    return (
      <div
        ref={navRef}
        className="relative flex h-12 items-center justify-center gap-2"
      >
        {/* Animated underline */}
        <span
          className="absolute -bottom-1 h-[2px] bg-[rgb(0,0,0)] dark:bg-[rgb(255,255,255)] transition-all duration-300 ease-out will-change-transform"
          style={{
            left: `${underlineStyle.left}px`,
            width: `${underlineStyle.width}px`,
            opacity: underlineStyle.opacity,
          }}
        />

        {visibleReportTabs.map((tab: any) => {
          // Determine if this is a report-specific tab or regular nav item
          const isReportTab = tab.hasOwnProperty("value");
          const href = isReportTab ? tab.href : tab.path;
          const isActive = isReportTab
            ? isCodeEditorPage
              ? tab.value === "code"
              : activeTab === tab.value
            : pathname === tab.path;

          return (
            <Link
              key={isReportTab ? tab.value : tab.path}
              href={href}
              data-path={href}
              className={`relative px-4 py-2 flex items-center gap-2 text-sm font-medium transition-all duration-200 rounded-sm hover:bg-[rgb(237,237,237)] dark:hover:bg-[rgb(30,30,30)] ${
                isActive
                  ? "text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)]"
                  : "text-[rgb(102,102,102)] dark:text-[rgb(136,136,136)] hover:text-[rgb(0,0,0)] dark:hover:text-[rgb(255,255,255)]"
              }`}
            >
              <span data-text className="inline-block">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div
      ref={navRef}
      className="relative flex h-12 items-center justify-center"
    >
      {/* Animated underline - hidden initially to prevent layout shift */}
      <span
        className="absolute -bottom-1 h-[2px] bg-[rgb(0,0,0)] dark:bg-[rgb(255,255,255)]  transition-all duration-300 ease-out will-change-transform"
        style={{
          left: `${underlineStyle.left}px`,
          width: `${underlineStyle.width}px`,
          opacity: underlineStyle.opacity,
        }}
      />

      {visibleItems.map((item) => {
        const isActive = pathname === item.path;

        return (
          <Link
            key={item.path}
            href={item.path}
            data-path={item.path}
            className={`relative px-4 py-2 flex items-center gap-2 text-sm font-medium transition-all duration-200 rounded-sm hover:bg-[rgb(237,237,237)] dark:hover:bg-[rgb(30,30,30)]  transition-colors duration-400 ${
              isActive
                ? "text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)]"
                : "text-[rgb(102,102,102)] dark:text-[rgb(136,136,136)] hover:text-[rgb(0,0,0)] dark:hover:text-[rgb(255,255,255)] hover:bg-[rgb(237,237,237)] dark:hover:bg-[rgb(30,30,30)] transition-colors duration-400"
            }`}
          >
            <span data-text className="inline-block">
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
