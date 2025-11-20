"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, onTokenChange } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export function ProtectedClient({
  children,
  fallback,
  onRequireLogin,
}: {
  children: ReactNode;
  // optional fallback UI when not authenticated
  fallback?: ReactNode;
  // optional callback to open a login modal or navigate to /auth/login
  onRequireLogin?: () => void;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setToken(getToken());
    setReady(true);
    const off = onTokenChange((t) => setToken(t));

    // wrap the cleanup so it returns void (ignore off()'s boolean return)
    return () => {
      void off();
    };
  }, []);

  useEffect(() => {
    // Redirect to login if no token once ready
    if (ready && !token) {
      onRequireLogin?.();
      router.push("/login");
    }
  }, [ready, token, router, onRequireLogin]);

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!token) {
    // Show loading indicator while redirecting
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
