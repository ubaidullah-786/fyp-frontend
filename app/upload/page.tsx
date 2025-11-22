"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUser } from "@/lib/auth";
import {
  apiFetch,
  createTeam,
  checkTeamMembership,
  type Team,
} from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Upload as UploadIcon,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { TeamSelectionSection } from "@/components/upload/TeamSelectionSection";
import { NewTeamForm } from "@/components/upload/NewTeamForm";
import { VersionUploadSection } from "@/components/upload/VersionUploadSection";
import { FileUploadSection } from "@/components/upload/FileUploadSection";
import { ProjectDetailsSection } from "@/components/upload/ProjectDetailsSection";
import { SubmitButton } from "@/components/upload/SubmitButton";
import { AlertMessages } from "@/components/upload/AlertMessages";
import {
  fetchTeams,
  searchMembers as searchMembersHelper,
  checkDuplicateTeam,
} from "@/components/upload/uploadFunctions";
import {
  handleProjectUpload,
  validateUploadForm,
} from "@/components/upload/uploadHelpers";

export default function UploadPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [fileLoading, setFileLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState("");

  // Team-related states
  const [uploadToTeam, setUploadToTeam] = useState<"no" | "yes">("no");
  const [teamSelection, setTeamSelection] = useState<"existing" | "new">(
    "existing"
  );
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [newTeamName, setNewTeamName] = useState("Team 1");
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [teamMessage, setTeamMessage] = useState<string>("");
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [isCreatorOfAnyTeam, setIsCreatorOfAnyTeam] = useState(false);

  // Version upload states
  const [uploadingVersion, setUploadingVersion] = useState<"no" | "yes">("no");
  const [existingProjects, setExistingProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [canUploadVersion, setCanUploadVersion] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
      const userData = getUser();
      if (userData && typeof userData === "object") {
        const userId = (userData as any).id || (userData as any)._id;
        if (userId) {
          setCurrentUserId(userId);
        }
      }
    }
  }, [router]);

  useEffect(() => {
    if (uploadToTeam === "yes") {
      loadTeams();
    }
  }, [uploadToTeam]);

  useEffect(() => {
    if (currentUserId) {
      fetchExistingProjects();
    }
  }, [uploadToTeam, selectedTeamId, currentUserId, uploadingVersion]);

  const loadTeams = async () => {
    setLoadingTeams(true);
    try {
      const { myTeams, addedToTeams } = await fetchTeams();
      const combined = [...myTeams, ...addedToTeams];
      setAllTeams(combined);
      const isCreator = myTeams.length > 0;
      setIsCreatorOfAnyTeam(isCreator);
      setTeamSelection(isCreator ? "existing" : "new");
    } catch (error) {
      console.error("Failed to fetch teams:", error);
      setIsCreatorOfAnyTeam(false);
    } finally {
      setLoadingTeams(false);
    }
  };

  const fetchExistingProjects = async () => {
    try {
      let endpoint = "/api/v1/projects";
      const res = await apiFetch<{ data: { projects: any[] } }>(endpoint, {
        method: "GET",
        auth: true,
      });

      if (res.ok && res.data) {
        let projects = res.data.data.projects;

        // Filter projects based on team selection
        if (
          uploadToTeam === "yes" &&
          teamSelection === "existing" &&
          selectedTeamId
        ) {
          // Flow 4 & 5: For existing team, only show projects from this team where user is creator
          const selectedTeam = allTeams.find((t) => t._id === selectedTeamId);
          const creatorId =
            typeof selectedTeam?.creator === "string"
              ? selectedTeam.creator
              : selectedTeam?.creator?._id;
          const isTeamCreator = creatorId === currentUserId;

          projects = projects.filter(
            (p) => p.team?._id === selectedTeamId && isTeamCreator
          );
        } else if (uploadToTeam === "no") {
          // Flow 1 & 2: For personal uploads, only show user's own projects (no team)
          projects = projects.filter((p) => {
            const projectOwner =
              typeof p.owner === "string"
                ? p.owner
                : p.owner?._id || p.owner?.toString();
            return !p.team && projectOwner === currentUserId;
          });
        } else {
          // Flow 3: Creating new team - no projects available yet
          projects = [];
        }

        setExistingProjects(projects);
        setCanUploadVersion(projects.length > 0);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setCanUploadVersion(false);
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
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError("File size must be less than 100MB");
        setFile(null);
        return;
      }

      setError(null);
      setFileLoading(true);

      // Read the file to simulate loading into browser
      const reader = new FileReader();
      reader.onloadstart = () => {
        setFileLoading(true);
      };
      reader.onloadend = () => {
        setFile(selectedFile);
        // Keep the loading state for animation completion
        setTimeout(() => {
          setFileLoading(false);
        }, 1000); // 1 second to match the animation duration
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const searchMembers = async (query: string) => {
    setMemberSearch(query);
    setSearching(true);
    const results = await searchMembersHelper(
      query,
      teamMembers,
      currentUserId
    );
    setSearchResults(results);
    setSearching(false);
  };

  const addMember = (user: any) => {
    if (!teamMembers.includes(user._id)) {
      setTeamMembers([...teamMembers, user._id]);
      setSelectedUsers([...selectedUsers, user]);
    }
    setMemberSearch("");
    setSearchResults([]);
  };

  const removeMember = (userId: string) => {
    setTeamMembers(teamMembers.filter((id) => id !== userId));
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userId));
  };

  const checkDuplicateTeamMembership = async () => {
    if (teamMembers.length === 0) {
      setTeamMessage("");
      return;
    }

    try {
      const res = await checkTeamMembership(teamMembers);
      if (res.ok && res.data) {
        if (res.data.status === "exists") {
          setTeamMessage(
            res.data.message ||
              `You are already in team "${res.data.team?.name}" with these members`
          );
          // Don't clear members - just show the message
        } else {
          setTeamMessage("");
        }
      }
    } catch (error) {
      console.error("Failed to check team membership:", error);
    }
  };

  useEffect(() => {
    if (teamSelection === "new" && teamMembers.length > 0) {
      checkDuplicateTeamMembership();
    } else {
      setTeamMessage("");
    }
  }, [teamMembers, teamSelection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setUploadProgress(0);

    // Only validate title when creating a new project, not when uploading a version
    if (uploadingVersion !== "yes" && !title.trim()) {
      setError("Project title is required");
      return;
    }

    if (!file) {
      setError("Please select a ZIP file to upload");
      // Scroll to error at bottom after state updates
      setTimeout(() => {
        errorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
      return;
    }

    if (uploadToTeam === "yes") {
      if (teamSelection === "existing" && !selectedTeamId) {
        setError("Please select a team");
        return;
      }
      if (teamSelection === "new" && !newTeamName.trim()) {
        setError("Please enter a team name");
        return;
      }
      if (teamSelection === "new" && teamMembers.length === 0) {
        setError("Please add at least one team member");
        return;
      }
      // Check if trying to create duplicate team
      if (teamSelection === "new" && teamMessage) {
        setError(teamMessage);
        return;
      }
    }

    if (uploadingVersion === "yes" && !selectedProjectId) {
      setError("Please select a project for the new version");
      return;
    }

    setLoading(true);

    try {
      let teamId = selectedTeamId;

      // Create new team if needed
      if (uploadToTeam === "yes" && teamSelection === "new") {
        const teamRes = await createTeam({
          name: newTeamName,
          members: teamMembers,
        });

        if (!teamRes.ok) {
          // Handle backend error response
          const errorMsg =
            (teamRes as any).data?.message || "Failed to create team";
          setError(errorMsg);
          setLoading(false);
          return;
        }

        if (!teamRes.data) {
          throw new Error("Failed to create team");
        }

        // The response structure is { data: { data: { team } } }
        teamId = teamRes.data.data.team._id;

        // Refetch teams to update the list
        await loadTeams();
      }

      const formData = new FormData();
      formData.append("project", file);

      let endpoint = "/api/v1/projects/create-project";
      let method = "POST";

      if (uploadingVersion === "yes" && selectedProjectId) {
        // Uploading new version - only needs project file and description
        endpoint = `/api/v1/projects/update-project/${selectedProjectId}`;
        method = "PATCH";
        formData.append("description", description.trim());
      } else {
        // Creating new project - needs name, description, and team
        formData.append("name", title.trim());
        formData.append("description", description.trim());
        if (teamId) {
          formData.append("team", teamId);
        }
      }

      const response = await apiFetch<{
        project: { _id: string };
        analyzing?: boolean;
        jobId?: string;
      }>(endpoint, {
        method,
        body: formData,
        auth: true,
        onUploadProgress: (progress) => {
          setUploadProgress(progress);
        },
      });

      if (response.ok && response.data) {
        // Upload completed
        setLoading(false);
        setUploadProgress(100);
        setUploadSuccess(true);

        // Check if analysis is happening asynchronously
        if (response.data.analyzing && response.data.jobId) {
          setAnalyzing(true);
          setAnalysisMessage("Analyzing your project...");

          // After 5 seconds, update message to indicate large project
          const timer = setTimeout(() => {
            setAnalysisMessage(
              "Analyzing your project. Large project detected, this may take some time..."
            );
          }, 5000);

          // Start polling for analysis completion
          const projectId = response.data.project._id;
          const jobId = response.data.jobId;
          pollAnalysisStatus(jobId, projectId, timer);
        } else {
          // Analysis completed immediately (small project)
          setSuccess(true);
          setTimeout(() => {
            router.push(`/report/${response.data!.project._id}`);
          }, 1500);
        }
      } else {
        throw new Error(response.error || "Failed to upload project");
      }
    } catch (err: any) {
      console.error("Error uploading project:", err);
      setError(err.message || "Failed to upload project. Please try again.");
      setLoading(false);
    }
  };

  const pollAnalysisStatus = async (
    jobId: string,
    projectId: string,
    timer?: NodeJS.Timeout
  ) => {
    const maxAttempts = 180; // 6 minutes max (180 * 2 seconds)
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await apiFetch<{
          analysisStatus: string;
          project?: { _id: string };
          error?: string;
        }>(`/api/v1/projects/analysis-status/${jobId}`, {
          method: "GET",
          auth: true,
        });

        if (response.ok && response.data) {
          const { analysisStatus, project, error } = response.data;

          if (analysisStatus === "completed" && project) {
            if (timer) clearTimeout(timer);
            setAnalyzing(false);
            setSuccess(true);

            setTimeout(() => {
              router.push(`/report/${projectId}`);
            }, 1500);
            return;
          }

          if (analysisStatus === "failed") {
            if (timer) clearTimeout(timer);
            setAnalyzing(false);
            setError(error || "Analysis failed. Please try again.");
            return;
          }

          // Still analyzing or pending
          attempts++;
          if (attempts >= maxAttempts) {
            if (timer) clearTimeout(timer);
            setAnalyzing(false);
            setError(
              "Analysis is taking longer than expected. Please check your project later."
            );
            return;
          }

          // Continue polling
          setTimeout(poll, 2000); // Poll every 2 seconds
        } else {
          throw new Error(response.error || "Failed to check analysis status");
        }
      } catch (err: any) {
        console.error("Error polling analysis status:", err);
        if (timer) clearTimeout(timer);
        setAnalyzing(false);
        setError(
          err.message ||
            "Failed to check analysis status. Please refresh the page."
        );
      }
    };

    // Start polling
    poll();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-8 lg:py-12 min-h-screen bg-[rgb(237,237,237)] dark:bg-[rgb(0,0,0)]">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Upload Project
        </h1>
        <p className="text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] mt-2 text-sm sm:text-base">
          Upload a ZIP file containing your source code for analysis
        </p>
      </div>

      <Card className="bg-white dark:bg-[rgb(10,10,10)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Project Details</CardTitle>
          <CardDescription className="text-[rgb(136,136,136)] text-sm sm:text-base">
            Provide information about your project and upload the source code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 grid gap-6">
            {/* Team Selection Section */}
            <TeamSelectionSection
              uploadToTeam={uploadToTeam}
              setUploadToTeam={setUploadToTeam}
              teamSelection={teamSelection}
              setTeamSelection={setTeamSelection}
              isCreatorOfAnyTeam={isCreatorOfAnyTeam}
              allTeams={allTeams}
              selectedTeamId={selectedTeamId}
              setSelectedTeamId={setSelectedTeamId}
              currentUserId={currentUserId}
              loading={loading}
              loadingTeams={loadingTeams}
              resetTeamState={() => {
                setSelectedTeamId("");
                setTeamSelection("existing");
              }}
            >
              <NewTeamForm
                newTeamName={newTeamName}
                setNewTeamName={setNewTeamName}
                memberSearch={memberSearch}
                searchMembers={searchMembers}
                searchResults={searchResults}
                searching={searching}
                selectedUsers={selectedUsers}
                addMember={addMember}
                removeMember={removeMember}
                teamMessage={teamMessage}
                loading={loading}
              />
            </TeamSelectionSection>

            {/* Version Upload Section */}
            <VersionUploadSection
              canUploadVersion={canUploadVersion}
              uploadToTeam={uploadToTeam}
              teamSelection={teamSelection}
              selectedTeamId={selectedTeamId}
              uploadingVersion={uploadingVersion}
              setUploadingVersion={setUploadingVersion}
              existingProjects={existingProjects}
              selectedProjectId={selectedProjectId}
              setSelectedProjectId={setSelectedProjectId}
              loading={loading}
            />

            {/* Project Title and Description */}
            <ProjectDetailsSection
              uploadingVersion={uploadingVersion}
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              loading={loading}
            />

            {/* File Upload Section */}
            <FileUploadSection
              file={file}
              setFile={setFile}
              handleFileChange={handleFileChange}
              loading={loading}
              uploadProgress={uploadProgress}
              fileLoading={fileLoading}
            />

            {/* Submit Button */}
            <SubmitButton
              loading={loading}
              success={success}
              uploadSuccess={uploadSuccess}
              file={file}
              uploadProgress={uploadProgress}
            />
          </form>
        </CardContent>
      </Card>

      {/* Success and Error Alerts */}
      <AlertMessages
        success={success}
        error={error}
        uploadSuccess={uploadSuccess}
        ref={errorRef}
      />

      {/* Analyzing Alert */}
      {analyzing && (
        <Alert className="mt-6 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            {analysisMessage}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
