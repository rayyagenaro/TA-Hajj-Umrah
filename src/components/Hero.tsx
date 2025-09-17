import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative">
      <div className="container-section pt-10 sm:pt-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">
              Sistem Pakar Rekomendasi Haji
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              Temukan Paket Haji <span className="gradient-text">Terbaik</span> untuk Anda
            </h1>
            <p className="mt-4 text-black dark:text-black">
              Pilih antara Haji Reguler, Haji Plus, atau Haji Furoda. Sistem kami
              membantu merekomendasikan paket sesuai kebutuhan, anggaran, dan waktu keberangkatan.
            </p>
            <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row">
              <Link
                href="/rekomendasi"
                className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
              >
                Mulai Rekomendasi
              </Link>
              <a
                href="#paket"
                className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-primary-700 ring-1 ring-primary-200 hover:bg-primary-50"
              >
                Lihat Paket
              </a>
            </div>
          </div>
          <div className="relative">
            {/* Decorative card cluster */}
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -left-6 -top-6 h-24 w-24 rounded-3xl bg-primary-200/40 blur-2xl animate-floaty"></div>
              <div className="absolute -right-8 -bottom-8 h-28 w-28 rounded-full bg-primary-300/40 blur-2xl animate-floaty" style={{ animationDelay: "1.2s" }}></div>
              <div className="glass rounded-2xl p-5 shadow-glow">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                      <path d="M12 2 2 7l10 5 10-5-10-5Zm10 7-10 5-10-5v8l10 5 10-5V9Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Paket Haji</p>
                    <p className="text-xs text-black dark:text-black">Reguler • Plus • Furoda</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    { name: "Reguler", desc: "Efisien & terjangkau" },
                    { name: "Plus", desc: "Layanan lebih premium" },
                    { name: "Furoda", desc: "Tanpa antre resmi" },
                    { name: "Personal", desc: "Sesuai preferensi Anda" },
                  ].map((x) => (
                    <div
                      key={x.name}
                      className="rounded-xl border border-black/5 p-3 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10"
                    >
                      <p className="text-sm font-semibold">{x.name}</p>
                      <p className="text-xs text-black dark:text-black">{x.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
