"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProjectDetailsSectionProps {
  uploadingVersion: "no" | "yes";
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  loading: boolean;
}

export function ProjectDetailsSection({
  uploadingVersion,
  title,
  setTitle,
  description,
  setDescription,
  loading,
}: ProjectDetailsSectionProps) {
  return (
    <>
      {/* Project Title - Hide when uploading new version */}
      {uploadingVersion === "no" && (
        <div className="grid gap-2">
          <Label htmlFor="title" className="text-sm sm:text-base">
            Project Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            required
            className="h-10 sm:h-11 text-sm sm:text-base border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-white dark:bg-[rgb(10,10,10)] hover:border-[rgb(245,245,245)] dark:hover:border-[rgb(245,245,245)]/20 focus-visible:border-[rgb(255,255,255)] dark:focus-visible:border-[rgb(255,255,255)]/50 focus-visible:shadow-[0_0_0_2px_rgb(136,136,136)] dark:focus-visible:shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:outline-none transition-all"
          />
        </div>
      )}

      {/* Description */}
      <div className="grid gap-2">
        <Label htmlFor="description" className="text-sm sm:text-base">
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          rows={4}
          className="!text-sm sm:!text-base !border-[1.3px] !border-[rgb(237,237,237)] dark:!border-[rgb(237,237,237)]/15 !bg-white dark:!bg-[rgb(10,10,10)] hover:!border-[rgb(245,245,245)] dark:hover:!border-[rgb(245,245,245)]/20 focus-visible:!border-[rgb(255,255,255)] dark:focus-visible:!border-[rgb(255,255,255)]/50 focus-visible:!shadow-[0_0_0_2px_rgb(136,136,136)] dark:focus-visible:!shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:!ring-0 !outline-none focus-visible:!outline-none !transition-all !resize-none"
        />
      </div>
    </>
  );
}
