import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/db/clients";
import { courseSchema } from "@/lib/admin/schemas";
import { invalid, toResponse } from "@/lib/http-errors";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    const { data, error } = await createAdminClient()
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return Response.json(data);
  } catch (error) {
    return toResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = courseSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw invalid(parsed.error.issues[0].message);
    const { data, error } = await createAdminClient().from("courses").insert(parsed.data).select().single();
    if (error) throw error;
    return Response.json(data, { status: 201 });
  } catch (error) {
    return toResponse(error);
  }
}
