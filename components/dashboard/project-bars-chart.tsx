"use client";

import { useState, useMemo, useEffect } from "react";
import { Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProjectBar {
  id: string;
  title: string;
  totalSmells: number;
  qualityScore: number;
  createdAt: string;
  team?: {
    name: string;
    color: string;
  } | null;
}

interface ProjectBarsChartProps {
  projectBars: ProjectBar[];
}

export function ProjectBarsChart({ projectBars }: ProjectBarsChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Calculate max smells in projects and determine default selector value
  const maxProjectSmells = useMemo(() => {
    if (!projectBars || projectBars.length === 0) return 0;
    return Math.max(...projectBars.map((p) => p.totalSmells));
  }, [projectBars]);

  // Generate scale options with dynamic gaps based on max smells
  const scaleOptions = useMemo(() => {
    if (maxProjectSmells === 0) return [20];

    // Determine gap based on max smells
    let gap: number;
    if (maxProjectSmells < 100) {
      gap = 10;
    } else if (maxProjectSmells < 200) {
      gap = 20;
    } else if (maxProjectSmells <= 1000) {
      gap = 50;
    } else {
      gap = 100;
    }

    const roundedMax = Math.ceil(maxProjectSmells / gap) * gap; // Round up to nearest gap
    const options: number[] = [];

    // Generate options: gap, 2*gap, 3*gap, ..., up to roundedMax
    for (let i = gap; i <= roundedMax; i += gap) {
      options.push(i);
    }

    // Ensure we have at least the max value
    if (options.length === 0 || options[options.length - 1] < roundedMax) {
      options.push(roundedMax);
    }

    return options;
  }, [maxProjectSmells]);

  // Default scale is the max value (selected by default)
  const defaultScale = useMemo(() => {
    if (scaleOptions.length === 0) return 20;
    return scaleOptions[scaleOptions.length - 1];
  }, [scaleOptions]);

  const [maxSmells, setMaxSmells] = useState(defaultScale);

  // Update maxSmells when defaultScale changes (e.g., when new data loads)
  useEffect(() => {
    setMaxSmells(defaultScale);
  }, [defaultScale]);

  // Check if we're showing a single version (report page) or multiple projects (dashboard)
  const isVersionAnalysis =
    projectBars.length === 1 && projectBars[0].title.startsWith("V");

  if (!projectBars || projectBars.length === 0) {
    return (
      <Card className="bg-white dark:bg-[rgb(10,10,10)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15">
        <CardHeader>
          <CardTitle className="text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)]">
            {isVersionAnalysis
              ? "Project Version Analysis"
              : "Projects Analysis"}
          </CardTitle>
          <CardDescription className="text-[rgb(102,102,102)] dark:text-[rgb(136,136,136)]">
            {isVersionAnalysis
              ? "Code smells and quality per version"
              : "Code smells and quality per project"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-[rgb(102,102,102)] dark:text-[rgb(136,136,136)]">
            No projects available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartHeight = 500;
  const barWidth = 28;
  const barGap = 50;
  const leftPadding = 120;
  const rightPadding = 150;
  const topPadding = 80;
  const bottomPadding = 80;

  const chartWidth =
    leftPadding +
    rightPadding +
    projectBars.length * barWidth +
    (projectBars.length - 1) * barGap;

  const getBarHeight = (smells: number) => {
    return (smells / maxSmells) * (chartHeight - topPadding - bottomPadding);
  };

  const getBarX = (index: number) => {
    return leftPadding + 30 + index * (barWidth + barGap) + barWidth / 2;
  };

  const getBarY = (smells: number) => {
    return chartHeight - bottomPadding - getBarHeight(smells);
  };

  // Calculate dynamic tooltip dimensions
  const getTooltipDimensions = (projectTitle: string) => {
    // Simplified tooltip - only shows quality percentage
    const baseWidth = 160;
    return { width: baseWidth, height: 50 };
  };

  // Calculate dynamic name box dimensions
  const getNameBoxDimensions = (projectTitle: string) => {
    const baseWidth = 100;
    const charWidth = 7;
    const width = Math.max(baseWidth, projectTitle.length * charWidth + 30);
    return { width, height: 40 };
  };

  return (
    <Card className="bg-white dark:bg-[rgb(10,10,10)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="">
            <CardTitle className="text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)]">
              {isVersionAnalysis
                ? "Project Version Analysis"
                : "Projects Analysis"}
            </CardTitle>
            <CardDescription className="text-[rgb(102,102,102)] dark:text-[rgb(136,136,136)]">
              {isVersionAnalysis
                ? "Code smells and quality per version"
                : "Code smells and quality per project"}
            </CardDescription>
          </div>

          {/* Y-axis Scale Selector */}
          <div className="flex flex-col items-center gap-2 mt-4 mr-25">
            <div className="flex items-center gap-2">
              {/* Status bar with scale points */}
              <div className="relative flex items-center justify-center">
                {/* Y-axis label above first selector */}
                <span className="absolute -top-5 left-0 text-xs font-medium text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)] whitespace-nowrap">
                  Y-axis Max Code Smells
                </span>

                {/* Line connecting all points */}
                <div className="absolute left-0 right-0 h-[2px] bg-[rgb(201,201,201)]" />

                {/* Scale points */}
                <div className="relative flex items-center gap-[2px]">
                  {scaleOptions.map((scale, index) => {
                    const isSelected = maxSmells === scale;
                    const isBeforeSelected =
                      scaleOptions.indexOf(maxSmells) >= index;
                    const isLastItem = index === scaleOptions.length - 1;

                    return (
                      <div key={scale} className="relative flex items-center">
                        {/* Connecting line segment (colored if before or at selected) */}
                        {index > 0 && (
                          <div
                            className={`w-[2px] h-[2px] ${
                              isBeforeSelected
                                ? "bg-[rgb(0,104,214)]"
                                : "bg-[rgb(201,201,201)]"
                            }`}
                          />
                        )}

                        {/* Scale point button */}
                        <button
                          type="button"
                          onClick={() => setMaxSmells(scale)}
                          className="relative w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110 z-10"
                          style={{
                            backgroundColor: isSelected
                              ? "rgb(0,104,214)"
                              : isBeforeSelected
                              ? "rgb(0,104,214)"
                              : "rgb(201,201,201)",
                          }}
                          title={`${scale} smells`}
                        >
                          {isSelected && (
                            <Check
                              className="w-3 h-3 text-white dark:text-white"
                              strokeWidth={3}
                            />
                          )}
                        </button>

                        {/* Scale label (show all) */}
                        <span
                          className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap"
                          style={{
                            color: isSelected
                              ? "rgb(0,104,214)"
                              : "rgb(136, 136, 136)",
                          }}
                        >
                          {scale}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="w-full overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <svg
            width={Math.max(chartWidth, 900)}
            height={chartHeight}
            className="mx-auto"
          >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={ratio}
                x1={leftPadding}
                y1={
                  chartHeight -
                  bottomPadding -
                  ratio * (chartHeight - topPadding - bottomPadding)
                }
                x2={chartWidth - rightPadding}
                y2={
                  chartHeight -
                  bottomPadding -
                  ratio * (chartHeight - topPadding - bottomPadding)
                }
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4 4"
                className="text-[rgb(209,213,219)] dark:text-[rgb(75,85,99)]"
              />
            ))}

            {/* Y-axis */}
            <line
              x1={leftPadding}
              y1={topPadding}
              x2={leftPadding}
              y2={chartHeight - bottomPadding}
              stroke="currentColor"
              strokeWidth="7"
              className="text-[rgb(107,114,128)] dark:text-[rgb(156,163,175)]"
            />

            {/* X-axis */}
            <line
              x1={116.5}
              y1={chartHeight - bottomPadding}
              x2={116.5 + barWidth * projectBars.length * 10}
              y2={chartHeight - bottomPadding}
              stroke="currentColor"
              strokeWidth="7"
              className="text-[rgb(107,114,128)] dark:text-[rgb(156,163,175)]"
            />

            {/* Y-axis label */}
            <text
              x={25}
              y={topPadding - 25}
              textAnchor="start"
              className="text-sm font-semibold fill-[rgb(0,0,0)] dark:fill-[rgb(255,255,255)]"
            >
              Code Smells
            </text>

            {/* X-axis label */}
            <text
              x={leftPadding + (chartWidth - leftPadding - rightPadding) / 2}
              y={chartHeight - 45}
              textAnchor="middle"
              className="text-sm font-semibold fill-[rgb(0,0,0)] dark:fill-[rgb(255,255,255)]"
            >
              {isVersionAnalysis ? "Versions" : "Projects"}
            </text>

            {/* Bars */}
            {projectBars.map((project, index) => {
              const barHeight = getBarHeight(project.totalSmells);
              const barX = getBarX(index);
              const barY = getBarY(project.totalSmells);
              const isHovered = hoveredIndex === index;

              // Colorful bars - cycle through vibrant colors
              const barColors = [
                {
                  normal: "fill-[rgb(59,130,246)]",
                  hover: "fill-[rgb(37,99,235)]",
                }, // Blue
                {
                  normal: "fill-[rgb(16,185,129)]",
                  hover: "fill-[rgb(5,150,105)]",
                }, // Green
                {
                  normal: "fill-[rgb(249,115,22)]",
                  hover: "fill-[rgb(234,88,12)]",
                }, // Orange
                {
                  normal: "fill-[rgb(139,92,246)]",
                  hover: "fill-[rgb(124,58,237)]",
                }, // Purple
                {
                  normal: "fill-[rgb(236,72,153)]",
                  hover: "fill-[rgb(219,39,119)]",
                }, // Pink
                {
                  normal: "fill-[rgb(234,179,8)]",
                  hover: "fill-[rgb(202,138,4)]",
                }, // Yellow
                {
                  normal: "fill-[rgb(20,184,166)]",
                  hover: "fill-[rgb(13,148,136)]",
                }, // Teal
                {
                  normal: "fill-[rgb(239,68,68)]",
                  hover: "fill-[rgb(220,38,38)]",
                }, // Red
              ];
              const colorIndex = index % barColors.length;
              const barColor = barColors[colorIndex];

              // Get actual color values for this bar
              const barColorValue = [
                "rgb(59,130,246)", // Blue
                "rgb(16,185,129)", // Green
                "rgb(249,115,22)", // Orange
                "rgb(139,92,246)", // Purple
                "rgb(236,72,153)", // Pink
                "rgb(234,179,8)", // Yellow
                "rgb(20,184,166)", // Teal
                "rgb(239,68,68)", // Red
              ][colorIndex];

              const barColorValueDark = [
                "rgb(37,99,235)", // Blue dark
                "rgb(5,150,105)", // Green dark
                "rgb(234,88,12)", // Orange dark
                "rgb(124,58,237)", // Purple dark
                "rgb(219,39,119)", // Pink dark
                "rgb(202,138,4)", // Yellow dark
                "rgb(13,148,136)", // Teal dark
                "rgb(220,38,38)", // Red dark
              ][colorIndex];

              return (
                <g key={project.id}>
                  {/* Bar */}
                  <rect
                    x={barX - barWidth / 2}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    className={`transition-all duration-200 cursor-pointer ${
                      isHovered ? barColor.hover : barColor.normal
                    }`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                </g>
              );
            })}

            {/* Hover tooltips - rendered after all bars to appear on top */}
            {projectBars.map((project, index) => {
              const barHeight = getBarHeight(project.totalSmells);
              const barX = getBarX(index);
              const barY = getBarY(project.totalSmells);
              const isHovered = hoveredIndex === index;
              const tooltipDims = getTooltipDimensions(project.title);
              const nameBoxDims = getNameBoxDimensions(project.title);

              // Get color index for this bar
              const colorIndex = index % 8;

              // Get actual color values for this bar
              const barColorValue = [
                "rgb(59,130,246)", // Blue
                "rgb(16,185,129)", // Green
                "rgb(249,115,22)", // Orange
                "rgb(139,92,246)", // Purple
                "rgb(236,72,153)", // Pink
                "rgb(234,179,8)", // Yellow
                "rgb(20,184,166)", // Teal
                "rgb(239,68,68)", // Red
              ][colorIndex];

              return (
                <g key={`tooltip-${project.id}`}>
                  {/* Horizontal line from bar top to y-axis - ALWAYS VISIBLE */}
                  <line
                    x1={barX}
                    y1={barY}
                    x2={leftPadding - 15}
                    y2={barY}
                    stroke={barColorValue}
                    strokeWidth="2"
                    strokeDasharray="5 3"
                  />

                  {/* Total smells label box - ALWAYS VISIBLE */}
                  <g>
                    <rect
                      x={leftPadding - 80}
                      y={barY - 18}
                      width={60}
                      height={36}
                      rx={6}
                      fill={barColorValue}
                    />
                    <text
                      x={leftPadding - 50}
                      y={barY + 6}
                      textAnchor="middle"
                      className="text-sm font-bold fill-white"
                    >
                      {project.totalSmells}
                    </text>
                  </g>

                  {/* Project Name Tooltip (below bar) - ONLY ON HOVER */}
                  {isHovered && (
                    <g>
                      <rect
                        x={barX - nameBoxDims.width / 2}
                        y={chartHeight - bottomPadding + 15}
                        width={nameBoxDims.width}
                        height={nameBoxDims.height}
                        rx={6}
                        className="fill-[rgb(139,92,246)] dark:fill-[rgb(167,139,250)]"
                      />
                      <text
                        x={barX}
                        y={
                          chartHeight -
                          bottomPadding +
                          15 +
                          nameBoxDims.height / 2
                        }
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-sm font-bold fill-black"
                      >
                        {project.title}
                      </text>
                    </g>
                  )}

                  {/* Diagonal line from bar center - ONLY ON HOVER */}
                  {isHovered && (
                    <line
                      x1={barX}
                      y1={barY + barHeight / 2}
                      x2={barX + 40}
                      y2={barY + barHeight / 2 - 40}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="5 3"
                      className="text-[rgb(16,185,129)] dark:text-[rgb(52,211,153)]"
                    />
                  )}

                  {/* Horizontal line to quality label - ONLY ON HOVER */}
                  {isHovered && (
                    <line
                      x1={barX + 40}
                      y1={barY + barHeight / 2 - 40}
                      x2={barX + 70}
                      y2={barY + barHeight / 2 - 40}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="5 3"
                      className="text-[rgb(16,185,129)] dark:text-[rgb(52,211,153)]"
                    />
                  )}

                  {/* Quality score label box - ONLY ON HOVER */}
                  {isHovered && (
                    <g>
                      <rect
                        x={barX + 70}
                        y={barY + barHeight / 2 - 40 - tooltipDims.height / 2}
                        width={tooltipDims.width}
                        height={tooltipDims.height}
                        rx={6}
                        className="fill-[rgb(16,185,129)] dark:fill-[rgb(52,211,153)]"
                      />
                      {/* Quality score */}
                      <text
                        x={barX + 70 + tooltipDims.width / 2}
                        y={
                          barY +
                          barHeight / 2 -
                          40 -
                          tooltipDims.height / 2 +
                          28
                        }
                        textAnchor="middle"
                        className="text-sm font-bold fill-black"
                      >
                        Quality: {project.qualityScore.toFixed(1)}%
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center mt-6 items-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[rgb(249,115,22)] dark:bg-[rgb(251,146,60)]" />
            <span className="text-xs text-[rgb(102,102,102)] dark:text-[rgb(136,136,136)]">
              Total Code Smells
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[rgb(16,185,129)] dark:bg-[rgb(52,211,153)]" />
            <span className="text-xs text-[rgb(102,102,102)] dark:text-[rgb(136,136,136)]">
              Code Quality Score
            </span>
          </div>

          {/* Axis Legend */}
          <div className="flex items-center gap-3 ml-6 border-l border-[rgb(209,213,219)] dark:border-[rgb(75,85,99)] pl-6">
            <div className="relative">
              <svg width="135" height="100" className="inline-block">
                <defs>
                  <marker
                    id="arrowY"
                    markerWidth="8"
                    markerHeight="8"
                    refX="4"
                    refY="4"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 8 4, 0 8"
                      className="fill-[rgb(107,114,128)] dark:fill-[rgb(156,163,175)]"
                    />
                  </marker>
                  <marker
                    id="arrowX"
                    markerWidth="8"
                    markerHeight="8"
                    refX="4"
                    refY="4"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 8 4, 0 8"
                      className="fill-[rgb(107,114,128)] dark:fill-[rgb(156,163,175)]"
                    />
                  </marker>
                </defs>
                {/* Y-axis line */}
                <line
                  x1="20"
                  y1="80"
                  x2="20"
                  y2="25"
                  stroke="currentColor"
                  strokeWidth="2"
                  markerEnd="url(#arrowY)"
                  className="stroke-[rgb(107,114,128)] dark:stroke-[rgb(156,163,175)]"
                />
                {/* X-axis line */}
                <line
                  x1="20"
                  y1="80"
                  x2="75"
                  y2="80"
                  stroke="currentColor"
                  strokeWidth="2"
                  markerEnd="url(#arrowX)"
                  className="stroke-[rgb(107,114,128)] dark:stroke-[rgb(156,163,175)]"
                />
                {/* Code Smells label at top */}
                <text
                  x="35"
                  y="12"
                  textAnchor="middle"
                  style={{ fontSize: "12px" }}
                  className="font-semibold fill-[rgb(0,0,0)] dark:fill-[rgb(255,255,255)]"
                >
                  Code Smells
                </text>
                {/* Projects label on right */}
                <text
                  x="85"
                  y="84"
                  textAnchor="start"
                  style={{ fontSize: "12px" }}
                  className="font-semibold fill-[rgb(0,0,0)] dark:fill-[rgb(255,255,255)]"
                >
                  {isVersionAnalysis ? "Versions" : "Projects"}
                </text>
              </svg>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
