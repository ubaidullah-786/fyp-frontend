"use client";

import { useState, useEffect } from "react";
import { FileList } from "@/components/code-editor/FileList";
import { CodeHeader } from "@/components/code-editor/CodeHeader";
import { CodeContent } from "@/components/code-editor/CodeContent";
import {
  SMELL_COLORS,
  SMELL_BORDER_COLORS,
} from "@/components/code-editor/smellColors";

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

interface FileData {
  fileName: string;
  content: string;
  _id: string;
}

interface CodeEditorProps {
  fileData: FileData[];
  smells: Smell[];
}

export default function CodeEditor({ fileData, smells }: CodeEditorProps) {
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [selectedSmellType, setSelectedSmellType] = useState<string>("all");
  const [currentSmellIndex, setCurrentSmellIndex] = useState(-1);

  // Get unique smell types
  const smellTypes = Array.from(new Set(smells.map((s) => s.smellType))).sort();

  // Filter smells based on selected type
  const filteredSmells =
    selectedSmellType === "all"
      ? smells
      : smells.filter((s) => s.smellType === selectedSmellType);

  // Get files that have the filtered smells
  const getFilteredFiles = () => {
    if (selectedSmellType === "all") {
      return fileData;
    }
    const filesWithSmells = new Set(filteredSmells.map((s) => s.fileName));
    return fileData.filter((f) => filesWithSmells.has(f.fileName));
  };

  const filteredFiles = getFilteredFiles();

  // Get smells for currently selected file
  const currentFileSmells = selectedFile
    ? filteredSmells.filter((s) => s.fileName === selectedFile.fileName)
    : [];

  useEffect(() => {
    if (filteredFiles.length > 0) {
      setSelectedFile(filteredFiles[0]);

      // Only scroll to first smell if a specific smell type is selected (not "all")
      if (selectedSmellType !== "all") {
        setCurrentSmellIndex(0);
        setTimeout(() => {
          const fileSmells = filteredSmells.filter(
            (s) => s.fileName === filteredFiles[0].fileName
          );
          if (fileSmells.length > 0) {
            scrollToSmell(fileSmells[0]);
          }
        }, 100);
      } else {
        setCurrentSmellIndex(-1);
      }
    }
  }, [selectedSmellType]);

  const getSmellsCountForFile = (fileName: string) => {
    return filteredSmells.filter((s) => s.fileName === fileName).length;
  };

  const getSmellColor = (smellType: string): string => {
    return SMELL_COLORS[smellType] || SMELL_COLORS["Default"];
  };

  const getSmellBorderColor = (smellType: string): string => {
    return SMELL_BORDER_COLORS[smellType] || SMELL_BORDER_COLORS["Default"];
  };

  const handleFileClick = (file: FileData) => {
    setSelectedFile(file);

    // Scroll to top of page
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // Only scroll to first smell if a specific smell type is selected (not "all")
    if (selectedSmellType !== "all") {
      setCurrentSmellIndex(0);
      setTimeout(() => {
        const fileSmells = filteredSmells.filter(
          (s) => s.fileName === file.fileName
        );
        if (fileSmells.length > 0) {
          scrollToSmell(fileSmells[0]);
        }
      }, 100);
    } else {
      setCurrentSmellIndex(-1);
    }
  };

  const handlePreviousSmell = () => {
    if (currentSmellIndex > 0) {
      const newIndex = currentSmellIndex - 1;
      setCurrentSmellIndex(newIndex);
      // Use setTimeout to ensure state is updated before scrolling
      setTimeout(() => {
        scrollToSmell(currentFileSmells[newIndex]);
      }, 50);
    }
  };

  const handleNextSmell = () => {
    if (currentFileSmells.length === 0) return;

    // If not started navigating yet (index is -1), go to first smell (index 0)
    if (currentSmellIndex === -1) {
      setCurrentSmellIndex(0);
      setTimeout(() => {
        scrollToSmell(currentFileSmells[0]);
      }, 50);
    } else if (currentSmellIndex < currentFileSmells.length - 1) {
      const newIndex = currentSmellIndex + 1;
      setCurrentSmellIndex(newIndex);
      setTimeout(() => {
        scrollToSmell(currentFileSmells[newIndex]);
      }, 50);
    }
  };

  const scrollToSmell = (smell: Smell) => {
    const lineElement = document.querySelector(
      `[data-line="${smell.startLine}"]`
    );
    if (lineElement) {
      const elementTop =
        lineElement.getBoundingClientRect().top + window.scrollY;
      const navbarHeight = 56;
      const headerHeight = 73;
      const fixedOffset = navbarHeight + headerHeight + 20; // 20px extra padding
      window.scrollTo({
        top: elementTop - fixedOffset,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative flex">
      <FileList
        files={filteredFiles}
        selectedFile={selectedFile}
        onFileClick={handleFileClick}
        getSmellsCountForFile={getSmellsCountForFile}
        selectedSmellType={selectedSmellType}
        getSmellColor={getSmellColor}
        getSmellBorderColor={getSmellBorderColor}
      />

      {/* Vertical Border Divider */}
      <div
        className="fixed bg-[rgb(237,237,237)] dark:bg-[rgb(237,237,237)]/15"
        style={{
          left: "320px",
          top: "56px",
          width: "0.8px",
          height: "calc(100vh - 56px)",
          zIndex: 45,
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-80">
        <CodeHeader
          selectedFile={selectedFile}
          smellTypes={smellTypes}
          selectedSmellType={selectedSmellType}
          onSmellTypeChange={setSelectedSmellType}
          currentSmellIndex={currentSmellIndex}
          currentFileSmells={currentFileSmells}
          onPreviousSmell={handlePreviousSmell}
          onNextSmell={handleNextSmell}
        />

        <CodeContent
          selectedFile={selectedFile}
          currentFileSmells={currentFileSmells}
          getSmellColor={getSmellColor}
          getSmellBorderColor={getSmellBorderColor}
        />
      </div>
    </div>
  );
}
