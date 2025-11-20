"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, ApiFetchOptions } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/config";
import { Pen, User as UserIcon, Eye, EyeOff } from "lucide-react";
import { Loader2 } from "lucide-react";
import { ProtectedClient } from "@/components/auth/protected-client";
import { format } from "date-fns";
import { clearToken, clearUser, setToken } from "@/lib/auth";

function formatTime(dateString?: string) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" }); // e.g. Oct
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

type User = {
  _id?: string;
  id?: string;
  username?: string | null;
  name?: string | null;
  email?: string | null;
  photo?: string | null;
  pendingEmail?: string | null;
  passwordChangedAt?: string | null;
};

export default function AccountPage() {
  return (
    <ProtectedClient>
      <AccountUI />
    </ProtectedClient>
  );
}

/** Helper: normalize various backend shapes into a user object */
function extractUser(payload: any): User | null {
  if (!payload) return null;
  const maybe = payload?.data ?? payload;
  if (!maybe) return null;
  if (maybe.userData) return maybe.userData;
  if (maybe.user) return maybe.user;
  if (maybe?.data?.userData) return maybe.data.userData;
  const keys = ["id", "_id", "email", "name"];
  if (typeof maybe === "object" && keys.some((k) => k in maybe)) return maybe;
  return null;
}

function imageSrc(photo: string | undefined): string | null {
  if (!photo) return null;
  if (photo.startsWith("http")) {
    return photo;
  }
  const url = `${API_BASE_URL}${
    photo.startsWith("/uploads/") ? "" : "/uploads/"
  }${photo}`;
  return url;
}

function formatDateToDDMonYYYY(iso?: string | null) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    // format: 10-Oct-2025
    return format(d, "dd-MMM-yyyy");
  } catch {
    return iso;
  }
}

