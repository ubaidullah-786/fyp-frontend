"use client";

import { FileCode } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface FileListProps {
  files: FileData[];
  selectedFile: FileData | null;
  onFileClick: (file: FileData) => void;
  getSmellsCountForFile: (fileName: string) => number;
  selectedSmellType: string;
  getSmellColor: (smellType: string) => string;
  getSmellBorderColor: (smellType: string) => string;
}

export function FileList({
  files,
  selectedFile,
  onFileClick,
  getSmellsCountForFile,
  selectedSmellType,
  getSmellColor,
  getSmellBorderColor,
}: FileListProps) {
  return (
    <div
      className="fixed left-0 w-80 bg-white dark:bg-[rgb(10,10,10)] overflow-y-auto"
      style={{ top: "129px", height: "calc(100vh - 129px)" }}
    >
      <div className="p-3 space-y-1">
        {files.map((file) => {
          const smellCount = getSmellsCountForFile(file.fileName);
          const isSelected = selectedFile?._id === file._id;

          return (
            <div
              key={file._id}
              className={cn(
                "group flex items-center justify-between p-3 cursor-pointer rounded-md text-sm transition-all duration-200 hover:bg-[rgb(237,237,237)] dark:hover:bg-[rgb(31,31,31)]",
                isSelected && "bg-[rgb(237,237,237)] dark:bg-[rgb(31,31,31)]"
              )}
              onClick={() => onFileClick(file)}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <FileCode
                  className={cn(
                    "h-4 w-4 flex-shrink-0 transition-colors duration-200",
                    isSelected
                      ? "text-[rgb(255,255,255)] dark:text-[rgb(255,255,255)] group-hover:text-[rgb(0,0,0)] dark:group-hover:text-[rgb(237,237,237)]"
                      : "text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] group-hover:text-[rgb(0,0,0)] dark:group-hover:text-[rgb(237,237,237)]"
                  )}
                />
                <span
                  className={cn(
                    "truncate transition-colors duration-200",
                    isSelected
                      ? "text-[rgb(255,255,255)] dark:text-[rgb(255,255,255)] group-hover:text-[rgb(0,0,0)] dark:group-hover:text-[rgb(237,237,237)]"
                      : "text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] group-hover:text-[rgb(0,0,0)] dark:group-hover:text-[rgb(237,237,237)]"
                  )}
                >
                  {file.fileName}
                </span>
              </div>
              {smellCount > 0 && (
                <span
                  className={cn(
                    "ml-2 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 transition-colors duration-200",
                    isSelected
                      ? "bg-[rgb(255,255,255)]/10 text-[rgb(255,255,255)]"
                      : "bg-[rgb(136,136,136)]/20 text-[rgb(136,136,136)]"
                  )}
                  style={{
                    backgroundColor:
                      selectedSmellType !== "all"
                        ? getSmellColor(selectedSmellType).replace(
                            "0.15",
                            "0.3"
                          )
                        : undefined,
                    color:
                      selectedSmellType !== "all"
                        ? getSmellBorderColor(selectedSmellType)
                        : undefined,
                  }}
                >
                  {smellCount}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
