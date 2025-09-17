import Hero from "@/components/Hero";
import PackageCard from "@/components/PackageCard";
import Reveal from "@/components/Reveal";
import Link from "next/link";

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
              <h2 className="text-2xl font-bold sm:text-3xl">Pilihan Paket Haji</h2>
              <p className="mt-1 text-black dark:text-black">
                Tiga kategori utama yang paling sering dipilih jamaah.
              </p>
            </div>
            <Link
              href="/rekomendasi"
              className="hidden rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 sm:inline-flex"
            >
              Bandingkan & Dapatkan Rekomendasi
            </Link>
          </div>

          <Reveal>
            <div className="grid gap-6 md:grid-cols-3">
              <PackageCard
                variant="reguler"
                title="Haji Reguler"
                priceRange="Rp35-60 jt"
                waitTime="Antrean panjang (10-20 th)"
                highlights={["Biaya terjangkau", "Kuota pemerintah", "Fasilitas standar"]}
                href="/paket/reguler"
              />
              <PackageCard
                variant="plus"
                title="Haji Plus"
                priceRange="Rp150-250 jt"
                waitTime="Lebih cepat (1-5 th)"
                highlights={["Layanan premium", "Hotel lebih dekat", "Pendampingan intensif"]}
                href="/paket/plus"
              />
              <PackageCard
                variant="furoda"
                title="Haji Furoda"
                priceRange="> Rp250 jt"
                waitTime="Tanpa antre (visa mujamalah)"
                highlights={["Keberangkatan cepat", "Kenyamanan tinggi", "Kuota non-kuota"]}
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
                <h3 className="text-2xl font-bold">Tidak yakin pilih yang mana?</h3>
                <p className="mt-2 text-white/90">
                  Jawab beberapa pertanyaan sederhana dan dapatkan rekomendasi paket
                  yang paling sesuai dengan kebutuhan Anda.
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

      {/* Testimonials */}
      <section className="mt-24">
        <div className="container-section">
          <Reveal>
            <div className="mb-6">
              <h2 className="text-2xl font-bold sm:text-3xl">Apa kata jamaah?</h2>
              <p className="mt-1 text-black dark:text-black">Cerita singkat dari mereka yang sudah memilih.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  name: "Ahmad",
                  text: "Saya dapat rekomendasi Reguler sesuai kondisi finansial. Penjelasannya jelas!",
                },
                {
                  name: "Siti",
                  text: "Pilih Plus karena ingin lebih nyaman. Antrean juga lebih singkat.",
                },
                {
                  name: "Dewi",
                  text: "Furoda jadi solusi karena butuh keberangkatan cepat tanpa antre.",
                },
              ].map((t) => (
                <div
                  key={t.name}
                  className="rounded-2xl border border-black/5 bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white font-semibold">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-xs text-black dark:text-black">Jamaah</p>
                    </div>
                  </div>
                  <p className="text-sm text-black dark:text-black">&ldquo;{t.text}&rdquo;</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-24">
        <div className="container-section">
          <Reveal>
            <div className="mb-6">
              <h2 className="text-2xl font-bold sm:text-3xl">Pertanyaan Umum</h2>
              <p className="mt-1 text-black dark:text-black">Info ringkas seputar paket dan rekomendasi.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                [
                  "Apa itu sistem pakar di sini?",
                  "Sistem ini membantu memberikan saran paket berdasarkan preferensi Anda (frontend demo).",
                ],
                [
                  "Apakah hasilnya final?",
                  "Tidak. Anggap sebagai rekomendasi awal. Keputusan akhir menyesuaikan kebijakan resmi.",
                ],
                [
                  "Apakah data saya disimpan?",
                  "Tidak. Saat ini isian preferensi hanya diproses di sisi frontend.",
                ],
                [
                  "Bisakah saya ganti preferensi?",
                  "Bisa. Ubah pilihan kapan saja dan lihat perubahan rekomendasi secara langsung.",
                ],
              ].map(([q, a]) => (
                <div
                  key={q as string}
                  className="rounded-2xl border border-black/5 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10"
                >
                  <p className="font-semibold">{q as string}</p>
                  <p className="mt-1 text-sm text-black dark:text-black">{a as string}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
