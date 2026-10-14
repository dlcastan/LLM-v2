import type { Purchase, PurchaseStatus } from "@/lib/db/types";
import type { EnrollmentRow, MpStatus } from "./types";

export type Action =
  | { type: "approve" }
  | { type: "mark-duplicate" }
  | { type: "revert"; deactivateEnrollment: boolean }
  | { type: "reject" }
  | { type: "noop" };

const REVERSAL: MpStatus[] = ["refunded", "charged_back", "cancelled"];

/**
 * Decide la transición de una compra según el estado verificado del pago.
 * Función pura: es la fuente de verdad de FR-014, FR-015, FR-017 y FR-023.
 */
export function decide(
  purchase: Pick<Purchase, "id" | "status">,
  mpStatus: MpStatus,
  existingEnrollment: EnrollmentRow | null,
): { action: Action; next: PurchaseStatus } {
  const stay = { action: { type: "noop" } as Action, next: purchase.status };

  if (mpStatus === "approved") {
    // Una reversión ya registrada (o un duplicado) nunca se vuelve a habilitar
    if (["approved", "reverted", "duplicate"].includes(purchase.status)) return stay;

    const ownedByOtherPurchase =
      existingEnrollment?.active === true && existingEnrollment.purchaseId !== purchase.id;
    if (ownedByOtherPurchase) {
      return { action: { type: "mark-duplicate" }, next: "duplicate" };
    }
    return { action: { type: "approve" }, next: "approved" };
  }

  if (REVERSAL.includes(mpStatus)) {
    if (purchase.status === "approved") {
      return { action: { type: "revert", deactivateEnrollment: true }, next: "reverted" };
    }
    if (purchase.status === "duplicate" || purchase.status === "pending") {
      return { action: { type: "revert", deactivateEnrollment: false }, next: "reverted" };
    }
    return stay;
  }

  if (mpStatus === "rejected" && purchase.status === "pending") {
    return { action: { type: "reject" }, next: "rejected" };
  }

  return stay;
}
