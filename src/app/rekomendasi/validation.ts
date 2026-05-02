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
  if (!isIntegerInRange(form.budget, 10_000_000, 250_000_000)) {
    errors.budget = "Budget harus bilangan bulat di rentang 10.000.000 - 250.000.000.";
  }
  if (!isIntegerInRange(form.usia, 12, 100)) {
    errors.usia = "Usia harus bilangan bulat di rentang 12 - 100.";
  }
  if (!isIntegerInRange(form.durasiPreferensi, 7, 20)) {
    errors.durasiPreferensi = "Durasi harus bilangan bulat di rentang 7 - 20 hari.";
  }
  if (!(form.tipePenerbangan === "direct" || form.tipePenerbangan === "transit")) {
    errors.tipePenerbangan = "Tipe penerbangan harus Direct atau Transit.";
  }
  if (!isIntegerInRange(form.preferJarakHotelMaks, 100, 2000)) {
    errors.preferJarakHotelMaks = "Jarak hotel harus bilangan bulat di rentang 100 - 2000 meter.";
  }
  if (form.nama.trim().length > 120) {
    errors.nama = "Nama maksimal 120 karakter.";
  }
  return errors;
}

function isIntegerInRange(value: number | "", min: number, max: number): boolean {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
}
