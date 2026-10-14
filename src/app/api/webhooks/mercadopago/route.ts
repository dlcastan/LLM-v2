import { serverEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { productionPaymentDeps } from "@/lib/payments";
import { processPayment } from "@/lib/payments/process-payment";
import { verifyWebhookSignature } from "@/lib/payments/verify-signature";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const body = (await request.json().catch(() => ({}))) as {
    type?: string;
    data?: { id?: string | number };
  };
  const dataId = String(body.data?.id ?? url.searchParams.get("data.id") ?? "");

  const valid = verifyWebhookSignature({
    signatureHeader: request.headers.get("x-signature"),
    requestId: request.headers.get("x-request-id"),
    dataId,
    secret: serverEnv().MP_WEBHOOK_SECRET,
  });
  if (!valid) {
    logger.warn("webhook.invalid_signature", { dataId });
    return Response.json({ error: "Firma inválida" }, { status: 401 });
  }

  // Solo nos interesan los pagos; el resto se confirma sin procesar
  if ((body.type ?? url.searchParams.get("type")) !== "payment" || !dataId) {
    return Response.json({ ok: true, ignored: true });
  }

  try {
    const result = await processPayment(dataId, productionPaymentDeps());
    return Response.json({ ok: true, status: result.to });
  } catch (error) {
    // Error transitorio: 500 para que Mercado Pago reintente
    logger.error("webhook.failed", { dataId, error: String(error) });
    return Response.json({ error: "Error procesando el pago" }, { status: 500 });
  }
}
