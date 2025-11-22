"use client";

type TokenChangeHandler = (token: string | null) => void;
type UserInfo = {
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  photo?: string;
};
type ProjectsChangeHandler = (hasProjects: boolean) => void;

const TOKEN_KEY = "auth-token";
const USER_KEY = "user";
const subscribers: Set<TokenChangeHandler> = new Set();
const userSubscribers: Set<UserChangeHandler> = new Set();
const projectsSubscribers: Set<ProjectsChangeHandler> = new Set();

export function setToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    // also set a cookie for SSR/route handlers in the future if needed
    document.cookie = `${TOKEN_KEY}=${token}; path=/; SameSite=Lax`;
    notify(token);
  } catch {}
}

export function getToken(): string | null {
  try {
    const ls = localStorage.getItem(TOKEN_KEY);
    if (ls) return ls;
  } catch {}
  // best-effort cookie read (client-only)
  try {
    const m = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]+)`));
    return m ? decodeURIComponent(m[1]) : null;
  } catch {}
  return null;
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = `${TOKEN_KEY}=; path=/; Max-Age=0; SameSite=Lax`;
    notify(null);
  } catch {}
}

export function setUser(user: UserInfo) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    notifyUser(user);
  } catch {}
}

export function getUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserInfo) : null;
  } catch {
    return null;
  }
}

export function clearUser() {
  try {
    localStorage.removeItem(USER_KEY);
    notifyUser(null);
  } catch {}
}

function notify(token: string | null) {
  subscribers.forEach((fn) => {
    try {
      fn(token);
    } catch {}
  });
}

export function onTokenChange(handler: TokenChangeHandler) {
  subscribers.add(handler);
  return () => subscribers.delete(handler);
}

type UserChangeHandler = (user: UserInfo | null) => void;

export function onUserChange(handler: UserChangeHandler) {
  userSubscribers.add(handler);
  return () => userSubscribers.delete(handler);
}

function notifyUser(user: UserInfo | null) {
  userSubscribers.forEach((fn) => {
    try {
      fn(user);
    } catch {}
  });
}

function notifyProjects(hasProjects: boolean) {
  projectsSubscribers.forEach((fn) => {
    try {
      fn(hasProjects);
    } catch {}
  });
}

export function onProjectsChange(handler: ProjectsChangeHandler) {
  projectsSubscribers.add(handler);
  return () => projectsSubscribers.delete(handler);
}
