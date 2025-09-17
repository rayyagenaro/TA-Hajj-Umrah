import Link from "next/link";
import { IconWallet } from "@/components/Icons";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = {
  title: "Paket Haji Reguler",
};

export default function RegulerPage() {
  return (
    <div className="container-section">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { href: "/", label: "Beranda" },
              { href: "/#paket", label: "Paket" },
              { label: "Haji Reguler" },
            ]}
          />
          <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">
            Paket Haji
          </span>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600/10 text-primary-700">
              <IconWallet className="h-5 w-5" />
            </span>
            <h1 className="text-3xl font-bold">Haji Reguler</h1>
          </div>
          <p className="mt-2 text-black dark:text-black">
            Opsi paling ekonomis dengan fasilitas standar, mengikuti kuota pemerintah. Cocok untuk
            jamaah yang siap menunggu antrean lebih panjang.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/5 p-5 dark:border-white/10">
            <p className="text-sm text-black dark:text-black">Perkiraan Biaya</p>
            <p className="text-xl font-semibold">Rp35–60 jt</p>
          </div>
          <div className="rounded-2xl border border-black/5 p-5 dark:border-white/10">
            <p className="text-sm text-black dark:text-black">Perkiraan Waktu</p>
            <p className="text-xl font-semibold">Antrean 10–20 tahun</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-black/5 p-6 dark:border-white/10">
          <p className="font-semibold">Fitur Utama</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-black dark:text-black">
            <li>Biaya terjangkau</li>
            <li>Kuota pemerintah</li>
            <li>Fasilitas standar & pembinaan</li>
          </ul>
        </div>

        <div className="mt-8 flex gap-3">
          <Link href="/rekomendasi" className="rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm">
            Bandingkan Paket
          </Link>
          <Link href="/" className="rounded-xl px-5 py-3 text-sm font-semibold text-primary-700 ring-1 ring-primary-200">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
