import { requireAdmin } from "@/lib/auth/guards";
import { toResponse } from "@/lib/http-errors";
import { productionPaymentDeps } from "@/lib/payments";
import { verifyAndForce } from "@/lib/payments/admin-verify";

export const runtime = "nodejs";

export async function POST(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    return Response.json(await verifyAndForce(id, productionPaymentDeps()));
  } catch (error) {
    return toResponse(error);
  }
}
