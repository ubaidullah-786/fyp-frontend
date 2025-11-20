"use client";

import { apiFetch } from "@/lib/api";

interface UploadParams {
  file: File;
  title: string;
  description: string;
  teamId?: string;
  uploadingVersion: boolean;
  selectedProjectId?: string;
}

export async function handleProjectUpload({
  file,
  title,
  description,
  teamId,
  uploadingVersion,
  selectedProjectId,
}: UploadParams) {
  const formData = new FormData();
  formData.append("project", file);

  let endpoint = "/api/v1/projects/create-project";
  let method = "POST";

  if (uploadingVersion && selectedProjectId) {
    endpoint = `/api/v1/projects/update-project/${selectedProjectId}`;
    method = "PATCH";
    formData.append("description", description.trim());
  } else {
    formData.append("name", title.trim());
    formData.append("description", description.trim());
    if (teamId) {
      formData.append("team", teamId);
    }
  }

  return await apiFetch<{ project: { _id: string } }>(endpoint, {
    method,
    body: formData,
    auth: true,
  });
}

export function validateUploadForm(
  uploadingVersion: string,
  title: string,
  file: File | null,
  uploadToTeam: string,
  teamSelection: string,
  selectedTeamId: string,
  newTeamName: string,
  teamMembers: string[],
  selectedProjectId: string
): string | null {
  if (uploadingVersion !== "yes" && !title.trim()) {
    return "Project title is required";
  }

  if (!file) {
    return "Please select a ZIP file to upload";
  }

  if (uploadToTeam === "yes") {
    if (teamSelection === "existing" && !selectedTeamId) {
      return "Please select a team";
    }
    if (teamSelection === "new" && !newTeamName.trim()) {
      return "Please enter a team name";
    }
    if (teamSelection === "new" && teamMembers.length === 0) {
      return "Please add at least one team member";
    }
  }

  if (uploadingVersion === "yes" && !selectedProjectId) {
    return "Please select a project for the new version";
  }

  return null;
}
