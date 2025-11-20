"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import cn from "classnames";
import {
  Menu,
  X,
  Home,
  LayoutDashboard,
  FolderOpen,
  Upload,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getToken, onTokenChange } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    setTokenState(getToken());
    const unsub = onTokenChange((t) => {
      setTokenState(t);
    });

    return () => {
      void unsub();
    };
  }, []);

  const isLoggedIn = !!token;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          aria-label="Toggle menu"
          variant="ghost"
          size="icon"
          className="relative size-9 rounded-full transition-transform hover:scale-105 hover:bg-muted md:hidden"
        >
          <Menu
            className={cn(
              "absolute size-5 transition-opacity duration-200",
              open ? "opacity-0" : "opacity-100"
            )}
          />
          <X
            className={cn(
              "absolute size-5 transition-opacity duration-200",
              open ? "opacity-100" : "opacity-0"
            )}
          />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-56 pt-4">
        <SheetHeader className="sr-only">
          <SheetTitle>Sidebar</SheetTitle>
        </SheetHeader>
        <nav className="mt-15 grid gap-1">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-muted"
          >
            <Home className="size-5" />
            Home
          </Link>

          {isLoggedIn && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-muted"
              >
                <LayoutDashboard className="size-5" />
                Dashboard
              </Link>
              <Link
                href="/projects"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-muted"
              >
                <FolderOpen className="size-5" />
                Projects
              </Link>
              <Link
                href="/upload"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-muted"
              >
                <Upload className="size-5" />
                Upload Project
              </Link>
            </>
          )}

          {!isLoggedIn && (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-muted"
              >
                <User className="size-5" />
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-muted"
              >
                <User className="size-5" />
                Create account
              </Link>
            </>
          )}

          {/* Separator and Preferences Section */}
          <div className="my-4 h-px bg-border/40" />
          <div className="px-3 py-1 text-xs font-medium text-muted-foreground">
            Preferences
          </div>
          <div className="flex items-center justify-between px-3 py-2.5">
            <span className="text-sm">Theme</span>
            <ThemeToggle />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
