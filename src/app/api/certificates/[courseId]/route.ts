import { requireUser } from "@/lib/auth/guards";
import { generateCertificatePdf } from "@/lib/certificates/generate";
import { issueCertificate } from "@/lib/certificates/issue";
import { createAdminClient } from "@/lib/db/clients";
import { toResponse } from "@/lib/http-errors";
import { productionProgressDeps } from "@/lib/progress-deps";

export const runtime = "nodejs";

export async function GET(_request: Request, ctx: { params: Promise<{ courseId: string }> }) {
  try {
    const user = await requireUser();
    const { courseId } = await ctx.params;
    const db = createAdminClient();
    const progress = productionProgressDeps();

    const { issuedAt } = await issueCertificate(
      { userId: user.id, courseId },
      {
        async getExistingCertificate(userId, cId) {
          const { data } = await db
            .from("certificates")
            .select("issued_at")
            .eq("user_id", userId)
            .eq("course_id", cId)
            .maybeSingle();
          return data;
        },
        hasActiveEnrollment: progress.hasActiveEnrollment,
        async listLessons(cId) {
          const { data } = await db.from("lessons").select("id,archived_at").eq("course_id", cId);
          return data ?? [];
        },
        listWatchedIds: progress.listWatchedIds,
        async saveCertificate(userId, cId) {
          const { data, error } = await db
            .from("certificates")
            .upsert({ user_id: userId, course_id: cId }, { onConflict: "user_id,course_id" })
            .select("issued_at")
            .single();
          if (error) throw error;
          return data;
        },
      },
    );

    const { data: course } = await db.from("courses").select("title").eq("id", courseId).single();
    const pdf = await generateCertificatePdf({
      studentName: user.fullName,
      courseTitle: course?.title ?? "Curso",
      issuedAt: new Date(issuedAt),
    });

    return new Response(Buffer.from(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="certificado-${courseId}.pdf"`,
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    return toResponse(error);
  }
}
