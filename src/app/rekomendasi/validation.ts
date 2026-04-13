import type { FieldErrors, FormState } from "./types";

export const FIELD_ORDER: Array<keyof FormState> = [
  "nama",
  "budget",
  "usia",
  "butuhPendampingan",
  "preferensiHotel",
  "tipeTransportasi",
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
  if (form.nama.trim().length > 120) {
    errors.nama = "Nama maksimal 120 karakter.";
  }
  return errors;
}
