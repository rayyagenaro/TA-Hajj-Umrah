import TrackedLink from "@/components/TrackedLink";

export default function Hero() {
  return (
    <section className="relative">
      <div className="container-section pt-10 sm:pt-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="text-black">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">
              <span className="inline-flex h-2 w-2 rounded-full bg-primary-500" aria-hidden />
              Sistem Pakar Rekomendasi Umrah
            </span>

            <h1 className="mt-4 text-4xl font-bold leading-tight text-black sm:text-5xl">
              Temukan Paket Umrah <span className="gradient-text">Terbaik</span> untuk Anda
            </h1>

            <p className="mt-3 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-black">
              <span
                className="inline-flex h-[2px] w-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-300"
                aria-hidden
              />
              Bismillah Menuju Baitullah
            </p>

            <p className="mt-4 text-black">
              Dapatkan rekomendasi paket berdasarkan budget, preferensi kenyamanan hotel, dan minat tur religi Anda.
            </p>

            <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row">
              <TrackedLink
                href="/rekomendasi"
                eventName="cta_click"
                eventPayload={{ location: "hero-primary", target: "/rekomendasi" }}
                className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-300/40 transition hover:-translate-y-0.5 hover:bg-amber-300"
              >
                Mulai Rekomendasi
              </TrackedLink>
              <a
                href="#paket"
                className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-primary-700 ring-1 ring-primary-200 hover:bg-primary-50"
              >
                Lihat Paket
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="relative mx-auto w-full max-w-md">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">Kategori Populer</p>
              <div className="absolute -left-6 -top-6 h-24 w-24 animate-floaty rounded-3xl bg-primary-200/40 blur-2xl" />
              <div
                className="absolute -right-8 -bottom-8 h-28 w-28 animate-floaty rounded-full bg-primary-300/40 blur-2xl"
                style={{ animationDelay: "1.2s" }}
              />

              <div className="glass rounded-2xl p-5 text-black shadow-glow">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                      <path d="M12 2 2 7l10 5 10-5-10-5Zm10 7-10 5-10-5v8l10 5 10-5V9Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black">Paket Umrah</p>
                    <p className="text-xs text-black">Reguler | Plus Turki | Plus Dubai</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    { name: "Reguler", desc: "Fokus ibadah & hemat" },
                    { name: "Plus Turki", desc: "Ditambah tur Istanbul" },
                    { name: "Plus Dubai", desc: "City tour mewah" },
                    { name: "Private", desc: "Jadwal fleksibel" },
                  ].map((x) => (
                    <div
                      key={x.name}
                      className="rounded-xl border border-black/5 p-3 text-black transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <p className="text-sm font-semibold text-black">{x.name}</p>
                      <p className="text-xs text-black">{x.desc}</p>
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
