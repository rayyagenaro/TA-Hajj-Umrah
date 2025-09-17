// "use client";

// import { useEffect, useState } from "react";

// type Mode = "light" | "dark" | "system";

// const modes: Mode[] = ["system", "light", "dark"];

// export default function ThemeToggle() {
//   const [mode, setMode] = useState<Mode>("system");
//   const [isReady, setIsReady] = useState(false);

//   useEffect(() => {
//     if (typeof window === "undefined") {
//       return;
//     }

//     const saved = (localStorage.getItem("theme-mode") as Mode | null) ?? "system";
//     setMode(saved);
//     applyMode(saved);
//     setIsReady(true);
//   }, []);

//   useEffect(() => {
//     if (typeof window === "undefined") {
//       return;
//     }

//     const media = window.matchMedia("(prefers-color-scheme: dark)");
//     const handleChange = (event: MediaQueryListEvent) => {
//       if (mode === "system") {
//         applyMode("system", event.matches);
//       }
//     };

//     media.addEventListener("change", handleChange);
//     return () => media.removeEventListener("change", handleChange);
//   }, [mode]);

//   const currentMode = isReady ? mode : "system";

//   function applyMode(next: Mode, prefersDark?: boolean) {
//     if (typeof document === "undefined") {
//       return;
//     }

//     const root = document.documentElement;
//     const shouldUseDark =
//       next === "dark" ||
//       (next === "system" &&
//         (prefersDark ??
//           (typeof window !== "undefined" &&
//             window.matchMedia("(prefers-color-scheme: dark)").matches)));

//     root.classList.toggle("dark", shouldUseDark);
//     document.body.dataset.theme = shouldUseDark ? "dark" : "light";
//   }

//   function cycle() {
//     const current = isReady ? mode : "system";
//     const next = modes[(modes.indexOf(current) + 1) % modes.length];

//     setMode(next);
//     localStorage.setItem("theme-mode", next);
//     applyMode(next);
//     setIsReady(true);
//   }

//   const icon =
//     currentMode === "dark" ? (
//       <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
//         <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 1 0 21 12.79Z" />
//       </svg>
//     ) : currentMode === "light" ? (
//       <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
//         <path d="M6.76 4.84 5.35 3.43 3.93 4.85l1.41 1.41 1.42-1.42Zm10.48 0 1.41-1.41 1.42 1.42-1.41 1.41-1.42-1.42ZM12 2h0v2h0V2Zm0 18h0v2h0v-2ZM2 12H0v0h2v0Zm22 0h-2v0h2v0ZM6.76 19.16l-1.42 1.42-1.41-1.41 1.42-1.42 1.41 1.41Zm12.02 0 1.41 1.41-1.42 1.42-1.41-1.41 1.42-1.42ZM12 6.5A5.5 5.5 0 1 0 17.5 12 5.51 5.51 0 0 0 12 6.5Z" />
//       </svg>
//     ) : (
//       <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
//         <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6l2 2H7l2-2H5a2 2 0 0 1-2-2V5Zm2 0v12h14V5H5Z" />
//       </svg>
//     );

//   return (
//     <button
//       type="button"
//       aria-label="Ganti tema"
//       aria-live="polite"
//       onClick={cycle}
//       className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/75 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-primary-400 hover:text-primary-600 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-primary-500 dark:hover:text-white"
//       title={`Mode tampilan: ${currentMode}`}
//     >
//       <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors dark:bg-slate-800 dark:text-slate-200">
//         {icon}
//       </span>
//       <span className="hidden text-xs uppercase tracking-wide text-slate-500 sm:inline dark:text-slate-400">
//         {currentMode === "system" ? "Sistem" : currentMode === "light" ? "Terang" : "Gelap"}
//       </span>
//     </button>
//   );
// }
