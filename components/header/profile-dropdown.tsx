"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LogOut, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { getToken, onTokenChange, clearToken } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";
import { ThemeSelector } from "@/components/theme-selector";

interface UserData {
  name?: string;
  username?: string;
  email?: string;
  photo?: string;
}

export function ProfileDropdown() {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    setTokenState(getToken());
    const unsub = onTokenChange((t) => {
      setTokenState(t);
    });

    return () => {
      void unsub();
    };
  }, []);

  useEffect(() => {
    if (token) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {}
      }
      fetch(`${API_BASE_URL}/api/v1/users/me`, { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then((json) => {
          if (json?.data) {
            const u = {
              id: json.data._id || json.data.id,
              name: json.data.name,
              username: json.data.username,
              email: json.data.email,
              photo: json.data.photo || "",
            };
            setUser(u);
            try {
              localStorage.setItem("user", JSON.stringify(u));
            } catch {}
          }
        })
        .catch(() => {});
    } else {
      setUser(null);
    }
  }, [token]);

  const handleLogout = async () => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
    } finally {
      clearToken();
      localStorage.removeItem("user");
      setUser(null);
      toast({ title: "Signed out successfully", duration: 2500 });
      router.push("/");
    }
  };

  const isLoggedIn = !!token;

  // Hide profile on auth pages
  const currentPath = pathname ?? "/";
  const hidePrefixes = ["/login", "/signup", "/profile"];
  const hideProfile = hidePrefixes.some((p) => currentPath.startsWith(p));

  if (hideProfile) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 sm:size-9 rounded-full hover:bg-muted hover:ring-1 hover:ring-border focus-visible:ring-1 cursor-pointer"
          aria-label="Open account menu"
        >
          {isLoggedIn && user?.photo && !imageError ? (
            user.photo.startsWith("http") ? (
              // Try regular img for Cloudinary
              <img
                src={user.photo}
                alt="Profile"
                className="size-8 sm:size-9 rounded-full object-cover"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onError={() => {
                  setImageError(true);
                }}
              />
            ) : (
              // Use Next Image for local images
              <Image
                src={`${API_BASE_URL}${
                  user.photo.startsWith("/uploads/") ? "" : "/uploads/"
                }${user.photo}`}
                alt="Profile"
                width={32}
                height={32}
                className="rounded-full object-cover"
                unoptimized
                onError={() => setImageError(true)}
              />
            )
          ) : (
            <UserIcon className="size-4 sm:size-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="end"
        className="w-60 bg-white dark:bg-[rgb(10,10,10)] border border-[rgb(237,237,237)] dark:border-[rgb(50,50,50)] p-0"
        style={{ width: "260px" }}
      >
        {isLoggedIn && (
          <>
            {/* User Info */}
            <div className="px-4 py-3">
              <p className="text-[14px] font-medium text-[rgb(23,23,23)] dark:text-[rgb(237,237,237)] truncate">
                {user?.username}
              </p>
              <p
                className="text-[14px] text-[rgb(102,102,102)] dark:text-[rgb(161,161,161)] mt-0.5 truncate"
                title={user?.email}
              >
                {user?.email}
              </p>
            </div>

            {/* Account Settings */}
            <div className="px-2">
              <Link
                href="/profile"
                className="block px-3 py-2 text-[14px] text-[rgb(102,102,102)] dark:text-[rgb(161,161,161)] hover:text-[rgb(23,23,23)] dark:hover:text-[rgb(237,237,237)] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.06)] rounded-md transition-colors cursor-pointer"
              >
                Account Settings
              </Link>
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-[rgb(237,237,237)] dark:bg-[rgb(237,237,237)]/10 my-2" />

            {/* Theme */}
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-[14px] text-[rgb(102,102,102)] dark:text-[rgb(161,161,161)]">
                Theme
              </span>
              <div className="flex gap-1.5">
                <ThemeSelector />
              </div>
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-[rgb(237,237,237)] dark:bg-[rgb(237,237,237)]/10 my-2" />

            {/* Logout */}
            <div className="px-2 pb-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-3 py-2 flex items-center justify-between text-[14px] text-[rgb(102,102,102)] dark:text-[rgb(161,161,161)] hover:text-[rgb(23,23,23)] dark:hover:text-[rgb(237,237,237)] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.06)] rounded-md transition-colors cursor-pointer text-left"
              >
                <span>Logout</span>
                <LogOut className="size-4" />
              </button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
