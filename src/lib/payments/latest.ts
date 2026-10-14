import type { MpPayment } from "./types";

/** Elige el pago más relevante de una compra: el de mayor fecha de actualización. */
export function latestPayment(payments: MpPayment[]): MpPayment | null {
  if (payments.length === 0) return null;
  return [...payments].sort((a, b) => b.dateLastUpdated.localeCompare(a.dateLastUpdated))[0];
}
