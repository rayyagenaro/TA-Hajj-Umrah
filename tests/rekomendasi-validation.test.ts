import test from "node:test";
import assert from "node:assert/strict";
import { validateClientForm } from "../src/app/rekomendasi/validation";
import type { FormState } from "../src/app/rekomendasi/types";

const validForm: FormState = {
  budget: 32_000_000,
  usia: 40,
  preferJarakHotelMaks: 500,
  durasiPreferensi: 12,
  tipePenerbangan: "transit",
  butuhPendampingan: "tidak",
  preferensiHotel: "Standard",
  tipeTransportasi: "Ekonomi",
  destinasiTambahan: "none",
  nama: "Test User",
};

test("returns empty errors for valid form", () => {
  const errors = validateClientForm(validForm);
  assert.deepEqual(errors, {});
});

test("returns nama required error when empty", () => {
  const errors = validateClientForm({ ...validForm, nama: "   " });
  assert.equal(errors.nama, "Nama wajib diisi.");
});

test("returns budget error when out of range", () => {
  const errors = validateClientForm({ ...validForm, budget: 5_000_000 });
  assert.equal(errors.budget, "Budget harus bilangan bulat di rentang 10.000.000 - 250.000.000.");
});

test("returns usia error when out of range", () => {
  const errors = validateClientForm({ ...validForm, usia: 101 });
  assert.equal(errors.usia, "Usia harus bilangan bulat di rentang 12 - 100.");
});

test("returns jarak hotel error when out of range", () => {
  const errors = validateClientForm({ ...validForm, preferJarakHotelMaks: 90 });
  assert.equal(errors.preferJarakHotelMaks, "Jarak hotel harus bilangan bulat di rentang 100 - 2000 meter.");
});

test("returns durasi error when out of range", () => {
  const errors = validateClientForm({ ...validForm, durasiPreferensi: 30 });
  assert.equal(errors.durasiPreferensi, "Durasi harus bilangan bulat di rentang 7 - 20 hari.");
});

test("returns nama error when too long", () => {
  const errors = validateClientForm({ ...validForm, nama: "a".repeat(121) });
  assert.equal(errors.nama, "Nama maksimal 120 karakter.");
});

