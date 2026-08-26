"use client";

import { Moon, Sun } from "@phosphor-icons/react";

export function ThemeToggle() {
  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Changer de thème"
      className="border-border text-foreground hover:bg-muted focus-visible:outline-ring inline-flex size-9 items-center justify-center rounded-md border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {/* CSS-only swap (no JS state) avoids a hydration mismatch against theme-script.ts,
          which sets the .dark class before React hydrates. */}
      <Sun size={18} className="dark:hidden" aria-hidden="true" />
      <Moon size={18} className="hidden dark:block" aria-hidden="true" />
    </button>
  );
}
