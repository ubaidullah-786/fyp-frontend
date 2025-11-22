"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setToken, setUser, getToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast"; // toast feedback on login success
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true); // Add checking state
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast(); // initialize toast

  // Redirect if already logged in
  useEffect(() => {
    const token = getToken();
    if (token) {
      router.push("/");
    } else {
      setChecking(false); // Only show page if not logged in
    }
  }, [router]);

  // Don't render the page until auth check is complete
  if (checking) {
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      }
    );

    setLoading(false);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      setError(errData?.message || "Login failed");
      return;
    }

    const data = await res.json();
    const raw =
      data?.data?.userData || data?.data?.user || data?.userData || data?.user;
    if (raw && typeof raw === "object") {
      const u = {
        id: raw._id || raw.id,
        name: raw.name,
        username: raw.username,
        email: raw.email,
        photo: raw.photo || "",
      };
      setUser(u);
    }
    if (data?.token) setToken(data.token);

    toast({ title: "Signed in successfully", duration: 2500 });

    // Check projects to determine redirect
    try {
      const projectsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/projects`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        }
      );

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        const totalProjects = projectsData?.totalProjects || 0;

        if (totalProjects > 0) {
          // User has projects (personal or team), redirect to projects page
          router.push("/projects");
        } else {
          // No projects, redirect to upload
          router.push("/upload");
        }
      } else {
        // Fallback to upload if check fails
        router.push("/upload");
      }
    } catch (err) {
      // Fallback to upload if check fails
      router.push("/upload");
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 sm:px-6 py-6 sm:py-8 lg:py-12 min-h-screen bg-[rgb(237,237,237)] dark:bg-[rgb(0,0,0)]">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
        Log in
      </h1>
      <p className="text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] mt-2 text-sm sm:text-base">
        Access your account to post ads, chat, and manage favorites.
      </p>

      <form onSubmit={onSubmit} className="mt-6 sm:mt-8 grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-sm sm:text-base">
            Email or Username <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 sm:h-11 text-sm sm:text-base border-[1.3px] border-[rgb(237,237,237)] 
            dark:border-[rgb(237,237,237)]/15 bg-white dark:bg-[rgb(10,10,10)] 
            hover:border-[rgb(245,245,245)] dark:hover:border-[rgb(245,245,245)]/20 
            focus-visible:border-[rgb(255,255,255)] dark:focus-visible:border-[rgb(255,255,255)]/50 
            focus-visible:shadow-[0_0_0_2px_rgb(136,136,136)] 
            dark:focus-visible:shadow-[0_0_0_3px_rgb(60,61,60)] 
            focus-visible:outline-none transition-all"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password" className="text-sm sm:text-base">
            Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10 h-10 sm:h-11 text-sm sm:text-base border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-white dark:bg-[rgb(10,10,10)] hover:border-[rgb(245,245,245)] dark:hover:border-[rgb(245,245,245)]/20 focus-visible:border-[rgb(255,255,255)] dark:focus-visible:border-[rgb(255,255,255)]/50 focus-visible:shadow-[0_0_0_2px_rgb(136,136,136)] dark:focus-visible:shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] hover:text-[rgb(100,100,100)] dark:hover:text-[rgb(180,180,180)] transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
          </div>
        </div>
        {error ? (
          <p className="text-sm sm:text-base text-red-600">{error}</p>
        ) : null}
        <Button
          type="submit"
          disabled={loading}
          className="h-10 sm:h-11 text-sm sm:text-base bg-[rgb(0,0,0)] dark:bg-[rgb(237,237,237)] text-[rgb(255,255,255)] dark:text-[rgb(0,0,0)] hover:bg-[rgb(30,30,30)] dark:hover:bg-[rgb(220,220,220)] cursor-pointer"
        >
          {loading ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <div className="mt-6 text-sm sm:text-base">
        <p>
          Don't have an account?{" "}
          <Link
            className="text-[rgb(82,168,255)] hover:underline transition-all"
            href="/signup"
          >
            Sign Up
          </Link>
        </p>
        <p className="mt-2">
          Forgot your password?{" "}
          <Link
            className="text-[rgb(82,168,255)] hover:underline transition-all"
            href="/forgot-password"
          >
            Click here
          </Link>
        </p>
      </div>
    </main>
  );
}
