"use client";

import type React from "react";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setToken, setUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ResetPasswordPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { ok, data, error } = await apiFetch(
      `/api/v1/users/reset-password/${params.token}`,
      {
        method: "PATCH",
        body: { password, passwordConfirm },
      } as any
    );
    setLoading(false);
    if (!ok) return setError((error?.message as string) || "Reset failed");

    // Store user data like login does
    const raw =
      (data as any)?.data?.userData ||
      (data as any)?.data?.user ||
      (data as any)?.userData ||
      (data as any)?.user;
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

    const token = (data as any)?.token;
    if (token) setToken(token);

    toast({
      title: "Password reset successfully! You are now logged in.",
      duration: 3000,
    });
    router.push("/");
  }

  return (
    <main className="mx-auto max-w-md px-4 sm:px-6 py-6 sm:py-8 lg:py-12 min-h-screen bg-[rgb(237,237,237)] dark:bg-[rgb(0,0,0)]">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
        Reset password
      </h1>
      <p className="text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] mt-2 text-sm sm:text-base">
        Enter your new password below.
      </p>
      <form onSubmit={onSubmit} className="mt-6 sm:mt-8 grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="password" className="text-sm sm:text-base">
            New Password <span className="text-red-500">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 sm:h-11 text-sm sm:text-base border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-white dark:bg-[rgb(10,10,10)] hover:border-[rgb(245,245,245)] dark:hover:border-[rgb(245,245,245)]/20 focus-visible:border-[rgb(255,255,255)] dark:focus-visible:border-[rgb(255,255,255)]/50 focus-visible:shadow-[0_0_0_2px_rgb(136,136,136)] dark:focus-visible:shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:outline-none transition-all"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="passwordConfirm" className="text-sm sm:text-base">
            Confirm Password <span className="text-red-500">*</span>
          </Label>
          <Input
            id="passwordConfirm"
            type="password"
            required
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="h-10 sm:h-11 text-sm sm:text-base border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-white dark:bg-[rgb(10,10,10)] hover:border-[rgb(245,245,245)] dark:hover:border-[rgb(245,245,245)]/20 focus-visible:border-[rgb(255,255,255)] dark:focus-visible:border-[rgb(255,255,255)]/50 focus-visible:shadow-[0_0_0_2px_rgb(136,136,136)] dark:focus-visible:shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:outline-none transition-all"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button
          type="submit"
          disabled={loading}
          className="bg-[rgb(0,0,0)] dark:bg-[rgb(237,237,237)] text-[rgb(255,255,255)] dark:text-[rgb(0,0,0)] hover:bg-[rgb(30,30,30)] dark:hover:bg-[rgb(220,220,220)]"
        >
          {loading ? "Resetting..." : "Reset password"}
        </Button>
      </form>
    </main>
  );
}
