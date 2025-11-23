"use client";

import { MobileMenu } from "@/components/header/mobile-menu";
import { Logo } from "@/components/header/logo";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function LandingHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const isSignupPage = pathname === "/signup";
  const isLoginPage = pathname === "/login";
  const isProfilePage = pathname === "/profile";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[rgb(255,255,255)] dark:bg-[rgb(0,0,0)]">
        {/* Top row: Menu + Logo + Actions */}
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* LEFT: menu + logo + Code Doctor */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="md:hidden">
              <MobileMenu />
            </div>
            <Logo />
            <span className="text-foreground font-semibold text-base sm:text-lg ml-1">
              Code Doctor
            </span>
          </div>

          {/* RIGHT: auth buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Show Signup button on login page with same style as Login button */}
            {isLoginPage && (
              <Button
                onClick={() => router.push("/signup")}
                size="sm"
                className="text-sm font-medium bg-[rgb(255,255,255)] dark:bg-[rgb(10,10,10)] text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)] hover:bg-[rgb(242,242,242)] dark:hover:bg-[rgb(30,30,30)] border border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/20 cursor-pointer"
                style={{ borderRadius: "6px" }}
              >
                Sign Up
              </Button>
            )}

            {/* Show Login button on signup page */}
            {isSignupPage && (
              <Button
                onClick={() => router.push("/login")}
                size="sm"
                className="text-sm font-medium bg-[rgb(255,255,255)] dark:bg-[rgb(10,10,10)] text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)] hover:bg-[rgb(242,242,242)] dark:hover:bg-[rgb(30,30,30)] border border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/20 cursor-pointer"
                style={{ borderRadius: "6px" }}
              >
                Log In
              </Button>
            )}

            {/* Show both buttons on home page, hide on profile page */}
            {!isLoginPage && !isSignupPage && !isProfilePage && (
              <>
                <Button
                  onClick={() => router.push("/login")}
                  size="sm"
                  className="text-sm font-medium bg-[rgb(255,255,255)] dark:bg-[rgb(10,10,10)] text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)] hover:bg-[rgb(242,242,242)] dark:hover:bg-[rgb(30,30,30)] border border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/20 cursor-pointer"
                  style={{ borderRadius: "6px" }}
                >
                  Log In
                </Button>
                <Button
                  onClick={() => router.push("/signup")}
                  size="sm"
                  className="text-sm font-medium bg-[rgb(0,0,0)] dark:bg-[rgb(237,237,237)] text-[rgb(255,255,255)] dark:text-[rgb(0,0,0)] hover:bg-[rgb(30,30,30)] dark:hover:bg-[rgb(220,220,220)] border border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)] cursor-pointer"
                  style={{ borderRadius: "6px" }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Divider that appears only when scrolled */}
      {scrolled && (
        <div className="sticky top-14 z-40 h-[1px] bg-[rgb(237,237,237)] dark:bg-[rgb(237,237,237)]/10" />
      )}
    </>
  );
}
