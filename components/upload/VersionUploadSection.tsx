"use client";

import { Label } from "@/components/ui/label";
import {
  CustomRadioGroup,
  CustomRadioItem,
} from "@/components/ui/custom-radio";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Project {
  _id: string;
  title: string;
}

interface VersionUploadSectionProps {
  canUploadVersion: boolean;
  uploadToTeam: "no" | "yes";
  teamSelection: "existing" | "new";
  selectedTeamId: string;
  uploadingVersion: "no" | "yes";
  setUploadingVersion: (value: "no" | "yes") => void;
  existingProjects: Project[];
  selectedProjectId: string;
  setSelectedProjectId: (value: string) => void;
  loading: boolean;
}

export function VersionUploadSection({
  canUploadVersion,
  uploadToTeam,
  teamSelection,
  selectedTeamId,
  uploadingVersion,
  setUploadingVersion,
  existingProjects,
  selectedProjectId,
  setSelectedProjectId,
  loading,
}: VersionUploadSectionProps) {
  if (
    !canUploadVersion ||
    (uploadToTeam === "yes" &&
      !(teamSelection === "existing" && selectedTeamId))
  ) {
    return null;
  }

  return (
    <div className="grid gap-3">
      <Label className="text-sm sm:text-base font-medium">
        Uploading new version?
      </Label>
      <CustomRadioGroup
        value={uploadingVersion}
        onValueChange={(value) => {
          setUploadingVersion(value as "no" | "yes");
          setSelectedProjectId("");
        }}
        disabled={loading}
      >
        <CustomRadioItem value="no" id="version-no" label="No" />
        <CustomRadioItem value="yes" id="version-yes" label="Yes" />
      </CustomRadioGroup>

      {uploadingVersion === "yes" && (
        <div className="mt-2">
          <Label
            htmlFor="project-select"
            className="text-sm sm:text-base font-medium mb-3"
          >
            Select Project
          </Label>
          <Select
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
            disabled={loading}
          >
            <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base !border-[1.3px] !border-[rgb(237,237,237)] dark:!border-[rgb(237,237,237)]/15 !bg-white dark:!bg-[rgb(10,10,10)] hover:!bg-[rgb(245,245,245)] dark:hover:!bg-[rgb(20,20,20)] focus-visible:border-[rgb(255,255,255)] dark:focus-visible:border-[rgb(255,255,255)]/50 focus-visible:shadow-[0_0_0_2px_rgb(136,136,136)] dark:focus-visible:shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:outline-none !transition-all">
              <SelectValue placeholder="Choose a project" />
            </SelectTrigger>
            <SelectContent className="!border-[1.3px] !border-[rgb(237,237,237)] dark:!border-[rgb(237,237,237)]/15 !bg-white dark:!bg-[rgb(10,10,10)] !shadow-lg">
              {existingProjects.map((project) => (
                <SelectItem
                  key={project._id}
                  value={project._id}
                  className="relative flex w-full cursor-pointer select-none items-center rounded-md py-2 pl-3 pr-3 text-[14px] text-[rgb(161,161,161)] outline-none transition-colors hover:!bg-[rgba(255,255,255,0.06)] hover:!text-[rgb(237,237,237)] focus:!bg-[rgba(255,255,255,0.06)] focus:!text-[rgb(237,237,237)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>span:first-child]:hidden"
                >
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
