"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import PrintButton from "@/components/PrintButton";
import type { PaketKey, TravelPackage } from "@/data/travelPackages";
import { travelPackagesByType } from "@/data/travelPackages";

/* ---------- Types ---------- */
type FormState = {
  budget: number;
  usia: number;
  butuhPendampingan: "ya" | "tidak";
  preferensiHotel: "Standard" | "Mewah" | "Premium";
  tipeTransportasi: "Ekonomi" | "Bisnis" | "Premium";
  destinasiTambahan: "none" | "Turki" | "Dubai";
  nama: string;
};

type ApiRecommendation = { paket: string; label?: string; comment?: string };
type ApiResponse = { paketUtama: ApiRecommendation | null; paketAlternatif: ApiRecommendation[] };

type EnrichedRecommendation = ApiRecommendation & {
  displayName: string;
  deskripsi: string;
  href?: string;
};

/* ---------- Metadata ---------- */
const paketMetadata: Record<string, { label: string; deskripsi: string; href?: string }> = {
  UmrahReguler: {
    label: "Umrah Reguler",
    deskripsi: "Pilihan dasar dengan fokus ibadah 9-12 hari dan fasilitas hotel bintang 3-4.",
    href: "/paket/reguler",
  },
  UmrahPlusTurki: {
    label: "Umrah Plus Turki",
    deskripsi: "Ibadah dilanjutkan tur sejarah Istanbul & Bursa, dengan maskapai premium.",
    href: "/paket/plus",
  },
  UmrahPlusDubai: {
    label: "Umrah Plus Dubai",
    deskripsi: "Pengalaman city tour modern, desert safari, dan hotel bintang 5 setelah Umrah.",
    href: "/paket/furoda",
  },
  TidakMendapatRekomendasiUmrah: {
    label: "Belum Ada Rekomendasi Umrah",
    deskripsi: "Input saat ini belum memenuhi syarat minimal paket Umrah. Silakan sesuaikan preferensi.",
  },
};

