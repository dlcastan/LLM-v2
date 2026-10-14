import { z } from "zod";
import { requireUser } from "@/lib/auth/guards";
import { invalid, toResponse } from "@/lib/http-errors";
import { productionProgressDeps } from "@/lib/progress-deps";
import { setLessonProgress } from "@/lib/progress-service";

export const runtime = "nodejs";

const bodySchema = z.object({ watched: z.boolean() });

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw invalid("watched debe ser booleano");
    const { id } = await ctx.params;

    const summary = await setLessonProgress(
      { userId: user.id, lessonId: id, watched: parsed.data.watched },
      productionProgressDeps(),
    );
    return Response.json(summary);
  } catch (error) {
    return toResponse(error);
  }
}
