"use client";

import type { RefObject } from "react";
import type { FieldErrors, FieldKey, FormState } from "../types";

type FormProgress = { filled: number; total: number; percent: number };
type SummaryItem = { label: string; value: string };

type InputRefs = {
  namaRef: RefObject<HTMLInputElement | null>;
  budgetRef: RefObject<HTMLInputElement | null>;
  usiaRef: RefObject<HTMLInputElement | null>;
  durasiRef: RefObject<HTMLInputElement | null>;
  penerbanganRef: RefObject<HTMLInputElement | null>;
  jarakRef: RefObject<HTMLInputElement | null>;
  destinasiRef: RefObject<HTMLInputElement | null>;
};

type Props = {
  form: FormState;
  loading: boolean;
  cooldownSeconds: number;
  fieldErrors: FieldErrors;
  formProgress: FormProgress;
  preferenceSummary: SummaryItem[];
  refs: InputRefs;
  onUpdateForm: (key: FieldKey, value: FormState[FieldKey]) => void;
};

export default function RecommendationFormSection({
  form,
  loading,
  cooldownSeconds,
  fieldErrors,
  formProgress,
  preferenceSummary,
  refs,
  onUpdateForm,
}: Props) {
  const controlsDisabled = loading || cooldownSeconds > 0;

  return (
    <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
      <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Form Preferensi</h2>
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">
            {formProgress.filled}/{formProgress.total} siap
          </span>
        </div>
        <div className="mb-5 rounded-xl border border-primary-100 bg-primary-50/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-primary-800">Progres Pengisian Preferensi</p>
            <p className="text-xs font-bold text-primary-700">{formProgress.percent}%</p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white ring-1 ring-primary-100">
            <div className="h-full rounded-full bg-gradient-to-r from-primary-600 to-cyan-400" style={{ width: `${formProgress.percent}%` }} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <fieldset className={`rounded-xl border p-4 md:col-span-2 ${fieldErrors.nama ? "border-red-300 bg-red-50/30" : "border-black/10"}`}>
            <legend className="px-1 text-sm font-semibold">Nama Jamaah</legend>
            <input
              ref={refs.namaRef}
              type="text"
              value={form.nama}
              onChange={(e) => onUpdateForm("nama", e.target.value)}
              disabled={controlsDisabled}
              required
              placeholder="Tuliskan nama lengkap"
              aria-invalid={Boolean(fieldErrors.nama)}
              aria-describedby={fieldErrors.nama ? "error-nama" : undefined}
              className={[
                "mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200",
                fieldErrors.nama ? "border-red-300 ring-1 ring-red-200" : "border-black/10",
              ].join(" ")}
            />
            {fieldErrors.nama && (
              <p id="error-nama" className="mt-2 text-xs font-medium text-red-600">
                {fieldErrors.nama}
              </p>
            )}
          </fieldset>

          <fieldset className={`rounded-xl border p-4 ${fieldErrors.budget ? "border-red-300 bg-red-50/30" : "border-black/10"}`}>
            <legend className="px-1 text-sm font-semibold">Budget Umrah (IDR)</legend>
            <input
              ref={refs.budgetRef}
              type="number"
              min={10_000_000}
              max={250_000_000}
              step={500_000}
              value={form.budget}
              onChange={(e) => onUpdateForm("budget", Number(e.target.value))}
              disabled={controlsDisabled}
              aria-invalid={Boolean(fieldErrors.budget)}
              aria-describedby={fieldErrors.budget ? "error-budget" : undefined}
              className={[
                "mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200",
                fieldErrors.budget ? "border-red-300 ring-1 ring-red-200" : "border-black/10",
              ].join(" ")}
            />
            <p className="mt-2 text-xs text-slate-500">Contoh: 32000000</p>
            {fieldErrors.budget && (
              <p id="error-budget" className="mt-1 text-xs font-medium text-red-600">
                {fieldErrors.budget}
              </p>
            )}
          </fieldset>

          <fieldset className={`rounded-xl border p-4 ${fieldErrors.usia ? "border-red-300 bg-red-50/30" : "border-black/10"}`}>
            <legend className="px-1 text-sm font-semibold">Usia Jamaah</legend>
            <input
              ref={refs.usiaRef}
              type="number"
              min={12}
              max={100}
              value={form.usia}
              onChange={(e) => onUpdateForm("usia", Number(e.target.value))}
              disabled={controlsDisabled}
              aria-invalid={Boolean(fieldErrors.usia)}
              aria-describedby={fieldErrors.usia ? "error-usia" : undefined}
              className={[
                "mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200",
                fieldErrors.usia ? "border-red-300 ring-1 ring-red-200" : "border-black/10",
              ].join(" ")}
            />
            {fieldErrors.usia && (
              <p id="error-usia" className="mt-2 text-xs font-medium text-red-600">
                {fieldErrors.usia}
              </p>
            )}
          </fieldset>

          <fieldset className={`rounded-xl border p-4 ${fieldErrors.durasiPreferensi ? "border-red-300 bg-red-50/30" : "border-black/10"}`}>
            <legend className="px-1 text-sm font-semibold">Preferensi Durasi (hari)</legend>
            <input
              ref={refs.durasiRef}
              type="number"
              min={7}
              max={20}
              step={1}
              value={form.durasiPreferensi}
              onChange={(e) => onUpdateForm("durasiPreferensi", Number(e.target.value))}
              disabled={controlsDisabled}
              aria-invalid={Boolean(fieldErrors.durasiPreferensi)}
              aria-describedby={fieldErrors.durasiPreferensi ? "error-durasi" : undefined}
              className={[
                "mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200",
                fieldErrors.durasiPreferensi ? "border-red-300 ring-1 ring-red-200" : "border-black/10",
              ].join(" ")}
            />
            <p className="mt-2 text-xs text-slate-500">Contoh: 12</p>
            {fieldErrors.durasiPreferensi && (
              <p id="error-durasi" className="mt-2 text-xs font-medium text-red-600">
                {fieldErrors.durasiPreferensi}
              </p>
            )}
          </fieldset>

          <fieldset className={`rounded-xl border p-4 ${fieldErrors.tipePenerbangan ? "border-red-300 bg-red-50/30" : "border-black/10"}`}>
            <legend className="px-1 text-sm font-semibold">Tipe Penerbangan</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {([ ["direct", "Direct"], ["transit", "Transit"] ] as const).map(([val, label]) => (
                <label
                  key={val}
                  className={[
                    "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition",
                    form.tipePenerbangan === val
                      ? "border-primary-300 bg-primary-50 ring-1 ring-primary-200 shadow-sm"
                      : "border-black/10 bg-white hover:border-primary-200",
                  ].join(" ")}
                >
                  <input
                    ref={val === "direct" ? refs.penerbanganRef : undefined}
                    type="radio"
                    name="tipe-penerbangan"
                    className="h-4 w-4 accent-primary-600"
                    checked={form.tipePenerbangan === val}
                    onChange={() => onUpdateForm("tipePenerbangan", val)}
                    disabled={controlsDisabled}
                    aria-describedby={fieldErrors.tipePenerbangan ? "error-penerbangan" : undefined}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {fieldErrors.tipePenerbangan && (
              <p id="error-penerbangan" className="mt-2 text-xs font-medium text-red-600">
                {fieldErrors.tipePenerbangan}
              </p>
            )}
          </fieldset>

          <fieldset className={`rounded-xl border p-4 ${fieldErrors.preferJarakHotelMaks ? "border-red-300 bg-red-50/30" : "border-black/10"}`}>
            <legend className="px-1 text-sm font-semibold">Jarak Hotel ke Masjid (meter)</legend>
            <input
              ref={refs.jarakRef}
              type="number"
              min={100}
              max={2000}
              step={50}
              value={form.preferJarakHotelMaks}
              onChange={(e) => onUpdateForm("preferJarakHotelMaks", Number(e.target.value))}
              disabled={controlsDisabled}
              aria-invalid={Boolean(fieldErrors.preferJarakHotelMaks)}
              aria-describedby={fieldErrors.preferJarakHotelMaks ? "error-jarak" : undefined}
              className={[
                "mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200",
                fieldErrors.preferJarakHotelMaks ? "border-red-300 ring-1 ring-red-200" : "border-black/10",
              ].join(" ")}
            />
            <p className="mt-2 text-xs text-slate-500">Contoh: 300</p>
            {fieldErrors.preferJarakHotelMaks && (
              <p id="error-jarak" className="mt-2 text-xs font-medium text-red-600">
                {fieldErrors.preferJarakHotelMaks}
              </p>
            )}
          </fieldset>

          <fieldset className={`rounded-xl border p-4 md:col-span-2 ${fieldErrors.destinasiTambahan ? "border-red-300 bg-red-50/30" : "border-black/10"}`}>
            <legend className="px-1 text-sm font-semibold">Destinasi Tambahan</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {([ ["none", "Tanpa destinasi"], ["Turki", "Turki"], ["Dubai", "Dubai"], ["Mesir", "Mesir"] ] as const).map(([val, label]) => (
                <label
                  key={val}
                  className={[
                    "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition",
                    form.destinasiTambahan === val
                      ? "border-primary-300 bg-primary-50 ring-1 ring-primary-200 shadow-sm"
                      : "border-black/10 bg-white hover:border-primary-200",
                  ].join(" ")}
                >
                  <input
                    ref={val === "none" ? refs.destinasiRef : undefined}
                    type="radio"
                    name="destinasi"
                    className="h-4 w-4 accent-primary-600"
                    checked={form.destinasiTambahan === val}
                    onChange={() => onUpdateForm("destinasiTambahan", val)}
                    disabled={controlsDisabled}
                    aria-describedby={fieldErrors.destinasiTambahan ? "error-destinasi" : undefined}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {fieldErrors.destinasiTambahan && (
              <p id="error-destinasi" className="mt-2 text-xs font-medium text-red-600">
                {fieldErrors.destinasiTambahan}
              </p>
            )}
          </fieldset>
        </div>

        {Object.keys(fieldErrors).length > 0 && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            Periksa kembali field yang ditandai merah sebelum submit ulang.
          </div>
        )}
        {cooldownSeconds > 0 && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Batas permintaan tercapai. Coba lagi dalam {cooldownSeconds} detik.
          </div>
        )}

        <button
          type="submit"
          className={[
            "mt-6 inline-flex w-full items-center justify-center rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-300/40 transition hover:-translate-y-0.5 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60",
            loading ? "animate-pulse-soft" : "",
          ].join(" ")}
          disabled={controlsDisabled}
        >
          {loading ? "Menghitung rekomendasi..." : cooldownSeconds > 0 ? `Coba lagi ${cooldownSeconds} detik` : "Hitung Rekomendasi"}
        </button>
      </div>

      <aside className="space-y-4 lg:self-start">
        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold">Ringkasan Preferensi</h3>
          </div>
          <div className="mt-3 grid gap-1.5">
            {preferenceSummary.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs">
                <span className="text-slate-600">{item.label}</span>
                <span className="max-w-[65%] text-right font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
}
