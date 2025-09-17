"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import PrintButton from "@/components/PrintButton";

type Preferensi = {
  anggaran: "rendah" | "sedang" | "tinggi";
  keberangkatan: "secepatnya" | "1-5tahun" | ">5tahun";
  kenyamanan: "standar" | "premium" | "maksimal";
};

type Paket = "Reguler" | "Plus" | "Furoda";

function skor(pre: Preferensi) {
  const s: Record<Paket, number> = { Reguler: 0, Plus: 0, Furoda: 0 };
  // Anggaran
  if (pre.anggaran === "rendah") { s.Reguler += 2; }
  if (pre.anggaran === "sedang") { s.Plus += 2; s.Reguler += 1; }
  if (pre.anggaran === "tinggi") { s.Furoda += 2; s.Plus += 1; }
  // Keberangkatan
  if (pre.keberangkatan === "secepatnya") { s.Furoda += 3; s.Plus += 1; }
  if (pre.keberangkatan === "1-5tahun") { s.Plus += 2; s.Reguler += 1; }
  if (pre.keberangkatan === ">5tahun") { s.Reguler += 3; }
  // Kenyamanan
  if (pre.kenyamanan === "standar") { s.Reguler += 2; }
  if (pre.kenyamanan === "premium") { s.Plus += 2; }
  if (pre.kenyamanan === "maksimal") { s.Furoda += 2; }
  return s;
}

function rekomendasi(pre: Preferensi): { terbaik: Paket; urutan: [Paket, number][] } {
  const s = skor(pre);
  const urutan = (Object.entries(s) as [Paket, number][]) // sort desc
    .sort((a, b) => b[1] - a[1]);
  return { terbaik: urutan[0][0], urutan };
}

export default function RekomendasiPage() {
  const [pref, setPref] = useState<Preferensi>({
    anggaran: "sedang",
    keberangkatan: "1-5tahun",
    kenyamanan: "premium",
  });
  const hasil = useMemo(() => rekomendasi(pref), [pref]);
  const [generatedAt] = useState(() => new Date().toLocaleString());

  const mapping = {
    Reguler: {
      href: "/paket/reguler",
      deskripsi: "Pilihan ekonomis dengan fasilitas standar dan antrean lebih panjang.",
    },
    Plus: {
      href: "/paket/plus",
      deskripsi: "Fleksibilitas lebih, fasilitas lebih baik, waktu tunggu lebih singkat.",
    },
    Furoda: {
      href: "/paket/furoda",
      deskripsi: "Keberangkatan cepat tanpa antre kuota, kenyamanan maksimal.",
    },
  } as const;

  return (
    <div className="container-section">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Rekomendasi Paket</h1>
          <p className="mt-1 text-black dark:text-black">
            Isi preferensi di bawah ini untuk mendapatkan rekomendasi awal (frontend-only demo).
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Anggaran */}
          <div className="rounded-2xl border border-black/5 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-semibold">Anggaran</p>
            <div className="mt-3 space-y-2">
              {([
                ["rendah", "Rendah"],
                ["sedang", "Sedang"],
                ["tinggi", "Tinggi"],
              ] as const).map(([val, label]) => (
                <label key={val} className="flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name="anggaran"
                    className="h-4 w-4 accent-primary-600"
                    checked={pref.anggaran === val}
                    onChange={() => setPref((p) => ({ ...p, anggaran: val }))}
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Keberangkatan */}
          <div className="rounded-2xl border border-black/5 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-semibold">Waktu Keberangkatan</p>
            <div className="mt-3 space-y-2">
              {([
                ["secepatnya", "Secepatnya"],
                ["1-5tahun", "1–5 tahun"],
                [">5tahun", "> 5 tahun"],
              ] as const).map(([val, label]) => (
                <label key={val} className="flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name="keberangkatan"
                    className="h-4 w-4 accent-primary-600"
                    checked={pref.keberangkatan === val}
                    onChange={() => setPref((p) => ({ ...p, keberangkatan: val }))}
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Kenyamanan */}
          <div className="rounded-2xl border border-black/5 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-semibold">Kenyamanan</p>
            <div className="mt-3 space-y-2">
              {([
                ["standar", "Standar"],
                ["premium", "Premium"],
                ["maksimal", "Maksimal"],
              ] as const).map(([val, label]) => (
                <label key={val} className="flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name="kenyamanan"
                    className="h-4 w-4 accent-primary-600"
                    checked={pref.kenyamanan === val}
                    onChange={() => setPref((p) => ({ ...p, kenyamanan: val }))}
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Hasil */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="glass rounded-2xl p-6 shadow-glow animate-pulse-soft">
            <p className="text-sm font-semibold text-black dark:text-black">Hasil Rekomendasi</p>
            <h2 className="mt-2 text-2xl font-bold">{hasil.terbaik}</h2>
            <p className="mt-2 text-black dark:text-black">{mapping[hasil.terbaik].deskripsi}</p>
            <p className="print-only mt-1 text-xs text-slate-500">Dicetak: {generatedAt}</p>
            <div className="mt-4 flex gap-3">
              <Link
                href={mapping[hasil.terbaik].href}
                className="inline-flex items-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
              >
                Lihat Detail Paket
              </Link>
              <Link href="#logika" className="text-sm font-medium text-primary-700 underline-offset-4 hover:underline">
                Lihat logika (demo)
              </Link>
              <PrintButton />
            </div>
          </div>

          <div id="logika" className="rounded-2xl border border-black/5 p-6 text-sm dark:border-white/10">
            <p className="font-semibold">Catatan logika demo (frontend):</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-black dark:text-black">
              <li>Skor dihitung dari anggaran, waktu keberangkatan, dan kenyamanan.</li>
              <li>Urutan paket berdasarkan skor tertinggi.</li>
            </ul>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[320px] text-left text-xs">
                <thead className="text-black">
                  <tr>
                    <th className="py-1 pr-4">Paket</th>
                    <th className="py-1">Skor</th>
                  </tr>
                </thead>
                <tbody>
                  {hasil.urutan.map(([p, n]) => (
                    <tr key={p}>
                      <td className="py-1 pr-4">{p}</td>
                      <td className="py-1">{n}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
