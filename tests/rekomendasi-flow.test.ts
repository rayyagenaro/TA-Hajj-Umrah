import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { validateClientForm } from "../src/app/rekomendasi/validation";
import { __resetRateLimitForTests, POST } from "../src/app/api/rekomendasi/route";
import type { FormState } from "../src/app/rekomendasi/types";

test.beforeEach(() => {
  __resetRateLimitForTests();
});

const baseForm: FormState = {
  budget: 32_000_000,
  usia: 40,
  preferJarakHotelMaks: 500,
  durasiPreferensi: 12,
  tipePenerbangan: "transit",
  butuhPendampingan: "tidak",
  preferensiHotel: "Standard",
  tipeTransportasi: "Ekonomi",
  destinasiTambahan: "none",
  nama: "Flow Test",
};

test("invalid flow: blocked by client validation before API request", () => {
  const clientErrors = validateClientForm({ ...baseForm, budget: 5_000_000 });
  assert.equal(clientErrors.budget, "Budget harus bilangan bulat di rentang 10.000.000 - 250.000.000.");
});

test("valid flow: passes client validation and receives recommendation from API", async () => {
  const clientErrors = validateClientForm(baseForm);
  assert.deepEqual(clientErrors, {});

  const req = new NextRequest("http://localhost/api/rekomendasi", {
    method: "POST",
    body: JSON.stringify({
      budget: baseForm.budget,
      usia: baseForm.usia,
      butuhPendampingan: baseForm.butuhPendampingan === "ya",
      preferensiHotel: baseForm.preferensiHotel,
      tipeTransportasi: baseForm.tipeTransportasi,
      preferJarakHotelMaks: baseForm.preferJarakHotelMaks,
      durasiPreferensi: baseForm.durasiPreferensi,
      destinasiTambahan: baseForm.destinasiTambahan,
      nama: baseForm.nama,
    }),
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.44" },
  });

  const res = await POST(req);
  assert.equal(res.status, 200);

  const json = (await res.json()) as { paketUtama?: { paket?: string } | null };
  assert.ok(json.paketUtama?.paket);
});
