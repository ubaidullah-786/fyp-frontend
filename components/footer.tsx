"use client";

import { ThemeSelector } from "@/components/theme-selector";

export function Footer() {
  return (
    <footer className="w-full py-8 bg-[rgb(255,255,255)] dark:bg-[rgb(0,0,0)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <p className="text-sm text-[rgb(102,102,102)] dark:text-[rgb(136,136,136)]">
            © {new Date().getFullYear()} Code Doctor. All rights reserved.
          </p>
          <ThemeSelector />
        </div>
      </div>
    </footer>
  );
}
