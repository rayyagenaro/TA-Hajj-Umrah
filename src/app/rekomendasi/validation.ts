import type { FieldErrors, FormState } from "./types";

export const FIELD_ORDER: Array<keyof FormState> = [
  "nama",
  "budget",
  "usia",
  "durasiPreferensi",
  "tipePenerbangan",
  "preferJarakHotelMaks",
  "destinasiTambahan",
];

export function validateClientForm(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (form.nama.trim().length === 0) {
    errors.nama = "Nama wajib diisi.";
  }
  if (!Number.isInteger(form.budget) || form.budget < 10_000_000 || form.budget > 250_000_000) {
    errors.budget = "Budget harus bilangan bulat di rentang 10.000.000 - 250.000.000.";
  }
  if (!Number.isInteger(form.usia) || form.usia < 12 || form.usia > 100) {
    errors.usia = "Usia harus bilangan bulat di rentang 12 - 100.";
  }
  if (!Number.isInteger(form.durasiPreferensi) || form.durasiPreferensi < 7 || form.durasiPreferensi > 20) {
    errors.durasiPreferensi = "Durasi harus bilangan bulat di rentang 7 - 20 hari.";
  }
  if (!(form.tipePenerbangan === "direct" || form.tipePenerbangan === "transit")) {
    errors.tipePenerbangan = "Tipe penerbangan harus Direct atau Transit.";
  }
  if (!Number.isInteger(form.preferJarakHotelMaks) || form.preferJarakHotelMaks < 100 || form.preferJarakHotelMaks > 2000) {
    errors.preferJarakHotelMaks = "Jarak hotel harus bilangan bulat di rentang 100 - 2000 meter.";
  }
  if (form.nama.trim().length > 120) {
    errors.nama = "Nama maksimal 120 karakter.";
  }
  return errors;
}
