"use client";

import { MobileMenu } from "@/components/header/mobile-menu";
import { Logo } from "@/components/header/logo";
import { ProfileDropdown } from "@/components/header/profile-dropdown";
import { Navbar } from "@/components/navbar";
import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export function LoggedInHeader() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Account for navbar border (1px) in the calculation
  const codeDoctorHeight = 56;
  const navbarStuck = scrollY >= codeDoctorHeight - 1;

  const scrollToTop = () => {
    const scrollDuration = 400;
    const scrollStep = -window.scrollY / (scrollDuration / 40);

    const scrollInterval = setInterval(() => {
      if (window.scrollY !== 0) {
        window.scrollBy(0, scrollStep);
      } else {
        clearInterval(scrollInterval);
      }
    }, 15);
  };

  return (
    <>
      {/* Logo - fixed on left side with reduced height */}
      <div className="fixed top-0 left-0 z-50 bg-[rgb(237,237,237)] dark:bg-[rgb(0,0,0)]">
        <div className="flex h-14 items-center gap-2 sm:gap-3 pl-2 sm:pl-6 lg:pl-8">
          <div className="md:hidden">
            <MobileMenu />
          </div>
          <Logo />
        </div>
      </div>

      {/* Code Doctor + Profile - scrolls up, appears in same row */}
      <div className="relative bg-[rgb(237,237,237)] dark:bg-[rgb(0,0,0)]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Empty space on left to avoid logo overlap - matches landing header spacing */}
          <div style={{ width: "calc(1rem + 2rem)" }}></div>

          {/* Code Doctor + Profile with space between */}
          <div className="flex items-center justify-between flex-1 ml-5">
            <span className="text-foreground font-semibold text-base sm:text-lg">
              Code Doctor
            </span>
            <ProfileDropdown />
          </div>
        </div>
      </div>

      {/* Navbar container - always reserves space */}
      <div className="relative h-14">
        {/* Navbar - becomes fixed at top when Code Doctor scrolls out */}
        <div
          className={`${
            navbarStuck
              ? "fixed top-0 left-0 right-0"
              : "absolute top-0 left-0 right-0"
          } z-40`}
        >
          <div className="bg-[rgb(250,250,250)] dark:bg-[rgb(0,0,0)] border-b border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/20">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-14 items-center justify-between">
                {/* LEFT DIV: Navbar content */}
                <div className="flex-1">
                  <Navbar />
                </div>

                {/* RIGHT DIV: Arrow up icon space (always reserved) */}
                <div
                  className="flex items-center ml-4"
                  style={{ width: "36px" }}
                >
                  <button
                    onClick={scrollToTop}
                    className={`size-8 sm:size-9 rounded-full bg-transparent hover:bg-[rgb(237,237,237)] hover:text-[rgb(237,237,237)] dark:hover:bg-[rgb(30,30,30)] dark:hover:text-[rgb(237,237,237)] text-[rgb(237,237,237)] dark:text-[rgb(161,161,161)] transition-opacity duration-300 flex items-center justify-center cursor-pointer ${
                      navbarStuck ? "opacity-100" : "opacity-0"
                    }`}
                    aria-label="Scroll to top"
                    disabled={!navbarStuck}
                  >
                    <ArrowUp className="size-4 sm:size-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
