import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { IconDiamond, IconPlane, IconWallet } from "@/components/Icons";
import Reveal from "@/components/Reveal";
import { type PaketKey, travelPackagesByType } from "@/data/travelPackages";
import PackageCatalogGrid from "./components/PackageCatalogGrid";

export const metadata = {
  title: "Pilihan Paket Umrah",
  description: "Katalog pilihan paket Umrah Hemat, Reguler, VIP Gold, Plus Turki, Plus Dubai, dan Plus Mesir.",
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
  UmrahHemat: {
    title: "Umrah Hemat",
    short: "Hemat",
    desc: "Fokus keterjangkauan biaya untuk jamaah dengan prioritas harga ekonomis.",
    href: "/paket/reguler",
    badge: "Umrah Hemat",
    icon: IconWallet,
    tone: "bg-sky-50 text-sky-700 ring-sky-100",
  },
  UmrahReguler: {
    title: "Umrah Reguler",
    short: "Reguler",
    desc: "Paket umum dengan komposisi biaya, fasilitas, dan jadwal yang seimbang.",
    href: "/paket/reguler",
    badge: "Umrah Reguler",
    icon: IconWallet,
    tone: "bg-primary-50 text-primary-700 ring-primary-100",
  },
  UmrahPlusTurki: {
    title: "Umrah Plus Turki",
    short: "Plus Turki",
    desc: "Kombinasi ibadah dan wisata sejarah Islam di Istanbul.",
    href: "/paket/plus",
    badge: "Umrah Plus Turki",
    icon: IconDiamond,
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  UmrahPlusDubai: {
    title: "Umrah Plus Dubai",
    short: "Plus Dubai",
    desc: "Opsi premium dengan city tour modern dan fasilitas upgrade.",
    href: "/paket/furoda",
    badge: "Umrah Plus Dubai",
    icon: IconPlane,
    tone: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  UmrahVIPGold: {
    title: "Umrah VIP Gold",
    short: "VIP Gold",
    desc: "Paket premium dengan akomodasi unggulan dan kenyamanan layanan lebih tinggi.",
    href: "/paket/furoda",
    badge: "Umrah VIP Gold",
    icon: IconDiamond,
    tone: "bg-rose-50 text-rose-700 ring-rose-100",
  },
  UmrahPlusMesir: {
    title: "Umrah Plus Mesir",
    short: "Plus Mesir",
    desc: "Kombinasi ibadah Umrah dengan wisata religi dan sejarah di Mesir.",
    href: "/paket/plus",
    badge: "Umrah Plus Mesir",
    icon: IconPlane,
    tone: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  },
};

const parsePrice = (value: string) => Number(value.replace(/[^\d]/g, ""));
const orderedPackageKeys: PaketKey[] = [
  "UmrahHemat",
  "UmrahReguler",
  "UmrahVIPGold",
  "UmrahPlusTurki",
  "UmrahPlusDubai",
  "UmrahPlusMesir",
];
const unknownMarker = /belum dicantumkan|^-$|#n\/a/i;

const formatPrice = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

const extractDurationDays = (value?: string) => {
  if (!value) return null;
  const nums = value.match(/\d+/g);
  if (!nums || nums.length === 0) return null;
  const mapped = nums.map((x) => Number(x));
  return { min: Math.min(...mapped), max: Math.max(...mapped) };
};

const summarizePriceRange = (key: PaketKey) => {
  const prices = travelPackagesByType[key].map((item) => parsePrice(item.price)).filter(Boolean);
  if (prices.length === 0) return "-";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return formatPrice(min);
  return `${formatPrice(min)} - ${formatPrice(max)}`;
};

const summarizeDurationRange = (key: PaketKey) => {
  const durations = travelPackagesByType[key]
    .map((item) => extractDurationDays(item.duration))
    .filter((x): x is { min: number; max: number } => Boolean(x));
  if (durations.length === 0) return "Sesuai program";
  const min = Math.min(...durations.map((x) => x.min));
  const max = Math.max(...durations.map((x) => x.max));
  return `${min}-${max} hari`;
};

const summarizeTransport = (key: PaketKey) => {
  const list = travelPackagesByType[key]
    .map((item) => item.transport?.trim())
    .filter((item): item is string => Boolean(item))
    .filter((item) => !unknownMarker.test(item));
  if (list.length === 0) return "Tidak dicantumkan";
  const unique = Array.from(new Set(list));
  return unique.length <= 2 ? unique.join(" / ") : `${unique.slice(0, 2).join(" / ")} + lainnya`;
};

const summarizeHotelData = (key: PaketKey) => {
  const list = travelPackagesByType[key]
    .map((item) => item.accommodation?.trim())
    .filter((item): item is string => Boolean(item));
  if (list.length === 0) return "Tidak dicantumkan";
  const knownCount = list.filter((item) => !unknownMarker.test(item)).length;
  if (knownCount === 0) return "Mayoritas belum dicantumkan";
  if (knownCount === list.length) return "Tersedia di semua paket";
  return `${knownCount}/${list.length} paket mencantumkan hotel`;
};

const packageTypes = orderedPackageKeys.map((key) => {
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

const packageCatalog = orderedPackageKeys.flatMap((key) =>
  travelPackagesByType[key].map((item) => ({
    key,
    name: item.name,
    provider: item.provider,
    type: packageMeta[key].short,
    airline: item.transport || "Belum dicantumkan di sumber",
    hotel: item.accommodation || "Belum dicantumkan di sumber",
    duration: item.duration || "-",
    price: item.price,
    source: item.source || "-",
    url: item.url,
    notes: item.notes || "",
    additionalInfo: item.additionalInfo || "",
  })),
);

const comparisonRows: string[][] = [
  ["Kisaran Harga", ...orderedPackageKeys.map(summarizePriceRange)],
  ["Durasi", ...orderedPackageKeys.map(summarizeDurationRange)],
  ["Ketersediaan Data Hotel", ...orderedPackageKeys.map(summarizeHotelData)],
  ["Maskapai Dominan", ...orderedPackageKeys.map(summarizeTransport)],
  ["Fokus Program", ...orderedPackageKeys.map((key) => packageMeta[key].desc)],
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
  const visiblePackageTypes = focusKey ? packageTypes.filter((item) => item.key === focusKey) : packageTypes;
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
            Daftar paket di bawah terhubung ke data lokal dan ditampilkan sesuai detail sumber
            yang tersedia, <b>terakhir diupdate: 22 April 2026</b>. 
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/paket"
              className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                focusKey === null
                  ? "bg-primary-600 text-white ring-primary-600"
                  : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              Semua Jenis
            </Link>
            {packageTypes.map((item) => (
              <Link
                key={item.key}
                href={`/paket?focus=${item.key}`}
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                  focusKey === item.key 
                    ? "bg-primary-600 text-white ring-primary-600"
                    : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {item.title}
              </Link>
            ))}
          </div>
          {focusKey && (
            <div className="mt-4 inline-flex items-center rounded-xl border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-800">
              Menampilkan paket tipe: {packageMeta[focusKey].title}
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
          <PackageCatalogGrid items={visibleCatalog} />
        </section>

        <section className="mt-12 overflow-hidden rounded-2xl border border-black/5 bg-white">
          <div className="border-b border-black/5 px-5 py-4">
            <h2 className="text-2xl font-bold">Perbandingan Jenis Paket</h2>
            <p className="mt-1 text-sm text-black">Ringkasan cepat untuk bantu jamaah memilih jenis paket yang paling cocok.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Kriteria</th>
                  <th className="px-4 py-3 font-semibold">Hemat</th>
                  <th className="px-4 py-3 font-semibold">Reguler</th>
                  <th className="px-4 py-3 font-semibold">VIP Gold</th>
                  <th className="px-4 py-3 font-semibold">Plus Turki</th>
                  <th className="px-4 py-3 font-semibold">Plus Dubai</th>
                  <th className="px-4 py-3 font-semibold">Plus Mesir</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row[0]} className="border-t border-black/5">
                    <td className="px-4 py-3 font-medium">{row[0]}</td>
                    <td className="px-4 py-3">{row[1]}</td>
                    <td className="px-4 py-3">{row[2]}</td>
                    <td className="px-4 py-3">{row[3]}</td>
                    <td className="px-4 py-3">{row[4]}</td>
                    <td className="px-4 py-3">{row[5]}</td>
                    <td className="px-4 py-3">{row[6]}</td>
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
              [
                "Apa bedanya paket Hemat, Reguler, VIP Gold, dan paket Plus?",
                "Hemat fokus ke biaya lebih terjangkau, Reguler lebih seimbang, VIP Gold menonjolkan kenyamanan premium, sedangkan paket Plus menambahkan destinasi seperti Turki, Dubai, atau Mesir.",
              ],
              [
                "Apakah harga dan detail paket di sini selalu final?",
                "Belum tentu. Data katalog disusun dari sumber paket yang tersedia, jadi harga, hotel, maskapai, dan jadwal bisa berubah. Tetap konfirmasi langsung ke travel sebelum memesan.",
              ],
              [
                "Kenapa fasilitas antar paket terlihat berbeda-beda?",
                "Karena tiap jenis paket punya fokus yang berbeda. Ada yang menekan biaya, ada yang mengejar hotel lebih dekat, ada juga yang menambah city tour atau program perjalanan lebih panjang.",
              ],
              [
                "Kapan sebaiknya saya pakai halaman rekomendasi?",
                "Gunakan halaman rekomendasi kalau kamu masih bingung memilih dari banyak tipe paket. Sistem akan membantu menyaring opsi berdasarkan budget, preferensi hotel, penerbangan, usia, dan destinasi tambahan.",
              ],
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
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(travelPackagesByType, value);
}
