"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UploadIcon, FileArchive, X } from "lucide-react";

interface FileUploadSectionProps {
  file: File | null;
  setFile: (file: File | null) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
  uploadProgress: number;
}

export function FileUploadSection({
  file,
  setFile,
  handleFileChange,
  loading,
  uploadProgress,
}: FileUploadSectionProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="file" className="text-sm sm:text-base">
        Source Code (ZIP) <span className="text-red-500">*</span>
      </Label>

      {file ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-4 border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 rounded-lg bg-white dark:bg-[rgb(10,10,10)]">
            <div className="flex items-center gap-3">
              <FileArchive className="h-8 w-8 text-[rgb(82,168,255)]" />
              <div>
                <p className="text-sm font-medium text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)]">
                  {file.name}
                </p>
                <p className="text-xs text-[rgb(136,136,136)]">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                const input = document.getElementById(
                  "file"
                ) as HTMLInputElement;
                if (input) input.value = "";
              }}
              className="p-1 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors cursor-pointer"
              disabled={loading}
            >
              <X className="w-5 h-5 text-red-500" />
            </button>
          </div>
          {loading && uploadProgress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[rgb(136,136,136)]">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-[rgb(237,237,237)] dark:bg-[rgb(237,237,237)]/15 rounded-full h-2">
                <div
                  className="bg-[rgb(82,168,255)] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <label
          htmlFor="file"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/20 rounded-lg cursor-pointer hover:bg-[rgb(245,245,245)] dark:hover:bg-[rgb(10,10,10)] transition-colors"
        >
          <UploadIcon className="h-8 w-8 text-[rgb(136,136,136)] mb-2" />
          <span className="text-sm text-[rgb(136,136,136)]">Choose file</span>
          <span className="text-xs text-[rgb(136,136,136)] mt-1">
            Max 100MB
          </span>
        </label>
      )}

      <Input
        id="file"
        type="file"
        accept=".zip"
        onChange={handleFileChange}
        disabled={loading}
        className="hidden"
      />
      <p className="text-xs text-[rgb(136,136,136)]">
        Maximum file size: 100MB. Supported format: ZIP
      </p>
    </div>
  );
}
