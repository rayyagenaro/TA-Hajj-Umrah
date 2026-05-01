import type { PreferenceInput, InferenceResult } from "@/lib/ontology";
import { isSupabaseConfigured, supabaseRest } from "@/lib/supabaseServer";

export type RecommendationLogRow = {
  id: number;
  created_at: string;
  client_ip: string | null;
  nama: string | null;
  budget: number | null;
  usia: number | null;
  butuh_pendampingan: number | null;
  preferensi_hotel: string | null;
  tipe_transportasi: string | null;
  destinasi_tambahan: string | null;
  paket_utama: string | null;
  alternatif_count: number;
  status: string;
};

export async function saveRecommendationLog(params: {
  input: PreferenceInput;
  result: InferenceResult;
  clientIp: string;
}) {
  if (!isSupabaseConfigured()) return;

  const { input, result, clientIp } = params;
  try {
    const payload = {
      client_ip: clientIp,
      nama: input.nama ?? null,
      budget: input.budget ?? null,
      usia: input.usia ?? null,
      butuh_pendampingan: input.butuhPendampingan ?? null,
      preferensi_hotel: input.preferensiHotel ?? null,
      tipe_transportasi: input.tipeTransportasi ?? null,
      destinasi_tambahan: input.destinasiTambahan ?? null,
      paket_utama: result.paketUtama?.paket ?? null,
      alternatif_count: result.paketAlternatif.length,
      status: "success",
    };

    await supabaseRest("recommendation_logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.warn("Gagal menyimpan recommendation log ke Supabase.", error);
  }
}

export async function getRecentRecommendationLogs(limit = 100): Promise<RecommendationLogRow[]> {
  if (!isSupabaseConfigured()) return [];

  const safeLimit = Math.max(1, Math.min(500, Math.floor(limit)));
  return supabaseRest<RecommendationLogRow[]>(
    `recommendation_logs?select=id,created_at,client_ip,nama,budget,usia,butuh_pendampingan,preferensi_hotel,tipe_transportasi,destinasi_tambahan,paket_utama,alternatif_count,status&order=id.desc&limit=${safeLimit}`,
  );
}

export async function deleteRecommendationLogById(id: number): Promise<void> {
  if (!isSupabaseConfigured()) return;

  if (!Number.isInteger(id) || id <= 0) return;
  await supabaseRest(`recommendation_logs?id=eq.${id}`, {
    method: "DELETE",
    headers: {
      Prefer: "return=minimal",
    },
  });
}

export async function clearAllRecommendationLogs(): Promise<void> {
  if (!isSupabaseConfigured()) return;

  await supabaseRest("recommendation_logs?id=gte.0", {
    method: "DELETE",
    headers: {
      Prefer: "return=minimal",
    },
  });
}

export { isSupabaseConfigured as isRecommendationLogsConfigured };
