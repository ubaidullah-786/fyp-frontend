"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null;
  }

  const currentTheme = theme || "system";

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="flex gap-1 bg-white dark:bg-[rgb(10,10,10)] border border-[rgb(237,237,237)] dark:border-[rgb(50,50,50)] rounded-full px-1 py-0.5 shadow-lg">
      {themes.map((t) => {
        const Icon = t.icon;
        const isSelected = currentTheme === t.value;
        return (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isSelected
                ? "bg-[rgb(240,240,240)] dark:bg-[rgb(30,30,30)] text-[rgb(0,0,0)] dark:text-white"
                : "text-[rgb(136,136,136)] dark:text-[rgb(136,136,136)] hover:text-[rgb(60,60,60)] dark:hover:text-white"
            }`}
            aria-label={t.label}
          >
            <Icon className="w-3 h-3" />
          </button>
        );
      })}
    </div>
  );
}
