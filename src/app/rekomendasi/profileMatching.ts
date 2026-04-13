import type { TravelPackage } from "@/data/travelPackages";
import type { FormState } from "./types";

export type ProfileScoreBreakdown = {
  total: number;
  budget: number;
  hotel: number;
  transport: number;
  usia: number;
};

export type ScoredPackage = TravelPackage & { score: ProfileScoreBreakdown };

export function rankPackagesByProfile(packages: TravelPackage[], form: FormState, limit = 4): ScoredPackage[] {
  return [...packages]
    .map((pkg) => ({ ...pkg, score: getProfileScoreBreakdown(pkg, form) }))
    .sort((a, b) => b.score.total - a.score.total)
    .slice(0, limit);
}

export function getProfileScoreBreakdown(pkg: TravelPackage, form: FormState): ProfileScoreBreakdown {
  const budget = extractRupiah(pkg.price);
  const budgetScore =
    budget <= 0 ? 50 : Math.max(0, 100 - Math.round((Math.abs(form.budget - budget) / Math.max(form.budget, budget)) * 100));

  const hotelText = `${pkg.accommodation ?? ""} ${pkg.name}`.toLowerCase();
  const transportText = `${pkg.transport ?? ""} ${pkg.name}`.toLowerCase();

  const hotelScore =
    form.preferensiHotel === "Standard"
      ? hotelText.includes("3") || hotelText.includes("standard")
        ? 100
        : 70
      : form.preferensiHotel === "Mewah"
        ? hotelText.includes("4") || hotelText.includes("mewah")
          ? 100
          : 70
        : hotelText.includes("5") || hotelText.includes("premium")
          ? 100
          : 70;

  const transportScore =
    form.tipeTransportasi === "Ekonomi"
      ? transportText.includes("ekonomi")
        ? 100
        : 75
      : form.tipeTransportasi === "Bisnis"
        ? transportText.includes("bisnis")
          ? 100
          : 75
        : transportText.includes("premium") || transportText.includes("emirates")
          ? 100
          : 75;

  const usiaScore = form.usia >= 55 ? 90 : 100;
  const total = Math.round(budgetScore * 0.45 + hotelScore * 0.2 + transportScore * 0.2 + usiaScore * 0.15);

  return { total, budget: budgetScore, hotel: hotelScore, transport: transportScore, usia: usiaScore };
}

function extractRupiah(price: string) {
  const numeric = Number.parseInt(price.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(numeric) ? numeric : 0;
}
