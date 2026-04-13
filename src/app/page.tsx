import Hero from "@/components/Hero";
import PackageCard from "@/components/PackageCard";
import Reveal from "@/components/Reveal";
import TrackedLink from "@/components/TrackedLink";
import { umrahPilgrimsPerYear, umrahStatsMeta } from "@/data/umrahStats";
import { videoResources } from "@/data/videos";
import Link from "next/link";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const trustSignals = [
  "Rekomendasi berbasis aturan ontologi",
  "Input diproses langsung tanpa simpan data pribadi",
  "Referensi paket diambil dari sumber publik travel",
];

const howItWorks = [
  { title: "Isi Preferensi", desc: "Masukkan budget, usia, kebutuhan pendampingan, dan destinasi tambahan." },
  { title: "Sistem Memetakan Aturan", desc: "Mesin inferensi mencocokkan input Anda dengan aturan paket Umrah." },
  { title: "Dapatkan Rekomendasi", desc: "Lihat paket utama, alternatif, dan referensi travel sejenis." },
];

export default function Home() {
  const maxTrend = Math.max(...umrahPilgrimsPerYear.map((item) => item.pilgrims));
  const minTrend = Math.min(...umrahPilgrimsPerYear.map((item) => item.pilgrims));
  const trendRange = Math.max(1, maxTrend - minTrend);

  const chartWidth = 760;
  const chartHeight = 280;
  const chartPadX = 26;
  const chartPadTop = 20;
  const chartPadBottom = 42;
  const innerWidth = chartWidth - chartPadX * 2;
  const innerHeight = chartHeight - chartPadTop - chartPadBottom;
  const stepX = innerWidth / Math.max(1, umrahPilgrimsPerYear.length - 1);

  const chartPoints = umrahPilgrimsPerYear.map((item, index) => {
    const x = chartPadX + stepX * index;
    const y = chartPadTop + ((maxTrend - item.pilgrims) / trendRange) * innerHeight;
    return { ...item, x, y };
  });

  const linePath = chartPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) => maxTrend - (trendRange / yTicks) * i);

  return (
    <div>
      <Hero />

      <section className="mt-20">
        <div className="container-section">
          <Reveal>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold">Tren Jamaah Umrah</h2>
                    <p className="mt-1 text-sm text-black">Jumlah pelaksana Umrah per tahun.</p>
                  </div>
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">
                    2016-2025
                  </span>
                </div>
                <div className="rounded-2xl bg-slate-50 p-2 sm:p-4">
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-64 w-full">
                    {tickValues.map((val, index) => {
                      const y = chartPadTop + (index / yTicks) * innerHeight;
                      return (
                        <g key={val}>
                          <line
                            x1={chartPadX}
                            y1={y}
                            x2={chartWidth - chartPadX}
                            y2={y}
                            stroke="rgba(148,163,184,0.35)"
                            strokeDasharray="4 4"
                          />
                          <text x={6} y={y + 4} fontSize="10" fill="#64748b">
                            {Math.round(val / 1_000_000)}jt
                          </text>
                        </g>
                      );
                    })}

                    <polyline
                      fill="none"
                      stroke="#16a34a"
                      strokeWidth="3"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      points={linePath}
                    />

                    {chartPoints.map((point, index) => (
                      <g key={point.year}>
                        <title>{`${point.year}: ${point.pilgrims.toLocaleString("id-ID")} jamaah`}</title>
                        <circle cx={point.x} cy={point.y} r="4" fill="#16a34a" />
                        <text
                          x={point.x}
                          y={point.y - 10}
                          fontSize="10"
                          textAnchor="middle"
                          fill="#0f172a"
                          className={index % 2 === 0 ? "hidden sm:block" : "hidden"}
                        >
                          {point.pilgrims.toLocaleString("id-ID")}
                        </text>
                        <text
                          x={point.x}
                          y={chartHeight - 16}
                          fontSize="10"
                          textAnchor="middle"
                          fill="#475569"
                          className={index % 2 === 0 ? "" : "hidden sm:block"}
                        >
                          {point.year}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Sumber: {umrahStatsMeta.source}. Pembaruan terakhir: {umrahStatsMeta.lastUpdated}.
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-bold">Kenapa UmrahYuk?</h3>
                  <div className="mt-4 grid gap-3">
                    {trustSignals.map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 rounded-2xl border border-primary-100 bg-primary-50/60 px-4 py-3"
                      >
                        <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-primary-500" />
                        <p className="text-sm text-slate-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl bg-gradient-to-r from-primary-700 to-primary-500 p-6 text-white shadow-lg shadow-primary-600/20">
                  <h3 className="text-xl font-bold">Ingin hasil yang lebih akurat?</h3>
                  <p className="mt-2 text-sm text-white/90">
                    Lengkapi semua preferensi di sistem rekomendasi untuk melihat paket utama dan alternatif.
                  </p>
                  <TrackedLink
                    href="/rekomendasi"
                    eventName="cta_click"
                    eventPayload={{ location: "home-trust-banner", target: "/rekomendasi" }}
                    className="mt-4 inline-flex items-center justify-center rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
                  >
                    Mulai Rekomendasi
                  </TrackedLink>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mt-20">
        <div className="container-section">
          <Reveal>
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold sm:text-3xl">Cara Kerja UmrahYuk</h2>
                  <p className="mt-1 text-sm text-black">Tiga langkah cepat dari input hingga rekomendasi paket.</p>
                </div>
                <TrackedLink
                  href="/rekomendasi"
                  eventName="cta_click"
                  eventPayload={{ location: "home-how-it-works", target: "/rekomendasi" }}
                  className="rounded-xl border border-primary-200 px-4 py-2 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
                >
                  Coba Sekarang
                </TrackedLink>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {howItWorks.map((item, index) => (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-black/5 bg-slate-50/70 p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <span className="inline-flex rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
                      Langkah {index + 1}
                    </span>
                    <h3 className="mt-3 text-lg font-bold">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-700">{item.desc}</p>
                  </article>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

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
            <TrackedLink
              href="/rekomendasi"
              eventName="cta_click"
              eventPayload={{ location: "home-package-header", target: "/rekomendasi" }}
              className="hidden rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 sm:inline-flex"
            >
              Bandingkan & Cek Rekomendasi
            </TrackedLink>
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
                <TrackedLink
                  href="/rekomendasi"
                  eventName="cta_click"
                  eventPayload={{ location: "home-main-banner", target: "/rekomendasi" }}
                  className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-300/40 transition hover:-translate-y-0.5 hover:bg-amber-300"
                >
                  Dapatkan Rekomendasi
                </TrackedLink>
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
                <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
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
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <h3 className="min-h-16 text-xl font-semibold leading-snug text-slate-900">{video.title}</h3>
                    <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">
                      {dateFormatter.format(new Date(video.publishedAt))}
                    </div>
                    <Link
                      href={video.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-auto inline-flex w-fit items-center justify-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
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

      <section className="mt-24">
        <div className="container-section">
          <Reveal>
            <div className="rounded-3xl border border-black/5 bg-white/90 p-6 shadow-sm sm:p-7">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold sm:text-3xl">Pertanyaan Umum</h2>
                  <p className="mt-1 text-black">Jawaban cepat biar kamu makin yakin pakai rekomendasi ini.</p>
                </div>
                <span className="inline-flex rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">
                  FAQ
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
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
                ].map(([q, a], index) => (
                  <details
                    key={q as string}
                    className="group rounded-2xl border border-black/10 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm transition-all open:border-primary-200 open:shadow-md"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 marker:content-['']">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary-600 text-[11px] font-bold text-white">
                          {index + 1}
                        </span>
                        <span className="font-semibold text-slate-900">{q as string}</span>
                      </div>
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-primary-200 bg-primary-50 text-primary-700 transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 rounded-xl border border-black/5 bg-white px-3 py-2 text-sm text-black">{a as string}</p>
                  </details>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
