"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmailChangePage() {
  const params = useParams();
  const token = (params?.token as string) ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (!token) return;
    let mounted = true;
    async function verify() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/verify-email-change/${token}`,
          {
            method: "GET",
            credentials: "include", // This sends cookies (if any)
            // Note: No Authorization header needed - the token is in the URL
          }
        );
        const json = await res.json().catch(() => ({}));
        if (!mounted) return;
        if (res.ok) {
          setStatus("success");
          setMessage(json?.message ?? "Email verified successfully.");
          toast({ title: "Email verified", duration: 3000 });
        } else {
          setStatus("error");
          setMessage(
            json?.message ||
              "Verification failed. The link may be invalid or expired."
          );
        }
      } catch (err) {
        if (!mounted) return;
        setStatus("error");
        setMessage("An error occurred during verification.");
      }
    }
    verify();
    return () => {
      mounted = false;
    };
  }, [token, toast]);

  // Close this tab and focus back on the original tab
  const handleCloseAndReturn = () => {
    // Try to close the tab (works if opened via window.open or from email)
    window.close();

    // If window.close() doesn't work (tab wasn't opened by script),
    // redirect to profile page
    setTimeout(() => {
      if (!window.closed) {
        window.location.href = "/profile";
      }
    }, 100);
  };

  return (
    <main className="mx-auto max-w-md px-4 sm:px-6 py-6 sm:py-8 lg:py-12 min-h-screen bg-[rgb(237,237,237)] dark:bg-[rgb(0,0,0)]">
      <div className="rounded-lg border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-white dark:bg-[rgb(10,10,10)] p-6 sm:p-8 text-center">
        {status === "loading" && (
          <>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Verifying...
            </h1>
            <p className="text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] mt-2 text-sm sm:text-base">
              Please wait while we verify your email.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-green-600">
              Email Verified!
            </h1>
            <p className="text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] mt-2 text-sm sm:text-base">
              {message}
            </p>
            <p className="text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] mt-3 text-sm sm:text-base">
              You can close this tab and return to your previous window. Your
              profile will be updated once you refresh that page.
            </p>
            <div className="mt-6">
              <Button
                onClick={handleCloseAndReturn}
                className="w-full h-10 sm:h-11 text-sm sm:text-base bg-[rgb(0,0,0)] dark:bg-[rgb(237,237,237)] text-[rgb(255,255,255)] dark:text-[rgb(0,0,0)] hover:bg-[rgb(30,30,30)] dark:hover:bg-[rgb(220,220,220)]"
              >
                Close this tab
              </Button>
              <p className="text-xs text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] mt-2">
                If the tab doesn't close automatically, you can close it
                manually
              </p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-red-600">
              Verification Failed
            </h1>
            <p className="text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] mt-2 text-sm sm:text-base">
              {message}
            </p>
            <div className="mt-6">
              <Button
                onClick={() => window.close()}
                className="w-full h-10 sm:h-11 text-sm sm:text-base bg-[rgb(0,0,0)] dark:bg-[rgb(237,237,237)] text-[rgb(255,255,255)] dark:text-[rgb(0,0,0)] hover:bg-[rgb(30,30,30)] dark:hover:bg-[rgb(220,220,220)]"
              >
                Close this tab
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
