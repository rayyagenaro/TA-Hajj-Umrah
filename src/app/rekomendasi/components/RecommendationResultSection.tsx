"use client";

import Link from "next/link";
import PrintButton from "@/components/PrintButton";
import type { ApiResponse, EnrichedRecommendation } from "../types";

type Props = {
  nama: string;
  error: string | null;
  loading: boolean;
  result: ApiResponse | null;
  utamaInfo: EnrichedRecommendation | null;
  alternatifInfo: EnrichedRecommendation[];
  isNoRecommendation: boolean;
  generatedAt: string | null;
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
  onOpenPackageModal,
}: Props) {
  return (
    <section>
      <div
        className={[
          "animate-soft-slide-up rounded-2xl p-5 shadow-sm sm:p-6",
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

        {error && <div className="animate-soft-slide-up mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {!error && loading && (
          <div className="animate-pulse-soft mt-4 rounded-xl border border-primary-200 bg-primary-50 p-3 text-sm text-primary-700">
            Mengambil rekomendasi dari ontologi...
          </div>
        )}

        {!error && !loading && utamaInfo && (
          <div className="animate-soft-slide-up">
            {isNoRecommendation && (
              <span className="mt-3 inline-flex items-center rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                Perlu penyesuaian preferensi
              </span>
            )}
            <h2 className="mt-3 text-2xl font-bold text-slate-900">{utamaInfo.displayName}</h2>
            <p className="mt-2 text-sm text-slate-700">
              {isNoRecommendation
                ? utamaInfo.deskripsi
                : "Ringkasan hasil ditampilkan di sini, sementara detail kandidat paket muncul di popup seperti versi sebelumnya."}
            </p>

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

            {!isNoRecommendation && alternatifInfo.length > 0 && (
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
              {!isNoRecommendation && (
                <button
                  type="button"
                  onClick={onOpenPackageModal}
                  className="inline-flex items-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primary-700"
                >
                  Buka Popup Hasil
                </button>
              )}
              {utamaInfo.href && (
                <Link
                  href={utamaInfo.href}
                  className="inline-flex items-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primary-700"
                >
                  Lihat Detail Paket
                </Link>
              )}
              <Link
                href="#logika"
                className="inline-flex items-center rounded-xl border border-primary-200 px-4 py-2 text-sm font-semibold text-primary-700 transition hover:-translate-y-0.5 hover:bg-primary-50"
              >
                Lihat Logika
              </Link>
              <PrintButton />
            </div>
          </div>
        )}

        {!error && !loading && !utamaInfo && (
          <div className="animate-soft-slide-up mt-4 rounded-xl border border-dashed border-black/15 bg-slate-50 p-4 text-sm text-slate-600">
            Isi form lalu klik <span className="font-semibold">Hitung Rekomendasi</span> untuk melihat hasil paket.
          </div>
        )}
      </div>
    </section>
  );
}
