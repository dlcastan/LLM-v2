import type { Purchase, PurchaseStatus } from "@/lib/db/types";

/** Estados de Mercado Pago que el sistema distingue. */
export type MpStatus =
  | "approved"
  | "pending"
  | "in_process"
  | "rejected"
  | "refunded"
  | "charged_back"
  | "cancelled";

export interface MpPayment {
  id: string;
  status: MpStatus;
  dateLastUpdated: string;
  /** id de la compra (purchases.id) enviado como external_reference al crear la preferencia */
  externalReference: string;
  amount: number;
}

export interface PaymentGateway {
  getPayment(paymentId: string): Promise<MpPayment>;
  /** Pagos asociados a una compra (external_reference); permite conciliar sin webhook. */
  findPaymentsByReference(externalReference: string): Promise<MpPayment[]>;
  createPreference(input: {
    purchaseId: string;
    title: string;
    amount: number;
    payerEmail: string;
  }): Promise<{ preferenceId: string; checkoutUrl: string }>;
}

export interface EnrollmentRow {
  userId: string;
  courseId: string;
  purchaseId: string;
  active: boolean;
}

/** Acceso a datos que necesita el procesamiento de pagos (Supabase en producción, memoria en tests). */
export interface PaymentStore {
  getPurchase(purchaseId: string): Promise<Purchase | null>;
  getEnrollment(userId: string, courseId: string): Promise<EnrollmentRow | null>;
  updatePurchase(
    purchaseId: string,
    patch: Partial<Pick<Purchase, "status" | "mp_payment_id" | "approved_at" | "reverted_at">>,
  ): Promise<void>;
  upsertEnrollment(row: Omit<EnrollmentRow, "active">): Promise<void>;
  deactivateEnrollment(purchaseId: string): Promise<void>;
  /** true si el evento es nuevo; false si ya fue registrado (idempotencia, FR-015). */
  recordEvent(payment: MpPayment, raw: unknown): Promise<boolean>;
  /** true solo para quien logra marcar la compra como notificada (una sola vez). */
  claimNotification(purchaseId: string): Promise<boolean>;
  /** Compras `pending` creadas antes de `olderThan` y después de `newerThan` (para conciliar). */
  listPendingPurchases(range: { olderThan: Date; newerThan: Date }): Promise<Purchase[]>;
}

export interface Notifier {
  sendPurchaseConfirmation(purchase: Purchase): Promise<void>;
}

export type ProcessResult = {
  purchaseId: string;
  from: PurchaseStatus;
  to: PurchaseStatus;
  eventIsNew: boolean;
  notified: boolean;
};
