"use client";

import { useState, useEffect } from "react";

interface LayoutClientProps {
  children: React.ReactNode;
}

export function LayoutClient({ children }: LayoutClientProps) {
  const [showLayout, setShowLayout] = useState(false);

  useEffect(() => {
    // Check if hero was dismissed
    const isDismissed = localStorage.getItem("hero-section-dismissed");
    if (isDismissed) {
      setShowLayout(true);
    }

    // Listen for hero dismissal
    const handleStorageChange = () => {
      const isDismissed = localStorage.getItem("hero-section-dismissed");
      if (isDismissed) {
        setTimeout(() => {
          setShowLayout(true);
        }, 100);
      }
    };

    // Check periodically for localStorage changes (since storage event doesn't work on same tab)
    const interval = setInterval(() => {
      const isDismissed = localStorage.getItem("hero-section-dismissed");
      if (isDismissed && !showLayout) {
        setTimeout(() => {
          setShowLayout(true);
        }, 100);
      }
    }, 100);

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [showLayout]);

  return (
    <div
      className={`flex flex-col min-h-screen transition-all duration-700 ${
        showLayout ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Header with expanding animation */}
      <div
        className={`transition-all duration-700 ease-out ${
          showLayout ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
        }`}
        style={{ transformOrigin: "center" }}
      >
        {children}
      </div>
    </div>
  );
}