/* ---------- Page ---------- */
export default function RekomendasiPage() {
  const [form, setForm] = useState<FormState>({
    budget: 32_000_000,
    usia: 40,
    butuhPendampingan: "tidak",
    preferensiHotel: "Standard",
    tipeTransportasi: "Ekonomi",
    destinasiTambahan: "none",
    nama: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const paketList = useMemo(() => {
    if (!result) return [] as ApiRecommendation[];
    const items: ApiRecommendation[] = [];
    if (result.paketUtama) items.push(result.paketUtama);
    items.push(...result.paketAlternatif);
    return items;
  }, [result]);

  const utamaInfo = enrich(result?.paketUtama ?? null);
  const alternatifInfo = (result?.paketAlternatif ?? [])
    .map((item) => enrich(item))
    .filter((x): x is EnrichedRecommendation => x !== null);

  const utamaTravel = useMemo(() => {
    const utama = result?.paketUtama;
    if (!utama) return null;
    const key = utama.paket;
    if (!isPaketKey(key)) return null;
    const packages = travelPackagesByType[key]?.slice(0, 4) ?? [];
    if (packages.length === 0) return null;
    const meta = paketMetadata[key] ?? { label: formatPaket(key), deskripsi: "" };
    return { paket: key, label: meta.label, packages } as { paket: PaketKey; label: string; packages: TravelPackage[] };
  }, [result?.paketUtama]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rekomendasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ibadah: "Umrah",
          budget: form.budget,
          usia: form.usia,
          butuhPendampingan: form.butuhPendampingan === "ya",
          preferensiHotel: form.preferensiHotel,
          tipeTransportasi: form.tipeTransportasi,
          destinasiTambahan: form.destinasiTambahan,
          nama: form.nama,
        }),
      });
      if (!res.ok) throw new Error("Gagal mengambil rekomendasi dari server");
      const data = await res.json();
      setResult({
        paketUtama: data?.paketUtama ?? null,
        paketAlternatif: Array.isArray(data?.paketAlternatif) ? data.paketAlternatif : [],
      });
      if (data?.input?.nama) setForm((p) => ({ ...p, nama: data.input.nama }));
      setGeneratedAt(new Date().toLocaleString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan tak terduga");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function updateForm<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  return (
    <div className="container-section">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Rekomendasi Paket Umrah</h1>
            <p className="mt-1 max-w-3xl text-black">
              Isi preferensi berdasarkan kebutuhan jamaah Umrah. Sistem membaca aturan SWRL langsung dari ontologi untuk menentukan paket Reguler, Plus Turki, atau Plus Dubai yang paling sesuai.
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-semibold uppercase text-slate-500">Nama Jamaah</label>
            <input
              type="text"
              value={form.nama}
              onChange={(e) => updateForm("nama", e.target.value)}
              placeholder="Tuliskan nama lengkap"
              className="mt-1 w-full min-w-[240px] rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
          </div>
        </div>

        {/* ====== FORM DI ATAS (1 kartu) ====== */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-black/5 bg-white p-5">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Budget */}
              <fieldset className="rounded-xl border border-black/10 p-4">
                <legend className="px-1 text-sm font-semibold">Budget Umrah (IDR)</legend>
                <input
                  type="number"
                  min={0}
                  step={500_000}
                  value={form.budget}
                  onChange={(e) => updateForm("budget", Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                />
                <p className="mt-2 text-xs text-slate-500">Contoh: 32000000 untuk 32 juta rupiah.</p>
              </fieldset>

              {/* Usia */}
              <fieldset className="rounded-xl border border-black/10 p-4">
                <legend className="px-1 text-sm font-semibold">Usia Jamaah</legend>
                <input
                  type="number"
                  min={0}
                  value={form.usia}
                  onChange={(e) => updateForm("usia", Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                />
              </fieldset>

              {/* Pendampingan */}
              <fieldset className="rounded-xl border border-black/10 p-4 md:col-span-2">
                <legend className="px-1 text-sm font-semibold">Pendampingan Khusus</legend>
                <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-6">
                  {([["ya", "Butuh pendampingan"], ["tidak", "Tidak perlu"]] as const).map(([val, label]) => (
                    <label key={val} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1 text-sm">
                      <input
                        type="radio"
                        name="pendampingan"
                        className="h-4 w-4 accent-primary-600"
                        checked={form.butuhPendampingan === val}
                        onChange={() => updateForm("butuhPendampingan", val)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Hotel */}
              <fieldset className="rounded-xl border border-black/10 p-4">
                <legend className="px-1 text-sm font-semibold">Preferensi Akomodasi</legend>
                <div className="mt-3 grid grid-cols-1 gap-2">
                  {([["Standard", "Hotel Standard"], ["Mewah", "Hotel Mewah"], ["Premium", "Hotel Premium"]] as const).map(([val, label]) => (
                    <label key={val} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1 text-sm">
                      <input
                        type="radio"
                        name="hotel"
                        className="h-4 w-4 accent-primary-600"
                        checked={form.preferensiHotel === val}
                        onChange={() => updateForm("preferensiHotel", val)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Transport */}
              <fieldset className="rounded-xl border border-black/10 p-4">
                <legend className="px-1 text-sm font-semibold">Preferensi Transportasi</legend>
                <div className="mt-3 grid grid-cols-1 gap-2">
                  {([["Ekonomi", "Kelas Ekonomi"], ["Bisnis", "Kelas Bisnis"], ["Premium", "Kelas Premium"]] as const).map(([val, label]) => (
                    <label key={val} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1 text-sm">
                      <input
                        type="radio"
                        name="transportasi"
                        className="h-4 w-4 accent-primary-600"
                        checked={form.tipeTransportasi === val}
                        onChange={() => updateForm("tipeTransportasi", val)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Destinasi tambahan */}
              <fieldset className="rounded-xl border border-black/10 p-4 md:col-span-2">
                <legend className="px-1 text-sm font-semibold">Destinasi Tambahan</legend>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {([["none", "Tanpa destinasi tambahan"], ["Turki", "Turki"], ["Dubai", "Dubai"]] as const).map(([val, label]) => (
                    <label key={val} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1 text-sm">
                      <input
                        type="radio"
                        name="destinasi"
                        className="h-4 w-4 accent-primary-600"
                        checked={form.destinasiTambahan === val}
                        onChange={() => updateForm("destinasiTambahan", val)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="mt-4">
              <button
                type="submit"
                className="w-full rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Menghitung rekomendasi..." : "Hitung Rekomendasi"}
              </button>
            </div>
          </div>

          {/* ====== HASIL: 2 kolom di bawah form ====== */}
          <div className="lg:flex lg:items-start lg:gap-4 space-y-4 lg:space-y-0">
            {/* Card kiri (fix tinggi konten) */}
            <div className="glass rounded-2xl p-5 shadow-glow lg:w-[380px] shrink-0 self-start">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-black">Hasil Rekomendasi</p>
                {form.nama && (
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                    untuk {form.nama}
                  </span>
                )}
              </div>

              {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
              )}

              {!error && loading && <p className="mt-4 text-sm text-slate-600">Mengambil rekomendasi dari ontologi...</p>}

              {!error && !loading && utamaInfo && (
                <>
                  <h2 className="mt-2 text-2xl font-bold text-black">{utamaInfo.displayName}</h2>
                  <p className="mt-2 text-black">{utamaInfo.deskripsi}</p>

                  {result?.paketUtama?.label && (
                    <p className="mt-3 rounded-lg bg-black/5 px-3 py-2 text-xs text-black">Aturan: {result.paketUtama.label}</p>
                  )}
                  {result?.paketUtama?.comment && <p className="mt-2 text-xs text-slate-600">{result.paketUtama.comment}</p>}

                  {alternatifInfo.length > 0 && (
                    <div className="mt-4 text-sm">
                      <p className="font-semibold text-black">Alternatif lain:</p>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-black">
                        {alternatifInfo.map((info) => (
                          <li key={info.paket}>{info.displayName}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="print-only mt-3 text-xs text-slate-500">Dicetak: {generatedAt ?? "-"}</p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {utamaInfo.href && (
                      <Link href={utamaInfo.href} className="inline-flex items-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700">
                        Lihat Detail Paket
                      </Link>
                    )}
                    <Link href="#logika" className="text-sm font-medium text-primary-700 underline-offset-4 hover:underline">
                      Lihat logika
                    </Link>
                    <PrintButton />
                  </div>
                </>
              )}

              {!error && !loading && !utamaInfo && (
                <p className="mt-4 text-sm text-slate-600">Masukkan data dan klik &quot;Hitung Rekomendasi&quot; untuk melihat hasil.</p>
              )}
            </div>

            {/* Card kanan (SELALU tampil) */}
            <div className="glass rounded-2xl p-5 shadow-glow flex-1">
              {utamaTravel ? (
                <>
                  <p className="text-sm font-semibold text-black">Rekomendasi Travel {utamaTravel.label}</p>
                  <p className="mt-1 text-xs text-black/70">Paket referensi publik yang sejenis dengan hasil utama.</p>

                  <div className="mt-4 grid gap-3">
                    {utamaTravel.packages.map((pkg) => (
                      <a
                        key={`${utamaTravel.paket}-${pkg.provider}-${pkg.name}`}
                        href={pkg.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-xl border border-black/10 bg-white/90 px-4 py-3 transition hover:-translate-y-0.5 hover:border-primary-300 hover:bg-white"
                      >
                        <div className="flex items-start justify-between gap-2 text-sm">
                          <span className="font-semibold text-black">{pkg.provider}</span>
                          <span className="font-semibold text-black">{pkg.price}</span>
                        </div>

                        <p className="mt-1 text-xs font-medium text-black">{pkg.name}</p>

                        <dl className="mt-3 grid grid-cols-[auto,1fr] gap-x-2 gap-y-1 text-[11px] text-black">
                          {pkg.duration && (<><dt className="font-semibold">Durasi</dt><dd>{pkg.duration}</dd></>)}
                          {pkg.transport && (<><dt className="font-semibold">Maskapai</dt><dd>{pkg.transport}</dd></>)}
                          {pkg.accommodation && (<><dt className="font-semibold">Hotel</dt><dd>{pkg.accommodation}</dd></>)}
                        </dl>

                        <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-black">
                          Kunjungi situs <span aria-hidden>→</span>
                        </span>

                        {pkg.source && (
                          <p className="mt-2 text-[10px] uppercase tracking-wide text-black/60">
                            {pkg.source}
                          </p>
                        )}
                      </a>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex h-full flex-col justify-center text-sm text-black/60">
                  <p className="font-semibold">
                    {utamaInfo ? `Belum ada data travel yang dipetakan untuk ${utamaInfo.displayName}.` : "Jalankan rekomendasi terlebih dahulu untuk melihat paket travel terkait."}
                  </p>
                  <p className="mt-2 text-xs">Anda dapat menambahkan data travel baru di sumber data atau memilih biro perjalanan favorit secara manual.</p>
                </div>
              )}
            </div>
          </div>

          {/* LOGIKA */}
          <div id="logika" className="rounded-2xl border border-black/5 p-5 text-sm lg:col-span-2">
            <p className="font-semibold">Logika berbasis aturan ontologi</p>
            <p className="mt-2 text-xs text-slate-600">Sistem membaca aturan SWRL dari file ontologi RDF/XML kemudian mencocokkannya dengan input di atas.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[360px] text-left text-xs">
                <thead className="text-black">
                  <tr>
                    <th className="py-1 pr-4">Paket</th>
                    <th className="py-1 pr-4">Label Aturan</th>
                    <th className="py-1">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {paketList.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-3 text-center text-slate-500">Belum ada aturan yang terpenuhi.</td>
                    </tr>
                  )}
                  {paketList.map((item) => {
                    const info = enrich(item);
                    if (!info) return null;
                    return (
                      <tr key={item.paket}>
                        <td className="py-1 pr-4">{info.displayName}</td>
                        <td className="py-1 pr-4">{item.label ?? "-"}</td>
                        <td className="py-1">{item.comment ?? info.deskripsi}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */
function enrich(rec: ApiRecommendation | null): EnrichedRecommendation | null {
  if (!rec) return null;
  const meta = paketMetadata[rec.paket] ?? { label: formatPaket(rec.paket), deskripsi: "Belum ada deskripsi khusus untuk paket ini." };
  return { ...rec, displayName: meta.label, deskripsi: meta.deskripsi, href: meta.href };
}
function formatPaket(value: string) { return value.replace(/([a-z])([A-Z])/g, "$1 $2"); }
function isPaketKey(value: string): value is PaketKey {
  return Object.prototype.hasOwnProperty.call(travelPackagesByType, value);
}
