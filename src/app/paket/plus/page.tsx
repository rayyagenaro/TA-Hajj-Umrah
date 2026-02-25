import Link from "next/link";
import { IconDiamond } from "@/components/Icons";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = {
  title: "Paket Umrah Plus Turki",
};

export default function PlusPage() {
  return (
    <div className="container-section">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { href: "/", label: "Beranda" },
              { href: "/#paket", label: "Paket" },
              { label: "Umrah Plus Turki" },
            ]}
          />
          <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">
            Paket Umrah
          </span>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600/10 text-primary-700">
              <IconDiamond className="h-5 w-5" />
            </span>
            <h1 className="text-3xl font-bold">Umrah Plus Turki</h1>
          </div>
          <p className="mt-2 text-black">
            Rangkaian Umrah 10-12 hari dilanjutkan tur Istanbul dan Bursa. Menggabungkan ibadah khusyuk
            dengan wisata sejarah Islam di Turki.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/5 p-5">
            <p className="text-sm text-black">Perkiraan Biaya</p>
            <p className="text-xl font-semibold">Rp34-40 juta</p>
          </div>
          <div className="rounded-2xl border border-black/5 p-5">
            <p className="text-sm text-black">Perkiraan Waktu</p>
            <p className="text-xl font-semibold">Durasi 10-12 hari</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-black/5 p-6">
          <p className="font-semibold">Fitur Utama</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-black">
            <li>City tour Hagia Sophia, Blue Mosque, hingga Cappadocia opsional</li>
            <li>Maskapai full service dengan bagasi 30kg</li>
            <li>Hotel bintang 4-5 selama tur</li>
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

