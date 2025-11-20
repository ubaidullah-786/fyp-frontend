"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, setHasProjects } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { DashboardCards } from "@/components/dashboard/dashboard-cards";
import { Button } from "@/components/ui/button";
import { Upload, FolderOpen } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasProjects, setHasProjects] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    setIsAuthenticated(true);
    checkUserProjects();
  }, [router]);

  const checkUserProjects = async () => {
    try {
      const response = await apiFetch<{
        totalProjects: number;
        data: { projects: any[] };
      }>("/api/v1/projects", {
        method: "GET",
        auth: true,
      });

      if (response.ok && response.data) {
        const totalProjects = response.data.totalProjects || 0;

        if (totalProjects === 0) {
          // User has no projects, redirect to upload
          router.push("/upload");
          return;
        }

        setHasProjects(true); // Cache the result in localStorage
      }
    } catch (err) {
      console.error("Error checking projects:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !hasProjects) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12 min-h-screen bg-[rgb(237,237,237)] dark:bg-[rgb(0,0,0)]">
      <div className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] mt-2 text-sm sm:text-base">
          Overview of your code quality metrics and projects
        </p>
      </div>

      <div className="h-[1px] bg-[rgb(237,237,237)] dark:bg-[rgb(237,237,237)]/15 mb-6 sm:mb-8" />

      <DashboardCards />
    </div>
  );
}
