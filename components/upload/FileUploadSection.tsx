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
  fileLoading: boolean;
}

export function FileUploadSection({
  file,
  setFile,
  handleFileChange,
  loading,
  uploadProgress,
  fileLoading,
}: FileUploadSectionProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="file" className="text-sm sm:text-base">
        Source Code (ZIP) <span className="text-red-500">*</span>
      </Label>

      {file ? (
        <div className="space-y-2">
          <div className="relative flex items-center justify-between p-4 border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 rounded-lg bg-white dark:bg-[rgb(10,10,10)]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <FileArchive
                  className={`h-8 w-8 text-[rgb(0,104,214)] transition-opacity duration-300 ${
                    fileLoading ? "opacity-30" : "opacity-100"
                  }`}
                />
                {/* Circular progress overlay during file loading */}
                {fileLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="rgba(82,168,255,0.2)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="rgb(0,104,214)"
                        strokeWidth="8"
                        strokeDasharray="283"
                        strokeDashoffset="283"
                        strokeLinecap="round"
                        className="animate-[disappear-clockwise_1s_ease-out_forwards]"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div
                className={`transition-opacity duration-300 ${
                  fileLoading ? "opacity-30" : "opacity-100"
                }`}
              >
                <p className="text-sm font-medium text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)]">
                  {file.name}
                </p>
                <p className="text-xs text-[rgb(136,136,136)]">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            {/* Remove button - only show when not loading */}
            {!fileLoading && (
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
            )}
          </div>
          {loading && uploadProgress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[rgb(136,136,136)]">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-[rgb(237,237,237)] dark:bg-[rgb(237,237,237)]/15 rounded-full h-2">
                <div
                  className="bg-[rgb(0,104,214)] h-2 rounded-full transition-all duration-300"
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
