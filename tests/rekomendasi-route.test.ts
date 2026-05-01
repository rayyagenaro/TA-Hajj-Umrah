import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "../src/app/api/rekomendasi/route";
import { resetRecommendationRateLimitForTests } from "../src/lib/rateLimit";

test.beforeEach(() => {
  resetRecommendationRateLimitForTests();
});

test("returns 400 for invalid payload and exposes fieldErrors", async () => {
  const req = new NextRequest("http://localhost/api/rekomendasi", {
    method: "POST",
    body: JSON.stringify({
      budget: 1_000_000,
      usia: 8,
      butuhPendampingan: "invalid",
      preferensiHotel: "Lux",
      tipeTransportasi: "First",
      destinasiTambahan: "Mars",
      nama: "a".repeat(130),
    }),
    headers: { "content-type": "application/json" },
  });

  const res = await POST(req);
  assert.equal(res.status, 400);

  const json = (await res.json()) as {
    message?: string;
    errors?: string[];
    fieldErrors?: Record<string, string>;
  };
  assert.equal(json.message, "Input tidak valid.");
  assert.ok(Array.isArray(json.errors));
  assert.ok((json.errors?.length ?? 0) > 0);
  assert.equal(json.fieldErrors?.budget, "Budget harus bilangan bulat di rentang 10.000.000 - 250.000.000.");
  assert.equal(json.fieldErrors?.usia, "Usia harus bilangan bulat di rentang 12 - 100.");
});

test("returns 400 when nama is empty", async () => {
  const req = new NextRequest("http://localhost/api/rekomendasi", {
    method: "POST",
    body: JSON.stringify({
      budget: 32_000_000,
      usia: 40,
      butuhPendampingan: false,
      preferensiHotel: "Standard",
      tipeTransportasi: "Ekonomi",
      destinasiTambahan: "none",
      nama: "   ",
    }),
    headers: { "content-type": "application/json" },
  });

  const res = await POST(req);
  assert.equal(res.status, 400);

  const json = (await res.json()) as { fieldErrors?: Record<string, string> };
  assert.equal(json.fieldErrors?.nama, "Nama wajib diisi.");
});

test("returns 200 and recommendation payload for valid input", async () => {
  const req = new NextRequest("http://localhost/api/rekomendasi", {
    method: "POST",
    body: JSON.stringify({
      budget: 32_000_000,
      usia: 40,
      butuhPendampingan: false,
      preferensiHotel: "Standard",
      tipeTransportasi: "Ekonomi",
      destinasiTambahan: "none",
      nama: "Test User",
    }),
    headers: { "content-type": "application/json" },
  });

  const res = await POST(req);
  assert.equal(res.status, 200);

  const json = (await res.json()) as {
    input?: { ibadah?: string; budget?: number; usia?: number; destinasiTambahan?: string | null };
    paketAlternatif?: unknown[];
    statistik?: { totalRule?: number };
  };

  assert.equal(json.input?.ibadah, "Umrah");
  assert.equal(json.input?.budget, 32_000_000);
  assert.equal(json.input?.usia, 40);
  assert.equal(json.input?.destinasiTambahan, null);
  assert.ok(Array.isArray(json.paketAlternatif));
  assert.ok((json.statistik?.totalRule ?? 0) > 0);
});

test("returns 429 when a client exceeds request limit", async () => {
  const headers = {
    "content-type": "application/json",
    "x-forwarded-for": "198.51.100.10",
  };
  const body = JSON.stringify({
    budget: 32_000_000,
    usia: 40,
    butuhPendampingan: false,
    preferensiHotel: "Standard",
    tipeTransportasi: "Ekonomi",
    destinasiTambahan: "none",
    nama: "Spam Test",
  });

  let lastStatus = 200;
  let lastRetryAfter: string | null = null;
  for (let i = 0; i < 31; i += 1) {
    const req = new NextRequest("http://localhost/api/rekomendasi", { method: "POST", headers, body });
    const res = await POST(req);
    lastStatus = res.status;
    lastRetryAfter = res.headers.get("Retry-After");
  }

  assert.equal(lastStatus, 429);
  assert.ok(lastRetryAfter !== null);
});
