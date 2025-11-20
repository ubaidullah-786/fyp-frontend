"use client";

import { useState } from "react";
import { FileCode } from "lucide-react";
import { cn } from "@/lib/utils";
import Prism from "prismjs";
import "prismjs/components/prism-java";

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

interface CodeContentProps {
  selectedFile: FileData | null;
  currentFileSmells: Smell[];
  getSmellColor: (smellType: string) => string;
  getSmellBorderColor: (smellType: string) => string;
}

const highlightCode = (code: string, language: string): string => {
  const trimmedCode = code.trim();

  if (trimmedCode.startsWith("//")) {
    return `<span style="color: rgb(136, 136, 136);">${code}</span>`;
  }

  if (
    trimmedCode.startsWith("/*") ||
    trimmedCode.startsWith("*") ||
    trimmedCode.endsWith("*/")
  ) {
    return `<span style="color: rgb(136, 136, 136);">${code}</span>`;
  }

  try {
    let highlighted = Prism.highlight(code, Prism.languages.java, "java");
    highlighted = highlighted.replace(
      /<span class="token [^"]*comment[^"]*"[^>]*>/gi,
      '<span style="color: rgb(136, 136, 136);">'
    );
    return highlighted;
  } catch (e) {
    return code;
  }
};

export function CodeContent({
  selectedFile,
  currentFileSmells,
  getSmellColor,
  getSmellBorderColor,
}: CodeContentProps) {
  const [hoveredSmellId, setHoveredSmellId] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const getSmellAtLine = (lineNumber: number): Smell | null => {
    return (
      currentFileSmells.find(
        (smell) => lineNumber >= smell.startLine && lineNumber <= smell.endLine
      ) || null
    );
  };

  if (!selectedFile) {
    return (
      <div
        className="bg-white dark:bg-[rgb(10,10,10)] min-h-screen flex items-center justify-center"
        style={{ marginTop: "67px", minHeight: "calc(100vh - 129px)" }}
      >
        <div className="text-center">
          <FileCode className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Select a file to view its content</p>
        </div>
      </div>
    );
  }

  const lines = selectedFile.content.split("\n");

  return (
    <div
      className="bg-white dark:bg-[rgb(10,10,10)] min-h-screen"
      style={{ marginTop: "67px" }}
    >
      <div className="p-4">
        <div
          className="relative"
          style={{ fontFamily: "'Geist Mono', monospace", fontSize: "13px" }}
        >
          {lines.map((line, index) => {
            const lineNumber = index + 1;
            const smell = getSmellAtLine(lineNumber);
            const isHovered = smell && hoveredSmellId === smell._id;
            const isSmellStart = smell && smell.startLine === lineNumber;
            const highlightedLine = highlightCode(line || " ", "java");

            return (
              <div
                key={lineNumber}
                className="relative group"
                data-line={lineNumber}
                onMouseEnter={() => smell && setHoveredSmellId(smell._id)}
                onMouseLeave={() => setHoveredSmellId(null)}
                onMouseMove={(e) => {
                  if (smell) {
                    setMousePosition({ x: e.clientX, y: e.clientY });
                  }
                }}
              >
                <div
                  className={cn(
                    "flex transition-all duration-200",
                    smell && "cursor-pointer"
                  )}
                  style={{
                    backgroundColor: smell
                      ? isHovered
                        ? getSmellColor(smell.smellType).replace("0.15", "0.25")
                        : getSmellColor(smell.smellType)
                      : "transparent",
                    borderLeft:
                      smell && isSmellStart
                        ? `3px solid ${getSmellBorderColor(smell.smellType)}`
                        : "none",
                    paddingLeft: smell && isSmellStart ? "0" : "3px",
                  }}
                >
                  <div className="w-12 text-right pr-4 select-none flex-shrink-0 text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)]">
                    {lineNumber}
                  </div>
                  <div
                    className="pl-4 whitespace-pre-wrap break-all flex-grow py-0.5"
                    dangerouslySetInnerHTML={{ __html: highlightedLine }}
                  />
                </div>

                {/* Tooltip */}
                {smell && isHovered && (
                  <div
                    className="fixed z-50 pointer-events-none transition-all duration-75 ease-out"
                    style={{
                      left: `${mousePosition.x + 15}px`,
                      top: `${mousePosition.y + 15}px`,
                    }}
                  >
                    <div className="bg-white dark:bg-[rgb(20,20,20)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 rounded-lg shadow-lg p-3 min-w-[200px] animate-in fade-in duration-150">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: getSmellBorderColor(
                              smell.smellType
                            ),
                          }}
                        />
                        <span className="font-semibold text-sm text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)]">
                          {smell.smellType}
                        </span>
                      </div>
                      <div className="h-px bg-[rgb(237,237,237)] dark:bg-[rgb(237,237,237)]/15 my-2" />
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border-[1.3px] flex items-center justify-center text-[10px] font-medium"
                          style={{
                            borderColor: getSmellBorderColor(smell.smellType),
                            color: getSmellBorderColor(smell.smellType),
                          }}
                        >
                          {smell.category.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)]">
                          {smell.category}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
