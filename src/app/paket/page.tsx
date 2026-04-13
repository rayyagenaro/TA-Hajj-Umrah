import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { IconDiamond, IconPlane, IconWallet } from "@/components/Icons";
import Reveal from "@/components/Reveal";
import { type PaketKey, travelPackagesByType } from "@/data/travelPackages";

export const metadata = {
  title: "Pilihan Paket Umrah",
  description: "Katalog dummy pilihan paket Umrah Reguler, Plus Turki, Plus Dubai, dan variasi lainnya.",
};

const packageMeta: Record<
  PaketKey,
  {
    title: string;
    desc: string;
    href: string;
    badge: string;
    icon: typeof IconWallet;
    tone: string;
    short: string;
  }
> = {
  UmrahReguler: {
    title: "Umrah Reguler",
    short: "Reguler",
    desc: "Paling ekonomis, fokus ibadah, jadwal rutin tiap bulan.",
    href: "/paket/reguler",
    badge: "Favorit Jamaah",
    icon: IconWallet,
    tone: "bg-primary-50 text-primary-700 ring-primary-100",
  },
  UmrahPlusTurki: {
    title: "Umrah Plus Turki",
    short: "Plus Turki",
    desc: "Kombinasi ibadah dan wisata sejarah Islam di Istanbul.",
    href: "/paket/plus",
    badge: "Paling Seimbang",
    icon: IconDiamond,
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  UmrahPlusDubai: {
    title: "Umrah Plus Dubai",
    short: "Plus Dubai",
    desc: "Opsi premium dengan city tour modern dan fasilitas upgrade.",
    href: "/paket/furoda",
    badge: "Premium",
    icon: IconPlane,
    tone: "bg-amber-50 text-amber-700 ring-amber-100",
  },
};

const parsePrice = (value: string) => Number(value.replace(/[^\d]/g, ""));

const formatPrice = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

const extractDurationDays = (value?: string) => {
  if (!value) return null;
  const nums = value.match(/\d+/g);
  if (!nums || nums.length === 0) return null;
  const mapped = nums.map((x) => Number(x));
  return { min: Math.min(...mapped), max: Math.max(...mapped) };
};

const packageTypes = (Object.keys(travelPackagesByType) as PaketKey[]).map((key) => {
  const list = travelPackagesByType[key];
  const prices = list.map((item) => parsePrice(item.price)).filter(Boolean);
  const durations = list.map((item) => extractDurationDays(item.duration)).filter((x): x is { min: number; max: number } => Boolean(x));
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const durationMin = durations.length > 0 ? Math.min(...durations.map((x) => x.min)) : null;
  const durationMax = durations.length > 0 ? Math.max(...durations.map((x) => x.max)) : null;

  return {
    key,
    ...packageMeta[key],
    price: minPrice ? `Mulai ${formatPrice(minPrice)}` : "-",
    duration: durationMin && durationMax ? `${durationMin}-${durationMax} hari` : "Sesuai program",
    total: list.length,
  };
});

const packageCatalog = (Object.keys(travelPackagesByType) as PaketKey[]).flatMap((key) =>
  travelPackagesByType[key].map((item) => ({
    key,
    name: item.name,
    provider: item.provider,
    type: packageMeta[key].short,
    airline: item.transport || "-",
    hotel: item.accommodation || "-",
    duration: item.duration || "-",
    price: item.price,
    source: item.source || "-",
    url: item.url,
  })),
);

const comparisonRows = [
  ["Kisaran Harga", "Rp23-38 jt", "Rp36-37 jt", "Rp35-66 jt"],
  ["Durasi", "9-12 hari", "12 hari", "9-14 hari"],
  ["Kelas Hotel", "Bintang 3-4", "Bintang 4", "Bintang 4-5"],
  ["Maskapai", "Mix standard/full service", "Turkish Airlines", "Emirates & premium class"],
  ["Program Tambahan", "Fokus ibadah", "Tur sejarah Turki", "City tour modern Dubai"],
];

const addons = [
  "Asuransi perjalanan dan kesehatan",
  "Kereta cepat Haramain Makkah-Madinah",
  "Upgrade kamar triple ke double",
  "Handling dokumen paspor & vaksin",
  "Paket perlengkapan eksklusif jamaah",
  "Pendamping ustaz/ustazah private",
];

type PaketPageProps = {
  searchParams?: Promise<{ focus?: string }>;
};

export default async function PaketPage({ searchParams }: PaketPageProps) {
  const resolvedSearchParams = (await searchParams) ?? undefined;
  const focusCandidate = resolvedSearchParams?.focus;
  const focusKey = isPaketKey(focusCandidate) ? focusCandidate : null;
  const orderedTypes = focusKey
    ? [focusKey, ...packageTypes.filter((item) => item.key !== focusKey).map((item) => item.key)]
    : packageTypes.map((item) => item.key);
  const visiblePackageTypes = orderedTypes.map((key) => packageTypes.find((item) => item.key === key)!);
  const visibleCatalog = focusKey ? packageCatalog.filter((item) => item.key === focusKey) : packageCatalog;

  return (
    <div className="container-section">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Breadcrumbs items={[{ href: "/", label: "Beranda" }, { label: "Paket" }]} />
          <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">
            Katalog Paket Umrah
          </span>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Pilihan Paket Umrah Lengkap</h1>
          <p className="mt-2 max-w-3xl text-black">
            Daftar paket di bawah terhubung ke data lokal pada `travelPackages.ts`, jadi isi katalog akan ikut berubah
            saat data diperbarui.
          </p>
          {focusKey && (
            <div className="mt-4 inline-flex items-center rounded-xl border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-800">
              Menampilkan paket paling cocok: {packageMeta[focusKey].title}
            </div>
          )}
        </div>

        <Reveal>
          <section className="grid gap-5 md:grid-cols-3">
            {visiblePackageTypes.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.key}
                  className="flex h-full flex-col rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600/10 text-primary-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${item.tone}`}>{item.badge}</span>
                  </div>
                  <h2 className="mt-4 text-xl font-bold">{item.title}</h2>
                  <p className="mt-2 text-sm text-black">{item.desc}</p>
                  <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    <p>{item.price}</p>
                    <p>{item.duration}</p>
                    <p>{item.total} paket tersedia</p>
                  </div>
                  <Link
                    href={item.href}
                    className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                  >
                    Lihat Detail
                  </Link>
                </article>
              );
            })}
          </section>
        </Reveal>

        <section className="mt-12">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">Daftar Paket dari Data</h2>
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">
              {visibleCatalog.length} paket
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleCatalog.map((item) => (
              <Reveal key={`${item.provider}-${item.name}`}>
                <article className="flex h-full flex-col rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
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
                  <p className="mt-5 text-lg font-bold text-primary-700">{item.price}</p>
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
                    >
                      Kunjungi Provider
                    </Link>
                    <Link
                      href="/rekomendasi"
                      className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-primary-700 ring-1 ring-primary-200 transition hover:bg-primary-50"
                    >
                      Bandingkan
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mt-12 overflow-hidden rounded-2xl border border-black/5 bg-white">
          <div className="border-b border-black/5 px-5 py-4">
            <h2 className="text-2xl font-bold">Perbandingan Jenis Paket</h2>
            <p className="mt-1 text-sm text-black">Ringkasan cepat untuk bantu jamaah memilih jenis paket yang paling cocok.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Kriteria</th>
                  <th className="px-4 py-3 font-semibold">Reguler</th>
                  <th className="px-4 py-3 font-semibold">Plus Turki</th>
                  <th className="px-4 py-3 font-semibold">Plus Dubai</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row[0]} className="border-t border-black/5">
                    <td className="px-4 py-3 font-medium">{row[0]}</td>
                    <td className="px-4 py-3">{row[1]}</td>
                    <td className="px-4 py-3">{row[2]}</td>
                    <td className="px-4 py-3">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-black/5 bg-white p-5">
            <h2 className="text-xl font-bold">Add-on yang Bisa Ditambahkan</h2>
            <ul className="mt-3 space-y-2 text-sm text-black">
              {addons.map((addon) => (
                <li key={addon} className="flex items-start gap-2">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-primary-500" aria-hidden />
                  <span>{addon}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-400 p-5 text-white">
            <h2 className="text-xl font-bold">Tidak yakin pilih paket yang mana?</h2>
            <p className="mt-2 text-sm text-white/90">
              Jalankan sistem rekomendasi untuk dapat shortlist paket berdasarkan budget, kebutuhan pendampingan, dan
              preferensi destinasi.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/rekomendasi"
                className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
              >
                Mulai Rekomendasi
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold">FAQ Paket</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              ["Apakah ini data asli biro travel?", "Belum. Seluruh item di halaman ini masih dummy untuk kebutuhan demo UI/UX."],
              ["Bisa tambah jenis paket lain?", "Bisa. Misalnya paket Ramadhan, paket lansia, atau paket furoda khusus."],
              ["Bagaimana menentukan paket terbaik?", "Prioritaskan budget, kenyamanan hotel, jadwal cuti, dan kebutuhan pendampingan."],
              ["Apa langkah setelah memilih paket?", "Gunakan halaman rekomendasi, lalu lanjut konsultasi dan verifikasi izin PPIU travel."],
            ].map(([q, a]) => (
              <details key={q} className="rounded-2xl border border-black/5 bg-white p-4">
                <summary className="cursor-pointer font-semibold">{q}</summary>
                <p className="mt-2 text-sm text-black">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function isPaketKey(value: unknown): value is PaketKey {
  return value === "UmrahReguler" || value === "UmrahPlusTurki" || value === "UmrahPlusDubai";
}
