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
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-lg border bg-card p-6 text-center">
        {status === "loading" && (
          <>
            <h1 className="text-2xl font-semibold">Verifying...</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Please wait while we verify your email.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-green-600">
              Email Verified!
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">{message}</p>
            <p className="text-muted-foreground mt-3 text-sm">
              You can close this tab and return to your previous window. Your
              profile will be updated once you refresh that page.
            </p>
            <div className="mt-6">
              <Button onClick={handleCloseAndReturn} className="w-full">
                Close this tab
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                If the tab doesn't close automatically, you can close it
                manually
              </p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-red-600">
              Verification Failed
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">{message}</p>
            <div className="mt-6">
              <Button onClick={() => window.close()} className="w-full">
                Close this tab
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
