"use client";

import Link from "next/link";
import PrintButton from "@/components/PrintButton";
import { rankPackagesByProfile } from "../profileMatching";
import type { ApiResponse, EnrichedRecommendation, FormState, MainTravel } from "../types";

type Props = {
  nama: string;
  error: string | null;
  loading: boolean;
  result: ApiResponse | null;
  utamaInfo: EnrichedRecommendation | null;
  alternatifInfo: EnrichedRecommendation[];
  isNoRecommendation: boolean;
  generatedAt: string | null;
  utamaTravel: MainTravel | null;
  form: FormState;
  daftarPaketHref: string;
  onOpenPackageModal: () => void;
};

export default function RecommendationResultSection({
  nama,
  error,
  loading,
  result,
  utamaInfo,
  alternatifInfo,
  isNoRecommendation,
  generatedAt,
  utamaTravel,
  form,
  daftarPaketHref,
  onOpenPackageModal,
}: Props) {
  const topProfileMatch = utamaTravel ? rankPackagesByProfile(utamaTravel.packages, form, 1)[0] ?? null : null;

  return (
    <section className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
      <div
        className={[
          "rounded-2xl p-5 shadow-sm sm:p-6",
          !utamaInfo
            ? "border border-black/5 bg-white"
            : isNoRecommendation
              ? "border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-amber-100/70"
              : "border border-primary-200 bg-white shadow-primary-100/60",
        ].join(" ")}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-black">Hasil Rekomendasi</p>
          {nama && (
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">
              untuk {nama}
            </span>
          )}
        </div>

        {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {!error && loading && (
          <div className="mt-4 rounded-xl border border-primary-200 bg-primary-50 p-3 text-sm text-primary-700">
            Mengambil rekomendasi dari ontologi...
          </div>
        )}

        {!error && !loading && utamaInfo && (
          <>
            {isNoRecommendation && (
              <span className="mt-3 inline-flex items-center rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                Perlu penyesuaian preferensi
              </span>
            )}
            <h2 className="mt-3 text-2xl font-bold text-slate-900">{utamaInfo.displayName}</h2>
            <p className="mt-2 text-sm text-slate-700">{utamaInfo.deskripsi}</p>

            {result?.paketUtama?.label && (
              <p
                className={[
                  "mt-3 rounded-lg px-3 py-2 text-xs",
                  isNoRecommendation ? "border border-amber-200 bg-white/70 text-amber-900" : "bg-slate-100 text-slate-700",
                ].join(" ")}
              >
                Aturan: {result.paketUtama.label}
              </p>
            )}
            {result?.paketUtama?.comment && <p className="mt-2 text-xs text-slate-600">{result.paketUtama.comment}</p>}

            {isNoRecommendation && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-white/80 p-4">
                <div className="mb-3 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                      <path d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2Zm1 14h-2v-2h2Zm0-4h-2V7h2Z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Belum memenuhi syarat</p>
                    <p className="text-xs text-amber-900">Sistem belum bisa memberi paket utama untuk kombinasi ini.</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-900">Saran cepat agar mendapat paket</p>
                <ul className="mt-2 space-y-1 text-xs text-slate-700">
                  <li>- Naikkan budget minimal ke sekitar Rp 25.000.000.</li>
                  <li>- Jika ingin tetap hemat, pilih tanpa destinasi tambahan dulu.</li>
                  <li>- Coba hotel Standard dan transportasi Ekonomi untuk simulasi awal.</li>
                </ul>
              </div>
            )}

            {alternatifInfo.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-black">Alternatif lain</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {alternatifInfo.map((info) => (
                    <span
                      key={info.paket}
                      className="rounded-full border border-black/10 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {info.displayName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="print-only mt-3 text-xs text-slate-500">Dicetak: {generatedAt ?? "-"}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {utamaTravel && (
                <button
                  type="button"
                  onClick={onOpenPackageModal}
                  className="inline-flex items-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                  Lihat Paket Cocok
                </button>
              )}
              {utamaInfo.href && (
                <Link
                  href={utamaInfo.href}
                  className="inline-flex items-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                  Lihat Detail Paket
                </Link>
              )}
              <Link
                href="#logika"
                className="inline-flex items-center rounded-xl border border-primary-200 px-4 py-2 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
              >
                Lihat Logika
              </Link>
              <PrintButton />
            </div>
          </>
        )}

        {!error && !loading && !utamaInfo && (
          <div className="mt-4 rounded-xl border border-dashed border-black/15 bg-slate-50 p-4 text-sm text-slate-600">
            Isi form lalu klik <span className="font-semibold">Hitung Rekomendasi</span> untuk melihat hasil paket.
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
        {utamaTravel ? (
          <>
            <div className="rounded-xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-cyan-50 p-4">
              <p className="text-sm font-semibold text-black">Daftar Paket Cocok</p>
              <p className="mt-1 text-xs text-slate-600">
                Paket paling relevan saat ini: <span className="font-semibold text-primary-700">{utamaTravel.label}</span>
              </p>
              <p className="mt-2 text-xs text-slate-600">
                Tersedia {utamaTravel.packages.length} referensi travel. Klik tombol di bawah untuk melihat daftar dalam popup.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onOpenPackageModal}
                  className="inline-flex items-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                  Buka Daftar Paket
                </button>
                <Link
                  href={daftarPaketHref}
                  className="inline-flex items-center rounded-xl border border-primary-200 px-4 py-2 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
                >
                  Lihat Selengkapnya
                </Link>
              </div>
            </div>

            {topProfileMatch && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
                <p className="text-sm font-semibold text-black">Ringkasan Justifikasi Skor</p>
                <p className="mt-1 text-xs text-slate-600">
                  Kecocokan tertinggi saat ini jatuh ke <span className="font-semibold text-emerald-700">{topProfileMatch.provider}</span> ({topProfileMatch.name})
                  dengan skor <span className="font-semibold text-emerald-700">{topProfileMatch.score.total}%</span>.
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-emerald-100 bg-white px-3 py-2">
                    <p className="text-slate-600">Budget (45%)</p>
                    <p className="font-semibold text-slate-900">{topProfileMatch.score.budget}%</p>
                  </div>
                  <div className="rounded-lg border border-emerald-100 bg-white px-3 py-2">
                    <p className="text-slate-600">Hotel (20%)</p>
                    <p className="font-semibold text-slate-900">{topProfileMatch.score.hotel}%</p>
                  </div>
                  <div className="rounded-lg border border-emerald-100 bg-white px-3 py-2">
                    <p className="text-slate-600">Transport (20%)</p>
                    <p className="font-semibold text-slate-900">{topProfileMatch.score.transport}%</p>
                  </div>
                  <div className="rounded-lg border border-emerald-100 bg-white px-3 py-2">
                    <p className="text-slate-600">Usia (15%)</p>
                    <p className="font-semibold text-slate-900">{topProfileMatch.score.usia}%</p>
                  </div>
                </div>

                <p className="mt-3 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs text-slate-700">
                  Kesimpulan: {buildProfileConclusion(topProfileMatch.score.total)}
                </p>
              </div>
            )}
          </>
        ) : (
          <div
            className={[
              "flex h-full flex-col justify-center rounded-xl p-4 text-sm",
              isNoRecommendation
                ? "border border-amber-200 bg-gradient-to-br from-white via-amber-50 to-orange-50 text-slate-700"
                : "border border-dashed border-black/15 bg-slate-50 text-slate-600",
            ].join(" ")}
          >
            {isNoRecommendation ? (
              <>
                <span className="inline-flex w-fit rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                  Belum siap dipetakan ke travel
                </span>
                <p className="mt-3 text-lg font-semibold text-slate-900">Belum ada travel yang relevan untuk kondisi ini.</p>
                <p className="mt-2 text-sm">Sistem menahan rekomendasi karena budget masih di bawah batas minimal rule ontologi Umrah.</p>
                <p className="mt-3 rounded-lg border border-amber-200 bg-white/80 px-3 py-2 text-xs text-slate-700">
                  Target aman: set budget minimal ke <span className="font-semibold">Rp 25.000.000</span> lalu hitung ulang.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-slate-800">
                  {utamaInfo
                    ? `Belum ada data travel yang dipetakan untuk ${utamaInfo.displayName}.`
                    : "Jalankan rekomendasi terlebih dahulu untuk melihat referensi travel terkait."}
                </p>
                <p className="mt-2 text-xs">Data travel dapat ditambah pada `src/data/travelPackages.ts`.</p>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function buildProfileConclusion(score: number) {
  if (score >= 90) return "Paket ini sangat cocok dengan profil Anda; hampir semua preferensi utama terpenuhi.";
  if (score >= 80) return "Paket ini cocok dan seimbang dengan preferensi Anda, hanya ada sedikit kompromi di detail tertentu.";
  if (score >= 70) return "Paket ini cukup cocok, namun ada beberapa preferensi yang belum optimal.";
  return "Paket ini masih kurang cocok; disarankan menyesuaikan budget atau preferensi untuk hasil yang lebih presisi.";
}
