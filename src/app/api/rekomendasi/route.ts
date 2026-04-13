import { NextRequest, NextResponse } from "next/server";

import {
  inferRecommendations,
  loadOntologyRules,
  PreferenceInput,
} from "@/lib/ontology";
import { saveRecommendationLog } from "@/lib/recommendationLogRepository";

type RawPayload = {
  budget?: unknown;
  usia?: unknown;
  butuhPendampingan?: unknown;
  preferensiHotel?: unknown;
  tipeTransportasi?: unknown;
  destinasiTambahan?: unknown;
  durasiPreferensi?: unknown;
  preferDirectFlight?: unknown;
  preferJarakHotelMaks?: unknown;
  butuhPrivate?: unknown;
  jumlahJamaah?: unknown;
  musimPreferensi?: unknown;
  preferDestinasi?: unknown;
  nama?: unknown;
};

type FieldKey =
  | "budget"
  | "usia"
  | "butuhPendampingan"
  | "preferensiHotel"
  | "tipeTransportasi"
  | "destinasiTambahan"
  | "nama";

type ValidationResult =
  | { ok: true; input: PreferenceInput }
  | { ok: false; errors: string[]; fieldErrors: Partial<Record<FieldKey, string>> };

const HOTEL_OPTIONS = ["Standard", "Mewah", "Premium"] as const;
const TRANSPORT_OPTIONS = ["Ekonomi", "Bisnis", "Premium"] as const;
const DESTINASI_OPTIONS = ["none", "Turki", "Dubai", "Mesir"] as const;
const MUSIM_OPTIONS = ["NormalSeason", "HighSeason"] as const;
const DESTINASI_RULE_OPTIONS = ["None", "Turki", "Dubai", "Mesir"] as const;
const MAX_NAME_LENGTH = 120;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function __resetRateLimitForTests() {
  rateLimitStore.clear();
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const limiter = checkRateLimit(clientIp);
    if (!limiter.allowed) {
      return NextResponse.json(
        { message: "Terlalu banyak permintaan. Coba lagi sebentar." },
        {
          status: 429,
          headers: {
            "Retry-After": String(limiter.retryAfterSec),
          },
        },
      );
    }

    const raw = (await request.json()) as RawPayload | null;
    const validated = validatePayload(raw ?? {});
    if (!validated.ok) {
      return NextResponse.json(
        {
          message: "Input tidak valid.",
          errors: validated.errors,
          fieldErrors: validated.fieldErrors,
        },
        { status: 400 },
      );
    }
    const input = validated.input;

    const rules = await loadOntologyRules();
    const hasil = inferRecommendations(input, rules);
    void saveRecommendationLog({
      input,
      result: hasil,
      clientIp,
    });

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

function validatePayload(payload: RawPayload): ValidationResult {
  const errors: string[] = [];
  const fieldErrors: Partial<Record<FieldKey, string>> = {};
  const ibadah = "Umrah";

  const budget = parseNumber(payload.budget);
  if (budget === null) {
    pushFieldError(fieldErrors, errors, "budget", "Budget wajib berupa angka.");
  } else if (!Number.isInteger(budget) || budget < 10_000_000 || budget > 250_000_000) {
    pushFieldError(fieldErrors, errors, "budget", "Budget harus bilangan bulat di rentang 10.000.000 - 250.000.000.");
  }

  const usia = parseNumber(payload.usia);
  if (usia === null) {
    pushFieldError(fieldErrors, errors, "usia", "Usia wajib berupa angka.");
  } else if (!Number.isInteger(usia) || usia < 12 || usia > 100) {
    pushFieldError(fieldErrors, errors, "usia", "Usia harus bilangan bulat di rentang 12 - 100.");
  }

  const butuhPendampingan = parseBoolean(payload.butuhPendampingan);
  if (butuhPendampingan === null) {
    pushFieldError(fieldErrors, errors, "butuhPendampingan", "Butuh pendampingan wajib berupa true/false.");
  }

  const preferensiHotel = parseString(payload.preferensiHotel);
  if (!preferensiHotel || !isOneOf(preferensiHotel, HOTEL_OPTIONS)) {
    pushFieldError(fieldErrors, errors, "preferensiHotel", "Preferensi hotel harus salah satu: Standard, Mewah, Premium.");
  }

  const tipeTransportasi = parseString(payload.tipeTransportasi);
  if (!tipeTransportasi || !isOneOf(tipeTransportasi, TRANSPORT_OPTIONS)) {
    pushFieldError(fieldErrors, errors, "tipeTransportasi", "Tipe transportasi harus salah satu: Ekonomi, Bisnis, Premium.");
  }

  const destinasiTambahanRaw = parseString(payload.destinasiTambahan);
  if (!destinasiTambahanRaw || !isOneOf(destinasiTambahanRaw, DESTINASI_OPTIONS)) {
    pushFieldError(
      fieldErrors,
      errors,
      "destinasiTambahan",
      "Destinasi tambahan harus salah satu: none, Turki, Dubai, Mesir.",
    );
  }
  const destinasiTambahan = destinasiTambahanRaw && destinasiTambahanRaw !== "none"
    ? destinasiTambahanRaw
    : null;

  const durasiPreferensiRaw = parseNumber(payload.durasiPreferensi);
  const durasiPreferensi =
    durasiPreferensiRaw !== null && Number.isInteger(durasiPreferensiRaw) && durasiPreferensiRaw >= 7 && durasiPreferensiRaw <= 20
      ? durasiPreferensiRaw
      : 12;

  const preferDirectFlightRaw = parseBoolean(payload.preferDirectFlight);
  const preferDirectFlight = preferDirectFlightRaw ?? (tipeTransportasi ? tipeTransportasi !== "Ekonomi" : undefined);

  const preferJarakHotelMaksRaw = parseNumber(payload.preferJarakHotelMaks);
  const preferJarakHotelMaks =
    preferJarakHotelMaksRaw !== null &&
      Number.isInteger(preferJarakHotelMaksRaw) &&
      preferJarakHotelMaksRaw >= 100 &&
      preferJarakHotelMaksRaw <= 2000
      ? preferJarakHotelMaksRaw
      : (preferensiHotel ? mapHotelToMaxDistance(preferensiHotel) : undefined);

  const butuhPrivateRaw = parseBoolean(payload.butuhPrivate);
  const butuhPrivate = butuhPrivateRaw ?? false;

  const jumlahJamaahRaw = parseNumber(payload.jumlahJamaah);
  const jumlahJamaah =
    jumlahJamaahRaw !== null && Number.isInteger(jumlahJamaahRaw) && jumlahJamaahRaw >= 1 && jumlahJamaahRaw <= 20
      ? jumlahJamaahRaw
      : 1;

  const musimPreferensiRaw = parseString(payload.musimPreferensi);
  const musimPreferensi = musimPreferensiRaw && isOneOf(musimPreferensiRaw, MUSIM_OPTIONS)
    ? musimPreferensiRaw
    : "NormalSeason";

  const preferDestinasiRaw = parseString(payload.preferDestinasi);
  const fallbackDestinasi = destinasiTambahan ?? "None";
  const preferDestinasi = preferDestinasiRaw && isOneOf(preferDestinasiRaw, DESTINASI_RULE_OPTIONS)
    ? preferDestinasiRaw
    : fallbackDestinasi;

  const nama = parseString(payload.nama);
  if (!nama) {
    pushFieldError(fieldErrors, errors, "nama", "Nama wajib diisi.");
  } else if (nama.length > MAX_NAME_LENGTH) {
    pushFieldError(fieldErrors, errors, "nama", `Nama maksimal ${MAX_NAME_LENGTH} karakter.`);
  }

  if (errors.length > 0) {
    return { ok: false, errors, fieldErrors };
  }

  const input: PreferenceInput = {
    ibadah,
    budget: budget!,
    usia: usia!,
    butuhPendampingan: butuhPendampingan!,
    butuhPrivate,
    durasiPreferensi,
    preferDirectFlight,
    preferJarakHotelMaks,
    jumlahJamaah,
    musimPreferensi,
    preferDestinasi,
    preferensiHotel: preferensiHotel!,
    tipeTransportasi: tipeTransportasi!,
    destinasiTambahan,
    nama,
  };

  return { ok: true, input };
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

function isOneOf<T extends readonly string[]>(value: string, options: T): value is T[number] {
  return options.includes(value);
}

function pushFieldError(
  fieldErrors: Partial<Record<FieldKey, string>>,
  errors: string[],
  key: FieldKey,
  message: string,
) {
  if (!fieldErrors[key]) fieldErrors[key] = message;
  errors.push(message);
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown";
}

function checkRateLimit(clientIp: string): { allowed: true } | { allowed: false; retryAfterSec: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(clientIp);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return { allowed: false, retryAfterSec };
  }

  entry.count += 1;
  rateLimitStore.set(clientIp, entry);
  return { allowed: true };
}

function mapHotelToMaxDistance(hotel: string): number {
  switch (hotel) {
    case "Standard":
      return 500;
    case "Mewah":
      return 300;
    case "Premium":
      return 200;
    default:
      return 500;
  }
}
