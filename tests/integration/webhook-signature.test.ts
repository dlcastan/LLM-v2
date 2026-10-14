import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyWebhookSignature } from "@/lib/payments/verify-signature";

const secret = "s3cret";

function sign(dataId: string, requestId: string, ts: string) {
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  return createHmac("sha256", secret).update(manifest).digest("hex");
}

describe("firma del webhook", () => {
  it("acepta una firma válida", () => {
    const ts = "1700000000";
    const v1 = sign("123", "req-1", ts);
    expect(
      verifyWebhookSignature({ signatureHeader: `ts=${ts},v1=${v1}`, requestId: "req-1", dataId: "123", secret }),
    ).toBe(true);
  });

  it("rechaza una firma inválida", () => {
    expect(
      verifyWebhookSignature({
        signatureHeader: "ts=1700000000,v1=deadbeef",
        requestId: "req-1",
        dataId: "123",
        secret,
      }),
    ).toBe(false);
  });

  it("rechaza un encabezado ausente o mal formado", () => {
    expect(verifyWebhookSignature({ signatureHeader: null, requestId: "r", dataId: "1", secret })).toBe(false);
    expect(verifyWebhookSignature({ signatureHeader: "basura", requestId: "r", dataId: "1", secret })).toBe(false);
  });
});
