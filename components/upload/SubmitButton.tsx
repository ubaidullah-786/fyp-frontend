"use client";

import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, Loader2, CheckCircle } from "lucide-react";

interface SubmitButtonProps {
  loading: boolean;
  success: boolean;
  uploadSuccess: boolean;
  file: File | null;
  uploadProgress: number;
}

export function SubmitButton({
  loading,
  success,
  uploadSuccess,
  file,
  uploadProgress,
}: SubmitButtonProps) {
  return (
    <div className="pt-2">
      <Button
        type="submit"
        disabled={loading || success || uploadSuccess || !file}
        className="w-full gap-2 h-10 sm:h-11 text-sm sm:text-base bg-[rgb(0,0,0)] dark:bg-[rgb(237,237,237)] text-white dark:text-[rgb(0,0,0)] hover:bg-[rgb(30,30,30)] dark:hover:bg-[rgb(220,220,220)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading... {uploadProgress}%
          </>
        ) : uploadSuccess || success ? (
          <>
            <CheckCircle className="h-4 w-4" />
            Uploaded Successfully
          </>
        ) : (
          <>
            <UploadIcon className="h-4 w-4" />
            Upload Project
          </>
        )}
      </Button>
    </div>
  );
}
