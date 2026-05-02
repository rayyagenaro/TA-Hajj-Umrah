"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";

export type PackageCatalogItem = {
  key: string;
  name: string;
  provider: string;
  type: string;
  airline: string;
  hotel: string;
  duration: string;
  price: string;
  source: string;
  url: string;
  notes?: string;
  additionalInfo?: string;
};

type PackageCatalogGridProps = {
  items: PackageCatalogItem[];
};

const ITEMS_PER_PAGE = 9;
const SCROLL_OFFSET = 120;

type ParsedNotes = {
  included: string[];
  excluded: string[];
  extra: string[];
};

const normalizeLines = (value?: string) =>
  (value ?? "")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);

const dedupeKeepOrder = (values: string[]) => {
  const seen = new Set<string>();
  const out: string[] = [];
  values.forEach((value) => {
    const key = value.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(value);
  });
  return out;
};

const isExcludedHeader = (lineUpper: string) =>
  lineUpper.includes("TIDAK TERMASUK") || lineUpper.includes("EXCLUDE");

const isIncludedHeader = (lineUpper: string) =>
  (lineUpper.includes("TERMASUK") || lineUpper.includes("INCLUDE")) && !isExcludedHeader(lineUpper);

const isExtraHeader = (lineUpper: string) =>
  lineUpper.includes("LAIN-LAIN") || lineUpper.includes("LAINNYA") || lineUpper.includes("CATATAN");

const parseNotes = (notes?: string, additionalInfo?: string): ParsedNotes => {
  const parsed: ParsedNotes = { included: [], excluded: [], extra: [] };
  const lines = normalizeLines(notes);
  let bucket: keyof ParsedNotes = "extra";

  lines.forEach((line) => {
    const upper = line.toUpperCase();
    if (isExcludedHeader(upper)) {
      bucket = "excluded";
      return;
    }
    if (isIncludedHeader(upper)) {
      bucket = "included";
      return;
    }
    if (isExtraHeader(upper)) {
      bucket = "extra";
      return;
    }
    parsed[bucket].push(line);
  });

  parsed.extra.push(...normalizeLines(additionalInfo));

  return {
    included: dedupeKeepOrder(parsed.included),
    excluded: dedupeKeepOrder(parsed.excluded),
    extra: dedupeKeepOrder(parsed.extra),
  };
};

const parseHotelLines = (hotel?: string) => dedupeKeepOrder(normalizeLines(hotel));

