"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export function AuthRedirect() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuthAndRedirect() {
      const token = getToken();

      if (!token) {
        // Not logged in, stay on home page
        setChecking(false);
        return;
      }

      try {
        // Check if user has any projects (personal or team)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/projects`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const totalProjects = data?.totalProjects || 0;

          if (totalProjects > 0) {
            // User has projects, redirect to dashboard
            router.replace("/dashboard");
          } else {
            // No projects, redirect to upload
            router.replace("/upload");
          }
        } else {
          // Error fetching projects, redirect to upload as fallback
          router.replace("/upload");
        }
      } catch (error) {
        console.error("Error checking projects:", error);
        // On error, redirect to upload as fallback
        router.replace("/upload");
      }
    }

    checkAuthAndRedirect();
  }, [router]);

  if (checking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[rgb(237,237,237)] dark:bg-[rgb(0,0,0)] z-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)] mx-auto" />
          <p className="mt-4 text-sm text-[rgb(136,136,136)]">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
}
