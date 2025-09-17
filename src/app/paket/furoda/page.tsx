import Link from "next/link";
import { IconPlane } from "@/components/Icons";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = {
  title: "Paket Haji Furoda",
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
              { label: "Haji Furoda" },
            ]}
          />
          <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">
            Paket Haji
          </span>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600/10 text-primary-700">
              <IconPlane className="h-5 w-5" />
            </span>
            <h1 className="text-3xl font-bold">Haji Furoda</h1>
          </div>
          <p className="mt-2 text-black dark:text-black">
            Keberangkatan cepat tanpa antre kuota (visa mujamalah), dengan kenyamanan tinggi dan
            layanan eksklusif.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/5 p-5 dark:border-white/10">
            <p className="text-sm text-black dark:text-black">Perkiraan Biaya</p>
            <p className="text-xl font-semibold">&gt; Rp250 jt</p>
          </div>
          <div className="rounded-2xl border border-black/5 p-5 dark:border-white/10">
            <p className="text-sm text-black dark:text-black">Perkiraan Waktu</p>
            <p className="text-xl font-semibold">Cepat (tanpa antre)</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-black/5 p-6 dark:border-white/10">
          <p className="font-semibold">Fitur Utama</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-black dark:text-black">
            <li>Keberangkatan prioritas</li>
            <li>Hotel dan transportasi pilihan</li>
            <li>Pelayanan eksklusif</li>
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
