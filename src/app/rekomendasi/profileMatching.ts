import type { TravelPackage } from "@/data/travelPackages";
import type { FormState } from "./types";

export type ProfileScoreBreakdown = {
  total: number;
  budget: number;
  jarakHotel: number;
  transport: number;
  durasi: number;
  usia: number;
};

export type ScoredPackage = TravelPackage & { score: ProfileScoreBreakdown };

export function rankPackagesByProfile(packages: TravelPackage[], form: FormState, limit = 4): ScoredPackage[] {
  return [...packages]
    .map((pkg) => ({
      ...pkg,
      score: getProfileScoreBreakdown(pkg, form),
      parsedBudget: extractRupiah(pkg.price),
    }))
    .sort((a, b) => {
      const aOver = a.parsedBudget > form.budget;
      const bOver = b.parsedBudget > form.budget;
      if (aOver !== bOver) return aOver ? 1 : -1;
      if (a.score.total !== b.score.total) return b.score.total - a.score.total;
      if (a.score.durasi !== b.score.durasi) return b.score.durasi - a.score.durasi;

      const aGap = Math.abs(form.budget - a.parsedBudget);
      const bGap = Math.abs(form.budget - b.parsedBudget);
      return aGap - bGap;
    })
    .slice(0, limit);
}

export function getProfileScoreBreakdown(pkg: TravelPackage, form: FormState): ProfileScoreBreakdown {
  const budget = extractRupiah(pkg.price);
  const budgetScore =
    budget <= 0
      ? 50
      : budget <= form.budget
        ? Math.max(60, 100 - Math.round((Math.abs(form.budget - budget) / Math.max(form.budget, 1)) * 52))
        : Math.max(0, 65 - Math.round(((budget - form.budget) / Math.max(form.budget, 1)) * 200));

  const hotelDistanceMeters = extractHotelDistanceMeters(pkg);
  const distanceScore = getDistanceScore(hotelDistanceMeters, form.preferJarakHotelMaks);

  const inferredFlightType = inferFlightType(pkg.transport);
  const transportScore =
    form.tipePenerbangan === inferredFlightType
      ? 100
      : form.tipePenerbangan === "direct"
        ? 35
        : 70;

  const packageDurationRange = extractPackageDurationRange(pkg.duration);
  const durationScore = getDurationScore(packageDurationRange, form.durasiPreferensi);

  const usiaScore = form.usia >= 55 ? 90 : 100;
  const total = Math.round(
    budgetScore * 0.34 +
      distanceScore * 0.24 +
      transportScore * 0.15 +
      durationScore * 0.22 +
      usiaScore * 0.05,
  );

  return {
    total,
    budget: budgetScore,
    jarakHotel: distanceScore,
    transport: transportScore,
    durasi: durationScore,
    usia: usiaScore,
  };
}

export function extractRupiah(price: string) {
  const numeric = Number.parseInt(price.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(numeric) ? numeric : 0;
}

function getDistanceScore(distanceMeters: number | null, preferredMax: number): number {
  if (!distanceMeters || preferredMax <= 0) return 65;

  if (distanceMeters <= preferredMax) {
    const ratio = distanceMeters / preferredMax;
    return clampScore(Math.round(100 - ratio * 20));
  }

  const overflowRatio = (distanceMeters - preferredMax) / preferredMax;
  return clampScore(Math.round(80 - overflowRatio * 140));
}

function extractHotelDistanceMeters(pkg: TravelPackage): number | null {
  const text = `${pkg.accommodation ?? ""} ${pkg.name ?? ""}`.toLowerCase();
  if (!text.trim()) return null;

  const values: number[] = [];
  const rangeRegex = /(\d{2,4})\s*[-\u2013]\s*(\d{2,4})\s*(?:meter|m)\b/gi;
  let rangeMatch: RegExpExecArray | null;
  let sanitized = text;
  while ((rangeMatch = rangeRegex.exec(text)) !== null) {
    const a = Number(rangeMatch[1]);
    const b = Number(rangeMatch[2]);
    if (Number.isFinite(a) && Number.isFinite(b)) values.push(Math.round((a + b) / 2));
    sanitized = sanitized.replace(rangeMatch[0], " ");
  }

  const singleRegex = /(\d{2,4})\s*(?:meter|m)\b/gi;
  let singleMatch: RegExpExecArray | null;
  while ((singleMatch = singleRegex.exec(sanitized)) !== null) {
    const value = Number(singleMatch[1]);
    if (Number.isFinite(value)) values.push(value);
  }

  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function inferFlightType(transportText: string | undefined): "direct" | "transit" {
  const text = (transportText ?? "").toLowerCase();
  if (!text.trim()) return "transit";

  if (/\b(direct|langsung|non[\s-]?stop)\b/i.test(text)) return "direct";
  if (/\b(transit|connecting|via)\b/i.test(text)) return "transit";

  const isGaruda = /\bgaruda\b|\bga\b/i.test(text);
  if (isGaruda) return "direct";

  const isForeignAirline =
    /\b(saudi|oman|emirates|qatar|etihad|turkish|egyptair|singapore|malaysia|thai|flynas|airarabia|kuwait|gulf)\b/i.test(
      text,
    );

  return isForeignAirline ? "direct" : "transit";
}

export function extractPackageDurationRange(durationText: string | undefined): { min: number; max: number } | null {
  if (!durationText) return null;
  const numbers = durationText
    .match(/\d+/g)
    ?.map((value) => Number(value))
    .filter((value) => Number.isFinite(value)) ?? [];
  if (numbers.length === 0) return null;
  return { min: Math.min(...numbers), max: Math.max(...numbers) };
}

function getDurationScore(durationRange: { min: number; max: number } | null, preferredDays: number): number {
  if (!durationRange || preferredDays <= 0) return 70;
  if (preferredDays >= durationRange.min && preferredDays <= durationRange.max) {
    const center = (durationRange.min + durationRange.max) / 2;
    const centerGap = Math.abs(preferredDays - center);
    const width = Math.max(1, durationRange.max - durationRange.min);
    return clampScore(Math.round(100 - (centerGap / width) * 10));
  }

  const nearest = preferredDays < durationRange.min ? durationRange.min : durationRange.max;
  const gap = Math.abs(preferredDays - nearest);
  let score = 100 - gap * 18;

  // Longer-trip preferences should penalize shorter packages more strongly.
  if (preferredDays >= 12 && durationRange.max < preferredDays) {
    score -= 12;
  }
  if (preferredDays <= 10 && durationRange.min > preferredDays) {
    score -= 8;
  }

  return clampScore(score);
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}
