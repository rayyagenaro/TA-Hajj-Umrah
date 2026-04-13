import type { PreferenceInput, InferenceResult } from "@/lib/ontology";
import { getMySqlPool } from "@/lib/mysql";

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
  const pool = getMySqlPool();
  if (!pool) return;

  const { input, result, clientIp } = params;
  try {
    await pool.execute(
      `INSERT INTO recommendation_logs (
        created_at,
        client_ip,
        nama,
        budget,
        usia,
        butuh_pendampingan,
        preferensi_hotel,
        tipe_transportasi,
        destinasi_tambahan,
        paket_utama,
        alternatif_count,
        status
      ) VALUES (
        NOW(),
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
      )`,
      [
        clientIp,
        input.nama ?? null,
        input.budget ?? null,
        input.usia ?? null,
        input.butuhPendampingan ?? null,
        input.preferensiHotel ?? null,
        input.tipeTransportasi ?? null,
        input.destinasiTambahan ?? null,
        result.paketUtama?.paket ?? null,
        result.paketAlternatif.length,
        "success",
      ],
    );
  } catch (error) {
    console.warn("Gagal menyimpan recommendation log ke MySQL.", error);
  }
}

export async function getRecentRecommendationLogs(limit = 100): Promise<RecommendationLogRow[]> {
  const pool = getMySqlPool();
  if (!pool) return [];

  const safeLimit = Math.max(1, Math.min(500, Math.floor(limit)));
  const [rows] = await pool.query(
    `SELECT
      id,
      created_at,
      client_ip,
      nama,
      budget,
      usia,
      butuh_pendampingan,
      preferensi_hotel,
      tipe_transportasi,
      destinasi_tambahan,
      paket_utama,
      alternatif_count,
      status
    FROM recommendation_logs
    ORDER BY id DESC
    LIMIT ?`,
    [safeLimit],
  );
  return rows as RecommendationLogRow[];
}
