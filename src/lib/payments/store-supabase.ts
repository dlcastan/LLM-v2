import type { SupabaseClient } from "@supabase/supabase-js";
import type { Purchase } from "@/lib/db/types";
import type { EnrollmentRow, MpPayment, PaymentStore } from "./types";

/** Implementación de PaymentStore sobre Supabase con rol de servicio. */
export function createSupabasePaymentStore(db: SupabaseClient): PaymentStore {
  return {
    async getPurchase(purchaseId) {
      const { data, error } = await db.from("purchases").select("*").eq("id", purchaseId).maybeSingle();
      if (error) throw error;
      return data as Purchase | null;
    },

    async getEnrollment(userId, courseId) {
      const { data, error } = await db
        .from("enrollments")
        .select("user_id,course_id,purchase_id,active")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        userId: data.user_id,
        courseId: data.course_id,
        purchaseId: data.purchase_id,
        active: data.active,
      } satisfies EnrollmentRow;
    },

    async updatePurchase(purchaseId, patch) {
      const { error } = await db.from("purchases").update(patch).eq("id", purchaseId);
      if (error) throw error;
    },

    async upsertEnrollment({ userId, courseId, purchaseId }) {
      const { error } = await db
        .from("enrollments")
        .upsert(
          { user_id: userId, course_id: courseId, purchase_id: purchaseId, active: true },
          { onConflict: "user_id,course_id" },
        );
      if (error) throw error;
    },

    async deactivateEnrollment(purchaseId) {
      const { error } = await db.from("enrollments").update({ active: false }).eq("purchase_id", purchaseId);
      if (error) throw error;
    },

    async recordEvent(payment: MpPayment, raw: unknown) {
      const { error } = await db.from("payment_events").insert({
        mp_payment_id: payment.id,
        mp_status: payment.status,
        date_last_updated: payment.dateLastUpdated,
        raw,
      });
      if (!error) return true;
      if (error.code === "23505") return false; // unique_violation => ya registrado
      throw error;
    },

    async listPendingPurchases({ olderThan, newerThan }) {
      const { data, error } = await db
        .from("purchases")
        .select("*")
        .eq("status", "pending")
        .lt("created_at", olderThan.toISOString())
        .gt("created_at", newerThan.toISOString())
        .limit(200);
      if (error) throw error;
      return data as Purchase[];
    },

    async claimNotification(purchaseId) {
      const { data, error } = await db
        .from("purchases")
        .update({ notified_at: new Date().toISOString() })
        .eq("id", purchaseId)
        .is("notified_at", null)
        .select("id");
      if (error) throw error;
      return (data?.length ?? 0) === 1;
    },
  };
}
