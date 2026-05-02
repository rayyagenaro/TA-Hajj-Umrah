"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { TravelPackage } from "@/data/travelPackages";
import { rankPackagesByProfile } from "../profileMatching";
import type { ScoredPackage } from "../profileMatching";
import type { ApiResponse, EnrichedRecommendation, FormState, MainTravel } from "../types";

type Props = {
  open: boolean;
  nama: string;
  result: ApiResponse | null;
  utamaInfo: EnrichedRecommendation | null;
  alternatifInfo: EnrichedRecommendation[];
  isNoRecommendation: boolean;
  generatedAt: string | null;
  utamaTravel: MainTravel | null;
  form: FormState;
  daftarPaketHref: string;
  onClose: () => void;
};

type ActiveTab = "ontologi" | "matching";

type ParsedNotes = {
  included: string[];
  excluded: string[];
  extra: string[];
};

type ExplanationContent = {
  badge: string;
  title: string;
  summary: string;
  reasons: string[];
  suggestions: string[];
};

const MIN_UMRAH_BUDGET = 25_000_000;
const MIN_PLUS_DESTINATION_BUDGET = 35_000_000;

const normalizeLines = (value?: string) =>
  (value ?? "")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .map((line) => line.replace(/^[-\u2022]\s*/, "").trim())
    .filter(Boolean);

const dedupeKeepOrder = (values: string[]) => {
  const seen = new Set<string>();
  const output: string[] = [];
  values.forEach((value) => {
    const key = value.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    output.push(value);
  });
  return output;
};

const isExcludedHeader = (lineUpper: string) => lineUpper.includes("TIDAK TERMASUK") || lineUpper.includes("EXCLUDE");

const isIncludedHeader = (lineUpper: string) => (lineUpper.includes("TERMASUK") || lineUpper.includes("INCLUDE")) && !isExcludedHeader(lineUpper);

const isExtraHeader = (lineUpper: string) => lineUpper.includes("LAIN-LAIN") || lineUpper.includes("LAINNYA") || lineUpper.includes("CATATAN");

function parseNotes(notes?: string, additionalInfo?: string): ParsedNotes {
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
}

function parseHotelLines(hotel?: string) {
  return dedupeKeepOrder(normalizeLines(hotel));
}

