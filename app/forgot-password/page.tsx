"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const COOLDOWN_KEY = "forgot-password-cooldown";
const COOLDOWN_DURATION = 1 * 60 * 1000; // 1 minutes in milliseconds

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Check cooldown on mount and update countdown
  useEffect(() => {
    const checkCooldown = () => {
      try {
        const cooldownEnd = localStorage.getItem(COOLDOWN_KEY);
        if (cooldownEnd) {
          const remaining = parseInt(cooldownEnd) - Date.now();
          if (remaining > 0) {
            setCooldownRemaining(remaining);
          } else {
            localStorage.removeItem(COOLDOWN_KEY);
            setCooldownRemaining(0);
          }
        }
      } catch {}
    };

    checkCooldown();

    // Update countdown every second
    const interval = setInterval(() => {
      checkCooldown();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Check if still in cooldown
    if (cooldownRemaining > 0) {
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);
    const { ok, data, error } = await apiFetch(
      "/api/v1/users/forgot-password",
      {
        method: "POST",
        body: { email },
      } as any
    );
    setLoading(false);

    if (!ok)
      return setError(
        (error?.message as string) || "Failed to send reset link"
      );

    // Set cooldown
    try {
      const cooldownEnd = Date.now() + COOLDOWN_DURATION;
      localStorage.setItem(COOLDOWN_KEY, cooldownEnd.toString());
      setCooldownRemaining(COOLDOWN_DURATION);
    } catch {}

    setMessage((data as any)?.message || "Reset link sent to your email!");
    setEmail(""); // Clear email field on success
  }

  // Format remaining time as MM:SS
  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isDisabled = loading || cooldownRemaining > 0;

  return (
    <main className="mx-auto max-w-md px-4 sm:px-6 py-6 sm:py-8 lg:py-12 min-h-screen bg-[rgb(237,237,237)] dark:bg-[rgb(0,0,0)]">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
        Forgot password
      </h1>
      <p className="text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] mt-2 text-sm sm:text-base">
        Enter your email and we'll send a reset link.
      </p>
      <form onSubmit={onSubmit} className="mt-6 sm:mt-8 grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-sm sm:text-base">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 sm:h-11 text-sm sm:text-base border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-white dark:bg-[rgb(10,10,10)] hover:border-[rgb(245,245,245)] dark:hover:border-[rgb(245,245,245)]/20 focus-visible:border-[rgb(255,255,255)] dark:focus-visible:border-[rgb(255,255,255)]/50 focus-visible:shadow-[0_0_0_2px_rgb(136,136,136)] dark:focus-visible:shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:outline-none transition-all"
          />
        </div>
        {message ? (
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-3 border border-emerald-200 dark:border-emerald-800">
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              {message}
            </p>
          </div>
        ) : null}
        {error ? (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        ) : null}
        <Button
          type="submit"
          disabled={isDisabled}
          className="bg-[rgb(0,0,0)] dark:bg-[rgb(237,237,237)] text-[rgb(255,255,255)] dark:text-[rgb(0,0,0)] hover:bg-[rgb(30,30,30)] dark:hover:bg-[rgb(220,220,220)]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending reset link...
            </>
          ) : cooldownRemaining > 0 ? (
            `Try again in ${formatTime(cooldownRemaining)}`
          ) : (
            "Send reset link"
          )}
        </Button>
        {cooldownRemaining > 0 && !loading && (
          <p className="text-xs text-center text-muted-foreground">
            Please wait before requesting another reset link
          </p>
        )}
      </form>
    </main>
  );
}
