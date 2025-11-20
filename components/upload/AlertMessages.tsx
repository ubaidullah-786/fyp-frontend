"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { forwardRef } from "react";

interface AlertMessagesProps {
  success: boolean;
  error: string | null;
}

export const AlertMessages = forwardRef<HTMLDivElement, AlertMessagesProps>(
  ({ success, error }, ref) => {
    return (
      <>
        {/* Success Alert */}
        {success && (
          <Alert className="mt-6 border-green-500/30 bg-green-50 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
            <AlertDescription className="text-green-700 dark:text-green-400 text-sm sm:text-base">
              Project uploaded successfully! Redirecting to report...
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <div ref={ref}>
            <Alert
              variant="destructive"
              className="mt-6 border-[1.3px] border-red-500/60 dark:border-red-500/60"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
      </>
    );
  }
);

AlertMessages.displayName = "AlertMessages";