function DeleteAccountSection({
  saving,
  setSaving,
  toast,
}: {
  saving: boolean;
  setSaving: (v: boolean) => void;
  toast: any;
}) {
  const [deleteInput, setDeleteInput] = useState("");
  const [showWarnings, setShowWarnings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function handleDeleteAccount() {
    if (deleteInput !== "DELETE") {
      toast({
        title: "Please type DELETE exactly to confirm",
        duration: 3000,
      });
      return;
    }

    setSaving(true);

    // First delete the account
    const { ok, error } = await apiFetch("/api/v1/users/delete-me", {
      method: "DELETE",
      auth: true,
    });

    if (!ok) {
      setSaving(false);
      toast({
        title: (error?.message as string) || "Deletion failed",
        duration: 3000,
      });
      return;
    }

    // Then logout to clear JWT and cookies
    try {
      await fetch(`${API_BASE_URL}/api/v1/users/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      // Ignore logout errors
    }

    // Clear auth token and user from localStorage and cookies
    clearToken();
    clearUser();

    // Clear all remaining local storage as backup
    try {
      localStorage.clear();
    } catch (err) {
      // Ignore localStorage errors
    }

    toast({
      title: "Account deleted successfully",
      duration: 2000,
    });

    // Force reload to clear all state and redirect to home
    setTimeout(() => {
      window.location.href = "/";
    }, 500);
  }

  return (
    <div className="rounded-lg border-[1.3px] border-[rgb(103,30,33)] dark:border-[rgb(103,30,33)] bg-card p-4 sm:p-6">
      <div className="flex-1">
        <div className="text-sm sm:text-base font-semibold">
          Delete Your Account
        </div>
        <div className="mt-2 text-xs sm:text-sm text-[rgb(237,237,237)] dark:text-[rgb(237,237,237)]/70">
          Once you delete your account, there is no going back. Please be
          certain.
        </div>

        {!showWarnings ? (
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowWarnings(true)}
              className="cursor-pointer border-[rgb(103,30,33)] bg-[rgb(217,48,54)] text-[rgb(255,255,255)] hover:bg-[rgb(255,97,102)] dark:border-[rgb(103,30,33)] dark:bg-[rgb(217,48,54)] dark:text-[rgb(255,255,255)] dark:hover:bg-[rgb(255,97,102)] text-sm sm:text-base transition-colors"
            >
              Delete Account
            </Button>
          </div>
        ) : !showDeleteConfirm ? (
          <div className="mt-4 space-y-4">
            <div className="text-xs sm:text-sm">
              <p className="font-medium mb-2">
                ⚠️ Warning: This action is irreversible!
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>
                  All your personal information will be permanently deleted
                </li>
                <li>All your posted ads will be removed from the platform</li>
                <li>All your chat conversations will be deleted</li>
                <li>All your messages will be permanently removed</li>
              </ul>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="cursor-pointer border-[rgb(103,30,33)] bg-[rgb(217,48,54)] text-[rgb(255,255,255)] hover:bg-[rgb(255,97,102)] dark:border-[rgb(103,30,33)] dark:bg-[rgb(217,48,54)] dark:text-[rgb(255,255,255)] dark:hover:bg-[rgb(255,97,102)] text-sm sm:text-base transition-colors"
            >
              I want to delete my account
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="text-xs sm:text-sm">
              <p className="font-medium mb-2">
                ⚠️ Warning: This action is irreversible!
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>
                  All your personal information will be permanently deleted
                </li>
                <li>All your posted ads will be removed from the platform</li>
                <li>All your chat conversations will be deleted</li>
                <li>All your messages will be permanently removed</li>
              </ul>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2">
                Type <span className="font-bold">DELETE</span> to confirm:
              </label>
              <Input
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                className="border-[1.3px] border-[rgb(103,30,33)]/80 dark:border-[rgb(103,30,33)]/80 bg-white dark:bg-[rgb(10,10,10)] hover:border-[rgb(103,30,33)] dark:hover:border-[rgb(103,30,33)] focus-visible:border-[rgb(103,30,33)] dark:focus-visible:border-[rgb(103,30,33)] focus-visible:shadow-[0_0_0_3px_rgb(87,25,28)] dark:focus-visible:shadow-[0_0_0_3px_rgb(87,25,28)] focus-visible:outline-none transition-all"
                disabled={saving}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleDeleteAccount}
                disabled={saving || deleteInput !== "DELETE"}
                className="cursor-pointer bg-[rgb(217,48,54)] text-[rgb(255,255,255)] hover:bg-[rgb(255,97,102)] dark:bg-[rgb(217,48,54)] dark:text-[rgb(255,255,255)] dark:hover:bg-[rgb(255,97,102)] transition-colors"
              >
                {saving ? "Deleting..." : "Confirm Delete Account"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setShowWarnings(false);
                  setDeleteInput("");
                }}
                disabled={saving}
                className="cursor-pointer bg-[rgb(237,237,237)] dark:bg-[rgb(10,10,10)] text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)] hover:bg-[rgb(220,220,220)] dark:hover:bg-[rgb(30,30,30)] border border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/20 transition-colors"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AccountUI() {
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // editing / UI toggles
  const [showEditControls, setShowEditControls] = useState(false); // controls visibility of edit UI and photo edit icon
  const [editingField, setEditingField] = useState<
    null | "name" | "email" | "password"
  >(null);

  // avatar file input / preview & upload states
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // editable values
  const [tempName, setTempName] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [originalEmail, setOriginalEmail] = useState(""); // Track original email
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // general UI state
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // initial load
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const { ok, data, error } = await apiFetch("/api/v1/users/me", {
        method: "GET",
        auth: true,
      });
      if (!mounted) return;
      if (ok) {
        const u = extractUser(data);
        if (u) {
          setUser(u);
          setTempName(u.name ?? "");
          setTempEmail(u.email ?? "");
          setOriginalEmail(u.email ?? ""); // Store original email
        }
      }
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // When clicking the avatar edit icon, open file chooser
  function triggerFileChooser() {
    fileRef.current?.click();
  }

  // user selected file -> auto-upload to /api/v1/users/update-me using FormData
  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    // Validate file type
    if (!f.type.startsWith("image/")) {
      setError("Please upload only image files");
      toast({
        title: "Please upload only image files",
        duration: 3000,
      });
      e.target.value = "";
      return;
    }

    // Validate file size (2MB max for user photo)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (f.size > maxSize) {
      setError("Profile photo must be less than 2MB");
      toast({
        title: "Profile photo must be less than 2MB",
        duration: 3000,
      });
      e.target.value = "";
      return;
    }

    // show local preview immediately
    const url = URL.createObjectURL(f);
    setAvatarPreview(url);
    // auto-upload
    setUploading(true);
    setMessage(null);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("photo", f);

      // send to same route /update-me as requested
      const { ok, data, error } = await apiFetch("/api/v1/users/update-me", {
        method: "PATCH",
        auth: true,
        body: fd,
      });

      if (!ok) {
        setError((error?.message as string) || "Photo update failed");
        toast({
          title: (error?.message as string) || "Photo update failed",
          duration: 3000,
        });
        // keep preview but don't apply; optionally you could clear preview
      } else {
        // normalize and update
        const updated = extractUser(data);
        if (updated) {
          setUser((u) => ({ ...(u ?? {}), ...(updated as User) }));
          // Update localStorage so header component picks up new photo
          try {
            localStorage.setItem("user", JSON.stringify(updated));
          } catch {}
        } else if (data?.photo) {
          setUser((u) => {
            const newUser = { ...(u ?? {}), photo: data.photo };
            // Update localStorage
            try {
              localStorage.setItem("user", JSON.stringify(newUser));
            } catch {}
            return newUser;
          });
        } else if (data?.user) {
          setUser((u) => {
            const newUser = { ...(u ?? {}), ...(data.user as User) };
            // Update localStorage
            try {
              localStorage.setItem("user", JSON.stringify(newUser));
            } catch {}
            return newUser;
          });
        } else {
          // fallback re-fetch
          const r = await apiFetch("/api/v1/users/me", {
            method: "GET",
            auth: true,
          });
          if (r.ok) {
            const u2 = extractUser(r.data);
            if (u2) {
              setUser(u2);
              // Update localStorage
              try {
                localStorage.setItem("user", JSON.stringify(u2));
              } catch {}
            }
          }
        }
        toast({ title: "Profile photo updated", duration: 2000 });
        // clear preview URL after upload; still show from user.photo afterwards
        setAvatarPreview(null);
        if (fileRef.current) fileRef.current.value = "";
      }
    } catch (err) {
      console.error(err);
      setError("Photo update failed");
      toast({ title: "Photo update failed", duration: 3000 });
    } finally {
      setUploading(false);
    }
  }

  // Cancel pending email
  async function cancelPendingEmail() {
    if (!confirm("Cancel pending email change?")) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    const { ok, data, error } = await apiFetch(
      "/api/v1/users/cancel-email-change",
      {
        method: "PATCH",
        auth: true,
      }
    );
    setSaving(false);
    if (!ok) {
      toast({
        title: (error?.message as string) || "Cancel failed",
        duration: 3000,
      });
      return;
    }
    // re-fetch user
    const r = await apiFetch("/api/v1/users/me", { method: "GET", auth: true });
    if (r.ok) {
      const u = extractUser(r.data);
      if (u) setUser(u);
    }
    toast({ title: "Pending email cancelled", duration: 2000 });
  }

  // Update name/email
  async function updateField(field: "name" | "email") {
    setSaving(true);
    setMessage(null);
    setError(null);

    const payload =
      field === "name" ? { name: tempName } : { email: tempEmail };

    const { ok, data, error } = await apiFetch("/api/v1/users/update-me", {
      method: "PATCH",
      auth: true,
      body: payload,
    } as ApiFetchOptions);

    setSaving(false);

    if (!ok) {
      setError((error?.message as string) || "Update failed");
      return;
    }

    const updated = extractUser(data);
    if (updated) {
      setUser((u) => ({ ...(u ?? {}), ...(updated as User) }));
      // Update localStorage
      try {
        localStorage.setItem(
          "user",
          JSON.stringify({ ...(user ?? {}), ...updated })
        );
      } catch {}
    } else if (data?.user) {
      const newUser = { ...(user ?? {}), ...(data.user as User) };
      setUser(() => newUser);
      // Update localStorage
      try {
        localStorage.setItem("user", JSON.stringify(newUser));
      } catch {}
    } else {
      const r = await apiFetch("/api/v1/users/me", {
        method: "GET",
        auth: true,
      });
      if (r.ok) {
        const u2 = extractUser(r.data);
        if (u2) {
          setUser(u2);
          // Update localStorage
          try {
            localStorage.setItem("user", JSON.stringify(u2));
          } catch {}
        }
      }
    }

    setEditingField(null);
    toast({
      title: `${field === "name" ? "Name" : "Email"} updated`,
      duration: 2000,
    });
  }

  // Update password
  async function updatePassword() {
    setSaving(true);
    setMessage(null);
    setError(null);

    if (!currPassword || !newPassword || !newPasswordConfirm) {
      setError("Fill all password fields");
      setSaving(false);
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setError("Passwords do not match");
      setSaving(false);
      return;
    }

    const { ok, data, error } = await apiFetch(
      "/api/v1/users/update-my-password",
      {
        method: "PATCH",
        auth: true,
        body: {
          currentPassword: currPassword,
          password: newPassword,
          passwordConfirm: newPasswordConfirm,
        },
      } as ApiFetchOptions
    );

    setSaving(false);

    if (!ok) {
      setError((error?.message as string) || "Password update failed");
      return;
    }

    // Extract and save new JWT token from response
    if ((data as any)?.token) {
      setToken((data as any).token);
    }

    // success: clear fields and refresh user for passwordChangedAt
    setEditingField(null);
    setCurrPassword("");
    setNewPassword("");
    setNewPasswordConfirm("");
    toast({ title: "Password updated", duration: 2000 });

    const r = await apiFetch("/api/v1/users/me", { method: "GET", auth: true });
    if (r.ok) {
      const u2 = extractUser(r.data);
      if (u2) setUser(u2);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 min-h-screen bg-[rgb(237,237,237)] dark:bg-[rgb(0,0,0)]">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
        Profile
      </h1>

      <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 md:grid-cols-3">
        {/* left panel: avatar + basic */}
        <div className="rounded-lg border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-card p-4 sm:p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-36 w-36 overflow-hidden rounded-full bg-muted flex items-center justify-center">
              {/* avatar image / preview / fallback */}
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                  sizes="144px"
                  unoptimized
                />
              ) : user?.photo && !imageError ? (
                user.photo.startsWith("http") ? (
                  // Try regular img tag for Cloudinary
                  <img
                    src={user.photo}
                    alt={user.name ?? "Profile"}
                    className="h-full w-full rounded-full object-cover"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    onError={() => {
                      setImageError(true);
                    }}
                  />
                ) : (
                  // Use Next Image for local images
                  <Image
                    src={imageSrc(user.photo) ?? ""}
                    alt={user.name ?? "Profile"}
                    fill
                    className="object-cover"
                    sizes="144px"
                    unoptimized
                    onError={() => {
                      setImageError(true);
                    }}
                  />
                )
              ) : (
                <div className="text-muted-foreground">
                  <UserIcon className="h-14 w-14" />
                </div>
              )}

              {/* Upload progress overlay */}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}

              {/* edit icon outside avatar circle (bottom-right) - only show if edit controls are enabled */}
              {showEditControls && !uploading && (
                <button
                  type="button"
                  onClick={triggerFileChooser}
                  title="Change profile photo"
                  className="absolute -right-1 -bottom-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow hover:bg-background/100 border border-border cursor-pointer"
                >
                  <Pen className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* hidden file input used for avatar changes */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileSelected}
            />

            <div className="text-center">
              <div className="text-base sm:text-lg font-medium">
                {user?.name ?? "—"}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {user?.email ?? "—"}
              </div>
            </div>

            {/* Edit account information toggle — shows/hides all editing features */}
            <div className="w-full">
              <Button
                className="w-full cursor-pointer bg-[rgb(0,0,0)] text-white hover:bg-[rgb(40,40,40)] dark:bg-white dark:text-[rgb(0,0,0)] dark:hover:bg-[rgb(220,220,220)] transition-colors"
                variant={showEditControls ? "secondary" : undefined}
                onClick={() => {
                  const newState = !showEditControls;
                  setShowEditControls(newState);
                  setEditingField(null);
                  // Only clear messages when closing editor completely
                  if (!newState) {
                    setMessage(null);
                    setError(null);
                  }
                }}
              >
                {showEditControls ? "Close editor" : "Edit account information"}
              </Button>
            </div>
          </div>
        </div>

        {/* right panel: fields */}
        <div className="md:col-span-2 space-y-4 sm:space-y-6">
          {/* Username (read-only) */}
          <div className="rounded-lg border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-card p-4 sm:p-6">
            <div className="text-xs sm:text-sm text-muted-foreground">
              Username
            </div>
            <div className="mt-1 text-base sm:text-lg font-medium">
              {user?.username ?? "—"}
            </div>
          </div>

          {/* Name */}
          <div className="rounded-lg border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-card p-4 sm:p-6 flex items-start justify-between">
            <div className="flex-1 pr-4">
              <div className="text-xs sm:text-sm text-muted-foreground">
                Name
              </div>

              {editingField === "name" && showEditControls ? (
                <>
                  <div className="mt-3">
                    <Input
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-white dark:bg-[rgb(10,10,10)] hover:border-[rgb(245,245,245)] dark:hover:border-[rgb(245,245,245)]/20 focus-visible:border-[rgb(255,255,255)] dark:focus-visible:border-[rgb(255,255,255)]/50 focus-visible:shadow-[0_0_0_2px_rgb(136,136,136)] dark:focus-visible:shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:outline-none transition-all"
                    />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      onClick={() => updateField("name")}
                      disabled={saving}
                      className="cursor-pointer bg-[rgb(0,0,0)] text-white hover:bg-[rgb(40,40,40)] dark:bg-white dark:text-[rgb(0,0,0)] dark:hover:bg-[rgb(220,220,220)] transition-colors"
                    >
                      {saving ? "Saving..." : "Update"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditingField(null);
                        setTempName(user?.name ?? "");
                      }}
                      className="cursor-pointer bg-[rgb(237,237,237)] dark:bg-[rgb(10,10,10)] text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)] hover:bg-[rgb(220,220,220)] dark:hover:bg-[rgb(30,30,30)] border border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/20 transition-colors"
                    >
                      Cancel
                    </Button>
                    {message ? (
                      <div className="ml-2 text-sm text-emerald-600">
                        {message}
                      </div>
                    ) : null}
                    {error ? (
                      <div className="ml-2 text-sm text-red-600">{error}</div>
                    ) : null}
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-1 text-base sm:text-lg font-medium">
                    {user?.name ?? "—"}
                  </div>
                </>
              )}
            </div>

            {/* Pen button only visible when edit controls shown */}
            {showEditControls ? (
              <div>
                <button
                  aria-label="Edit name"
                  className="rounded p-2 text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => {
                    setEditingField(editingField === "name" ? null : "name");
                  }}
                >
                  <Pen className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>

          {/* Email */}
          <div className="rounded-lg border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-card p-4 sm:p-6 flex items-start justify-between">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Email (Not Visible Publicly)
                </div>
                {user?.pendingEmail ? (
                  <div className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                    Unverified
                  </div>
                ) : null}
              </div>

              {editingField === "email" && showEditControls ? (
                <>
                  <div className="mt-3">
                    <Input
                      value={tempEmail}
                      onChange={(e) => setTempEmail(e.target.value)}
                      className="border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-white dark:bg-[rgb(10,10,10)] hover:border-[rgb(245,245,245)] dark:hover:border-[rgb(245,245,245)]/20 focus-visible:border-[rgb(255,255,255)] dark:focus-visible:border-[rgb(255,255,255)]/50 focus-visible:shadow-[0_0_0_2px_rgb(136,136,136)] dark:focus-visible:shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:outline-none transition-all"
                    />
                  </div>
                  <div className="mt-3 flex gap-2 items-center">
                    <Button
                      onClick={() => updateField("email")}
                      disabled={saving || tempEmail === originalEmail}
                      className="cursor-pointer bg-[rgb(0,0,0)] text-white hover:bg-[rgb(40,40,40)] dark:bg-white dark:text-[rgb(0,0,0)] dark:hover:bg-[rgb(220,220,220)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? "Saving..." : "Update"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditingField(null);
                        setTempEmail(user?.email ?? "");
                      }}
                      className="cursor-pointer bg-[rgb(237,237,237)] dark:bg-[rgb(10,10,10)] text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)] hover:bg-[rgb(220,220,220)] dark:hover:bg-[rgb(30,30,30)] border border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/20 transition-colors"
                    >
                      Cancel
                    </Button>
                    {message ? (
                      <div className="ml-2 text-sm text-emerald-600">
                        {message}
                      </div>
                    ) : null}
                    {error ? (
                      <div className="ml-2 text-sm text-red-600">{error}</div>
                    ) : null}
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-1 text-base sm:text-lg font-medium">
                    {user?.email ?? "—"}
                  </div>

                  {user?.pendingEmail ? (
                    <div className="mt-2">
                      <div className="mt-3 text-xs sm:text-sm">
                        Pending:{" "}
                        <span className="font-medium">{user.pendingEmail}</span>{" "}
                        <span className="ml-2 inline-flex items-center gap-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                          Unverified
                        </span>
                      </div>
                      <div className="mt-1 text-xs sm:text-sm text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)]">
                        A verification email has been sent to your pending
                        email. Open the link to confirm the change.
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          variant="ghost"
                          onClick={cancelPendingEmail}
                          disabled={saving}
                          className="cursor-pointer bg-[rgb(237,237,237)] dark:bg-[rgb(10,10,10)] text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)] hover:bg-[rgb(220,220,220)] dark:hover:bg-[rgb(30,30,30)] border border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/20 transition-colors"
                        >
                          Cancel pending change
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>

            {/* Pen button only visible when edit controls shown */}
            {showEditControls ? (
              <div>
                <button
                  aria-label="Edit email"
                  className="rounded p-2 text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => {
                    setEditingField(editingField === "email" ? null : "email");
                  }}
                >
                  <Pen className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>

          {/* Password */}
          {showEditControls && (
            <div className="rounded-lg border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-card p-4 sm:p-6 flex items-start justify-between">
              <div className="flex-1 pr-4">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Update Password
                </div>

                {editingField === "password" ? (
                  <>
                    <div className="mt-3 grid gap-3">
                      <div className="relative">
                        <Input
                          placeholder="Current password"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currPassword}
                          onChange={(e) => setCurrPassword(e.target.value)}
                          className="pr-10 border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-white dark:bg-[rgb(10,10,10)] hover:border-[rgb(245,245,245)] dark:hover:border-[rgb(245,245,245)]/20 focus-visible:border-[rgb(255,255,255)] dark:focus-visible:border-[rgb(255,255,255)]/50 focus-visible:shadow-[0_0_0_2px_rgb(136,136,136)] dark:focus-visible:shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:outline-none transition-all placeholder:text-[rgb(136,136,136)] dark:placeholder:text-[rgb(136,136,136)]"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          tabIndex={-1}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] hover:text-[rgb(100,100,100)] dark:hover:text-[rgb(180,180,180)] transition-colors cursor-pointer"
                          aria-label={
                            showCurrentPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                          ) : (
                            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                          )}
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          placeholder="New password"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pr-10 border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-white dark:bg-[rgb(10,10,10)] hover:border-[rgb(245,245,245)] dark:hover:border-[rgb(245,245,245)]/20 focus-visible:border-[rgb(255,255,255)] dark:focus-visible:border-[rgb(255,255,255)]/50 focus-visible:shadow-[0_0_0_2px_rgb(136,136,136)] dark:focus-visible:shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:outline-none transition-all placeholder:text-[rgb(136,136,136)] dark:placeholder:text-[rgb(136,136,136)]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          tabIndex={-1}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] hover:text-[rgb(100,100,100)] dark:hover:text-[rgb(180,180,180)] transition-colors cursor-pointer"
                          aria-label={
                            showNewPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                          ) : (
                            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                          )}
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          placeholder="Confirm new password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={newPasswordConfirm}
                          onChange={(e) =>
                            setNewPasswordConfirm(e.target.value)
                          }
                          className="pr-10 border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-white dark:bg-[rgb(10,10,10)] hover:border-[rgb(245,245,245)] dark:hover:border-[rgb(245,245,245)]/20 focus-visible:border-[rgb(255,255,255)] dark:focus-visible:border-[rgb(255,255,255)]/50 focus-visible:shadow-[0_0_0_2px_rgb(136,136,136)] dark:focus-visible:shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:outline-none transition-all placeholder:text-[rgb(136,136,136)] dark:placeholder:text-[rgb(136,136,136)]"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          tabIndex={-1}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] hover:text-[rgb(100,100,100)] dark:hover:text-[rgb(180,180,180)] transition-colors cursor-pointer"
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                          ) : (
                            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        onClick={updatePassword}
                        disabled={saving}
                        className="cursor-pointer bg-[rgb(0,0,0)] text-white hover:bg-[rgb(40,40,40)] dark:bg-white dark:text-[rgb(0,0,0)] dark:hover:bg-[rgb(220,220,220)] transition-colors"
                      >
                        {saving ? "Updating..." : "Update"}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditingField(null);
                          setCurrPassword("");
                          setNewPassword("");
                          setNewPasswordConfirm("");
                          setShowCurrentPassword(false);
                          setShowNewPassword(false);
                          setShowConfirmPassword(false);
                        }}
                        className="cursor-pointer bg-[rgb(237,237,237)] dark:bg-[rgb(10,10,10)] text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)] hover:bg-[rgb(220,220,220)] dark:hover:bg-[rgb(30,30,30)] border border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/20 transition-colors"
                      >
                        Cancel
                      </Button>
                      {message ? (
                        <div className="ml-2 text-sm text-emerald-600">
                          {message}
                        </div>
                      ) : null}
                      {error ? (
                        <div className="ml-2 text-sm text-red-600">{error}</div>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <>
                    {user?.passwordChangedAt ? (
                      <div className="mt-1 text-xs sm:text-sm text-muted-foreground">
                        Last changed: {formatTime(user.passwordChangedAt)}
                      </div>
                    ) : (
                      <div className="mt-1 text-xs sm:text-sm text-[rgb(237,237,237)] dark:text-[rgb(237,237,237)]/70">
                        Not changed recently
                      </div>
                    )}
                  </>
                )}
              </div>

              <div>
                <button
                  aria-label="Edit password"
                  className="rounded p-2 text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => {
                    if (!showEditControls) return setShowEditControls(true);
                    setEditingField(
                      editingField === "password" ? null : "password"
                    );
                  }}
                >
                  <Pen className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Delete Account */}
          {showEditControls && (
            <DeleteAccountSection
              saving={saving}
              setSaving={setSaving}
              toast={toast}
            />
          )}
        </div>
      </div>
    </div>
  );
}
