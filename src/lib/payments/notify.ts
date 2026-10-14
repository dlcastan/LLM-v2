import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env";
import type { Purchase } from "@/lib/db/types";
import type { Notifier } from "./types";

/** Email de confirmación de compra; la unicidad la garantiza claimNotification (FR-015). */
export function createEmailNotifier(db: SupabaseClient): Notifier {
  return {
    async sendPurchaseConfirmation(purchase: Purchase) {
      const env = serverEnv();
      const [{ data: profile }, { data: course }] = await Promise.all([
        db.from("profiles").select("email,full_name").eq("id", purchase.user_id).single(),
        db.from("courses").select("title").eq("id", purchase.course_id).single(),
      ]);
      if (!profile || !course) return;

      await new Resend(env.RESEND_API_KEY).emails.send({
        from: env.EMAIL_FROM,
        to: profile.email,
        subject: `Ya tenés acceso a ${course.title}`,
        text: `Hola ${profile.full_name}, tu pago fue aprobado y el curso "${course.title}" ya está disponible en Mi cuenta.`,
      });
    },
  };
}
