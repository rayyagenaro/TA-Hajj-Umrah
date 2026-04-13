import Reveal from "@/components/Reveal";
import FlowDiagram from "@/components/FlowDiagram";
import { IconDiamond, IconKaaba, IconPlane, IconWallet } from "@/components/Icons";
import TrackedLink from "@/components/TrackedLink";

export const metadata = {
  title: "Tentang Sistem Pakar",
  description: "Penjelasan metode rekomendasi paket Umrah di UmrahYuk.",
};

const criteria = [
  {
    title: "Budget",
    desc: "Sistem memetakan anggaran ke range paket agar rekomendasi tetap realistis untuk jamaah.",
    icon: IconWallet,
    tone: "bg-primary-50 text-primary-700 ring-primary-100",
  },
  {
    title: "Kenyamanan Hotel",
    desc: "Preferensi hotel membantu membedakan opsi standar, premium, dan kelas mewah.",
    icon: IconDiamond,
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  {
    title: "Destinasi Tambahan",
    desc: "Pilihan Turki atau Dubai memberi bobot ekstra ke paket plus yang paling relevan.",
    icon: IconPlane,
    tone: "bg-amber-50 text-amber-700 ring-amber-100",
  },
];

const packageSummary = [
  {
    name: "Umrah Reguler",
    detail: "Fokus ibadah, biaya lebih hemat, durasi 9-12 hari.",
  },
  {
    name: "Umrah Plus Turki",
    detail: "Kombinasi ibadah dan tur sejarah Islam di Istanbul/Bursa.",
  },
  {
    name: "Umrah Plus Dubai",
    detail: "Pilihan modern dengan city tour dan opsi pengalaman premium.",
  },
];

const roadmap = [
  "Integrasi data travel resmi secara berkala.",
  "Penyempurnaan aturan dengan validasi pakar dan biro berizin.",
  "Dashboard analitik keputusan untuk evaluasi akurasi rekomendasi.",
];

export default function TentangPage() {
  return (
    <div className="container-section">
      <div className="mx-auto max-w-6xl space-y-6">
        <Reveal>
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-700 via-primary-600 to-primary-400 p-7 text-white shadow-lg shadow-primary-600/20 sm:p-8">
            <div className="pointer-events-none absolute -left-6 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-cyan-200/25 blur-2xl" />
            <div className="relative z-10 flex flex-wrap items-end justify-between gap-5">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/30">
                  <IconKaaba className="h-3.5 w-3.5" />
                  Tentang UmrahYuk
                </span>
                <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Sistem Pakar Rekomendasi Paket Umrah</h1>
                <p className="mt-2 text-sm text-white/90 sm:text-base">
                  UmrahYuk membantu jamaah menyaring pilihan paket berdasarkan kebutuhan nyata. Sistem membaca aturan
                  ontologi lalu memetakan ke rekomendasi utama dan alternatif yang relevan.
                </p>
              </div>
              <TrackedLink
                href="/rekomendasi"
                eventName="cta_click"
                eventPayload={{ location: "about-hero", target: "/rekomendasi" }}
                className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
              >
                Coba Rekomendasi
              </TrackedLink>
            </div>
          </section>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold">Kriteria yang Dipertimbangkan</h2>
              <p className="mt-1 text-sm text-black">Tiga komponen inti yang jadi basis pemetaan aturan rekomendasi.</p>
              <div className="mt-5 grid gap-4">
                {criteria.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article
                      key={item.title}
                      className="rounded-2xl border border-black/5 bg-slate-50/70 p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${item.tone}`}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <h3 className="text-base font-bold">{item.title}</h3>
                          <p className="mt-1 text-sm text-slate-700">{item.desc}</p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold">Output Rekomendasi</h2>
              <p className="mt-1 text-sm text-black">Sistem mengembalikan paket utama + opsi cadangan.</p>
              <div className="mt-5 grid gap-3">
                {packageSummary.map((item, index) => (
                  <article key={item.name} className="rounded-2xl border border-black/5 bg-white p-4 ring-1 ring-black/5">
                    <span className="inline-flex rounded-full bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-700">
                      Prioritas {index + 1}
                    </span>
                    <h3 className="mt-2 text-base font-bold">{item.name}</h3>
                    <p className="mt-1 text-sm text-slate-700">{item.detail}</p>
                  </article>
                ))}
              </div>
            </section>
          </Reveal>
        </div>

        <Reveal>
          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-2xl font-bold">Alur Sistem</h2>
            <p className="mt-1 text-sm text-black">Gambaran ringkas proses dari input user hingga rekomendasi.</p>
            <div className="mt-4">
              <FlowDiagram />
            </div>
          </section>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold">Pseudocode Penilaian</h2>
              <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">
                <code>{`s = { Reguler: 0, PlusTurki: 0, PlusDubai: 0 }

if budget == hemat: s.Reguler += 2
if budget == sedang: s.PlusTurki += 2; s.Reguler += 1
if budget == tinggi: s.PlusDubai += 2; s.PlusTurki += 1

if hotel == standar: s.Reguler += 2
if hotel == premium: s.PlusTurki += 1; s.PlusDubai += 2
if hotel == mewah: s.PlusDubai += 2

if destinasi == Turki: s.PlusTurki += 3
if destinasi == Dubai: s.PlusDubai += 3

rekomendasi = argmax(s)`}</code>
              </pre>
              <p className="mt-3 text-sm text-slate-700">
                Bobot aturan dapat disesuaikan untuk kebijakan travel, profil jamaah, dan evaluasi pakar.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold">Batasan & Rencana Pengembangan</h2>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4 text-sm text-amber-900">
                  Versi saat ini adalah prototipe pembelajaran dan demonstrasi antarmuka sistem pakar.
                </div>
                {roadmap.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-black/5 bg-slate-50 px-4 py-3">
                    <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-primary-500" />
                    <p className="text-sm text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <TrackedLink
                  href="/rekomendasi"
                  eventName="cta_click"
                  eventPayload={{ location: "about-footer", target: "/rekomendasi" }}
                  className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                  Mulai Rekomendasi
                </TrackedLink>
                <TrackedLink
                  href="/paket"
                  eventName="cta_click"
                  eventPayload={{ location: "about-footer", target: "/paket" }}
                  className="inline-flex items-center justify-center rounded-xl border border-primary-200 px-4 py-2 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
                >
                  Lihat Paket
                </TrackedLink>
              </div>
            </section>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
