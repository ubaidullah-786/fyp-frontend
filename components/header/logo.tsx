"use client";

import Link from "next/link";
import { Stethoscope } from "lucide-react";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-1 hover:opacity-80 transition-opacity"
    >
      <span className="text-foreground font-semibold text-base sm:text-lg">
        &lt;
      </span>
      <Stethoscope className="h-5 w-5 text-foreground" />
      <span className="text-foreground font-semibold text-base sm:text-lg">
        &gt;
      </span>
    </Link>
  );
}
