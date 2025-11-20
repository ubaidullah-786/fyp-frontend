"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VerifyEmailPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/verify-email/${token}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (res.ok) {
          setStatus("success");
          setMessage("Your email has been verified successfully!");
        } else {
          const data = await res.json().catch(() => ({}));
          setStatus("error");
          setMessage(
            data?.message ||
              "Verification failed. The link may be invalid or expired."
          );
        }
      } catch (err) {
        setStatus("error");
        setMessage("An error occurred during verification.");
      }
    }

    if (token) verify();
  }, [token]);

  return (
    <main className="mx-auto max-w-md px-4 sm:px-6 py-6 sm:py-8 lg:py-12 min-h-screen bg-[rgb(237,237,237)] dark:bg-[rgb(0,0,0)]">
      <div className="rounded-lg border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-white dark:bg-[rgb(10,10,10)] p-6 sm:p-8 text-center">
        {status === "loading" && (
          <>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Verifying your email...
            </h1>
            <p className="text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] mt-2 text-sm sm:text-base">
              Please wait while we verify your account.
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
            <p className="text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] mt-1 text-sm sm:text-base">
              You can now log in to your account.
            </p>
            <Button
              asChild
              className="mt-4 h-10 sm:h-11 text-sm sm:text-base bg-[rgb(0,0,0)] dark:bg-[rgb(237,237,237)] text-[rgb(255,255,255)] dark:text-[rgb(0,0,0)] hover:bg-[rgb(30,30,30)] dark:hover:bg-[rgb(220,220,220)]"
            >
              <Link href="/login">Go to Login</Link>
            </Button>
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
            <Button
              asChild
              className="mt-4 h-10 sm:h-11 text-sm sm:text-base bg-[rgb(0,0,0)] dark:bg-[rgb(237,237,237)] text-[rgb(255,255,255)] dark:text-[rgb(0,0,0)] hover:bg-[rgb(30,30,30)] dark:hover:bg-[rgb(220,220,220)]"
            >
              <Link href="/signup">Try Signing Up Again</Link>
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
