"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getToken, getUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Download,
  Upload,
  Loader2,
  ChevronDown,
  Trash2,
  Edit2,
  ArrowLeft,
  FileArchive,
  X,
  Upload as UploadIcon,
} from "lucide-react";
import { ProjectBarsChart } from "@/components/dashboard/project-bars-chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Report {
  totalFiles: number;
  totalSmells: number;
  AffectedFiles: number;
  chartData: { category: string; value: number; color: string }[];
  smells: any[];
}

interface Version {
  _id: string;
  version: number;
  report: Report;
  createdAt: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  qualityScore: number;
  totalSmells: number;
  owner: string;
  latestVersion: Version;
  previousVersions?: Version[];
  allVersions?: Version[];
  createdAt: string;
}

type TabType = "overview" | "code" | "settings";

export default function ReportPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const activeTab = (searchParams?.get("tab") as TabType) || "overview";
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    null
  );
  const [currentVersionData, setCurrentVersionData] = useState<Version | null>(
    null
  );
  const [allVersions, setAllVersions] = useState<Version[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showDeleteWarnings, setShowDeleteWarnings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const currentUser = getUser();
  const isOwner =
    currentUser?.id && project?.owner
      ? currentUser.id === project.owner.toString()
      : false;

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
      fetchProject();
    }
  }, [id, router]);

  useEffect(() => {
    if (project && selectedVersionId) {
      fetchVersionData(selectedVersionId);
    }
  }, [selectedVersionId, project]);

  // Auto-redirect to code editor when on code tab
  useEffect(() => {
    if (activeTab === "code" && id) {
      router.push(`/code-editor/${id}`);
    }
  }, [activeTab, id, router]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const response = await apiFetch<any>(
        `/api/v1/projects/get-project/${id}`,
        { auth: true }
      );

      console.log("Full response:", response);
      console.log("Response ok:", response.ok);
      console.log("Response data:", response.data);
      console.log("Response error:", response.error);

      if (response.ok && response.data) {
        const projectData =
          response.data.data?.project || response.data.project || response.data;
        if (projectData) {
          setProject(projectData);
          setEditTitle(projectData.title);
          setEditDescription(projectData.description);
          // Set latest version as default
          setSelectedVersionId(projectData.latestVersion?._id);
          setCurrentVersionData(projectData.latestVersion);
          // Set all versions from response
          if (projectData.allVersions) {
            setAllVersions(projectData.allVersions);
          } else {
            // Fallback: combine latestVersion and previousVersions
            const versions = [
              projectData.latestVersion,
              ...(projectData.previousVersions || []),
            ].filter(Boolean);
            setAllVersions(versions);
          }
        } else {
          throw new Error("Project data not found in response");
        }
      } else {
        const errorMsg =
          response.error?.message ||
          response.error?.error ||
          JSON.stringify(response.error) ||
          "Failed to load project";
        console.error("API Error:", errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error("Error fetching project:", err);
      setError(err.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const fetchVersionData = async (versionId: string) => {
    // Find the version in allVersions
    const version = allVersions.find((v) => v._id === versionId);
    if (version) {
      setCurrentVersionData(version);
    } else if (versionId === project?.latestVersion?._id) {
      // Fallback to latest version
      setCurrentVersionData(project.latestVersion);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type !== "application/zip" &&
        !selectedFile.name.endsWith(".zip")
      ) {
        setError("Please select a ZIP file");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("project", file);

      const response = await apiFetch<any>(
        `/api/v1/projects/update-project/${id}`,
        {
          method: "PATCH",
          body: formData,
          auth: true,
        }
      );

      if (response.ok && response.data) {
        fetchProject();
        setDialogOpen(false);
        setFile(null);
      } else {
        throw new Error(response.error || "Failed to update project");
      }
    } catch (err: any) {
      console.error("Error updating project:", err);
      setError(err.message || "Failed to update project");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await apiFetch<any>(
        `/api/v1/projects/update-project-details/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editTitle,
            description: editDescription,
          }),
          auth: true,
        }
      );

      if (response.ok && response.data) {
        await fetchProject();
      } else {
        throw new Error(response.error || "Failed to update project details");
      }
    } catch (err: any) {
      console.error("Error updating project details:", err);
      setError(err.message || "Failed to update project details");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    setDeleting(true);
    setError(null);
    try {
      const response = await apiFetch<any>(
        `/api/v1/projects/delete-project/${id}`,
        {
          method: "DELETE",
          auth: true,
        }
      );

      // 204 means success with no content
      if (response.ok || response.status === 204) {
        // Check if user has remaining projects
        const projectsRes = await apiFetch<any>("/api/v1/projects", {
          method: "GET",
          auth: true,
        });

        if (projectsRes.ok && projectsRes.data) {
          const totalProjects = projectsRes.data.totalProjects || 0;
          if (totalProjects > 0) {
            router.push("/projects");
          } else {
            router.push("/upload");
          }
        } else {
          // Fallback to projects page if check fails
          router.push("/projects");
        }
      } else {
        const errorMsg =
          response.error?.message ||
          response.error?.error ||
          (typeof response.error === "string" ? response.error : null) ||
          "Failed to delete project";
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error("Error deleting project:", err);
      setError(err.message || "Failed to delete project");
      setDeleting(false);
    }
  };

  const downloadJson = () => {
    if (!currentVersionData?.report?.smells) return;
    const smells = currentVersionData.report.smells;
    const dataStr = JSON.stringify(smells, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "smells-report.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCsv = () => {
    const smells = currentVersionData?.report?.smells;
    if (!smells || smells.length === 0) return;

    const keys = Object.keys(smells[0]);
    const csvRows = [
      keys.join(","),
      ...smells.map((row: any) =>
        keys
          .map((key) => `"${(row[key] ?? "").toString().replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "smells-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const getQualityColor = (score: number) => {
    if (score >= 70) return "text-green-600 dark:text-green-500";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-500";
    return "text-red-600 dark:text-red-500";
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(237,237,237)] dark:bg-[rgb(0,0,0)]">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
          {/* Back Button Skeleton */}
          <div className="mb-4">
            <Skeleton className="h-10 w-40 bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
          </div>

          {/* Header Skeleton */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-64 bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
                  <Skeleton className="h-6 w-12 rounded-xl bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
                </div>
                <Skeleton className="h-4 w-96 bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-32 bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
                <Skeleton className="h-10 w-32 bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-[rgb(237,237,237)] dark:bg-[rgb(237,237,237)]/15 mb-6 sm:mb-8" />

          {/* Stats Grid Skeleton - Number on top, text below */}
          <div className="grid gap-6 sm:gap-8 md:grid-cols-4 mb-8">
            {[
              "Total Files",
              "Affected Files",
              "Code Smells",
              "Code Quality",
            ].map((label) => (
              <div key={label} className="text-center">
                <Skeleton className="h-12 sm:h-16 w-24 mx-auto mb-3 bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
                <p className="text-sm sm:text-base text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)]">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Chart Skeleton */}
          <div className="bg-white dark:bg-[rgb(10,10,10)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 rounded-lg p-6">
            <Skeleton className="h-6 w-64 mb-6 bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="h-20 w-full bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-[rgb(237,237,237)] dark:bg-[rgb(0,0,0)]">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!project || !currentVersionData) {
    return null;
  }

  const report = currentVersionData.report;

  // Create version bars for all versions (for comparison chart)
  const versionBars = allVersions
    .map((version) => ({
      id: version._id,
      title: `V${version.version}`,
      totalSmells: version.report?.totalSmells || 0,
      qualityScore: project.qualityScore || 0,
      createdAt: version.createdAt,
    }))
    .sort((a, b) => {
      // Sort by version number
      const versionA = parseInt(a.title.substring(1));
      const versionB = parseInt(b.title.substring(1));
      return versionA - versionB;
    });

  return (
    <div className="min-h-screen bg-[rgb(250,250,250)] dark:bg-[rgb(0,0,0)]">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            {/* Left: Title with Version Badge */}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                  {project.title}
                </h1>
                <span className="w-10 h-6 rounded-xl bg-[rgb(0,0,0)] dark:bg-[rgb(237,237,237)] text-white dark:text-[rgb(0,0,0)] flex items-center justify-center font-semibold">
                  v{currentVersionData.version}
                </span>
              </div>
              <p className="text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] text-sm sm:text-base mt-1">
                {project.description || "No description provided"}
              </p>
            </div>

            {/* Right: Version Dropdown and Download Button - Hide on Settings Tab */}
            {activeTab !== "settings" && (
              <div className="flex items-center gap-3 self-start">
                {/* Version Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 gap-6 !border-[1.3px] !border-[rgb(237,237,237)] dark:!border-[rgb(237,237,237)]/15 !bg-white dark:!bg-[rgb(10,10,10)] hover:!bg-[rgb(245,245,245)] dark:hover:!bg-[rgb(20,20,20)] !transition-all"
                    >
                      <span className="text-sm font-medium">
                        Version {currentVersionData.version}
                      </span>
                      <ChevronDown className="h-4 w-4 text-[rgb(136,136,136)]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="!border-[1.3px] !border-[rgb(237,237,237)] dark:!border-[rgb(237,237,237)]/15 !bg-white dark:!bg-[rgb(10,10,10)] !shadow-lg"
                  >
                    {[...allVersions]
                      .sort((a, b) => b.version - a.version)
                      .map((version) => (
                        <DropdownMenuItem
                          key={version._id}
                          onClick={() => setSelectedVersionId(version._id)}
                          className="block px-3 py-2 text-[14px] text-[rgb(102,102,102)] dark:text-[rgb(161,161,161)] hover:!text-[rgb(23,23,23)] dark:hover:!text-[rgb(237,237,237)] hover:!bg-[rgba(0,0,0,0.05)] dark:hover:!bg-[rgba(255,255,255,0.06)] rounded-md transition-colors cursor-pointer"
                        >
                          Version {version.version}
                          {version._id === project.latestVersion._id &&
                            " (Latest)"}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Download Button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="h-10 sm:h-11 px-6 text-sm sm:text-base bg-[rgb(0,0,0)] dark:bg-[rgb(237,237,237)] text-white dark:text-[rgb(0,0,0)] hover:bg-[rgb(30,30,30)] dark:hover:bg-[rgb(220,220,220)] gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="!border-[1.3px] !border-[rgb(237,237,237)] dark:!border-[rgb(237,237,237)]/15 !bg-white dark:!bg-[rgb(10,10,10)] !shadow-lg"
                  >
                    <DropdownMenuItem
                      onClick={downloadJson}
                      className="block px-3 py-2 text-[14px] text-[rgb(102,102,102)] dark:text-[rgb(161,161,161)] hover:!text-[rgb(23,23,23)] dark:hover:!text-[rgb(237,237,237)] hover:!bg-[rgba(0,0,0,0.05)] dark:hover:!bg-[rgba(255,255,255,0.06)] rounded-md transition-colors cursor-pointer"
                    >
                      Download JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={downloadCsv}
                      className="block px-3 py-2 text-[14px] text-[rgb(102,102,102)] dark:text-[rgb(161,161,161)] hover:!text-[rgb(23,23,23)] dark:hover:!text-[rgb(237,237,237)] hover:!bg-[rgba(0,0,0,0.05)] dark:hover:!bg-[rgba(255,255,255,0.06)] rounded-md transition-colors cursor-pointer"
                    >
                      Download CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>

        <div className="h-[1px] bg-[rgb(0,0,0)]/10 dark:bg-[rgb(250,250,250)]/15 mb-6 sm:mb-8" />

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Stats Grid */}
            <div className="grid gap-6 sm:gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)]">
                  {report?.totalFiles || 0}
                </div>
                <p className="text-sm sm:text-base text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] mt-3">
                  Total Files
                </p>
              </div>

              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)]">
                  {report?.AffectedFiles || 0}
                </div>
                <p className="text-sm sm:text-base text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] mt-3">
                  Affected Files
                </p>
              </div>

              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)]">
                  {report?.totalSmells || 0}
                </div>
                <p className="text-sm sm:text-base text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] mt-3">
                  Code Smells
                </p>
              </div>

              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)]">
                  {project.qualityScore || 0}%
                </div>
                <p className="text-sm sm:text-base text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] mt-3">
                  Code Quality
                </p>
              </div>
            </div>

            {/* Version Bars Chart */}
            <ProjectBarsChart projectBars={versionBars} />
          </div>
        )}

        {/* View Code Tab - Auto redirects to code editor */}

        {/* Settings Tab (Creator Only) */}
        {activeTab === "settings" && isOwner && (
          <div className="space-y-6 mx-auto max-w-2xl">
            {/* Upload New Version */}
            <Card className="bg-white dark:bg-[rgb(10,10,10)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15">
              <CardHeader>
                <CardTitle className="text-lg">Upload New Version</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  {file ? (
                    <div className="flex items-center justify-between p-4 border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 rounded-lg bg-white dark:bg-[rgb(10,10,10)]">
                      <div className="flex items-center gap-3">
                        <FileArchive className="h-8 w-8 text-[rgb(0,104,214)]" />
                        <div>
                          <p className="text-sm font-medium text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)]">
                            {file.name}
                          </p>
                          <p className="text-xs text-[rgb(136,136,136)]">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          const input = document.getElementById(
                            "version-file"
                          ) as HTMLInputElement;
                          if (input) input.value = "";
                        }}
                        className="p-1 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors cursor-pointer"
                        disabled={isUploading}
                      >
                        <X className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="version-file"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/20 rounded-lg cursor-pointer hover:bg-[rgb(245,245,245)] dark:hover:bg-[rgb(10,10,10)] transition-colors"
                    >
                      <UploadIcon className="h-8 w-8 text-[rgb(136,136,136)] mb-2" />
                      <span className="text-sm text-[rgb(136,136,136)]">
                        Choose file
                      </span>
                      <span className="text-xs text-[rgb(136,136,136)] mt-1">
                        Max 100MB
                      </span>
                    </label>
                  )}
                  <Input
                    id="version-file"
                    type="file"
                    accept=".zip"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <p className="text-xs text-[rgb(136,136,136)]">
                    Maximum file size: 100MB. Supported format: ZIP
                  </p>
                </div>
                {file && (
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full h-10 sm:h-11 text-sm sm:text-base bg-[rgb(0,0,0)] dark:bg-[rgb(237,237,237)] text-white dark:text-[rgb(0,0,0)] hover:bg-[rgb(30,30,30)] dark:hover:bg-[rgb(220,220,220)] gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload Version
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Edit Project Details */}
            <Card className="bg-white dark:bg-[rgb(10,10,10)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15">
              <CardHeader>
                <CardTitle className="text-lg">Edit Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title" className="text-sm sm:text-base">
                    Project Title
                  </Label>
                  <Input
                    id="edit-title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="h-10 sm:h-11 text-sm sm:text-base border-[1.3px] border-[rgb(0,0,0)]/10 dark:border-[rgb(237,237,237)]/15 bg-white dark:bg-[rgb(10,10,10)] hover:border-[rgb(0,0,0)]/20 dark:hover:border-[rgb(245,245,245)]/20 focus-visible:border-[rgb(255,255,255)] dark:focus-visible:border-[rgb(255,255,255)]/50 focus-visible:shadow-[0_0_0_2.5px_rgb(60,61,60)]/20 dark:focus-visible:shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-description"
                    className="text-sm sm:text-base"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="text-sm sm:text-base !border-[1.3px] !border-[rgb(0,0,0)]/10 dark:!border-[rgb(237,237,237)]/15 !bg-white dark:!bg-[rgb(10,10,10)] hover:!border-[rgb(0,0,0)]/20 dark:hover:!border-[rgb(245,245,245)]/20 focus-visible:!border-[rgb(255,255,255)] dark:focus-visible:!border-[rgb(255,255,255)]/50 focus-visible:!shadow-[0_0_0_2.5px_rgb(60,61,60)]/20 dark:focus-visible:!shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:!outline-none !transition-all"
                  />
                </div>
                {(editTitle !== project?.title ||
                  editDescription !== project?.description) && (
                  <Button
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className="w-full h-10 sm:h-11 text-sm sm:text-base bg-[rgb(0,0,0)] dark:bg-[rgb(237,237,237)] text-white dark:text-[rgb(0,0,0)] hover:bg-[rgb(30,30,30)] dark:hover:bg-[rgb(220,220,220)] cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Delete Project */}
            <Card className="bg-white dark:bg-[rgb(10,10,10)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(103,30,33)]">
              <CardHeader>
                <CardTitle className="text-lg">Delete Project</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-xs sm:text-sm text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)]">
                    Once you delete this project, there is no going back. Please
                    be certain.
                  </div>

                  {!showDeleteWarnings ? (
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteWarnings(true)}
                      className="cursor-pointer border-[rgb(103,30,33)] bg-[rgb(217,48,54)] text-[rgb(255,255,255)] hover:bg-[rgb(255,97,102)] dark:border-[rgb(103,30,33)] dark:bg-[rgb(217,48,54)] dark:text-[rgb(255,255,255)] dark:hover:bg-[rgb(255,97,102)] text-sm sm:text-base transition-colors"
                    >
                      Delete Project
                    </Button>
                  ) : !showDeleteConfirm ? (
                    <div className="space-y-4">
                      <div className="text-xs sm:text-sm">
                        <p className="font-medium mb-2">
                          ⚠️ Warning: This action is irreversible!
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li>All project data will be permanently deleted</li>
                          <li>All versions and code will be removed</li>
                          <li>All reports will be permanently deleted</li>
                        </ul>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="cursor-pointer border-[rgb(103,30,33)] bg-[rgb(217,48,54)] text-[rgb(255,255,255)] hover:bg-[rgb(255,97,102)] dark:border-[rgb(103,30,33)] dark:bg-[rgb(217,48,54)] dark:text-[rgb(255,255,255)] dark:hover:bg-[rgb(255,97,102)] text-sm sm:text-base transition-colors"
                      >
                        I want to delete this project
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-xs sm:text-sm">
                        <p className="font-medium mb-2">
                          ⚠️ Warning: This action is irreversible!
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li>All project data will be permanently deleted</li>
                          <li>All versions and code will be removed</li>
                          <li>All reports will be permanently deleted</li>
                        </ul>
                      </div>
                      <div>
                        <label className="block text-[rgb(102,102,102)] dark:text-[rgb(136,136,136)] text-xs sm:text-sm font-medium mb-2">
                          Type{" "}
                          <span className="text-[rgb(23,23,23)] dark:text-[rgb(255,255,255)]">
                            {project?.title}
                          </span>{" "}
                          to confirm:
                        </label>
                        <Input
                          value={deleteInput}
                          onChange={(e) => setDeleteInput(e.target.value)}
                          className="border-[1.3px] border-[rgb(103,30,33)]/80 dark:border-[rgb(103,30,33)]/80 bg-white dark:bg-[rgb(10,10,10)] hover:border-[rgb(103,30,33)] dark:hover:border-[rgb(103,30,33)] focus-visible:border-[rgb(103,30,33)] dark:focus-visible:border-[rgb(103,30,33)] focus-visible:shadow-[0_0_0_3px_rgb(87,25,28)] dark:focus-visible:shadow-[0_0_0_3px_rgb(87,25,28)] focus-visible:outline-none transition-all"
                          disabled={deleting}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleDeleteProject}
                          disabled={deleting || deleteInput !== project?.title}
                          className="cursor-pointer bg-[rgb(217,48,54)] text-[rgb(255,255,255)] hover:bg-[rgb(255,97,102)] dark:bg-[rgb(217,48,54)] dark:text-[rgb(255,255,255)] dark:hover:bg-[rgb(255,97,102)] transition-colors"
                        >
                          {deleting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Deleting...
                            </>
                          ) : (
                            "Confirm Delete Project"
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setShowDeleteWarnings(false);
                            setDeleteInput("");
                          }}
                          disabled={deleting}
                          className="cursor-pointer bg-[rgb(237,237,237)] dark:bg-[rgb(10,10,10)] text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)] hover:bg-[rgb(220,220,220)] dark:hover:bg-[rgb(30,30,30)] border border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/20 transition-colors"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
