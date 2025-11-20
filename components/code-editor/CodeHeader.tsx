"use client";

import { FileCode, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FileData {
  fileName: string;
  content: string;
  _id: string;
}

interface Smell {
  smellType: string;
  fileName: string;
  filePath: string;
  startLine: number;
  endLine: number;
  category: string;
  weight: number;
  _id: string;
}

interface CodeHeaderProps {
  selectedFile: FileData | null;
  smellTypes: string[];
  selectedSmellType: string;
  onSmellTypeChange: (value: string) => void;
  currentSmellIndex: number;
  currentFileSmells: Smell[];
  onPreviousSmell: () => void;
  onNextSmell: () => void;
}

export function CodeHeader({
  selectedFile,
  smellTypes,
  selectedSmellType,
  onSmellTypeChange,
  currentSmellIndex,
  currentFileSmells,
  onPreviousSmell,
  onNextSmell,
}: CodeHeaderProps) {
  return (
    <div
      className="fixed bg-white dark:bg-[rgb(10,10,10)] border-b border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 shadow-md z-40"
      style={{ top: "56px", left: "0", right: "0" }}
    >
      <div className="flex items-center">
        {/* Filter Dropdown */}
        <div
          className="absolute left-0 flex items-center gap-2 px-4 py-4"
          style={{ width: "320px" }}
        >
          <span className="text-sm text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)]">
            Show:
          </span>
          <Select value={selectedSmellType} onValueChange={onSmellTypeChange}>
            <SelectTrigger className="w-[200px] h-10 text-sm !border-[1.3px] !border-[rgb(237,237,237)] dark:!border-[rgb(237,237,237)]/15 !bg-white dark:!bg-[rgb(10,10,10)] hover:!bg-[rgb(245,245,245)] dark:hover:!bg-[rgb(20,20,20)] focus-visible:border-[rgb(255,255,255)] dark:focus-visible:border-[rgb(255,255,255)]/50 focus-visible:shadow-[0_0_0_2px_rgb(136,136,136)] dark:focus-visible:shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:outline-none !transition-all">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="!border-[1.3px] !border-[rgb(237,237,237)] dark:!border-[rgb(237,237,237)]/15 !bg-white dark:!bg-[rgb(10,10,10)] !shadow-lg">
              <SelectItem
                value="all"
                className="relative flex w-full cursor-pointer select-none items-center rounded-md py-2 pl-3 pr-3 text-[14px] text-[rgb(161,161,161)] outline-none transition-colors hover:!bg-[rgba(255,255,255,0.06)] hover:!text-[rgb(237,237,237)] focus:!bg-[rgba(255,255,255,0.06)] focus:!text-[rgb(237,237,237)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>span:first-child]:hidden"
              >
                All Files
              </SelectItem>
              {smellTypes.map((type) => (
                <SelectItem
                  key={type}
                  value={type}
                  className="relative flex w-full cursor-pointer select-none items-center rounded-md py-2 pl-3 pr-3 text-[14px] text-[rgb(161,161,161)] outline-none transition-colors hover:!bg-[rgba(255,255,255,0.06)] hover:!text-[rgb(237,237,237)] focus:!bg-[rgba(255,255,255,0.06)] focus:!text-[rgb(237,237,237)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>span:first-child]:hidden"
                >
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* File name and Navigation */}
        <div
          className="flex-1 px-6 py-4 flex items-center justify-between"
          style={{ marginLeft: "320px" }}
        >
          {/* File name */}
          <div className="flex items-center gap-2 min-w-0">
            <FileCode className="h-5 w-5 text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] flex-shrink-0" />
            <span className="text-base font-medium truncate">
              {selectedFile?.fileName || "Select a file"}
            </span>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={onPreviousSmell}
              disabled={
                currentSmellIndex <= 0 || currentFileSmells.length === 0
              }
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                currentSmellIndex <= 0 || currentFileSmells.length === 0
                  ? "bg-[rgb(237,237,237)] dark:bg-[rgb(237,237,237)]/10 text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] cursor-not-allowed opacity-50"
                  : "bg-[rgb(0,0,0)] dark:bg-[rgb(237,237,237)] text-white dark:text-[rgb(0,0,0)] hover:bg-[rgb(30,30,30)] dark:hover:bg-[rgb(220,220,220)] cursor-pointer"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <button
              onClick={onNextSmell}
              disabled={
                currentSmellIndex >= currentFileSmells.length - 1 ||
                currentFileSmells.length === 0
              }
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                currentSmellIndex >= currentFileSmells.length - 1 ||
                  currentFileSmells.length === 0
                  ? "bg-[rgb(237,237,237)] dark:bg-[rgb(237,237,237)]/10 text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] cursor-not-allowed opacity-50"
                  : "bg-[rgb(0,0,0)] dark:bg-[rgb(237,237,237)] text-white dark:text-[rgb(0,0,0)] hover:bg-[rgb(30,30,30)] dark:hover:bg-[rgb(220,220,220)] cursor-pointer"
              )}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
