import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/db/clients";
import { invalid, toResponse } from "@/lib/http-errors";

export const runtime = "nodejs";

const schema = z.object({ courseId: z.string().uuid(), ids: z.array(z.string().uuid()).min(1) });

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw invalid("courseId e ids inválidos");
    const { error } = await createAdminClient().rpc("reorder_lessons", {
      p_course: parsed.data.courseId,
      p_ids: parsed.data.ids,
    });
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (error) {
    return toResponse(error);
  }
}
