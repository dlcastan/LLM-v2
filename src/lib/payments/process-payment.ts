import { logger } from "@/lib/logger";
import { decide } from "./state";
import type { MpPayment, Notifier, PaymentGateway, PaymentStore, ProcessResult } from "./types";

export interface ProcessDeps {
  store: PaymentStore;
  gateway: PaymentGateway;
  notifier: Notifier;
}

/**
 * Procesa un pago de Mercado Pago de forma idempotente (FR-014, FR-015, FR-017).
 * - El estado SIEMPRE se consulta a la API (nunca se confía en el payload).
 * - La transición es una función pura del estado actual, por lo que repetirla no cambia nada.
 * - El email se envía una sola vez mediante `claimNotification`.
 */
export async function processPayment(paymentId: string, deps: ProcessDeps): Promise<ProcessResult> {
  return applyPayment(await deps.gateway.getPayment(paymentId), deps);
}

/** Aplica el estado ya verificado de un pago a su compra (usado por webhook y conciliación). */
export async function applyPayment(payment: MpPayment, deps: ProcessDeps): Promise<ProcessResult> {
  const { store, notifier } = deps;
  const paymentId = payment.id;
  const purchase = await store.getPurchase(payment.externalReference);
  if (!purchase) {
    throw new Error(`Pago ${paymentId}: compra ${payment.externalReference} inexistente`);
  }

  const eventIsNew = await store.recordEvent(payment, payment);
  const enrollment = await store.getEnrollment(purchase.user_id, purchase.course_id);
  const { action, next } = decide(purchase, payment.status, enrollment);
  const from = purchase.status;
  let notified = false;

  switch (action.type) {
    case "approve":
      await store.updatePurchase(purchase.id, {
        status: "approved",
        mp_payment_id: payment.id,
        approved_at: new Date().toISOString(),
      });
      await store.upsertEnrollment({
        userId: purchase.user_id,
        courseId: purchase.course_id,
        purchaseId: purchase.id,
      });
      break;
    case "mark-duplicate":
      await store.updatePurchase(purchase.id, { status: "duplicate", mp_payment_id: payment.id });
      break;
    case "revert":
      await store.updatePurchase(purchase.id, {
        status: "reverted",
        mp_payment_id: payment.id,
        reverted_at: new Date().toISOString(),
      });
      if (action.deactivateEnrollment) await store.deactivateEnrollment(purchase.id);
      break;
    case "reject":
      await store.updatePurchase(purchase.id, { status: "rejected", mp_payment_id: payment.id });
      break;
    case "noop":
      break;
  }

  // Un solo envío por compra aprobada, aunque llegue repetida o concurrente
  if (next === "approved" && (await store.claimNotification(purchase.id))) {
    try {
      await notifier.sendPurchaseConfirmation({ ...purchase, status: "approved" });
      notified = true;
    } catch (error) {
      logger.error("payment.notify_failed", { purchaseId: purchase.id, error: String(error) });
    }
  }

  logger.info("payment.processed", { paymentId, purchaseId: purchase.id, from, to: next, eventIsNew });
  return { purchaseId: purchase.id, from, to: next, eventIsNew, notified };
}
