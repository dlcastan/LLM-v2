import { requireUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/db/clients";
import { invalid, toResponse } from "@/lib/http-errors";
import { createCheckout } from "@/lib/payments/checkout";
import { createMercadoPagoGateway } from "@/lib/payments/mercadopago";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({ courseId: z.string().uuid() });

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw invalid("courseId inválido");

    const db = createAdminClient();
    const result = await createCheckout(
      { userId: user.id, email: user.email, courseId: parsed.data.courseId },
      {
        gateway: createMercadoPagoGateway(),
        courses: {
          async get(id) {
            const { data } = await db.from("courses").select("id,title,price_ars,status").eq("id", id).maybeSingle();
            return data;
          },
        },
        enrollments: {
          async hasActive(userId, courseId) {
            const { data } = await db
              .from("enrollments")
              .select("id")
              .eq("user_id", userId)
              .eq("course_id", courseId)
              .eq("active", true)
              .maybeSingle();
            return Boolean(data);
          },
        },
        purchases: {
          async create({ userId, courseId, amount }) {
            const { data, error } = await db
              .from("purchases")
              .insert({ user_id: userId, course_id: courseId, amount, status: "pending" })
              .select("id")
              .single();
            if (error) throw error;
            return data;
          },
          async attachPreference(purchaseId, preferenceId) {
            const { error } = await db
              .from("purchases")
              .update({ mp_preference_id: preferenceId })
              .eq("id", purchaseId);
            if (error) throw error;
          },
        },
      },
    );
    return Response.json({ checkoutUrl: result.checkoutUrl, alreadyOwned: result.alreadyOwned });
  } catch (error) {
    return toResponse(error);
  }
}