function parsePackagePrice(price: string): number {
  const parsed = Number.parseInt(price.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isUsableUrl(url?: string) {
  if (!url) return false;
  return /^https?:\/\/.+/i.test(url) && !/^https?:\/\/-+\/?$/i.test(url);
}

function hasProfileScore(pkg: TravelPackage): pkg is ScoredPackage {
  return "score" in pkg && typeof pkg.score === "object" && pkg.score !== null && "total" in pkg.score && typeof pkg.score.total === "number";
}

function extractMinHotelDistance(accommodation?: string): string | null {
  if (!accommodation) return null;

  const matches = accommodation.match(/(\d+)[\s-]*(?:meter|m)(?:\))?/gi);
  if (!matches || matches.length === 0) return null;

  const distances = matches
    .map((match) => {
      const num = Number.parseInt(match.replace(/[^\d]/g, ""), 10);
      return Number.isFinite(num) ? num : null;
    })
    .filter((num): num is number => num !== null);

  if (distances.length === 0) return null;

  const minDistance = Math.min(...distances);
  return `${minDistance} meter`;
}

function PackageCard({ pkg, budget, selected, onSelect, variant, index }: { pkg: TravelPackage; budget: number; selected: boolean; onSelect: () => void; variant: "ontologi" | "matching"; index: number }) {
  const isOverBudget = parsePackagePrice(pkg.price) > budget;
  const hotelDistance = extractMinHotelDistance(pkg.accommodation);
  const hasProviderUrl = isUsableUrl(pkg.url);

  return (
    <article
      className={[
        "animate-soft-slide-up flex h-full flex-col rounded-2xl border p-4 opacity-0 transition duration-300 hover:-translate-y-1 hover:shadow-lg",
        selected ? "border-primary-300 bg-primary-50/50 shadow-md shadow-primary-100/70" : "border-black/10 bg-white",
      ].join(" ")}
      style={{ animationDelay: `${Math.min(index, 5) * 55 + 120}ms` }}
    >
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">{pkg.name}</h4>
            <p className="mt-1 text-xs font-medium text-slate-600">{pkg.provider}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-primary-700">{pkg.price}</p>
            {hasProfileScore(pkg) && variant === "matching" && <p className="mt-1 text-[11px] font-semibold text-emerald-700">Skor {pkg.score.total}%</p>}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">{pkg.duration ?? "Durasi menyesuaikan program"}</span>
          <span className={["rounded-full px-2.5 py-1 font-semibold", isOverBudget ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-700"].join(" ")}>{isOverBudget ? "Budget kurang" : "Sesuai budget"}</span>
          {hotelDistance && <span className="rounded-full bg-blue-100 px-2.5 py-1 text-blue-700 font-semibold">Jarak hotel: {hotelDistance}</span>}
        </div>
      </div>

      <div className={["mt-4 grid gap-2", hasProviderUrl ? "grid-cols-2" : "grid-cols-1"].join(" ")}>
        <button
          type="button"
          onClick={onSelect}
          className="inline-flex min-h-9 w-full items-center justify-center rounded-lg bg-primary-600 px-3 py-1.5 text-center text-xs font-semibold leading-tight text-white transition hover:-translate-y-0.5 hover:bg-primary-700"
        >
          {selected ? "Tutup detail" : "Lihat detail"}
        </button>
        {hasProviderUrl && (
          <a
            href={pkg.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 w-full items-center justify-center rounded-lg border border-primary-200 px-3 py-1.5 text-center text-xs font-semibold leading-tight text-primary-700 transition hover:-translate-y-0.5 hover:bg-primary-50"
          >
            Kunjungi provider
          </a>
        )}
      </div>
    </article>
  );
}

export default function PackageRecommendationModal({ open, nama, result, utamaInfo, alternatifInfo, isNoRecommendation, generatedAt, utamaTravel, form, daftarPaketHref, onClose }: Props) {
  const [selectedPackage, setSelectedPackage] = useState<TravelPackage | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("ontologi");

  const scoredByProfile = useMemo(() => (utamaTravel ? rankPackagesByProfile(utamaTravel.packagesForMatching, form, 6) : []), [utamaTravel, form]);

  const parsedNotes = useMemo(() => parseNotes(selectedPackage?.notes, selectedPackage?.additionalInfo), [selectedPackage?.additionalInfo, selectedPackage?.notes]);

  const hotelLines = useMemo(() => parseHotelLines(selectedPackage?.accommodation), [selectedPackage?.accommodation]);
  const explanation = useMemo(() => buildRecommendationExplanation({ form, result, utamaInfo, isNoRecommendation }), [form, result, utamaInfo, isNoRecommendation]);

  useEffect(() => {
    if (!open) {
      setSelectedPackage(null);
      setActiveTab("ontologi");
    }
  }, [open]);

  if (!open || !utamaInfo) return null;

  const packagesForTab = activeTab === "ontologi" ? (utamaTravel?.packagesByRule ?? []) : scoredByProfile;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Tutup popup hasil rekomendasi" className="animate-backdrop-fade absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Hasil rekomendasi paket"
        className="animate-popup-rise relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl shadow-slate-900/25"
      >
        <div className="relative shrink-0 overflow-hidden border-b border-black/5 bg-slate-50 px-5 py-4 sm:px-6">
          <span className="animate-shimmer-sweep pointer-events-none absolute inset-y-0 left-0 w-full overflow-hidden" />
          <div className="flex items-start justify-between gap-4">
            <div className="animate-soft-slide-up">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">Hasil Rekomendasi</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">{utamaInfo.displayName}</h3>
              <p className="mt-2 text-sm text-slate-600">{utamaInfo.deskripsi}</p>
            </div>
            <button type="button" onClick={onClose} className="inline-flex rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white">
              Tutup
            </button>
          </div>

          <div className="animate-soft-slide-up stagger-1 mt-4 flex flex-wrap gap-2 text-xs opacity-0">
            {nama && <span className="rounded-full bg-primary-50 px-3 py-1 font-semibold text-primary-700 ring-1 ring-primary-100">untuk {nama}</span>}
            {generatedAt && <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">Dicetak: {generatedAt}</span>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div
            className={[
              "animate-soft-slide-up stagger-2 rounded-2xl border px-4 py-4 opacity-0",
              isNoRecommendation ? "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50" : "border-primary-100 bg-gradient-to-br from-primary-50 via-white to-cyan-50",
            ].join(" ")}
          >
            <span className={["inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide", isNoRecommendation ? "bg-amber-100 text-amber-900" : "bg-primary-100 text-primary-700"].join(" ")}>
              {explanation.badge}
            </span>
            <h4 className="mt-3 text-lg font-bold text-slate-900">{explanation.title}</h4>
            <p className="mt-2 text-sm text-slate-700">{explanation.summary}</p>

            {explanation.reasons.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-900">Penjelasan singkat</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {explanation.reasons.map((reason) => (
                    <li key={reason} className="flex items-start gap-2">
                      <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-primary-500" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {explanation.suggestions.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-900">Yang bisa dicoba</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {explanation.suggestions.map((suggestion) => (
                    <span key={suggestion} className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-slate-700">
                      {suggestion}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isNoRecommendation ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5">
              <p className="text-sm font-semibold text-amber-900">Belum ada paket yang bisa direkomendasikan saat ini.</p>
              <p className="mt-2 text-sm text-slate-700">Coba naikkan budget, sederhanakan destinasi tambahan, atau gunakan opsi hotel dan transportasi yang lebih fleksibel.</p>
            </div>
          ) : (
            <>
              {alternatifInfo.length > 0 && (
                <div className="animate-soft-slide-up mt-4 rounded-2xl border border-black/10 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-900">Alternatif lain</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {alternatifInfo.map((info) => (
                      <span key={info.paket} className="rounded-full border border-black/10 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                        {info.displayName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {utamaTravel ? (
                <>
                  <div className="animate-soft-slide-up stagger-3 mt-5 inline-flex rounded-xl border border-primary-100 bg-slate-50 p-1 opacity-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab("ontologi")}
                      className={["rounded-lg px-3 py-1.5 text-xs font-semibold transition", activeTab === "ontologi" ? "bg-primary-600 text-white shadow-sm" : "text-primary-700 hover:bg-primary-50"].join(" ")}
                    >
                      Kandidat Sesuai Aturan
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("matching")}
                      className={["rounded-lg px-3 py-1.5 text-xs font-semibold transition", activeTab === "matching" ? "bg-primary-600 text-white shadow-sm" : "text-primary-700 hover:bg-primary-50"].join(" ")}
                    >
                      Kandidat Terdekat
                    </button>
                  </div>

                  <p className="mt-3 text-xs text-slate-600">
                    {activeTab === "ontologi"
                      ? "Daftar ini menampilkan kandidat yang masih sesuai dengan aturan sistem dan budget input."
                      : "Tab ini menampilkan kandidat terdekat berdasarkan kecocokan budget, hotel, penerbangan, durasi, dan usia."}
                  </p>

                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    {packagesForTab.length === 0 && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Belum ada paket untuk tab ini pada kondisi input saat ini.</div>}

                    {packagesForTab.map((pkg, index) => {
                      const key = `${activeTab}-${pkg.provider}-${pkg.name}-${pkg.price}-${pkg.url}-${index}`;
                      const selected = selectedPackage?.provider === pkg.provider && selectedPackage?.name === pkg.name && selectedPackage?.price === pkg.price;

                      return <PackageCard key={key} pkg={pkg} budget={numericValue(form.budget)} selected={selected} onSelect={() => setSelectedPackage(selected ? null : pkg)} variant={activeTab} index={index} />;
                    })}
                  </div>

                  {selectedPackage && (
                    <div className="animate-popup-rise mt-5 rounded-3xl border border-primary-100 bg-primary-50/35 p-5 shadow-lg shadow-primary-100/70">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">Detail Paket</p>
                          <h4 className="mt-1 text-xl font-bold text-slate-900">{selectedPackage.name}</h4>
                          <p className="mt-1 text-sm text-slate-600">{selectedPackage.provider}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedPackage(null)}
                          className="inline-flex rounded-lg border border-primary-200 px-3 py-1.5 text-xs font-semibold text-primary-700 transition hover:-translate-y-0.5 hover:bg-white"
                        >
                          Tutup detail
                        </button>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <InfoTile label="Harga" value={selectedPackage.price} />
                        <InfoTile label="Durasi" value={selectedPackage.duration ?? "-"} />
                        <InfoTile label="Transportasi" value={selectedPackage.transport ?? "-"} />
                        <InfoTile label="Sumber" value={selectedPackage.source ?? "-"} />
                      </div>

                      {hotelLines.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-slate-900">Akomodasi</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {hotelLines.map((line) => (
                              <span key={line} className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-slate-700">
                                {line}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 grid gap-4 lg:grid-cols-3">
                        <InfoList title="Termasuk" items={parsedNotes.included} tone="emerald" />
                        <InfoList title="Tidak Termasuk" items={parsedNotes.excluded} tone="amber" />
                        <InfoList title="Catatan" items={parsedNotes.extra} tone="slate" />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-black/15 bg-slate-50 px-4 py-3 text-sm text-slate-600">Detail kandidat paket belum tersedia untuk hasil ini.</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function InfoList({ title, items, tone }: { title: string; items: string[]; tone: "emerald" | "amber" | "slate" }) {
  const toneClass = tone === "emerald" ? "border-emerald-200 bg-emerald-50/60" : tone === "amber" ? "border-amber-200 bg-amber-50/60" : "border-slate-200 bg-slate-50/70";

  return (
    <div className={["rounded-2xl border p-4", toneClass].join(" ")}>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {items.length > 0 ? (
        <ul className="mt-2 space-y-1 text-xs text-slate-700">
          {items.map((item) => (
            <li key={`${title}-${item}`}>- {item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-slate-500">Belum ada informasi.</p>
      )}
    </div>
  );
}

function buildRecommendationExplanation({ form, result, utamaInfo, isNoRecommendation }: { form: FormState; result: ApiResponse | null; utamaInfo: EnrichedRecommendation | null; isNoRecommendation: boolean }): ExplanationContent {
  const budget = numericValue(form.budget);
  const preferredDistance = numericValue(form.preferJarakHotelMaks);
  const budgetLabel = formatRupiah(budget);
  const selectedDestination = formatDestination(form.destinasiTambahan);
  const packageName = utamaInfo?.displayName ?? "paket ini";
  const suggestions = new Set<string>();
  const reasons: string[] = [];
  const minBudgetGap = Math.max(0, MIN_UMRAH_BUDGET - budget);
  const plusBudgetGap = Math.max(0, MIN_PLUS_DESTINATION_BUDGET - budget);
  const destinationMismatch = form.destinasiTambahan !== "none" && !matchesSelectedDestination(form.destinasiTambahan, result?.paketUtama?.paket);
  const extraConstraintNotes = collectConstraintNotes(form);

  if (isNoRecommendation) {
    if (budget < MIN_UMRAH_BUDGET) {
      reasons.push(`Budget Anda saat ini ${budgetLabel}. Untuk mulai masuk ke rekomendasi Umrah, budget aman minimumnya sekitar ${formatRupiah(MIN_UMRAH_BUDGET)}.`);
      reasons.push(`Jadi, Anda masih kurang sekitar ${formatRupiah(minBudgetGap)}.`);
      suggestions.add(`Naikkan budget minimal ke ${formatRupiah(MIN_UMRAH_BUDGET)}`);
    }
    if (form.destinasiTambahan !== "none") {
      reasons.push(`Pilihan tambahan ${selectedDestination} juga membuat kebutuhan budget jadi lebih tinggi daripada paket Umrah biasa.`);
      suggestions.add("Coba tanpa destinasi tambahan terlebih dahulu");
    }
    if (extraConstraintNotes.length > 0) {
      reasons.push(extraConstraintNotes[0]);
    }
    if (form.tipePenerbangan === "direct") {
      suggestions.add("Coba pilih penerbangan transit");
    }
    if (preferredDistance <= 300) {
      suggestions.add("Longgarkan batas jarak hotel");
    }

    return {
      badge: "Penjelasan Hasil",
      title: "Saat ini belum ada paket yang cukup pas",
      summary: "Input Anda sudah terbaca dengan baik, tetapi kombinasi yang dipilih masih terlalu ketat untuk memunculkan paket utama.",
      reasons: dedupeKeepOrder(reasons).slice(0, 3),
      suggestions: dedupeKeepOrder([...suggestions]).slice(0, 3),
    };
  }

  const fallbackReason = buildFallbackReason(form, result?.paketUtama?.paket, packageName);
  if (fallbackReason) {
    reasons.push(fallbackReason);
  }

  if (destinationMismatch) {
    reasons.push(`Budget Anda saat ini ${budgetLabel}. Untuk mulai mengejar paket ${selectedDestination}, budget aman minimumnya sekitar ${formatRupiah(MIN_PLUS_DESTINATION_BUDGET)}.`);
    if (plusBudgetGap > 0) {
      reasons.push(`Jadi, Anda masih kurang sekitar ${formatRupiah(plusBudgetGap)} untuk mulai masuk ke pilihan ${selectedDestination}.`);
    }
  }

  if (extraConstraintNotes.length > 0) {
    reasons.push(extraConstraintNotes[0]);
  }

  reasons.push(`${packageName} akhirnya dipilih karena untuk kondisi saat ini, itu yang paling masuk akal tanpa memaksakan preferensi yang belum terpenuhi.`);

  if (destinationMismatch) {
    if (plusBudgetGap > 0) {
      suggestions.add(`Tambah budget sekitar ${formatRupiah(plusBudgetGap)} jika tetap ingin ${selectedDestination}`);
    }
    if (form.tipePenerbangan === "direct") {
      suggestions.add("Coba pilih penerbangan transit");
    }
    if (preferredDistance <= 300) {
      suggestions.add("Coba longgarkan batas jarak hotel");
    }
  }

  if (!destinationMismatch && form.destinasiTambahan === "none") {
    suggestions.add("Lihat juga kandidat terdekat untuk opsi lain");
  }

  return {
    badge: "Penjelasan Hasil",
    title: fallbackReason ? `Kenapa hasilnya mengarah ke ${packageName}?` : `Kenapa sistem memilih ${packageName}?`,
    summary: fallbackReason
      ? "Sistem tetap membaca target awal Anda, tetapi akhirnya memilih opsi yang paling realistis untuk kondisi sekarang."
      : "Sistem memilih paket ini karena kombinasi preferensi Anda saat ini paling dekat dengan karakter paket tersebut.",
    reasons: dedupeKeepOrder(reasons).slice(0, 4),
    suggestions: dedupeKeepOrder([...suggestions]).slice(0, 3),
  };
}

function buildFallbackReason(form: FormState, paket: string | undefined, packageName: string) {
  if (!paket) return null;

  if (form.destinasiTambahan === "Turki" && paket !== "UmrahPlusTurki") {
    return `Anda memilih tambahan Turki, tetapi untuk sekarang sistem lebih aman mengarahkan Anda ke ${packageName} dulu.`;
  }
  if (form.destinasiTambahan === "Dubai" && paket !== "UmrahPlusDubai") {
    return `Anda memilih tambahan Dubai, tetapi untuk sekarang sistem lebih aman mengarahkan Anda ke ${packageName} dulu.`;
  }
  if (form.destinasiTambahan === "Mesir" && paket !== "UmrahPlusMesir") {
    return `Anda memilih tambahan Mesir, tetapi untuk sekarang sistem lebih aman mengarahkan Anda ke ${packageName} dulu.`;
  }

  return null;
}

function collectConstraintNotes(form: FormState) {
  const notes: string[] = [];
  const preferredDistance = numericValue(form.preferJarakHotelMaks);
  const preferredDuration = numericValue(form.durasiPreferensi);

  if (preferredDistance <= 300) {
    notes.push(`Anda memilih jarak hotel cukup dekat, maksimal ${preferredDistance} meter, jadi pilihan paket otomatis lebih sempit.`);
  }

  if (form.tipePenerbangan === "direct") {
    notes.push("Anda memilih penerbangan direct, jadi jumlah paket yang cocok juga ikut berkurang.");
  }

  if (preferredDuration < 9 || preferredDuration > 13) {
    notes.push(`Anda memilih durasi ${preferredDuration} hari, sehingga sistem mencari paket yang lebih spesifik dari biasanya.`);
  }

  return notes;
}

function matchesSelectedDestination(destinasi: FormState["destinasiTambahan"], paket?: string) {
  if (!paket || destinasi === "none") return true;
  if (destinasi === "Turki") return paket === "UmrahPlusTurki";
  if (destinasi === "Dubai") return paket === "UmrahPlusDubai";
  if (destinasi === "Mesir") return paket === "UmrahPlusMesir";
  return true;
}

function formatDestination(destinasi: FormState["destinasiTambahan"]) {
  return destinasi === "none" ? "tanpa tambahan" : destinasi;
}

function numericValue(value: number | ""): number {
  return typeof value === "number" ? value : 0;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
