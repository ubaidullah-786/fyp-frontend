"use client";

import { Logo } from "@/components/header/logo";
import { ProfileDropdown } from "@/components/header/profile-dropdown";
import { Navbar } from "@/components/navbar";
import { MobileMenu } from "@/components/header/mobile-menu";
import { useEffect } from "react";

export default function CodeEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Smooth scroll to top on mount
    const scrollToTop = () => {
      const scrollDuration = 600;
      const scrollStep = -window.scrollY / (scrollDuration / 15);

      const scrollInterval = setInterval(() => {
        if (window.scrollY !== 0) {
          window.scrollBy(0, scrollStep);
        } else {
          clearInterval(scrollInterval);
        }
      }, 15);
    };

    // Small delay to ensure page is mounted
    setTimeout(() => {
      if (window.scrollY > 0) {
        scrollToTop();
      }
    }, 100);
  }, []);

  return (
    <>
      {/* Fixed Navbar - always at top, no arrow-up icon */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[rgb(250,250,250)] dark:bg-[rgb(0,0,0)] border-b border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/20 h-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center">
            {/* Left: Logo and Mobile Menu */}
            <div className="flex items-center gap-2 sm:gap-3 mr-auto">
              <div className="md:hidden">
                <MobileMenu />
              </div>
              <Logo />
            </div>

            {/* Center: Navbar */}
            <div className="flex-1 flex justify-center">
              <Navbar />
            </div>

            {/* Right: Profile Dropdown */}
            <div className="ml-auto">
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </div>

      {/* Content area - starts below fixed navbar */}
      <div className="pt-14 min-h-screen bg-[rgb(237,237,237)] dark:bg-[rgb(0,0,0)] overflow-x-hidden">
        {children}
      </div>
    </>
  );
}
