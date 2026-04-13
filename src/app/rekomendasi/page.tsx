"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import FlowDiagram from "@/components/FlowDiagram";
import type { PaketKey } from "@/data/travelPackages";
import { travelPackagesByType } from "@/data/travelPackages";
import { trackEvent } from "@/lib/analytics";
import RecommendationFormSection from "./components/RecommendationFormSection";
import PackageRecommendationModal from "./components/PackageRecommendationModal";
import RecommendationResultSection from "./components/RecommendationResultSection";
import { FIELD_ORDER, validateClientForm } from "./validation";
import type { ApiRecommendation, ApiResponse, EnrichedRecommendation, FieldErrors, FormState, MainTravel } from "./types";

const paketMetadata: Record<string, { label: string; deskripsi: string; href?: string }> = {
  UmrahHemat: {
    label: "Umrah Hemat",
    deskripsi: "Paket ekonomis dengan prioritas budget terjangkau dan kebutuhan dasar ibadah.",
    href: "/paket/reguler",
  },
  UmrahReguler: {
    label: "Umrah Reguler",
    deskripsi: "Pilihan dasar dengan fokus ibadah 9-12 hari dan fasilitas hotel bintang 3-4.",
    href: "/paket/reguler",
  },
  UmrahVIPGold: {
    label: "Umrah VIP Gold",
    deskripsi: "Kenyamanan lebih tinggi dengan hotel lebih dekat dan dukungan penerbangan lebih nyaman.",
    href: "/paket/plus",
  },
  UmrahPrivate: {
    label: "Umrah Private",
    deskripsi: "Paket privat untuk keluarga atau kebutuhan layanan khusus dengan pendampingan eksklusif.",
    href: "/paket/plus",
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
  UmrahPlusMesir: {
    label: "Umrah Plus Mesir",
    deskripsi: "Paket umrah dengan destinasi tambahan Mesir untuk pengalaman religi dan sejarah Islam.",
    href: "/paket/plus",
  },
  UmrahTidakDirekomendasikan: {
    label: "Belum Ada Rekomendasi Umrah",
    deskripsi: "Input saat ini belum memenuhi syarat minimal paket Umrah. Silakan sesuaikan preferensi.",
  },
  TidakMendapatRekomendasiUmrah: {
    label: "Belum Ada Rekomendasi Umrah",
    deskripsi: "Input saat ini belum memenuhi syarat minimal paket Umrah. Silakan sesuaikan preferensi.",
  },
};

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
  const [rateLimitRetrySec, setRateLimitRetrySec] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const namaRef = useRef<HTMLInputElement>(null);
  const budgetRef = useRef<HTMLInputElement>(null);
  const usiaRef = useRef<HTMLInputElement>(null);
  const pendampinganRef = useRef<HTMLInputElement>(null);
  const hotelRef = useRef<HTMLInputElement>(null);
  const transportRef = useRef<HTMLInputElement>(null);
  const destinasiRef = useRef<HTMLInputElement>(null);

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
  const isNoRecommendation =
    result?.paketUtama?.paket === "TidakMendapatRekomendasiUmrah" ||
    result?.paketUtama?.paket === "UmrahTidakDirekomendasikan";

  const utamaTravel = useMemo(() => {
    const utama = result?.paketUtama;
    if (!utama) return null;
    const key = utama.paket;
    if (!isPaketKey(key)) return null;
    const packages = travelPackagesByType[key]?.slice(0, 4) ?? [];
    if (packages.length === 0) return null;
    const meta = paketMetadata[key] ?? { label: formatPaket(key), deskripsi: "" };
    return { paket: key, label: meta.label, packages } as MainTravel;
  }, [result?.paketUtama]);

  const daftarPaketHref = utamaTravel ? `/paket?focus=${utamaTravel.paket}` : (utamaInfo?.href ?? "/paket");

  const preferenceSummary = useMemo(
    () => [
      { label: "Budget", value: formatRupiah(form.budget) },
      { label: "Usia", value: `${form.usia} tahun` },
      { label: "Pendampingan", value: form.butuhPendampingan === "ya" ? "Butuh" : "Tidak butuh" },
      { label: "Hotel", value: form.preferensiHotel },
      { label: "Transportasi", value: form.tipeTransportasi },
      { label: "Destinasi", value: form.destinasiTambahan === "none" ? "Tanpa tambahan" : form.destinasiTambahan },
    ],
    [form],
  );

  const formProgress = useMemo(() => {
    const checks = [
      form.budget > 0,
      form.usia > 0,
      form.butuhPendampingan === "ya" || form.butuhPendampingan === "tidak",
      Boolean(form.preferensiHotel),
      Boolean(form.tipeTransportasi),
      Boolean(form.destinasiTambahan),
    ];
    const filled = checks.filter(Boolean).length;
    const total = checks.length;
    const percent = Math.round((filled / total) * 100);
    return { filled, total, percent };
  }, [form]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rateLimitRetrySec > 0) {
      setError(`Terlalu banyak permintaan. Coba lagi dalam ${rateLimitRetrySec} detik.`);
      return;
    }

    const localErrors = validateClientForm(form);
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      setError("Periksa kembali field yang ditandai merah.");
      focusFirstFieldError(localErrors);
      return;
    }

    setLoading(true);
    setError(null);
    setFieldErrors({});
    trackEvent("rekomendasi_submit", {
      hasName: Boolean(form.nama),
      budget: form.budget,
      usia: form.usia,
      pendampingan: form.butuhPendampingan,
      hotel: form.preferensiHotel,
      transport: form.tipeTransportasi,
      destinasi: form.destinasiTambahan,
    });
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
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { message?: string; errors?: string[]; fieldErrors?: FieldErrors }
          | null;
        const nextFieldErrors = body?.fieldErrors && typeof body.fieldErrors === "object" ? body.fieldErrors : {};
        setFieldErrors(nextFieldErrors);
        const firstMessage = Array.isArray(body?.errors) && body?.errors.length > 0 ? body.errors[0] : null;
        const fallbackMessage = body?.message ?? "Gagal mengambil rekomendasi dari server";
        const retryAfterSec = parseRetryAfterSeconds(res.headers.get("Retry-After"));
        if (res.status === 429 && retryAfterSec > 0) {
          setRateLimitRetrySec(retryAfterSec);
        }
        const finalMessage = res.status === 429 && retryAfterSec > 0
          ? `Terlalu banyak permintaan. Coba lagi dalam ${retryAfterSec} detik.`
          : (firstMessage ?? fallbackMessage);
        setError(finalMessage);
        setResult(null);
        setShowPackageModal(false);
        focusFirstFieldError(nextFieldErrors);
        trackEvent("rekomendasi_error", {
          status: res.status,
          message: finalMessage,
          validation: res.status === 400,
        });
        return;
      }
      const data = await res.json();
      setRateLimitRetrySec(0);
      setResult({
        paketUtama: data?.paketUtama ?? null,
        paketAlternatif: Array.isArray(data?.paketAlternatif) ? data.paketAlternatif : [],
      });
      setShowPackageModal(isPaketKey(data?.paketUtama?.paket ?? ""));
      trackEvent("rekomendasi_success", {
        paketUtama: data?.paketUtama?.paket ?? null,
        alternatifCount: Array.isArray(data?.paketAlternatif) ? data.paketAlternatif.length : 0,
      });
      if (data?.input?.nama) setForm((p) => ({ ...p, nama: data.input.nama }));
      setGeneratedAt(new Date().toLocaleString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan tak terduga");
      setFieldErrors({});
      setResult(null);
      setShowPackageModal(false);
      trackEvent("rekomendasi_error", {
        message: err instanceof Error ? err.message : "unknown_error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!result?.paketUtama?.paket) return;
    trackEvent("rekomendasi_result_shown", {
      paketUtama: result.paketUtama.paket,
      alternatifCount: result.paketAlternatif.length,
    });
  }, [result?.paketUtama?.paket, result?.paketAlternatif.length]);

  useEffect(() => {
    if (rateLimitRetrySec <= 0) return;
    const timer = window.setInterval(() => {
      setRateLimitRetrySec((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [rateLimitRetrySec]);

  useEffect(() => {
    if (!showPackageModal) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowPackageModal(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showPackageModal]);

  function updateForm<K extends keyof FormState>(k: K, v: FormState[K]) {
    if (fieldErrors[k]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[k];
        return next;
      });
    }
    setForm((p) => ({ ...p, [k]: v }));
  }

  function focusFirstFieldError(errors: FieldErrors) {
    const firstKey = FIELD_ORDER.find((key) => Boolean(errors[key]));
    if (!firstKey) return;
    switch (firstKey) {
      case "nama":
        namaRef.current?.focus();
        break;
      case "budget":
        budgetRef.current?.focus();
        break;
      case "usia":
        usiaRef.current?.focus();
        break;
      case "butuhPendampingan":
        pendampinganRef.current?.focus();
        break;
      case "preferensiHotel":
        hotelRef.current?.focus();
        break;
      case "tipeTransportasi":
        transportRef.current?.focus();
        break;
      case "destinasiTambahan":
        destinasiRef.current?.focus();
        break;
      default:
        break;
    }
  }

  return (
    <div className="container-section">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-700 via-primary-600 to-primary-400 p-7 text-white shadow-lg shadow-primary-600/20 sm:p-8">
          <div className="pointer-events-none absolute -top-10 -left-8 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -right-8 -bottom-10 h-40 w-40 rounded-full bg-cyan-200/20 blur-2xl" />
          <div className="max-w-4xl">
            <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/30">
              Sistem Pakar Umrah
            </span>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Rekomendasi Paket Umrah Personal</h1>
            <p className="mt-2 text-sm text-white/90 sm:text-base">
              Isi preferensi jamaah, lalu sistem membaca aturan ontologi untuk memilih paket paling sesuai dengan
              budget, kebutuhan pendampingan, dan destinasi tambahan.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["1. Isi preferensi", "2. Hitung otomatis", "3. Lihat rekomendasi"].map((step) => (
                <span key={step} className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/30">
                  {step}
                </span>
              ))}
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-8">
          <RecommendationFormSection
            form={form}
            loading={loading}
            cooldownSeconds={rateLimitRetrySec}
            fieldErrors={fieldErrors}
            formProgress={formProgress}
            preferenceSummary={preferenceSummary}
            refs={{ namaRef, budgetRef, usiaRef, pendampinganRef, hotelRef, transportRef, destinasiRef }}
            onUpdateForm={(key, value) => updateForm(key, value)}
          />

          <RecommendationResultSection
            nama={form.nama}
            error={error}
            loading={loading}
            result={result}
            utamaInfo={utamaInfo}
            alternatifInfo={alternatifInfo}
            isNoRecommendation={isNoRecommendation}
            generatedAt={generatedAt}
            utamaTravel={utamaTravel}
            form={form}
            daftarPaketHref={daftarPaketHref}
            onOpenPackageModal={() => setShowPackageModal(true)}
          />

          <PackageRecommendationModal
            open={showPackageModal}
            utamaTravel={utamaTravel}
            form={form}
            daftarPaketHref={daftarPaketHref}
            onClose={() => setShowPackageModal(false)}
          />

          <section id="logika" className="rounded-2xl border border-black/5 bg-white p-5 text-sm shadow-sm sm:p-6">
            <p className="font-semibold text-black">Logika Berbasis Aturan Ontologi</p>
            <p className="mt-2 text-xs text-slate-600">
              Sistem membaca aturan SWRL dari file ontologi RDF/XML, lalu mencocokkan dengan preferensi pengguna.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[380px] text-left text-xs">
                <thead className="bg-slate-50 text-black">
                  <tr>
                    <th className="py-2 pr-4 pl-2">Paket</th>
                    <th className="py-2 pr-4">Label Aturan</th>
                    <th className="py-2 pr-2">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {paketList.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-3 text-center text-slate-500">
                        Belum ada aturan yang terpenuhi.
                      </td>
                    </tr>
                  )}
                  {paketList.map((item) => {
                    const info = enrich(item);
                    if (!info) return null;
                    return (
                      <tr key={item.paket} className="border-t border-black/5 even:bg-slate-50/50">
                        <td className="py-2 pr-4 pl-2">{info.displayName}</td>
                        <td className="py-2 pr-4">{item.label ?? "-"}</td>
                        <td className="py-2 pr-2">{item.comment ?? info.deskripsi}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-bold">Alur Perhitungan</h3>
            <p className="mt-1 text-xs text-slate-600">Cara sistem memetakan input ke rekomendasi paket.</p>
            <div className="mt-4">
              <FlowDiagram />
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}

function enrich(rec: ApiRecommendation | null): EnrichedRecommendation | null {
  if (!rec) return null;
  const meta = paketMetadata[rec.paket] ?? {
    label: formatPaket(rec.paket),
    deskripsi: "Belum ada deskripsi khusus untuk paket ini.",
  };
  return { ...rec, displayName: meta.label, deskripsi: meta.deskripsi, href: meta.href };
}

function formatPaket(value: string) {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function isPaketKey(value: string): value is PaketKey {
  return Object.prototype.hasOwnProperty.call(travelPackagesByType, value);
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function parseRetryAfterSeconds(value: string | null): number {
  if (!value) return 0;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return parsed;
}


