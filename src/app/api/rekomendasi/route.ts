import { NextRequest, NextResponse } from "next/server";

import {
  inferRecommendations,
  loadOntologyRules,
  PreferenceInput,
} from "@/lib/ontology";

type RawPayload = {
  budget?: unknown;
  usia?: unknown;
  butuhPendampingan?: unknown;
  preferensiHotel?: unknown;
  tipeTransportasi?: unknown;
  destinasiTambahan?: unknown;
  nama?: unknown;
};

export async function POST(request: NextRequest) {
  try {
    const raw = (await request.json()) as RawPayload | null;
    const input = normalizePayload(raw ?? {});

    const rules = await loadOntologyRules();
    const hasil = inferRecommendations(input, rules);

    return NextResponse.json({
      input,
      paketUtama: hasil.paketUtama,
      paketAlternatif: hasil.paketAlternatif,
      statistik: {
        totalRule: rules.length,
      },
    });
  } catch (error) {
    console.error("Gagal memproses rekomendasi", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memproses rekomendasi." },
      { status: 500 },
    );
  }
}

function normalizePayload(payload: RawPayload): PreferenceInput {
  const ibadah = "Umrah";

  const budget = parseNumber(payload.budget);
  const usia = parseNumber(payload.usia);
  const butuhPendampingan = parseBoolean(payload.butuhPendampingan);

  const preferensiHotel = parseString(payload.preferensiHotel);
  const tipeTransportasi = parseString(payload.tipeTransportasi);
  const destinasiTambahanRaw = parseString(payload.destinasiTambahan);
  const destinasiTambahan = destinasiTambahanRaw && destinasiTambahanRaw !== "none"
    ? destinasiTambahanRaw
    : null;
  const nama = parseString(payload.nama);

  const input: PreferenceInput = {
    ibadah,
    budget: budget ?? undefined,
    usia: usia ?? undefined,
    butuhPendampingan: butuhPendampingan ?? undefined,
    preferensiHotel: preferensiHotel ?? undefined,
    tipeTransportasi: tipeTransportasi ?? undefined,
    destinasiTambahan,
    nama: nama ?? undefined,
  };

  return input;
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function parseBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const lowered = value.toLowerCase();
    if (lowered === "true") return true;
    if (lowered === "false") return false;
  }
  return null;
}

function parseString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }
  return null;
}
