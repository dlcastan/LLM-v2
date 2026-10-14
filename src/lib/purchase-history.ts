import type { PurchaseStatus } from "@/lib/db/types";

const LABELS: Record<PurchaseStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  reverted: "Revertida",
  duplicate: "Pago duplicado",
  rejected: "Rechazada",
};

export function purchaseHistoryRows(
  purchases: Array<{ id: string; course_title: string; created_at: string; status: PurchaseStatus }>,
) {
  return purchases.map((p) => ({
    id: p.id,
    course: p.course_title,
    date: p.created_at,
    status: p.status,
    statusLabel: LABELS[p.status],
  }));
}
