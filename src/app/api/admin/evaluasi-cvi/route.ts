import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/mysql";
import type { RowDataPacket } from "mysql2";

interface EvaluationPayload {
  evaluatorName: string;
  evaluatorRole: string;
  evaluatorExperience: string;
  items: Array<{
    id: string;
    aspect: string;
    number: string;
    question: string;
    rating: number;
    notes: string;
  }>;
  cvis: Array<{
    name: string;
    iCVI: number;
    valid: number;
    total: number;
  }>;
  sCVI: number;
  generalFeedback: string;
  suggestions: string;
  submittedAt: string;
}

export async function POST(req: NextRequest) {
  try {
    const payload: EvaluationPayload = await req.json();

    // Validate
    if (!payload.evaluatorName || payload.items.length === 0) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    const connection = await getConnection();

    // Insert ke tabel evaluation_cvi
    const query = `
      INSERT INTO evaluation_cvi (
        evaluator_name,
        evaluator_role,
        evaluator_experience,
        s_cvi_score,
        items_json,
        cvis_json,
        general_feedback,
        suggestions,
        submitted_at,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    await connection.execute(query, [
      payload.evaluatorName,
      payload.evaluatorRole || null,
      payload.evaluatorExperience ? parseInt(payload.evaluatorExperience) : null,
      payload.sCVI,
      JSON.stringify(payload.items),
      JSON.stringify(payload.cvis),
      payload.generalFeedback || null,
      payload.suggestions || null,
      new Date(payload.submittedAt),
    ]);

    connection.release();

    return NextResponse.json(
      {
        message: "✅ Evaluasi berhasil disimpan",
        sCVI: payload.sCVI,
        status: payload.sCVI >= 0.78 ? "VALID" : payload.sCVI >= 0.7 ? "MINOR_FIX" : "MAJOR_REVISE",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error saving evaluation:", error);
    return NextResponse.json(
      {
        message: "Gagal menyimpan evaluasi",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const connection = await getConnection();

    const query = `
      SELECT 
        id,
        evaluator_name,
        evaluator_role,
        evaluator_experience,
        s_cvi_score,
        general_feedback,
        suggestions,
        submitted_at,
        created_at
      FROM evaluation_cvi
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const [rows] = await connection.execute<RowDataPacket[]>(query);
    connection.release();

    return NextResponse.json({
      success: true,
      data: rows,
      total: rows.length,
    });
  } catch (error) {
    console.error("Error fetching evaluations:", error);
    return NextResponse.json(
      {
        message: "Gagal mengambil data evaluasi",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
