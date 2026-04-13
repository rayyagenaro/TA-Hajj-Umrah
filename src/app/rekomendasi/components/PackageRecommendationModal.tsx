"use client";

import Link from "next/link";
import type { FormState, MainTravel } from "../types";
import { rankPackagesByProfile } from "../profileMatching";

type Props = {
  open: boolean;
  utamaTravel: MainTravel | null;
  form: FormState;
  daftarPaketHref: string;
  onClose: () => void;
};

export default function PackageRecommendationModal({ open, utamaTravel, form, daftarPaketHref, onClose }: Props) {
  if (!open || !utamaTravel) return null;

  const scoredByProfile = rankPackagesByProfile(utamaTravel.packages, form, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Tutup popup"
        className="absolute inset-0 bg-slate-900/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Daftar Paket Cocok"
        className="relative z-10 max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-black/5 bg-slate-50 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">Paket Paling Cocok</p>
            <h3 className="mt-1 text-xl font-bold text-slate-900">{utamaTravel.label}</h3>
            <p className="mt-1 text-xs text-slate-600">Daftar referensi travel yang paling relevan dari hasil rekomendasi Anda.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white"
          >
            Tutup
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-700">Berdasarkan preferensi (aturan ontologi)</p>
            <p className="mt-1 text-xs text-slate-600">Urutan ini mengikuti hasil paket paling cocok dari input preferensi Anda.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {utamaTravel.packages.map((pkg) => (
                <article
                  key={`pref-${utamaTravel.paket}-${pkg.provider}-${pkg.name}`}
                  className="rounded-xl border border-black/10 bg-slate-50/60 p-4"
                >
                  <div className="flex items-start justify-between gap-2 text-sm">
                    <span className="font-semibold text-black">{pkg.provider}</span>
                    <span className="font-semibold text-primary-700">{pkg.price}</span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-black">{pkg.name}</p>
                  <p className="mt-2 text-[11px] text-slate-600">{pkg.duration ?? "Durasi menyesuaikan program"}</p>
                  <a
                    href={pkg.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center text-xs font-semibold text-primary-700 hover:underline"
                  >
                    Kunjungi provider
                  </a>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-6 border-t border-black/10 pt-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-700">Berdasarkan kecocokan profile matching</p>
            <p className="mt-1 text-xs text-slate-600">Skor dihitung dari kecocokan budget, hotel, transportasi, dan rentang usia.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {scoredByProfile.map((pkg) => (
                <article
                  key={`score-${utamaTravel.paket}-${pkg.provider}-${pkg.name}`}
                  className="rounded-xl border border-primary-100 bg-primary-50/40 p-4"
                >
                  <div className="flex items-start justify-between gap-2 text-sm">
                    <span className="font-semibold text-black">{pkg.provider}</span>
                    <div className="text-right">
                      <p className="font-semibold text-primary-700">{pkg.price}</p>
                      <p className="text-[11px] font-semibold text-emerald-700">Skor {pkg.score.total}%</p>
                    </div>
                  </div>
                  <p className="mt-1 text-xs font-medium text-black">{pkg.name}</p>
                  <p className="mt-2 text-[11px] text-slate-600">{pkg.duration ?? "Durasi menyesuaikan program"}</p>
                  <a
                    href={pkg.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center text-xs font-semibold text-primary-700 hover:underline"
                  >
                    Kunjungi provider
                  </a>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/5 px-5 py-4">
          <p className="text-xs text-slate-600">Ingin eksplor lebih lengkap dengan detail per paket?</p>
          <Link
            href={daftarPaketHref}
            onClick={onClose}
            className="inline-flex items-center rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
          >
            Lihat Selengkapnya
          </Link>
        </div>
      </div>
    </div>
  );
}
