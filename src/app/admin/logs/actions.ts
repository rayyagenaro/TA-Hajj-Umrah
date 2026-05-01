"use server";

import { revalidatePath } from "next/cache";

import {
  clearAllRecommendationLogs,
  deleteRecommendationLogById,
} from "@/lib/recommendationLogRepository";

export async function clearAllLogsAction() {
  await clearAllRecommendationLogs();
  revalidatePath("/admin/logs");
}

export async function deleteSingleLogAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (Number.isInteger(id) && id > 0) {
    await deleteRecommendationLogById(id);
  }
  revalidatePath("/admin/logs");
}

