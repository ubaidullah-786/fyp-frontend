"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getAllUserTeams,
  deleteTeam,
  updateTeam,
  createTeam,
  searchUsersByUsername,
  checkTeamMembership,
  type Team,
  apiFetch,
} from "@/lib/api";
import { getUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { TeamCard } from "@/components/teams/TeamCard";
import { EditTeamDialog } from "@/components/teams/EditTeamDialog";
import { CreateTeamDialog } from "@/components/teams/CreateTeamDialog";
import { DeleteTeamDialog } from "@/components/teams/DeleteTeamDialog";
import { getInitials } from "@/components/teams/utils";

export default function TeamsPage() {
  const router = useRouter();
  const currentUser = getUser();
  const [activeTab, setActiveTab] = useState<"your-teams" | "added-to" | null>(
    null
  );
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [addedToTeams, setAddedToTeams] = useState<Team[]>([]);
  const [teamProjects, setTeamProjects] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editName, setEditName] = useState("");
  const [editMembers, setEditMembers] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [deleteConfirmTeam, setDeleteConfirmTeam] = useState<Team | null>(null);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamMembers, setNewTeamMembers] = useState<string[]>([]);
  const [selectedNewUsers, setSelectedNewUsers] = useState<any[]>([]);
  const [newTeamSearch, setNewTeamSearch] = useState("");
  const [newTeamSearchResults, setNewTeamSearchResults] = useState<any[]>([]);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [teamMessage, setTeamMessage] = useState<string>("");

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (myTeams.length > 0 || addedToTeams.length > 0) {
      fetchProjectsForTeams();
    }
  }, [myTeams, addedToTeams]);

  const fetchProjectsForTeams = async () => {
    try {
      const response = await apiFetch<{ data: { projects: any[] } }>(
        "/api/v1/projects",
        {
          method: "GET",
          auth: true,
        }
      );

      if (response.ok && response.data) {
        const projects = response.data.data.projects;
        // Group projects by team
        const projectsByTeam: Record<string, any[]> = {};

        projects.forEach((project) => {
          if (project.team && project.team._id) {
            const teamId = project.team._id;
            if (!projectsByTeam[teamId]) {
              projectsByTeam[teamId] = [];
            }
            projectsByTeam[teamId].push(project);
          }
        });

        setTeamProjects(projectsByTeam);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await getAllUserTeams();

      if (response.ok && response.data) {
        const myTeamsData = response.data.data.myTeams || [];
        const addedToTeamsData = response.data.data.addedToTeams || [];

        setMyTeams(myTeamsData);
        setAddedToTeams(addedToTeamsData);

        if (!activeTab) {
          setActiveTab("your-teams");
        }
      }
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      const res = await deleteTeam(teamId);
      if (res.ok) {
        setMyTeams((prev) => prev.filter((t) => t._id !== teamId));
        setDeleteConfirmTeam(null);
      }
    } catch (error) {
      console.error("Failed to delete team:", error);
    }
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setEditName(team.name);
    setEditMembers(team.members.map((m) => m._id));
    setMemberSearch("");
    setSearchResults([]);
  };

  const handleSaveEdit = async () => {
    if (!editingTeam) return;

    try {
      const res = await updateTeam(editingTeam._id, {
        name: editName,
        members: editMembers,
      });

      if (res.ok && res.data) {
        await fetchTeams();
        setEditingTeam(null);
      }
    } catch (error) {
      console.error("Failed to update team:", error);
    }
  };

  const searchMembers = async (query: string) => {
    setMemberSearch(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await searchUsersByUsername(query);
      if (res.ok && res.data) {
        const filtered = res.data.users.filter(
          (u) => !editMembers.includes(u._id)
        );
        setSearchResults(filtered);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Failed to search users:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const addMember = (userId: string) => {
    if (!editMembers.includes(userId)) {
      setEditMembers([...editMembers, userId]);
    }
    setMemberSearch("");
    setSearchResults([]);
  };

  const removeMember = (userId: string) => {
    setEditMembers(editMembers.filter((id) => id !== userId));
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    if (teamMessage) {
      // Don't create if duplicate team exists
      return;
    }

    setCreatingTeam(true);
    try {
      const res = await createTeam({
        name: newTeamName.trim(),
        members: newTeamMembers,
      });

      if (!res.ok) {
        const errorMsg = (res as any).data?.message || "Failed to create team";
        alert(errorMsg);
        setCreatingTeam(false);
        return;
      }

      if (res.ok && res.data) {
        await fetchTeams();
        setIsCreatingTeam(false);
        setNewTeamName("");
        setNewTeamMembers([]);
        setSelectedNewUsers([]);
        setNewTeamSearch("");
        setNewTeamSearchResults([]);
      }
    } catch (error) {
      console.error("Failed to create team:", error);
    } finally {
      setCreatingTeam(false);
    }
  };

  const searchNewTeamMembers = async (query: string) => {
    setNewTeamSearch(query);
    if (query.length < 2) {
      setNewTeamSearchResults([]);
      return;
    }

    try {
      const res = await searchUsersByUsername(query);
      if (res.ok && res.data) {
        const filtered = res.data.users.filter(
          (u) => !newTeamMembers.includes(u._id) && u._id !== currentUser?.id
        );
        setNewTeamSearchResults(filtered);
      } else {
        setNewTeamSearchResults([]);
      }
    } catch (error) {
      console.error("Failed to search users:", error);
      setNewTeamSearchResults([]);
    }
  };

  const addNewTeamMember = (userId: string, user: any) => {
    if (!newTeamMembers.includes(userId)) {
      setNewTeamMembers([...newTeamMembers, userId]);
      setSelectedNewUsers([...selectedNewUsers, user]);
    }
    setNewTeamSearch("");
    setNewTeamSearchResults([]);
  };

  const removeNewTeamMember = (userId: string) => {
    setNewTeamMembers(newTeamMembers.filter((id) => id !== userId));
    setSelectedNewUsers(selectedNewUsers.filter((u) => u._id !== userId));
  };

  const checkDuplicateTeamMembership = async () => {
    if (newTeamMembers.length === 0) {
      setTeamMessage("");
      return;
    }

    try {
      const res = await checkTeamMembership(newTeamMembers);
      if (res.ok && res.data) {
        if (res.data.status === "exists") {
          setTeamMessage(
            res.data.message ||
              `You are already in team "${res.data.team?.name}" with these members`
          );
        } else {
          setTeamMessage("");
        }
      }
    } catch (error) {
      console.error("Failed to check team membership:", error);
    }
  };

  useEffect(() => {
    if (newTeamMembers.length > 0) {
      checkDuplicateTeamMembership();
    } else {
      setTeamMessage("");
    }
  }, [newTeamMembers]);

  const displayedTeams = activeTab === "your-teams" ? myTeams : addedToTeams;

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(237,237,237)] dark:bg-[rgb(0,0,0)] p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)]">
              Teams
            </h1>
            <Skeleton className="h-10 w-32 bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Skeleton */}
            <div className="lg:w-64 flex-shrink-0 space-y-2">
              <Skeleton className="h-16 w-full rounded-lg bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
              <Skeleton className="h-16 w-full rounded-lg bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
            </div>

            {/* Team Cards Skeleton */}
            <div className="flex-1 grid grid-cols-1 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[rgb(10,10,10)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-8 w-32 rounded-md bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
                      <Skeleton className="h-4 w-48 bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-9 bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
                      <Skeleton className="h-9 w-9 bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
                    </div>
                  </div>
                  <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-24 bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
                      {[1, 2].map((j) => (
                        <div key={j} className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-full bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32 bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
                            <Skeleton className="h-3 w-24 bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(237,237,237)] dark:bg-[rgb(0,0,0)] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-46">
            <h1 className="text-3xl font-bold text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)]">
              Teams
            </h1>
            {activeTab === "your-teams" && myTeams.length > 0 && (
              <p className="mt-2 text-sm text-[rgb(136,136,136)]">
                To upload project in a team, go to{" "}
                <Link
                  href="/upload"
                  className="text-[rgb(82,168,255)] font-medium hover:underline"
                >
                  Upload
                </Link>
              </p>
            )}
          </div>
          <Button
            onClick={() => setIsCreatingTeam(true)}
            className="h-10 sm:h-11 text-sm sm:text-base bg-[rgb(0,0,0)] dark:bg-[rgb(237,237,237)] text-[rgb(255,255,255)] dark:text-[rgb(0,0,0)] hover:bg-[rgb(30,30,30)] dark:hover:bg-[rgb(220,220,220)] flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create Team
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 flex-shrink-0">
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => setActiveTab("your-teams")}
                className={`px-6 py-4 text-left transition-colors cursor-pointer rounded-lg ${
                  activeTab === "your-teams"
                    ? "text-[rgb(237,237,237)] dark:text-[rgb(237,237,237)] bg-[rgb(0,0,0)] dark:bg-[rgb(30,30,30)]"
                    : "text-[rgb(136,136,136)] hover:text-[rgb(237,237,237)] dark:hover:text-[rgb(237,237,237)] hover:bg-[rgb(0,0,0)] dark:hover:bg-[rgb(30,30,30)]"
                }`}
              >
                <div className="font-medium">Your Teams</div>
              </button>

              {addedToTeams.length > 0 && (
                <button
                  onClick={() => setActiveTab("added-to")}
                  className={`px-6 py-4 text-left transition-colors cursor-pointer rounded-lg ${
                    activeTab === "added-to"
                      ? "text-[rgb(237,237,237)] dark:text-[rgb(237,237,237)] bg-[rgb(0,0,0)] dark:bg-[rgb(30,30,30)]"
                      : "text-[rgb(136,136,136)] hover:text-[rgb(237,237,237)] dark:hover:text-[rgb(237,237,237)] hover:bg-[rgb(0,0,0)] dark:hover:bg-[rgb(30,30,30)]"
                  }`}
                >
                  <div className="font-medium">Added To</div>
                </button>
              )}
            </nav>
          </div>

          <div className="flex-1">
            {activeTab === "your-teams" && myTeams.length === 0 ? (
              <div className="bg-white dark:bg-[rgb(10,10,10)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 rounded-lg p-8">
                <div className="text-center py-8">
                  <p className="text-[rgb(136,136,136)]">
                    Currently you don't own any team.
                  </p>
                </div>
              </div>
            ) : activeTab === "added-to" && addedToTeams.length === 0 ? (
              <div className="bg-white dark:bg-[rgb(10,10,10)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 rounded-lg p-8">
                <div className="text-center py-8">
                  <p className="text-[rgb(136,136,136)]">
                    You haven't been added to any teams yet.
                  </p>
                </div>
              </div>
            ) : displayedTeams.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white dark:bg-[rgb(10,10,10)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 rounded-lg p-8">
                  <p className="text-[rgb(136,136,136)]">No teams available</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {displayedTeams.map((team) => (
                  <TeamCard
                    key={team._id}
                    team={team}
                    isYourTeam={activeTab === "your-teams"}
                    currentUserId={currentUser?.id}
                    onEdit={handleEditTeam}
                    onDelete={setDeleteConfirmTeam}
                    getInitials={getInitials}
                    projects={teamProjects[team._id] || []}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <EditTeamDialog
        editingTeam={editingTeam}
        editName={editName}
        editMembers={editMembers}
        memberSearch={memberSearch}
        searchResults={searchResults}
        searching={searching}
        onClose={() => setEditingTeam(null)}
        onSave={handleSaveEdit}
        onNameChange={setEditName}
        onSearchChange={searchMembers}
        onAddMember={addMember}
        onRemoveMember={removeMember}
        getInitials={getInitials}
      />

      <DeleteTeamDialog
        team={deleteConfirmTeam}
        onClose={() => setDeleteConfirmTeam(null)}
        onConfirm={handleDeleteTeam}
      />

      <CreateTeamDialog
        isOpen={isCreatingTeam}
        newTeamName={newTeamName}
        newTeamSearch={newTeamSearch}
        newTeamSearchResults={newTeamSearchResults}
        selectedNewUsers={selectedNewUsers}
        creatingTeam={creatingTeam}
        teamMessage={teamMessage}
        onClose={() => {
          setIsCreatingTeam(false);
          setNewTeamName("");
          setNewTeamMembers([]);
          setSelectedNewUsers([]);
          setNewTeamSearch("");
          setNewTeamSearchResults([]);
        }}
        onCreate={handleCreateTeam}
        onNameChange={setNewTeamName}
        onSearchChange={searchNewTeamMembers}
        onAddMember={addNewTeamMember}
        onRemoveMember={removeNewTeamMember}
        getInitials={getInitials}
      />
    </div>
  );
}
