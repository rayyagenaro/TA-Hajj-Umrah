"use client";

import { useEffect, useState } from "react";

type Mode = "light" | "dark" | "system";

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");

  // Initialize from localStorage or system
  useEffect(() => {
    const saved = (localStorage.getItem("theme-mode") as Mode | null) ?? "system";
    setMode(saved);
    applyMode(saved);
  }, []);

  function applyMode(next: Mode) {
    const root = document.documentElement;
    if (next === "dark") {
      root.classList.add("dark");
    } else if (next === "light") {
      root.classList.remove("dark");
    } else {
      // system
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    }
  }

  function cycle() {
    const order: Mode[] = ["system", "light", "dark"];
    const next = order[(order.indexOf(mode) + 1) % order.length];
    setMode(next);
    localStorage.setItem("theme-mode", next);
    applyMode(next);
  }

  const icon = mode === "dark" ? (
    // Moon
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 1 0 21 12.79Z" />
    </svg>
  ) : mode === "light" ? (
    // Sun
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M6.76 4.84 5.35 3.43 3.93 4.85l1.41 1.41 1.42-1.42Zm10.48 0 1.41-1.41 1.42 1.42-1.41 1.41-1.42-1.42ZM12 2h0v2h0V2Zm0 18h0v2h0v-2ZM2 12H0v0h2v0Zm22 0h-2v0h2v0ZM6.76 19.16l-1.42 1.42-1.41-1.41 1.42-1.42 1.41 1.41Zm12.02 0 1.41 1.41-1.42 1.42-1.41-1.41 1.42-1.42ZM12 6.5A5.5 5.5 0 1 0 17.5 12 5.51 5.51 0 0 0 12 6.5Z" />
    </svg>
  ) : (
    // System
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6l2 2H7l2-2H5a2 2 0 0 1-2-2V5Zm2 0v12h14V5H5Z" />
    </svg>
  );

  return (
    <button
      aria-label="Toggle theme"
      onClick={cycle}
      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-black ring-1 ring-black/10 transition hover:bg-black/5 dark:text-black dark:ring-white/10 dark:hover:bg-white/5"
      title={`Mode: ${mode}`}
    >
      {icon}
      <span className="hidden sm:inline">{mode === "system" ? "Sistem" : mode === "light" ? "Terang" : "Gelap"}</span>
    </button>
  );
}
