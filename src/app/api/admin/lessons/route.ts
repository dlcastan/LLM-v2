import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/db/clients";
import { lessonSchema } from "@/lib/admin/schemas";
import { invalid, toResponse } from "@/lib/http-errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = lessonSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw invalid(parsed.error.issues[0].message);
    const db = createAdminClient();

    const { data: last } = await db
      .from("lessons")
      .select("position")
      .eq("course_id", parsed.data.course_id)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data, error } = await db
      .from("lessons")
      .insert({ ...parsed.data, position: (last?.position ?? 0) + 1 })
      .select()
      .single();
    if (error) throw error;
    return Response.json(data, { status: 201 });
  } catch (error) {
    return toResponse(error);
  }
}
