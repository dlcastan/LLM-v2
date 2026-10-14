import { logger } from "@/lib/logger";
import { latestPayment } from "./latest";
import { applyPayment, type ProcessDeps } from "./process-payment";

export interface ReconcileReport {
  checked: number;
  approved: number;
  errors: number;
}

/** Las compras más recientes que esto se esperan por webhook; las más viejas se abandonan. */
export const MIN_AGE_MS = 2 * 60_000;
export const MAX_AGE_MS = 7 * 24 * 60 * 60_000;

/**
 * Concilia compras `pending` contra la API de Mercado Pago (FR-016).
 * Corre cada 5 minutos, por lo que un pago aprobado sin webhook queda habilitado en ≤15 min.
 */
export async function reconcilePending(deps: ProcessDeps, now = new Date()): Promise<ReconcileReport> {
  const pending = await deps.store.listPendingPurchases({
    olderThan: new Date(now.getTime() - MIN_AGE_MS),
    newerThan: new Date(now.getTime() - MAX_AGE_MS),
  });

  const report: ReconcileReport = { checked: pending.length, approved: 0, errors: 0 };

  for (const purchase of pending) {
    try {
      const payment = latestPayment(await deps.gateway.findPaymentsByReference(purchase.id));
      if (!payment) continue;
      const result = await applyPayment(payment, deps);
      if (result.to === "approved") report.approved += 1;
    } catch (error) {
      report.errors += 1;
      logger.error("reconcile.failed", { purchaseId: purchase.id, error: String(error) });
    }
  }

  logger.info("reconcile.done", { ...report });
  return report;
}
