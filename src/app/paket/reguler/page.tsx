import Link from "next/link";
import { IconWallet } from "@/components/Icons";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = {
  title: "Paket Umrah Reguler",
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
              { label: "Umrah Reguler" },
            ]}
          />
          <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">
            Paket Umrah
          </span>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600/10 text-primary-700">
              <IconWallet className="h-5 w-5" />
            </span>
            <h1 className="text-3xl font-bold">Umrah Reguler</h1>
          </div>
          <p className="mt-2 text-black">
            Pilihan ekonomi dengan fokus ibadah selama 9-12 hari. Rute langsung Makkah-Madinah,
            fasilitas standar nyaman, dan cocok untuk keluarga yang ingin keberangkatan cepat.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/5 p-5">
            <p className="text-sm text-black">Perkiraan Biaya</p>
            <p className="text-xl font-semibold">Rp25-32 juta</p>
          </div>
          <div className="rounded-2xl border border-black/5 p-5">
            <p className="text-sm text-black">Perkiraan Waktu</p>
            <p className="text-xl font-semibold">Durasi 9-12 hari</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-black/5 p-6">
          <p className="font-semibold">Fitur Utama</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-black">
            <li>Fasilitas hotel setara bintang 3-4 dekat Masjidil Haram</li>
            <li>Pembimbing ibadah bersertifikat Kemenag</li>
            <li>Jadwal keberangkatan reguler setiap bulan</li>
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

