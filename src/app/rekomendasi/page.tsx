"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PaketKey, TravelPackage } from "@/data/travelPackages";
import { travelPackagesByType } from "@/data/travelPackages";
import { trackEvent } from "@/lib/analytics";
import PackageRecommendationModal from "./components/PackageRecommendationModal";
import { rankPackagesByProfile } from "./profileMatching";
import RecommendationFormSection from "./components/RecommendationFormSection";
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
    durasiPreferensi: 12,
    preferJarakHotelMaks: 500,
    tipePenerbangan: "transit",
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
  const durasiRef = useRef<HTMLInputElement>(null);
  const penerbanganRef = useRef<HTMLInputElement>(null);
  const jarakRef = useRef<HTMLInputElement>(null);
  const destinasiRef = useRef<HTMLInputElement>(null);

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
    const allPackages = travelPackagesByType[key] ?? [];
    if (allPackages.length === 0) return null;
    const packagesByRule = getRulePackagesByPreference(allPackages, form, 6);
    const meta = paketMetadata[key] ?? { label: formatPaket(key), deskripsi: "" };
    return { paket: key, label: meta.label, packagesByRule, packagesForMatching: allPackages } as MainTravel;
  }, [form, result?.paketUtama]);
  const daftarPaketHref = utamaTravel ? `/paket?focus=${utamaTravel.paket}` : (utamaInfo?.href ?? "/paket");

  const preferenceSummary = useMemo(
    () => [
      { label: "Nama", value: form.nama || "-" },
      { label: "Budget", value: formatRupiah(form.budget) },
      { label: "Usia", value: `${form.usia} tahun` },
      { label: "Durasi", value: `${form.durasiPreferensi} hari` },
      { label: "Penerbangan", value: form.tipePenerbangan === "direct" ? "Direct" : "Transit" },
      { label: "Jarak Hotel", value: `${form.preferJarakHotelMaks} m` },
      { label: "Destinasi", value: form.destinasiTambahan === "none" ? "Tanpa tambahan" : form.destinasiTambahan },
    ],
    [form],
  );

  const formProgress = useMemo(() => {
    const checks = [
      form.nama.trim().length > 0,
      form.budget > 0,
      form.usia > 0,
      form.durasiPreferensi > 0,
      form.tipePenerbangan === "direct" || form.tipePenerbangan === "transit",
      form.preferJarakHotelMaks > 0,
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
    setShowPackageModal(false);
    const inferredHotelPreference = mapDistanceToHotelPreference(form.preferJarakHotelMaks);
    const inferredTransport = mapFlightTypeToTransport(form.tipePenerbangan);
    const preferDirectFlight = form.tipePenerbangan === "direct";
    trackEvent("rekomendasi_submit", {
      hasName: Boolean(form.nama),
      budget: form.budget,
      usia: form.usia,
      durasi: form.durasiPreferensi,
      tipePenerbangan: form.tipePenerbangan,
      jarakHotel: form.preferJarakHotelMaks,
      hotel: inferredHotelPreference,
      transport: inferredTransport,
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
          durasiPreferensi: form.durasiPreferensi,
          butuhPendampingan: false,
          preferensiHotel: inferredHotelPreference,
          tipeTransportasi: inferredTransport,
          preferDirectFlight,
          preferJarakHotelMaks: form.preferJarakHotelMaks,
          preferDestinasi: form.destinasiTambahan === "none" ? "None" : form.destinasiTambahan,
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
      setShowPackageModal(Boolean(data?.paketUtama));
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
    setForm((prev) => {
      const next = { ...prev, [k]: v };

      if (k === "preferJarakHotelMaks") {
        next.preferensiHotel = mapDistanceToHotelPreference(v as number);
      }
      if (k === "tipePenerbangan") {
        next.tipeTransportasi = mapFlightTypeToTransport(v as FormState["tipePenerbangan"]);
      }

      return next;
    });
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
      case "durasiPreferensi":
        durasiRef.current?.focus();
        break;
      case "tipePenerbangan":
        penerbanganRef.current?.focus();
        break;
      case "preferJarakHotelMaks":
        jarakRef.current?.focus();
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
            refs={{ namaRef, budgetRef, usiaRef, durasiRef, penerbanganRef, jarakRef, destinasiRef }}
            onUpdateForm={(key, value) => updateForm(key, value)}
          />

          {error && !loading && (
            <section className="animate-soft-slide-up rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
              {error}
            </section>
          )}

          {!error && !loading && result?.paketUtama && (
            <section className="animate-soft-slide-up rounded-2xl border border-primary-100 bg-white p-4 shadow-sm shadow-primary-100/60">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-black">Hasil siap dilihat di popup</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {utamaInfo ? `${utamaInfo.displayName} sudah dihitung.` : "Hasil rekomendasi sudah siap."} Halaman ini tetap
                    difokuskan ke penjelasan sistem dan logika rekomendasi.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPackageModal(true)}
                    className="inline-flex items-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-200/70 transition hover:-translate-y-0.5 hover:bg-primary-700"
                  >
                    Buka Popup Hasil
                  </button>
                </div>
              </div>
            </section>
          )}

          <PackageRecommendationModal
            open={showPackageModal}
            nama={form.nama}
            result={result}
            utamaInfo={utamaInfo}
            alternatifInfo={alternatifInfo}
            isNoRecommendation={isNoRecommendation}
            generatedAt={generatedAt}
            utamaTravel={utamaTravel}
            form={form}
            daftarPaketHref={daftarPaketHref}
            onClose={() => setShowPackageModal(false)}
          />
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

function mapDistanceToHotelPreference(distance: number): FormState["preferensiHotel"] {
  if (distance <= 250) return "Premium";
  if (distance <= 400) return "Mewah";
  return "Standard";
}

function mapFlightTypeToTransport(flightType: FormState["tipePenerbangan"]): FormState["tipeTransportasi"] {
  return flightType === "direct" ? "Bisnis" : "Ekonomi";
}

function getRulePackagesByPreference(packages: TravelPackage[], form: FormState, limit: number): TravelPackage[] {
  const affordable = packages.filter((pkg) => {
    const parsed = Number.parseInt(pkg.price.replace(/[^\d]/g, ""), 10);
    return Number.isFinite(parsed) && parsed <= form.budget;
  });

  if (affordable.length === 0) return [];

  return rankPackagesByProfile(affordable, form, limit).map((pkg) => pkg);
}

function parseRetryAfterSeconds(value: string | null): number {
  if (!value) return 0;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return parsed;
}


