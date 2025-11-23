"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  FileText,
  TrendingUp,
  Calendar,
  Search,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Project {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  totalSmells: number;
  lastUpdated: string;
  qualityScore: number;
  team?: {
    _id: string;
    name: string;
    color: string;
  };
}

export default function ProjectsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
      fetchProjects();
    }
  }, [router]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await apiFetch<{ data: { projects: Project[] } }>(
        "/api/v1/projects/get-all-projects",
        { auth: true }
      );
      if (response.ok && response.data) {
        setProjects(response.data.data.projects);
      } else {
        throw new Error("Failed to load projects");
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 70) return "text-green-600 dark:text-green-500";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-500";
    return "text-red-600 dark:text-red-500";
  };

  const getQualityLabel = (score: number) => {
    if (score >= 70) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort filtered projects to show exact matches first
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const aExactMatch = a.title.toLowerCase() === searchQuery.toLowerCase();
    const bExactMatch = b.title.toLowerCase() === searchQuery.toLowerCase();
    if (aExactMatch && !bExactMatch) return -1;
    if (!aExactMatch && bExactMatch) return 1;
    return 0;
  });

  const getProjectCardClass = (project: Project) => {
    const isExactMatch =
      project.title.toLowerCase() === searchQuery.toLowerCase();
    const baseClass =
      "bg-white dark:bg-[rgb(10,10,10)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 hover:border-[rgb(245,245,245)] dark:hover:border-[rgb(245,245,245)]/20 hover:shadow-lg transition-all cursor-pointer group";

    if (isExactMatch && searchQuery) {
      return `${baseClass} !shadow-[0_0_0_2px_rgb(60,61,60)]/20 dark:!shadow-[0_0_0_3px_rgb(60,61,60)] !border-[rgb(255,255,255)] dark:!border-[rgb(255,255,255)]/50`;
    }
    return baseClass;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12 min-h-screen bg-[rgb(250,250,250)] dark:bg-[rgb(0,0,0)]">
      <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Projects
          </h1>
          <p className="text-[rgb(102,102,102)] dark:text-[rgb(102,102,102)] mt-2 text-sm sm:text-base">
            Manage and monitor all your code quality projects
          </p>
        </div>
        <Link href="/upload">
          <Button className="h-10 sm:h-11 text-sm sm:text-base bg-[rgb(0,0,0)] dark:bg-[rgb(250,250,250)] text-white dark:text-[rgb(0,0,0)] hover:bg-[rgb(30,30,30)] dark:hover:bg-[rgb(220,220,220)] whitespace-nowrap cursor-pointer">
            <Plus className="h-4 w-4" />
            Upload Project
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(143,143,143)] dark:text-[rgb(102,102,102)]" />
          <Input
            type="text"
            placeholder="Search Projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 !text-[14px] placeholder:text-[rgb(143,143,143)] dark:placeholder:text-[rgb(102,102,102)] !border-[1.3px] !border-[rgb(0,0,0)]/10 dark:!border-[rgb(237,237,237)]/15 !bg-white dark:!bg-[rgb(10,10,10)] hover:!border-[rgb(0,0,0)]/20 dark:hover:!border-[rgb(245,245,245)]/20 focus-visible:!border-[rgb(255,255,255)] dark:focus-visible:!border-[rgb(255,255,255)]/50 focus-visible:!shadow-[0_0_0_2.5px_rgb(60,61,60)]/20 dark:focus-visible:!shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:!ring-0 !outline-none focus-visible:!outline-none !transition-all"
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card
              key={i}
              className="bg-white dark:bg-[rgb(10,10,10)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15"
            >
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-3 bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
                <Skeleton className="h-4 w-full bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
                <Skeleton className="h-4 w-5/6 mt-2 bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24 bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
                    <Skeleton className="h-4 w-16 bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24 bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
                    <Skeleton className="h-4 w-16 bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
                  </div>
                </div>
                <Skeleton className="h-4 w-32 bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="bg-white dark:bg-[rgb(10,10,10)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-[rgb(102,102,102)] dark:text-[rgb(102,102,102)] mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
            <p className="text-[rgb(102,102,102)] dark:text-[rgb(102,102,102)] text-center mb-6 text-sm sm:text-base">
              Upload your first project to start analyzing code quality
            </p>
            <Link href="/upload">
              <Button className="h-10 sm:h-11 text-sm sm:text-base bg-[rgb(0,0,0)] dark:bg-[rgb(250,250,250)] text-white dark:text-[rgb(0,0,0)] hover:bg-[rgb(30,30,30)] dark:hover:bg-[rgb(220,220,220)]">
                Upload Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : sortedProjects.length === 0 ? (
        <Card className="bg-white dark:bg-[rgb(10,10,10)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-16 w-16 text-[rgb(102,102,102)] dark:text-[rgb(102,102,102)] mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
            <p className="text-[rgb(102,102,102)] dark:text-[rgb(102,102,102)] text-center text-sm sm:text-base">
              No projects match your search query
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedProjects.map((project) => (
            <Card
              key={project._id}
              className={getProjectCardClass(project)}
              onClick={() => router.push(`/report/${project._id}`)}
            >
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{project.title}</span>
                      {project.team && (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium text-white whitespace-nowrap"
                          style={{ backgroundColor: project.team.color }}
                        >
                          {project.team.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </CardTitle>
                <CardDescription className="line-clamp-2 text-[rgb(102,102,102)] dark:text-[rgb(102,102,102)] text-sm">
                  {project.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[rgb(102,102,102)] dark:text-[rgb(102,102,102)]">
                    <AlertCircle className="h-4 w-4" />
                    <span>{project.totalSmells} code smells</span>
                  </div>
                  <div
                    className={cn(
                      "text-sm font-medium",
                      getQualityColor(project.qualityScore)
                    )}
                  >
                    {project.qualityScore}%
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15">
                  <div className="flex items-center gap-2 text-xs text-[rgb(102,102,102)] dark:text-[rgb(102,102,102)]">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(project.createdAt)}</span>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full",
                      project.qualityScore >= 70
                        ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900"
                        : project.qualityScore >= 40
                        ? "text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900"
                        : "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900"
                    )}
                  >
                    {getQualityLabel(project.qualityScore)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
