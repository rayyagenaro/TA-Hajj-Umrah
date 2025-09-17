"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
// import ThemeToggle from "@/components/ThemeToggle";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/#paket", label: "Paket" },
  { href: "/rekomendasi", label: "Rekomendasi" },
  { href: "/tentang", label: "Tentang" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hash, setHash] = useState("");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateScroll = () => setScrolled(window.scrollY > 12);
    updateScroll();

    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateHash = () => setHash(window.location.hash);
    updateHash();

    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    if (href.startsWith("/#")) {
      return pathname === "/" && hash === href.slice(1);
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const desktopLinkClass = (href: string) =>
    [
      "rounded-full px-3 py-2 text-sm font-semibold transition-colors",
      isActive(href)
        ? "bg-primary-50/80 text-primary-700 shadow-sm dark:bg-white/10 dark:text-white"
        : "text-slate-600 hover:text-primary-600 dark:text-slate-200/80 dark:hover:text-white",
    ].join(" ");

  const mobileLinkClass = (href: string) =>
    [
      "rounded-xl px-3 py-2 text-base font-medium transition-colors",
      isActive(href)
        ? "bg-primary-50/80 text-primary-700 shadow-sm dark:bg-white/10 dark:text-white"
        : "text-slate-600 hover:bg-slate-100/60 hover:text-primary-600 dark:text-slate-200/80 dark:hover:bg-white/10",
    ].join(" ");

  return (
    <header className="fixed inset-x-0 top-0 z-50 print-hidden">
      <div
        className={[
          "border-b border-transparent backdrop-blur-md transition-all duration-300",
          scrolled
            ? "bg-white/80 shadow-[0_18px_48px_-28px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-slate-950/75"
            : "bg-white/60 dark:bg-slate-950/55",
        ].join(" ")}
      >
        <div className="container-section">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-full px-2 py-1 transition hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-600/25">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M3 7.5 12 3l9 4.5-9 4.5L3 7.5z" />
                  <path d="M21 9.75v6.75L12 21l-9-4.5V9.75l9 4.5 9-4.5z" />
                </svg>
              </span>
              <span className="text-lg font-semibold tracking-tight text-slate-800 dark:text-slate-100">
                Haji<span className="gradient-text">Expert</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className={desktopLinkClass(link.href)}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {/* <ThemeToggle /> */}
              <Link
                href="/rekomendasi"
                className="hidden items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition hover:bg-primary-700 md:inline-flex"
              >
                Mulai Rekomendasi
              </Link>
              <button
                type="button"
                aria-label="Buka menu navigasi"
                aria-expanded={open}
                aria-controls="mobile-navigation"
                onClick={() => setOpen((prev) => !prev)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/80 text-slate-700 transition hover:border-primary-400 hover:text-primary-600 md:hidden dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-primary-500 dark:hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                  {open ? (
                    <path d="M6 18 18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 7h16v2H4V7Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        id="mobile-navigation"
        className={[
          "md:hidden transition-all duration-200 ease-out",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0",
        ].join(" ")}
      >
        <div className="container-section pt-2 pb-4">
          <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-4 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90">
            <nav aria-label="Navigasi mobile" className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={mobileLinkClass(link.href)}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/rekomendasi"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition hover:bg-primary-700"
                onClick={() => setOpen(false)}
              >
                Mulai Rekomendasi
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
