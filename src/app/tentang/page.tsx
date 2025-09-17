import Reveal from "@/components/Reveal";
import { IconKaaba } from "@/components/Icons";
import FlowDiagram from "@/components/FlowDiagram";

export const metadata = {
  title: "Tentang Sistem Pakar",
  description: "Penjelasan singkat metode rekomendasi paket Haji di HajiExpert.",
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
            <p className="mt-2 text-black dark:text-black">
              Sistem pakar (expert system) HajiExpert bertujuan membantu jamaah memilih paket
              Haji yang paling sesuai berdasarkan kriteria sederhana. Versi ini adalah demonstrasi
              frontend tanpa backend.
            </p>
          </div>
        </div>

        <Reveal>
          <section className="rounded-2xl border border-black/5 p-6 dark:border-white/10">
            <h2 className="text-xl font-semibold">Kriteria yang Dipertimbangkan</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-black dark:text-black">
              <li>Anggaran: rendah, sedang, tinggi.</li>
              <li>Waktu keberangkatan: secepatnya, 1–5 tahun, &gt; 5 tahun.</li>
              <li>Kenyamanan: standar, premium, maksimal.</li>
            </ul>
          </section>
        </Reveal>

        <Reveal>
          <section className="mt-6 rounded-2xl border border-black/5 p-6 dark:border-white/10">
            <h2 className="text-xl font-semibold">Metode Rekomendasi</h2>
            <p className="mt-2 text-black dark:text-black">
              Kami menggunakan penilaian berbobot sederhana: tiap paket (Reguler, Plus, Furoda)
              menerima skor dari setiap kriteria. Paket dengan skor tertinggi direkomendasikan.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-white p-4 ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10">
                <p className="text-sm font-semibold">Reguler</p>
                <p className="mt-1 text-xs text-black dark:text-black">Cenderung unggul pada anggaran rendah dan kesiapan antre &gt; 5 tahun.</p>
              </div>
              <div className="rounded-xl bg-white p-4 ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10">
                <p className="text-sm font-semibold">Plus</p>
                <p className="mt-1 text-xs text-black dark:text-black">Seimbang untuk anggaran sedang, waktu tunggu 1–5 tahun, dan kenyamanan lebih.</p>
              </div>
              <div className="rounded-xl bg-white p-4 ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10">
                <p className="text-sm font-semibold">Furoda</p>
                <p className="mt-1 text-xs text-black dark:text-black">Unggul untuk keberangkatan secepatnya dan kenyamanan maksimal.</p>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="mt-6 rounded-2xl border border-black/5 p-6 dark:border-white/10">
            <h2 className="text-xl font-semibold">Diagram Alur</h2>
            <p className="mt-2 text-black dark:text-black">Gambaran sederhana proses rekomendasi.</p>
            <div className="mt-4">
              <FlowDiagram />
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="mt-6 rounded-2xl border border-black/5 p-6 dark:border-white/10">
            <h2 className="text-xl font-semibold">Pseudocode Skor</h2>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-black/5 p-4 text-xs dark:bg-white/5"><code>{`// Skor awal
s = { Reguler: 0, Plus: 0, Furoda: 0 }

// Anggaran
if anggaran == rendah  then s.Reguler += 2
if anggaran == sedang  then s.Plus   += 2; s.Reguler += 1
if anggaran == tinggi  then s.Furoda += 2; s.Plus    += 1

// Keberangkatan
if waktu == secepatnya then s.Furoda += 3; s.Plus += 1
if waktu == 1-5 tahun  then s.Plus   += 2; s.Reguler += 1
if waktu == >5 tahun   then s.Reguler += 3

// Kenyamanan
if nyaman == standar   then s.Reguler += 2
if nyaman == premium   then s.Plus   += 2
if nyaman == maksimal  then s.Furoda += 2

// Ambil skor tertinggi
rekomendasi = sort_desc(s)[0]
`}</code></pre>
            <p className="mt-2 text-black dark:text-black">
              Bobot dapat disesuaikan sesuai kebijakan atau pengetahuan pakar.
            </p>
          </section>
        </Reveal>

        <Reveal>
          <section className="mt-6 rounded-2xl border border-black/5 p-6 dark:border-white/10">
            <h2 className="text-xl font-semibold">Batasan dan Rencana</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-black dark:text-black">
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
