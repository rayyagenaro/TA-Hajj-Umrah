import Hero from "@/components/Hero";
import PackageCard from "@/components/PackageCard";
import Reveal from "@/components/Reveal";
import { videoResources } from "@/data/videos";
import Link from "next/link";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function Home() {
  return (
    <div>
      <Hero />

      <section id="paket" className="mt-20">
        <div className="container-section relative">
          <div className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-primary-300/30 blur-3xl"></div>
          <div className="pointer-events-none absolute -right-8 -top-6 h-40 w-40 rounded-full bg-primary-200/30 blur-3xl"></div>

          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Pilihan Paket Umrah</h2>
              <p className="mt-1 text-black">
                Fokus pada varian favorit dengan kombinasi ibadah dan wisata islami.
              </p>
            </div>
            <Link
              href="/rekomendasi"
              className="hidden rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 sm:inline-flex"
            >
              Bandingkan & Cek Rekomendasi
            </Link>
          </div>

          <Reveal>
            <div className="grid gap-6 md:grid-cols-3">
              <PackageCard
                variant="reguler"
                title="Umrah Reguler"
                priceRange="Rp25-32 jt"
                waitTime="Keberangkatan batch 9-12 hari"
                highlights={["Biaya hemat", "Fokus ibadah", "Hotel setara bintang 3-4"]}
                href="/paket/reguler"
              />
              <PackageCard
                variant="turki"
                title="Umrah Plus Turki"
                priceRange="Rp34-40 jt"
                waitTime="Include city tour Istanbul"
                highlights={["Tur sejarah & reliji", "Maskapai premium", "Hotel bintang 4"]}
                href="/paket/plus"
              />
              <PackageCard
                variant="dubai"
                title="Umrah Plus Dubai"
                priceRange="Rp36-42 jt"
                waitTime="City tour modern & desert"
                highlights={["Pengalaman mewah", "Transit nyaman", "Durasi 10-12 hari"]}
                href="/paket/furoda"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mt-24">
        <div className="container-section">
          <Reveal>
            <div className="grid items-center gap-8 rounded-3xl bg-gradient-to-r from-primary-600 to-primary-400 p-8 text-white md:grid-cols-2">
              <div>
                <h3 className="text-2xl font-bold">Masih bingung pilih paket Umrah?</h3>
                <p className="mt-2 text-white/90">
                  Jawab beberapa pertanyaan singkat lalu dapatkan rekomendasi paket yang pas dengan budget,
                  kebutuhan pendampingan, dan destinasi tambahan pilihan Anda.
                </p>
              </div>
              <div className="flex justify-end">
                <Link
                  href="/rekomendasi"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primary-700 shadow-sm transition hover:scale-[1.02] hover:bg-white/90"
                >
                  Dapatkan Rekomendasi
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mt-24">
        <div className="container-section">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold sm:text-3xl">Video</h2>

          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {videoResources.map((video) => (
              <Reveal key={video.id}>
                <article className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="aspect-video w-full bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtubeId}`}
                      title={video.title}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                  <div className="space-y-3 p-5">
                    <h3 className="text-xl font-semibold leading-snug text-slate-900">{video.title}</h3>
                    <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">
                      {dateFormatter.format(new Date(video.publishedAt))}
                    </div>
                    <Link
                      href={video.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                    >
                      Tonton di YouTube
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

        </div>
      </section>

      {/* FAQ */}
      <section className="mt-24">
        <div className="container-section">
          <Reveal>
            <div className="mb-6">
              <h2 className="text-2xl font-bold sm:text-3xl">Pertanyaan Umum</h2>
              <p className="mt-1 text-black">Ringkasan info seputar rekomendasi paket Umrah.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                [
                  "Apa itu sistem pakar di UmrahYuk?",
                  "Mesin inferensi membaca aturan ontologi sederhana untuk mencocokkan budget, hotel, dan destinasi tambahan.",
                ],
                [
                  "Apakah hasilnya final?",
                  "Belum. Gunakan sebagai referensi awal sebelum memutuskan biro perjalanan favorit Anda.",
                ],
                [
                  "Apakah data saya disimpan?",
                  "Tidak ada penyimpanan. Semua perhitungan berjalan langsung di perangkat Anda.",
                ],
                [
                  "Bisakah saya ganti preferensi?",
                  "Bisa banget. Sesuaikan budget, hotel, atau destinasi tambahan kapan saja untuk melihat alternatif baru.",
                ],
              ].map(([q, a]) => (
                <div
                  key={q as string}
                  className="rounded-2xl border border-black/5 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="font-semibold">{q as string}</p>
                  <p className="mt-1 text-sm text-black">{a as string}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