export default function PackageCatalogGrid({ items }: PackageCatalogGridProps) {
  const [selectedPackage, setSelectedPackage] = useState<PackageCatalogItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const didMountPageRef = useRef(false);
  const parsedNotes = useMemo(
    () => parseNotes(selectedPackage?.notes, selectedPackage?.additionalInfo),
    [selectedPackage?.notes, selectedPackage?.additionalInfo],
  );
  const hotelLines = useMemo(() => parseHotelLines(selectedPackage?.hotel), [selectedPackage?.hotel]);
  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleItems = useMemo(() => items.slice(pageStart, pageStart + ITEMS_PER_PAGE), [items, pageStart]);
  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, index) => index + 1), [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedPackage(null);
  }, [items]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!didMountPageRef.current) {
      didMountPageRef.current = true;
      return;
    }

    const gridTop = gridRef.current?.getBoundingClientRect().top;
    if (gridTop === undefined) return;

    window.scrollTo({
      top: Math.max(0, window.scrollY + gridTop - SCROLL_OFFSET),
      behavior: "smooth",
    });
  }, [currentPage]);

  useEffect(() => {
    if (!selectedPackage) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedPackage(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedPackage]);

  const handlePageChange = (nextPage: number) => {
    const safePage = Math.max(1, Math.min(totalPages, nextPage));
    if (safePage === currentPage) return;
    setSelectedPackage(null);
    setCurrentPage(safePage);
  };

  return (
    <>
      <div ref={gridRef} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleItems.map((item) => (
          <Reveal key={`${item.key}-${item.provider}-${item.name}-${item.url}`}>
            <article className="flex h-full min-h-[25rem] flex-col rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex flex-1 flex-col">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-primary-700">{item.type}</p>
                  <p className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{item.duration}</p>
                </div>
                <h3 className="mt-2 text-lg font-bold">{item.name}</h3>
                <p className="mt-1 text-sm text-black">{item.provider}</p>
                <div className="mt-4 space-y-1.5 text-sm text-black">
                  <p>Maskapai: {item.airline}</p>
                  <p>Hotel: {item.hotel}</p>
                  <p>Sumber: {item.source}</p>
                </div>
              </div>
              <p className="mt-5 text-lg font-bold text-primary-700">{item.price}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPackage(item)}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl px-3 py-2 text-center text-sm font-semibold leading-tight text-primary-700 ring-1 ring-primary-200 transition hover:bg-primary-50"
                >
                  Lihat Detail Paket
                </button>
                <Link
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-amber-400 px-3 py-2 text-center text-sm font-semibold leading-tight text-slate-900 transition hover:bg-amber-300"
                >
                  Kunjungi Provider
                </Link>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-black/5 bg-white px-4 py-5 shadow-sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm font-medium text-slate-700">
            Menampilkan <span className="font-semibold text-slate-900">{items.length === 0 ? 0 : pageStart + 1}</span>
            {" - "}
            <span className="font-semibold text-slate-900">{Math.min(pageStart + visibleItems.length, items.length)}</span>
            {" dari "}
            <span className="font-semibold text-slate-900">{items.length}</span> paket
          </p>
          <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            Halaman {currentPage} / {totalPages}
          </span>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Halaman sebelumnya"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="m15 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {pageNumbers.map((pageNumber) => {
            const isActive = pageNumber === currentPage;
            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => handlePageChange(pageNumber)}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "inline-flex h-12 w-12 items-center justify-center rounded-full text-2xl font-semibold leading-none transition",
                  isActive
                    ? "bg-primary-500 text-white shadow-[0_10px_24px_rgba(59,130,246,0.28)] ring-1 ring-primary-400/80"
                    : "bg-white text-slate-700 ring-1 ring-transparent hover:bg-slate-50 hover:ring-slate-200",
                ].join(" ")}
              >
                {pageNumber}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Halaman berikutnya"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-[2px]" onClick={() => setSelectedPackage(null)}>
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">{selectedPackage.type}</p>
                <h3 className="mt-2 text-2xl font-bold leading-tight text-slate-900">{selectedPackage.name}</h3>
                <p className="mt-1 text-sm text-slate-700">{selectedPackage.provider}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPackage(null)}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Tutup
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Harga</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selectedPackage.price}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Durasi</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selectedPackage.duration}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Maskapai</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selectedPackage.airline}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Sumber</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selectedPackage.source}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">Detail Hotel</p>
                {hotelLines.length > 0 ? (
                  <ul className="mt-2 space-y-2 text-sm text-slate-700">
                    {hotelLines.map((line) => (
                      <li key={line} className="rounded-lg bg-slate-50 px-3 py-2">
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-600">Detail hotel belum tersedia.</p>
                )}
              </div>

              <div className="space-y-4">
                {parsedNotes.included.length > 0 && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                    <p className="text-sm font-semibold text-emerald-900">Harga Termasuk</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-emerald-900/90">
                      {parsedNotes.included.map((line) => (
                        <li key={`inc-${line}`}>{line}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {parsedNotes.excluded.length > 0 && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                    <p className="text-sm font-semibold text-amber-900">Harga Tidak Termasuk</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900/90">
                      {parsedNotes.excluded.map((line) => (
                        <li key={`exc-${line}`}>{line}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {parsedNotes.extra.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">Catatan Tambahan</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {parsedNotes.extra.map((line) => (
                        <li key={`ext-${line}`}>{line}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {parsedNotes.included.length === 0 && parsedNotes.excluded.length === 0 && parsedNotes.extra.length === 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-600">Keterangan paket belum tersedia.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-slate-200 pt-4">
              <Link
                href={selectedPackage.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
              >
                Kunjungi Provider
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
