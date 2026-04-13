"use client";

import { useEffect, useState } from "react";

export default function FlowDiagram() {
  const [showFullModal, setShowFullModal] = useState(false);

  const activitySteps = [
    { title: "Isi Data", desc: "User isi budget, usia, pendampingan, hotel, transportasi, dan destinasi tambahan." },
    { title: "Klik Hitung", desc: "Sistem mulai memproses data yang sudah diisi." },
    { title: "Cek Aturan", desc: "Sistem membaca aturan rekomendasi dari data yang tersedia." },
    { title: "Cocokkan Data", desc: "Data user dicocokkan dengan aturan yang paling sesuai." },
    { title: "Pilih Hasil", desc: "Sistem memilih hasil utama dan alternatif yang cocok." },
    { title: "Tampilkan Rekomendasi", desc: "Hasil ditampilkan ke user beserta paket yang disarankan." },
  ];

  const sequenceRows = [
    { actor: "User", action: "Isi form lalu klik Hitung Rekomendasi", target: "Halaman Rekomendasi" },
    { actor: "Halaman Rekomendasi", action: "Kirim data ke server", target: "Server" },
    { actor: "Server", action: "Baca aturan rekomendasi", target: "Data Aturan" },
    { actor: "Data Aturan", action: "Kirim aturan ke server", target: "Server" },
    { actor: "Server", action: "Cocokkan data user dengan aturan", target: "Proses Rekomendasi" },
    { actor: "Proses Rekomendasi", action: "Tentukan hasil utama dan alternatif", target: "Server" },
    { actor: "Server", action: "Kirim hasil rekomendasi", target: "Halaman Rekomendasi" },
    { actor: "Halaman Rekomendasi", action: "Tampilkan hasil ke user", target: "User" },
  ];

  const visibleActivitySteps = activitySteps.slice(0, 3);
  const visibleSequenceRows = sequenceRows.slice(0, 4);

  useEffect(() => {
    if (!showFullModal) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowFullModal(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showFullModal]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 rounded-xl border border-black/10 bg-white px-3 py-2">
        <p className="text-xs text-slate-600 sm:text-sm">
          Tampilan ringkas: <span className="font-semibold text-slate-900">3 langkah utama + 4 alur data</span>
        </p>
        <button
          type="button"
          onClick={() => setShowFullModal(true)}
          className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700"
        >
          Lihat Alur Lengkap
        </button>
      </div>

      <section className="relative overflow-hidden rounded-xl border border-primary-100 bg-gradient-to-br from-primary-100/70 via-white to-cyan-100/60 p-3 shadow-sm sm:p-4">
        <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-primary-200/35 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-16 h-44 w-44 rounded-full bg-cyan-200/35 blur-3xl" />

        <div className="relative mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-700">Diagram 1</p>
            <h3 className="text-sm font-bold text-slate-900 sm:text-base">Alur Utama</h3>
            <p className="mt-0.5 text-[11px] text-slate-600 sm:text-xs">Flowchart sederhana dari isi data sampai hasil keluar.</p>
          </div>
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-primary-700 ring-1 ring-primary-200">
            End-to-end
          </span>
        </div>

        <div className="relative grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {visibleActivitySteps.map((step, index) => (
            <article
              key={step.title}
              className="group relative rounded-xl border border-white/80 bg-white/95 px-3 py-2.5 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.6)] ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-[0_18px_35px_-22px_rgba(37,99,235,0.35)]"
            >
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r from-primary-600 via-primary-400 to-cyan-400" />
              <span className="mt-1 inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-primary-600 px-1 text-[11px] font-bold text-white ring-2 ring-primary-100">
                {index + 1}
              </span>
              <h4 className="mt-1.5 text-xs font-bold text-slate-900 sm:text-sm">{step.title}</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-700 sm:text-xs">{step.desc}</p>
              <div className="mt-2 h-px w-full bg-gradient-to-r from-primary-100 via-slate-100 to-transparent" />
            </article>
          ))}
        </div>
        {activitySteps.length > visibleActivitySteps.length && (
          <p className="mt-2 text-[11px] text-slate-600">+{activitySteps.length - visibleActivitySteps.length} langkah lainnya (klik Lihat Alur Lengkap)</p>
        )}
      </section>

      <section className="rounded-xl border border-black/10 bg-white p-3 shadow-sm sm:p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">Diagram 2</p>
            <h3 className="text-sm font-bold text-slate-900 sm:text-base">Alur Kirim Data</h3>
            <p className="mt-0.5 text-[11px] text-slate-600 sm:text-xs">Urutan perpindahan data dari user sampai hasil tampil.</p>
          </div>
          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-black/10">
            Actor interaction
          </span>
        </div>

        <div className="space-y-1.5">
          {visibleSequenceRows.map((row, index) => (
            <article
              key={`${row.actor}-${row.action}`}
              className={[
                "grid items-start gap-2 rounded-lg border px-2.5 py-2 sm:grid-cols-[130px_1fr_130px] sm:gap-2.5 sm:px-3",
                index % 2 === 0 ? "border-primary-100 bg-primary-50/45" : "border-slate-200 bg-white",
              ].join(" ")}
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-bold text-white">
                  {index + 1}
                </span>
                <span className="text-[11px] font-semibold text-primary-700 sm:text-xs">{row.actor}</span>
              </div>
              <div className="text-[11px] text-slate-700 sm:text-xs">{row.action}</div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-800 sm:justify-end sm:text-xs">
                <span className="text-primary-600">-&gt;</span>
                <span>{row.target}</span>
              </div>
            </article>
          ))}
        </div>
        {sequenceRows.length > visibleSequenceRows.length && (
          <p className="mt-2 text-[11px] text-slate-600">+{sequenceRows.length - visibleSequenceRows.length} langkah lainnya (klik Lihat Alur Lengkap)</p>
        )}
      </section>

      <p className="rounded-lg border border-black/10 bg-slate-50 px-3 py-2 text-[11px] text-slate-600 sm:text-xs">
        Catatan: ini versi sederhana supaya lebih mudah dipahami semua user.
      </p>

      {showFullModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Tutup popup"
            className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]"
            onClick={() => setShowFullModal(false)}
          />

          <div className="relative z-10 max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-black/10 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">Alur Lengkap</p>
                <h3 className="text-base font-bold text-slate-900 sm:text-lg">Flowchart Sistem Rekomendasi</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFullModal(false)}
                className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>

            <div className="max-h-[74vh] space-y-4 overflow-y-auto p-4 sm:p-5">
              <section className="rounded-xl border border-primary-100 bg-gradient-to-br from-primary-100/70 via-white to-cyan-100/60 p-3 sm:p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-700">Diagram 1</p>
                    <h4 className="text-sm font-bold text-slate-900 sm:text-base">Alur Utama</h4>
                  </div>
                  <span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-primary-700 ring-1 ring-primary-200">
                    Lengkap
                  </span>
                </div>
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {activitySteps.map((step, index) => (
                    <article
                      key={`full-${step.title}`}
                      className="relative rounded-xl border border-white/80 bg-white px-3 py-2.5 ring-1 ring-black/5"
                    >
                      <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r from-primary-600 via-primary-400 to-cyan-400" />
                      <span className="mt-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white">
                        {index + 1}
                      </span>
                      <p className="mt-1.5 text-xs font-bold text-slate-900 sm:text-sm">{step.title}</p>
                      <p className="mt-1 text-[11px] text-slate-700 sm:text-xs">{step.desc}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-black/10 bg-white p-3 sm:p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">Diagram 2</p>
                    <h4 className="text-sm font-bold text-slate-900 sm:text-base">Alur Kirim Data</h4>
                  </div>
                  <span className="rounded-full bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-700 ring-1 ring-black/10">
                    Lengkap
                  </span>
                </div>
                <div className="space-y-1.5">
                  {sequenceRows.map((row, index) => (
                    <article
                      key={`full-${row.actor}-${row.action}`}
                      className={[
                        "grid items-start gap-2 rounded-lg border px-2.5 py-2 sm:grid-cols-[130px_1fr_130px] sm:px-3",
                        index % 2 === 0 ? "border-primary-100 bg-primary-50/45" : "border-slate-200 bg-white",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-bold text-white">
                          {index + 1}
                        </span>
                        <span className="text-[11px] font-semibold text-primary-700 sm:text-xs">{row.actor}</span>
                      </div>
                      <div className="text-[11px] text-slate-700 sm:text-xs">{row.action}</div>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-800 sm:justify-end sm:text-xs">
                        <span className="text-primary-600">-&gt;</span>
                        <span>{row.target}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
