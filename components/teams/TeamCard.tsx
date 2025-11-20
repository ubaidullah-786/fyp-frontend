"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface Member {
  _id: string;
  username: string;
  name: string;
  photo?: string;
}

import { Team } from "@/lib/api";

interface Project {
  _id: string;
  title: string;
  totalSmells: number;
  qualityScore: number;
}

interface TeamCardProps {
  team: Team;
  isYourTeam: boolean;
  currentUserId?: string;
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
  getInitials: (name: string) => string;
  projects?: Project[];
}

export function TeamCard({
  team,
  isYourTeam,
  currentUserId,
  onEdit,
  onDelete,
  getInitials,
  projects = [],
}: TeamCardProps) {
  const creatorName =
    typeof team.creator === "string" ? "Unknown" : team.creator.name;

  return (
    <div className="bg-white dark:bg-[rgb(10,10,10)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 rounded-lg p-6 hover:shadow-lg transition-shadow">
      {/* Team Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div
            className="inline-block px-3 py-1 rounded-md text-white text-sm font-medium mb-2"
            style={{ backgroundColor: team.color }}
          >
            {team.name}
          </div>
          <p className="text-xs text-[rgb(136,136,136)]">
            Created by{" "}
            <span className="font-medium text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)]">
              {isYourTeam ? `${creatorName} (You)` : creatorName}
            </span>
          </p>
        </div>
        {isYourTeam && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(team)}
              className="p-2 hover:bg-[rgb(237,237,237)] dark:hover:bg-[rgb(237,237,237)]/10 rounded-md transition-colors cursor-pointer"
            >
              <Pencil className="w-4 h-4 text-[rgb(136,136,136)]" />
            </button>
            <button
              onClick={() => onDelete(team)}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        )}
      </div>

      {/* Content Grid: Members on left, Projects on right */}
      <div
        className={`grid gap-8 ${
          projects && projects.length > 0
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-1"
        }`}
      >
        {/* Team Members */}
        <div>
          <p className="text-sm font-medium text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)] mb-3">
            Members ({team.members.length + 1})
          </p>
          <div className="space-y-2">
            {/* Creator */}
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={
                    typeof team.creator !== "string"
                      ? team.creator.photo
                      : undefined
                  }
                />
                <AvatarFallback className="text-xs">
                  {getInitials(creatorName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 max-w-[140px]">
                <p className="text-sm font-medium text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)] truncate">
                  {creatorName}
                  {isYourTeam ? " (You)" : ""}
                </p>
                <p className="text-xs text-[rgb(136,136,136)] truncate">
                  @
                  {typeof team.creator !== "string"
                    ? team.creator.username
                    : ""}
                </p>
              </div>
              <span className="text-xs bg-[rgb(237,237,237)] dark:bg-[rgb(237,237,237)]/10 px-2 py-1 rounded">
                Creator
              </span>
            </div>

            {/* Members */}
            {team.members.slice(0, 2).map((member) => {
              const isCurrentUser = currentUserId === member._id;
              return (
                <div key={member._id} className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={member.photo} />
                    <AvatarFallback className="text-xs">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 max-w-[140px]">
                    <p className="text-sm font-medium text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)] truncate">
                      {member.name}
                      {isCurrentUser ? " (You)" : ""}
                    </p>
                    <p className="text-xs text-[rgb(136,136,136)] truncate">
                      @{member.username}
                    </p>
                  </div>
                </div>
              );
            })}
            {team.members.length > 2 && (
              <p className="text-xs text-[rgb(136,136,136)] mt-2">
                +{team.members.length - 2} more members
              </p>
            )}
          </div>
        </div>

        {/* Projects Section */}
        {projects && projects.length > 0 && (
          <div>
            <p className="text-sm font-medium text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)] mb-3">
              Projects ({projects.length})
            </p>
            <div className="space-y-1.5">
              {projects.slice(0, 3).map((project) => (
                <Link
                  key={project._id}
                  href={`/report/${project._id}`}
                  className="block text-sm font-medium text-[rgb(82,168,255)] hover:underline truncate"
                >
                  {project.title}
                </Link>
              ))}
              {projects.length > 3 && (
                <p className="text-xs text-[rgb(136,136,136)] mt-2">
                  +{projects.length - 3} more
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
