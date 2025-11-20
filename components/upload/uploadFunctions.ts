import { getAllUserTeams, searchUsersByUsername } from "@/lib/api";

export interface FetchTeamsResult {
  myTeams: any[];
  addedToTeams: any[];
}

export const fetchTeams = async (): Promise<FetchTeamsResult> => {
  const response = await getAllUserTeams();
  if (response.ok && response.data) {
    return {
      myTeams: response.data.data.myTeams || [],
      addedToTeams: response.data.data.addedToTeams || [],
    };
  }
  return { myTeams: [], addedToTeams: [] };
};

export const searchMembers = async (
  query: string,
  currentMembers: string[],
  currentUserId?: string
): Promise<any[]> => {
  if (query.length < 2) return [];

  try {
    const res = await searchUsersByUsername(query);
    if (res.ok && res.data) {
      return res.data.users.filter(
        (u) => !currentMembers.includes(u._id) && u._id !== currentUserId
      );
    }
    return [];
  } catch (error) {
    console.error("Failed to search users:", error);
    return [];
  }
};

export const checkDuplicateTeam = (
  teamName: string,
  myTeams: any[],
  addedToTeams: any[]
): boolean => {
  const allTeams = [...myTeams, ...addedToTeams];
  return allTeams.some(
    (team) => team.name.toLowerCase() === teamName.toLowerCase()
  );
};
