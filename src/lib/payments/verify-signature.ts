import { createHmac, timingSafeEqual } from "node:crypto";

interface VerifyInput {
  signatureHeader: string | null;
  requestId: string | null;
  dataId: string | null;
  secret: string;
}

/**
 * Valida el header `x-signature` de Mercado Pago:
 * HMAC-SHA256 del manifest `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`.
 */
export function verifyWebhookSignature({
  signatureHeader,
  requestId,
  dataId,
  secret,
}: VerifyInput): boolean {
  if (!signatureHeader || !requestId || !dataId) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((kv) => {
      const [k, ...v] = kv.trim().split("=");
      return [k, v.join("=")];
    }),
  );
  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  // MP documenta que un data.id alfanumérico va en minúsculas en el manifest
  const id = /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId;
  const manifest = `id:${id};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(v1, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}
