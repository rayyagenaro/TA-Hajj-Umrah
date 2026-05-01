import type { PaketKey, TravelPackage } from "@/data/travelPackages";

export type FormState = {
  budget: number;
  usia: number;
  durasiPreferensi: number;
  preferJarakHotelMaks: number;
  tipePenerbangan: "direct" | "transit";
  butuhPendampingan: "ya" | "tidak";
  preferensiHotel: "Standard" | "Mewah" | "Premium";
  tipeTransportasi: "Ekonomi" | "Bisnis" | "Premium";
  destinasiTambahan: "none" | "Turki" | "Dubai" | "Mesir";
  nama: string;
};

export type FieldKey = keyof FormState;
export type FieldErrors = Partial<Record<FieldKey, string>>;

export type ApiRecommendation = { paket: string; label?: string; comment?: string };
export type ApiResponse = { paketUtama: ApiRecommendation | null; paketAlternatif: ApiRecommendation[] };

export type EnrichedRecommendation = ApiRecommendation & {
  displayName: string;
  deskripsi: string;
  href?: string;
};

export type MainTravel = {
  paket: PaketKey;
  label: string;
  packagesByRule: TravelPackage[];
  packagesForMatching: TravelPackage[];
};
