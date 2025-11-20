// components/ui/toast-progress.tsx
"use client";

import React, { useEffect, useRef } from "react";

/**
 * Thin progress bar that animates left->right (shrinks) over `duration` ms.
 * - duration in ms (fallback 4000)
 * - uses transform: scaleX for smooth GPU-accelerated animation
 */
export default function ToastProgressBar({
  duration = 4000,
}: {
  duration?: number;
}) {
  const innerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    // Reset in case of re-mounts
    el.style.transition = "none";
    el.style.transformOrigin = "left";
    el.style.transform = "scaleX(1)";

    // Kick off the transition on the next frame so it actually animates
    const raf = requestAnimationFrame(() => {
      // apply transition duration
      el.style.transition = `transform ${Math.max(0, duration)}ms linear`;
      // shrink to 0 (full -> 0) so it looks like the bar empties to the right
      el.style.transform = "scaleX(0)";
    });

    return () => {
      cancelAnimationFrame(raf);
      // clear transition to avoid leaking to next mount
      if (el) el.style.transition = "";
    };
  }, [duration]);

  return (
    <div aria-hidden className="absolute left-0 top-0 w-full overflow-hidden">
      {/* Use h-0.5 for a subtle 2px-ish line; change to h-[1px] if desired */}
      <div
        ref={innerRef}
        className="h-0.5 w-full bg-emerald-500 dark:bg-emerald-400"
        // initial inline transform important for SSR hydration safety
        style={{ transform: "scaleX(1)", transformOrigin: "left" }}
      />
    </div>
  );
}
