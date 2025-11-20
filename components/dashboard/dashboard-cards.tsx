"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { CustomPieChart } from "./custom-piechart";
import { ProjectBarsChart } from "./project-bars-chart";
import { apiFetch } from "@/lib/api";

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

interface DashboardData {
  totalSmells: number;
  totalProjects: number;
  codeQuality: string;
  chartData: {
    category: string;
    value: number;
    color: string;
  }[];
  typeData: {
    type: string;
    value: number;
    color: string;
  }[];
  projectBars: ProjectBar[];
}

export function DashboardCards() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await apiFetch<{ data: DashboardData }>(
        "/api/v1/projects/dashboard-stats",
        { auth: true }
      );
      if (response.ok && response.data) {
        setData(response.data.data);
      } else {
        throw new Error("Failed to load");
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Refresh data when user returns to the tab/window
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchDashboardData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (error && !data) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Calculate max code smells in any single project
  const maxCodeSmells = data?.projectBars
    ? Math.max(...data.projectBars.map((p) => p.totalSmells))
    : 0;

  return (
    <div className="space-y-8">
      {/* Stats Grid - Big Numbers Only */}
      <div className="grid gap-6 sm:gap-8 md:grid-cols-4">
        {/* Total Projects */}
        <div className="text-center">
          {loading ? (
            <Skeleton className="h-20 w-full mb-2" />
          ) : (
            <>
              <div className="text-4xl sm:text-6xl font-bold text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)]">
                {data?.totalProjects || 0}
              </div>
              <p className="text-sm sm:text-base text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] mt-3">
                Total Projects
              </p>
            </>
          )}
        </div>

        {/* Total Code Smells */}
        <div className="text-center">
          {loading ? (
            <Skeleton className="h-20 w-full mb-2" />
          ) : (
            <>
              <div className="text-4xl sm:text-5xl font-bold text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)]">
                {data?.totalSmells.toLocaleString() || 0}
              </div>
              <p className="text-sm sm:text-base text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] mt-3">
                Total Code Smells
              </p>
            </>
          )}
        </div>

        {/* Max Code Smells */}
        <div className="text-center">
          {loading ? (
            <Skeleton className="h-20 w-full mb-2" />
          ) : (
            <>
              <div className="text-4xl sm:text-5xl font-bold text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)]">
                {maxCodeSmells.toLocaleString()}
              </div>
              <p className="text-sm sm:text-base text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] mt-3">
                Max Code Smells
              </p>
            </>
          )}
        </div>

        {/* Code Quality */}
        <div className="text-center">
          {loading ? (
            <Skeleton className="h-20 w-full mb-2" />
          ) : (
            <>
              <div className="text-4xl sm:text-5xl font-bold text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)]">
                {parseFloat(data?.codeQuality || "0").toFixed(1)}%
              </div>
              <p className="text-sm sm:text-base text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] mt-3">
                Overall Code Quality
              </p>
            </>
          )}
        </div>
      </div>

      {/* Project Bars Chart */}
      <ProjectBarsChart projectBars={data?.projectBars ?? []} />

      {/* Pie Chart - Category Distribution */}
      <CustomPieChart
        chartData={data?.chartData ?? []}
        title="Code Smell Distribution by Category"
        description="Distribution of code smells by category"
      />

      {/* Pie Chart - Type Distribution */}
      <CustomPieChart
        chartData={
          data?.typeData?.map((item) => ({
            category: item.type,
            value: item.value,
            color: item.color,
          })) ?? []
        }
        title="Code Smell Distribution by Type"
        description="Distribution of code smells by type"
      />
    </div>
  );
}
