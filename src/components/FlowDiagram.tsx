import { Fragment } from "react";

export default function FlowDiagram() {
  const steps = [
    { title: "Input Preferensi", desc: "Anggaran, waktu, kenyamanan" },
    { title: "Skor Kriteria", desc: "Bobot per paket" },
    { title: "Agregasi", desc: "Jumlahkan skor" },
    { title: "Rekomendasi", desc: "Paket tertinggi" },
  ];

  return (
    <div className="w-full">
      <div className="hidden md:grid grid-cols-7 items-center gap-4">
        {steps.map((s, i) => (
          <Fragment key={s.title}>
            <div className="col-span-2 rounded-2xl bg-white p-4 ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10">
              <p className="text-sm font-semibold">{s.title}</p>
              <p className="text-xs text-black dark:text-black">{s.desc}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="col-span-1 flex items-center justify-center text-primary-700">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
                  <path d="m8 5 8 7-8 7V5Z" />
                </svg>
              </div>
            )}
          </Fragment>
        ))}
      </div>

      <div className="md:hidden grid gap-3">
        {steps.map((s, i) => (
          <div key={s.title} className="relative">
            <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10">
              <p className="text-sm font-semibold">{s.title}</p>
              <p className="text-xs text-black dark:text-black">{s.desc}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="flex justify-center py-1 text-primary-700">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
                  <path d="m5 8 7 8 7-8H5Z" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
