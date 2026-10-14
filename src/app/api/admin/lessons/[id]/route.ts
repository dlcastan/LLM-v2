import { requireAdmin } from "@/lib/auth/guards";
import { productionCatalogDeps } from "@/lib/admin/catalog-deps";
import { removeLesson } from "@/lib/admin/catalog";
import { createAdminClient } from "@/lib/db/clients";
import { invalid, toResponse } from "@/lib/http-errors";
import { lessonSchema } from "@/lib/admin/schemas";

export const runtime = "nodejs";

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const parsed = lessonSchema.omit({ course_id: true }).partial().safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw invalid(parsed.error.issues[0].message);
    const { data, error } = await createAdminClient().from("lessons").update(parsed.data).eq("id", id).select().single();
    if (error) throw error;
    return Response.json(data);
  } catch (error) {
    return toResponse(error);
  }
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    return Response.json({ result: await removeLesson(id, productionCatalogDeps()) });
  } catch (error) {
    return toResponse(error);
  }
}
