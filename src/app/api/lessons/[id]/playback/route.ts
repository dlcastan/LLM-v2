import { requireUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/db/clients";
import { serverEnv } from "@/lib/env";
import { toResponse } from "@/lib/http-errors";
import { signEmbedUrl } from "@/lib/video/bunny";
import { getPlayback } from "@/lib/video/playback";

export const runtime = "nodejs";

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const db = createAdminClient();
    const env = serverEnv();

    const result = await getPlayback(
      { userId: user.id, email: user.email, lessonId: id },
      {
        async getLesson(lessonId) {
          const { data } = await db
            .from("lessons")
            .select("id,course_id,bunny_video_id,archived_at")
            .eq("id", lessonId)
            .maybeSingle();
          return data;
        },
        async hasActiveEnrollment(userId, courseId) {
          const { data } = await db
            .from("enrollments")
            .select("id")
            .eq("user_id", userId)
            .eq("course_id", courseId)
            .eq("active", true)
            .maybeSingle();
          return Boolean(data);
        },
        sign: (videoId) =>
          signEmbedUrl({ libraryId: env.BUNNY_LIBRARY_ID, videoId, tokenKey: env.BUNNY_TOKEN_KEY }),
      },
    );
    return Response.json(result, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return toResponse(error);
  }
}
