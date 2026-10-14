import type { Purchase } from "@/lib/db/types";
import type {
  EnrollmentRow,
  MpPayment,
  Notifier,
  PaymentGateway,
  PaymentStore,
} from "@/lib/payments/types";

export function makePurchase(over: Partial<Purchase> = {}): Purchase {
  return {
    id: "pur-1",
    user_id: "user-1",
    course_id: "course-1",
    mp_preference_id: null,
    mp_payment_id: null,
    amount: 49900,
    status: "pending",
    created_at: new Date().toISOString(),
    approved_at: null,
    reverted_at: null,
    ...over,
  };
}

export class MemoryStore implements PaymentStore {
  purchases = new Map<string, Purchase>();
  enrollments: EnrollmentRow[] = [];
  events = new Set<string>();
  notified = new Set<string>();

  constructor(purchases: Purchase[] = []) {
    purchases.forEach((p) => this.purchases.set(p.id, p));
  }

  async getPurchase(id: string) {
    return this.purchases.get(id) ?? null;
  }
  async getEnrollment(userId: string, courseId: string) {
    return this.enrollments.find((e) => e.userId === userId && e.courseId === courseId) ?? null;
  }
  async updatePurchase(id: string, patch: Partial<Purchase>) {
    const p = this.purchases.get(id)!;
    this.purchases.set(id, { ...p, ...patch });
  }
  async upsertEnrollment(row: Omit<EnrollmentRow, "active">) {
    const i = this.enrollments.findIndex((e) => e.userId === row.userId && e.courseId === row.courseId);
    const next = { ...row, active: true };
    if (i >= 0) this.enrollments[i] = next;
    else this.enrollments.push(next);
  }
  async deactivateEnrollment(purchaseId: string) {
    this.enrollments.forEach((e) => {
      if (e.purchaseId === purchaseId) e.active = false;
    });
  }
  async recordEvent(p: MpPayment) {
    const key = `${p.id}|${p.status}|${p.dateLastUpdated}`;
    if (this.events.has(key)) return false;
    this.events.add(key);
    return true;
  }
  async listPendingPurchases({ olderThan, newerThan }: { olderThan: Date; newerThan: Date }) {
    return [...this.purchases.values()].filter((p) => {
      const t = new Date(p.created_at).getTime();
      return p.status === "pending" && t < olderThan.getTime() && t > newerThan.getTime();
    });
  }
  async claimNotification(purchaseId: string) {
    if (this.notified.has(purchaseId)) return false;
    this.notified.add(purchaseId);
    return true;
  }
}

export class FakeNotifier implements Notifier {
  sent: string[] = [];
  async sendPurchaseConfirmation(p: Purchase) {
    this.sent.push(p.id);
  }
}

export class FakeGateway implements PaymentGateway {
  payments = new Map<string, MpPayment>();
  preferences: Array<{ purchaseId: string; amount: number }> = [];
  async getPayment(id: string) {
    const p = this.payments.get(id);
    if (!p) throw new Error(`pago ${id} no existe`);
    return p;
  }
  async findPaymentsByReference(ref: string) {
    return [...this.payments.values()].filter((p) => p.externalReference === ref);
  }
  async createPreference(input: { purchaseId: string; amount: number }) {
    this.preferences.push({ purchaseId: input.purchaseId, amount: input.amount });
    return { preferenceId: `pref-${input.purchaseId}`, checkoutUrl: `https://mp.test/${input.purchaseId}` };
  }
}

export function payment(over: Partial<MpPayment> = {}): MpPayment {
  return {
    id: "pay-1",
    status: "approved",
    dateLastUpdated: "2026-10-14T10:00:00.000-03:00",
    externalReference: "pur-1",
    amount: 49900,
    ...over,
  };
}
