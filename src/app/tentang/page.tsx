import Reveal from "@/components/Reveal";
import { IconKaaba } from "@/components/Icons";
import FlowDiagram from "@/components/FlowDiagram";

export const metadata = {
  title: "Tentang Sistem Pakar",
  description: "Penjelasan singkat metode rekomendasi paket Umrah di UmrahYuk.",
};

export default function TentangPage() {
  return (
    <div className="container-section">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-start gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white">
            <IconKaaba className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold">Tentang Sistem Pakar</h1>
            <p className="mt-2 text-black">
              Sistem pakar (expert system) UmrahYuk membantu jamaah memilih paket Umrah berdasarkan
              budget, preferensi hotel, dan destinasi tambahan. Versi ini merupakan demonstrasi
              frontend tanpa backend.
            </p>
          </div>
        </div>

        <Reveal>
          <section className="rounded-2xl border border-black/5 p-6">
            <h2 className="text-xl font-semibold">Kriteria yang Dipertimbangkan</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-black">
              <li>Budget: hemat (25-30 jt), sedang (30-36 jt), tinggi (&gt; 36 jt).</li>
              <li>Preferensi hotel: standar, premium, mewah.</li>
              <li>Destinasi tambahan: none, Turki, Dubai.</li>
            </ul>
          </section>
        </Reveal>

        <Reveal>
          <section className="mt-6 rounded-2xl border border-black/5 p-6">
            <h2 className="text-xl font-semibold">Metode Rekomendasi</h2>
            <p className="mt-2 text-black">
              Penilaian berbobot sederhana: tiap paket (Umrah Reguler, Umrah Plus Turki, Umrah Plus Dubai)
              menerima skor dari setiap kriteria. Paket dengan skor tertinggi direkomendasikan.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-white p-4 ring-1 ring-black/5">
                <p className="text-sm font-semibold">Umrah Reguler</p>
                <p className="mt-1 text-xs text-black">Unggul pada budget hemat dan fokus ibadah 9-12 hari.</p>
              </div>
              <div className="rounded-xl bg-white p-4 ring-1 ring-black/5">
                <p className="text-sm font-semibold">Umrah Plus Turki</p>
                <p className="mt-1 text-xs text-black">Pilihan bagi yang ingin tur sejarah Istanbul & Bursa.</p>
              </div>
              <div className="rounded-xl bg-white p-4 ring-1 ring-black/5">
                <p className="text-sm font-semibold">Umrah Plus Dubai</p>
                <p className="mt-1 text-xs text-black">Ideal untuk pengalaman city tour modern & desert safari.</p>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="mt-6 rounded-2xl border border-black/5 p-6">
            <h2 className="text-xl font-semibold">Diagram Alur</h2>
            <p className="mt-2 text-black">Gambaran sederhana proses rekomendasi.</p>
            <div className="mt-4">
              <FlowDiagram />
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="mt-6 rounded-2xl border border-black/5 p-6">
            <h2 className="text-xl font-semibold">Pseudocode Skor</h2>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-black/5 p-4 text-xs"><code>{`// Skor awal
s = { Reguler: 0, PlusTurki: 0, PlusDubai: 0 }

// Budget
if budget == hemat  then s.Reguler   += 2
if budget == sedang then s.PlusTurki += 2; s.Reguler += 1
if budget == tinggi then s.PlusDubai += 2; s.PlusTurki += 1

// Preferensi hotel
if hotel == standar then s.Reguler   += 2
if hotel == premium then s.PlusTurki += 1; s.PlusDubai += 2

// Destinasi tambahan
if destinasi == Turki then s.PlusTurki += 3
if destinasi == Dubai then s.PlusDubai += 3

// Ambil skor tertinggi
rekomendasi = sort_desc(s)[0]
`}</code></pre>
            <p className="mt-2 text-black">
              Bobot dapat disesuaikan sesuai kebijakan atau pengetahuan pakar.
            </p>
          </section>
        </Reveal>

        <Reveal>
          <section className="mt-6 rounded-2xl border border-black/5 p-6">
            <h2 className="text-xl font-semibold">Batasan dan Rencana</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-black">
              <li>Prototype frontend: tidak menyimpan data dan tanpa integrasi backend.</li>
              <li>Bisa dikembangkan menjadi rule-engine yang lebih kaya atau AHP/SMART.</li>
              <li>Validasi kebijakan resmi diperlukan untuk produksi.</li>
            </ul>
          </section>
        </Reveal>
      </div>
    </div>
  );
}

