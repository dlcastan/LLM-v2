import { notFound } from "@/lib/http-errors";
import type { PurchaseStatus } from "@/lib/db/types";
import { latestPayment } from "./latest";
import { applyPayment, type ProcessDeps } from "./process-payment";

export type VerifyResult =
  | { found: false }
  | { found: true; mpStatus: string; status: PurchaseStatus; changed: boolean };

/** Verifica una compra contra Mercado Pago y aplica su estado real sin esperar la conciliación (FR-018). */
export async function verifyAndForce(purchaseId: string, deps: ProcessDeps): Promise<VerifyResult> {
  const purchase = await deps.store.getPurchase(purchaseId);
  if (!purchase) throw notFound("Compra");

  const payment = latestPayment(await deps.gateway.findPaymentsByReference(purchaseId));
  if (!payment) return { found: false };

  const result = await applyPayment(payment, deps);
  return { found: true, mpStatus: payment.status, status: result.to, changed: result.from !== result.to };
}
