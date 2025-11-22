"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Upload,
  X,
  Check,
  Loader2 as LoaderIcon,
} from "lucide-react";
import Image from "next/image";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [checking, setChecking] = useState(true); // Add checking state
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [usernameDebounceTimer, setUsernameDebounceTimer] =
    useState<NodeJS.Timeout | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    const token = getToken();
    if (token) {
      router.push("/");
    } else {
      setChecking(false); // Only show page if not logged in
    }
  }, [router]);

  // Check username availability with debouncing
  useEffect(() => {
    // Clear previous timer
    if (usernameDebounceTimer) {
      clearTimeout(usernameDebounceTimer);
    }

    // Reset state if username is empty
    if (!username.trim()) {
      setUsernameAvailable(null);
      setUsernameChecking(false);
      return;
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_\-]+$/.test(username)) {
      setUsernameAvailable(false);
      setUsernameChecking(false);
      return;
    }

    // Set checking state
    setUsernameChecking(true);

    // Debounce the API call
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_BASE_URL
          }/api/v1/users/username-available/${username.trim().toLowerCase()}`
        );
        const data = await res.json();
        setUsernameAvailable(data.available);
      } catch (err) {
        console.error("Error checking username:", err);
        setUsernameAvailable(null);
      } finally {
        setUsernameChecking(false);
      }
    }, 500); // 500ms debounce

    setUsernameDebounceTimer(timer);

    // Cleanup
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [username]);

  // Don't render the page until auth check is complete
  if (checking) {
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("passwordConfirm", passwordConfirm);
    if (photo) formData.append("photo", photo);

    const response = await apiFetch<{ data: { user: any } }>(
      "/api/v1/users/signup",
      {
        method: "POST",
        body: formData,
      }
    );

    setLoading(false);

    if (!response.ok) {
      setError(response.error?.message || "Signup failed");
      return;
    }

    if (response.data?.data?.user) {
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <main className="mx-auto max-w-md px-4 sm:px-6 py-6 sm:py-8 lg:py-12 min-h-screen bg-[rgb(237,237,237)] dark:bg-[rgb(0,0,0)]">
        <div className="rounded-lg border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-white dark:bg-[rgb(10,10,10)] p-6 sm:p-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Check your email
          </h1>
          <p className="text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] mt-3 text-sm sm:text-base">
            We've sent a verification link to{" "}
            <span className="text-white dark:text-white">{email}</span>. Please
            click the link sent to your email to verify your account.
          </p>
          <Button
            asChild
            className="mt-6 h-10 sm:h-11 text-sm sm:text-base bg-[rgb(0,0,0)] dark:bg-[rgb(237,237,237)] text-[rgb(255,255,255)] dark:text-[rgb(0,0,0)] hover:bg-[rgb(30,30,30)] dark:hover:bg-[rgb(220,220,220)]"
          >
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 sm:px-6 py-6 sm:py-8 lg:py-12 min-h-screen bg-[rgb(237,237,237)] dark:bg-[rgb(0,0,0)]">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
        Create account
      </h1>
      <p className="text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] mt-2 text-sm sm:text-base">
        Sign up to analyze your code and improve quality.
      </p>
      <form onSubmit={onSubmit} className="mt-6 sm:mt-8 grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name" className="text-sm sm:text-base">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 sm:h-11 text-sm sm:text-base border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-white dark:bg-[rgb(10,10,10)] hover:border-[rgb(245,245,245)] dark:hover:border-[rgb(245,245,245)]/20 focus-visible:border-[rgb(255,255,255)] dark:focus-visible:border-[rgb(255,255,255)]/50 focus-visible:shadow-[0_0_0_2px_rgb(136,136,136)] dark:focus-visible:shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:outline-none transition-all"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="username" className="text-sm sm:text-base">
            Username <span className="text-red-500">*</span>
          </Label>
          <Input
            id="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-10 sm:h-11 text-sm sm:text-base border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-white dark:bg-[rgb(10,10,10)] hover:border-[rgb(245,245,245)] dark:hover:border-[rgb(245,245,245)]/20 focus-visible:border-[rgb(255,255,255)] dark:focus-visible:border-[rgb(255,255,255)]/50 focus-visible:shadow-[0_0_0_2px_rgb(136,136,136)] dark:focus-visible:shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:outline-none transition-all"
          />
          {/* Username availability indicator */}
          {username.trim() && (
            <div className="flex items-center gap-2 text-xs sm:text-sm mt-1">
              {usernameChecking ? (
                <>
                  <LoaderIcon className="h-3.5 w-3.5 animate-spin text-[rgb(136,136,136)]" />
                  <span className="text-[rgb(136,136,136)]">
                    Checking availability...
                  </span>
                </>
              ) : usernameAvailable === true ? (
                <>
                  <div className="flex items-center justify-center h-3.5 w-3.5 rounded-full bg-green-500">
                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-green-500">Username is available</span>
                </>
              ) : usernameAvailable === false ? (
                <>
                  <div className="flex items-center justify-center h-3.5 w-3.5 rounded-full bg-red-500">
                    <X className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-red-500">
                    Username is not available
                  </span>
                </>
              ) : null}
            </div>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-sm sm:text-base">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 sm:h-11 text-sm sm:text-base border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-white dark:bg-[rgb(10,10,10)] hover:border-[rgb(245,245,245)] dark:hover:border-[rgb(245,245,245)]/20 focus-visible:border-[rgb(255,255,255)] dark:focus-visible:border-[rgb(255,255,255)]/50 focus-visible:shadow-[0_0_0_2px_rgb(136,136,136)] dark:focus-visible:shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:outline-none transition-all"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password" className="text-sm sm:text-base">
            Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10 h-10 sm:h-11 text-sm sm:text-base border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-white dark:bg-[rgb(10,10,10)] hover:border-[rgb(245,245,245)] dark:hover:border-[rgb(245,245,245)]/20 focus-visible:border-[rgb(255,255,255)] dark:focus-visible:border-[rgb(255,255,255)]/50 focus-visible:shadow-[0_0_0_2px_rgb(136,136,136)] dark:focus-visible:shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] hover:text-[rgb(100,100,100)] dark:hover:text-[rgb(180,180,180)] transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="passwordConfirm" className="text-sm sm:text-base">
            Confirm Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="passwordConfirm"
              type={showPasswordConfirm ? "text" : "password"}
              required
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="pr-10 h-10 sm:h-11 text-sm sm:text-base border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-white dark:bg-[rgb(10,10,10)] hover:border-[rgb(245,245,245)] dark:hover:border-[rgb(245,245,245)]/20 focus-visible:border-[rgb(255,255,255)] dark:focus-visible:border-[rgb(255,255,255)]/50 focus-visible:shadow-[0_0_0_2px_rgb(136,136,136)] dark:focus-visible:shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] hover:text-[rgb(100,100,100)] dark:hover:text-[rgb(180,180,180)] transition-colors cursor-pointer"
              aria-label={
                showPasswordConfirm ? "Hide password" : "Show password"
              }
            >
              {showPasswordConfirm ? (
                <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="photo" className="text-sm sm:text-base">
            Profile Photo
          </Label>

          {/* Photo Preview or Upload Area */}
          {photoPreview ? (
            <div className="space-y-2">
              <div className="relative w-32 h-32 mx-auto">
                {/* Image with optional fade overlay during upload */}
                <div className="relative w-full h-full">
                  <Image
                    src={photoPreview}
                    alt="Profile preview"
                    fill
                    className="object-cover rounded-full"
                    sizes="128px"
                  />
                  {/* Faded overlay during image upload */}
                  {imageUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      {/* Circular progress indicator */}
                      <svg
                        className="w-16 h-16 -rotate-90"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="white"
                          strokeWidth="8"
                          strokeDasharray="283"
                          strokeDashoffset="283"
                          strokeLinecap="round"
                          className="animate-[disappear-clockwise_1s_ease-out_forwards]"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                {/* Remove button - only show when not uploading */}
                {!imageUploading && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhoto(null);
                      setPhotoPreview(null);
                      const input = document.getElementById(
                        "photo"
                      ) as HTMLInputElement;
                      if (input) input.value = "";
                    }}
                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg cursor-pointer"
                    aria-label="Remove photo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <label
              htmlFor="photo"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/20 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Choose file</span>
              <span className="text-xs text-muted-foreground mt-1">
                Max 2MB
              </span>
            </label>
          )}

          <Input
            id="photo"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              // Validate file type
              if (!file.type.startsWith("image/")) {
                setError("Please upload only image files");
                e.target.value = "";
                return;
              }

              // Validate file size (2MB max for user photo)
              const maxSize = 2 * 1024 * 1024; // 2MB
              if (file.size > maxSize) {
                setError("Profile photo must be less than 2MB");
                e.target.value = "";
                return;
              }

              setError(null);
              setImageUploading(true);

              // Create preview
              const reader = new FileReader();
              reader.onloadstart = () => {
                setImageUploading(true);
              };
              reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
                setPhoto(file);
                // Simulate upload completion with animation duration
                setTimeout(() => {
                  setImageUploading(false);
                }, 1000); // 1 second to match animation
              };
              reader.readAsDataURL(file);
            }}
            className="hidden"
          />
        </div>
        {error ? (
          <p className="text-sm sm:text-base text-red-600">{error}</p>
        ) : null}
        <Button
          type="submit"
          disabled={loading || imageUploading}
          className="h-10 sm:h-11 text-sm sm:text-base bg-[rgb(0,0,0)] dark:bg-[rgb(237,237,237)] text-[rgb(255,255,255)] dark:text-[rgb(0,0,0)] hover:bg-[rgb(30,30,30)] dark:hover:bg-[rgb(220,220,220)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? "Creating account..."
            : imageUploading
            ? "Uploading image..."
            : "Sign up"}
        </Button>
      </form>
      <div className="mt-6 text-sm sm:text-base">
        Already have an account?{" "}
        <Link
          className="text-[rgb(82,168,255)] hover:underline transition-all"
          href="/login"
        >
          Log In
        </Link>
      </div>
    </main>
  );
}
