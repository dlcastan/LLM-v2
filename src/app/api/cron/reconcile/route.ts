import { serverEnv } from "@/lib/env";
import { productionPaymentDeps } from "@/lib/payments";
import { reconcilePending } from "@/lib/payments/reconcile";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${serverEnv().CRON_SECRET}`) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const report = await reconcilePending(productionPaymentDeps());
  return Response.json(report);
}
