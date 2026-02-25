import Link from "next/link";
import { IconPlane } from "@/components/Icons";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = {
  title: "Paket Umrah Plus Dubai",
};

export default function FurodaPage() {
  return (
    <div className="container-section">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { href: "/", label: "Beranda" },
              { href: "/#paket", label: "Paket" },
              { label: "Umrah Plus Dubai" },
            ]}
          />
          <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">
            Paket Umrah
          </span>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600/10 text-primary-700">
              <IconPlane className="h-5 w-5" />
            </span>
            <h1 className="text-3xl font-bold">Umrah Plus Dubai</h1>
          </div>
          <p className="mt-2 text-black">
            Paket Umrah premium dengan tambahan city tour Dubai & Abu Dhabi, pengalaman desert safari,
            dan fasilitas hotel bintang 5.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/5 p-5">
            <p className="text-sm text-black">Perkiraan Biaya</p>
            <p className="text-xl font-semibold">Rp36-42 juta</p>
          </div>
          <div className="rounded-2xl border border-black/5 p-5">
            <p className="text-sm text-black">Perkiraan Waktu</p>
            <p className="text-xl font-semibold">Durasi 10-12 hari</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-black/5 p-6">
          <p className="font-semibold">Fitur Utama</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-black">
            <li>Termasuk kunjungan Museum of the Future & desert safari</li>
            <li>Hotel bintang 5 dekat Masjidil Haram & Madinah</li>
            <li>Transportasi bus eksekutif dan guide bilingual</li>
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

