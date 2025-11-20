"use client";

import { API_BASE_URL } from "@/lib/config";
import { getToken } from "@/lib/auth";

export type ApiFetchOptions = RequestInit & {
  auth?: boolean;
  body?: any;
  onUploadProgress?: (progress: number) => void;
};

export async function apiFetch<T = any>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<{ ok: boolean; status: number; data?: T; error?: any }> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  // If onUploadProgress is provided and body is FormData, use XMLHttpRequest
  if (options.onUploadProgress && options.body instanceof FormData) {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();

      // Set up progress tracking
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && options.onUploadProgress) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          options.onUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        let payload: any = undefined;
        try {
          payload = JSON.parse(xhr.responseText);
        } catch {
          // ignore json parse errors
        }

        const ok = xhr.status >= 200 && xhr.status < 300;

        if (!ok) {
          console.error("[apiFetch] Request failed:", {
            url,
            status: xhr.status,
            method: options.method || "POST",
            isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
            payload,
          });
        }

        resolve({
          ok,
          status: xhr.status,
          data: payload,
          error: !ok ? payload : undefined,
        });
      };

      xhr.onerror = () => {
        console.error("[apiFetch] Network error:", {
          url,
          method: options.method || "POST",
          isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
          userAgent: navigator.userAgent,
        });

        resolve({
          ok: false,
          status: 0,
          error: { message: "Network error" },
        });
      };

      xhr.ontimeout = () => {
        console.error("[apiFetch] Request timeout:", {
          url,
          method: options.method || "POST",
        });

        resolve({
          ok: false,
          status: 0,
          error: { message: "Request timeout - please check your connection" },
        });
      };

      // Open connection
      xhr.open(options.method || "POST", url);

      // Set headers
      if (options.auth) {
        const token = getToken();
        if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      // Set timeout (60 seconds for large uploads)
      xhr.timeout = 60000;

      // Set credentials
      xhr.withCredentials = true;

      // Send request
      xhr.send(options.body);
    });
  }

  // Original fetch implementation for non-upload requests
  const headers = new Headers(options.headers || {});

  const fetchOptions: RequestInit = {
    ...options,
    credentials: "include",
  };

  if (options.auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const body =
    options.body &&
    typeof options.body === "object" &&
    !(options.body instanceof FormData)
      ? JSON.stringify(options.body)
      : (options.body as BodyInit | undefined);

  if (body && !(options.body instanceof FormData)) {
    if (!headers.has("Content-Type"))
      headers.set("Content-Type", "application/json");
  }

  fetchOptions.headers = headers;
  fetchOptions.body = body;

  try {
    // Add timeout for mobile stability (60 seconds for large uploads)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    fetchOptions.signal = controller.signal;

    const res = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    let payload: any = undefined;
    try {
      payload = await res.json();
    } catch {
      // ignore json parse errors
    }

    // Log failed requests for debugging mobile issues
    if (!res.ok) {
      console.error("[apiFetch] Request failed:", {
        url,
        status: res.status,
        method: options.method || "GET",
        isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
        payload,
      });
    }

    return {
      ok: res.ok,
      status: res.status,
      data: payload,
      error: !res.ok ? payload : undefined,
    };
  } catch (err: any) {
    console.error("[apiFetch] Network error:", {
      url,
      method: options.method || "GET",
      error: err.message,
      errorName: err.name,
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
      userAgent: navigator.userAgent,
    });

    // Better error message for timeout
    const errorMessage =
      err.name === "AbortError"
        ? "Request timeout - please check your connection"
        : "Network error";

    return { ok: false, status: 0, error: { message: errorMessage } };
  }
}

// ============================
// Team API Functions
// ============================

export interface Team {
  _id: string;
  name: string;
  color: string;
  creator: {
    _id: string;
    name: string;
    username: string;
    photo?: string;
  };
  members: Array<{
    _id: string;
    name: string;
    username: string;
    photo?: string;
  }>;
  createdAt: string;
}

export interface CreateTeamData {
  name: string;
  members: string[]; // array of user IDs
}

export interface UpdateTeamData {
  name?: string;
  members?: string[];
}

export async function createTeam(data: CreateTeamData) {
  return apiFetch<{ data: { team: Team } }>("/api/v1/teams", {
    method: "POST",
    auth: true,
    body: data,
  });
}

export async function getMyTeams() {
  return apiFetch<{ teams: Team[]; results: number }>(
    "/api/v1/teams/my-teams",
    {
      method: "GET",
      auth: true,
    }
  );
}

export async function getTeamsWhereAdded() {
  return apiFetch<{ teams: Team[]; results: number }>(
    "/api/v1/teams/added-to",
    {
      method: "GET",
      auth: true,
    }
  );
}

export async function getAllUserTeams() {
  return apiFetch<{
    data: {
      myTeams: Team[];
      addedToTeams: Team[];
      hasTeams: boolean;
      totalTeams: number;
    };
  }>("/api/v1/teams", {
    method: "GET",
    auth: true,
  });
}

export async function getTeam(teamId: string) {
  return apiFetch<{ team: Team; isCreator: boolean }>(
    `/api/v1/teams/${teamId}`,
    {
      method: "GET",
      auth: true,
    }
  );
}

export async function updateTeam(teamId: string, data: UpdateTeamData) {
  return apiFetch<{ team: Team }>(`/api/v1/teams/${teamId}`, {
    method: "PATCH",
    auth: true,
    body: data,
  });
}

export async function deleteTeam(teamId: string) {
  return apiFetch(`/api/v1/teams/${teamId}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function checkTeamMembership(members: string[]) {
  return apiFetch<{
    status: "new" | "exists";
    message?: string;
    team?: Team;
  }>("/api/v1/teams/check-membership", {
    method: "POST",
    auth: true,
    body: { members },
  });
}

export async function searchUsersByUsername(query: string) {
  return apiFetch<{
    users: Array<{
      _id: string;
      name: string;
      username: string;
      photo?: string;
    }>;
  }>(`/api/v1/users/search?username=${encodeURIComponent(query)}`, {
    method: "GET",
    auth: true,
  });
}
