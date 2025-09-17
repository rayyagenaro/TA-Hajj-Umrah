"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
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

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 print-hidden">
      <div className="container-section">
        <div className="mt-4 rounded-2xl glass px-4 py-3">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md">
                {/* simple Kaaba icon */}
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M3 7.5 12 3l9 4.5-9 4.5L3 7.5z" />
                  <path d="M21 9.75v6.75L12 21l-9-4.5V9.75l9 4.5 9-4.5z" />
                </svg>
              </span>
              <span className="text-lg font-semibold tracking-tight">
                Haji<span className="gradient-text">Expert</span>
              </span>
            </Link>
            <div className="hidden items-center gap-6 md:flex">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-sm/6 font-medium transition-colors hover:text-primary-700 ${
                    pathname === l.href ? "text-primary-700" : "text-black dark:text-black"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link
                href="/rekomendasi"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
              >
                Mulai Rekomendasi
              </Link>
              <button
                aria-label="Menu"
                aria-expanded={open}
                className="md:hidden inline-flex items-center rounded-xl px-3 py-2 ring-1 ring-black/10 hover:bg-black/5 dark:ring-white/10 dark:hover:bg-white/5"
                onClick={() => setOpen((v) => !v)}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                  {open ? (
                    <path d="M6 18 18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" />
                  )}
                </svg>
              </button>
            </div>
          </nav>
          {open && (
            <div className="mt-3 md:hidden">
              <div className="glass rounded-2xl p-3">
                <div className="flex flex-col">
                  {links.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={`rounded-lg px-3 py-2 text-sm font-medium ${
                        pathname === l.href ? "text-primary-700" : "text-black dark:text-black"
                      }`}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
