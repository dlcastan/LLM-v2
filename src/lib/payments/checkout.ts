import { invalid, notFound } from "@/lib/http-errors";
import type { PaymentGateway } from "./types";

export interface CheckoutDeps {
  gateway: PaymentGateway;
  courses: {
    get(id: string): Promise<{ id: string; title: string; price_ars: number; status: string } | null>;
  };
  enrollments: { hasActive(userId: string, courseId: string): Promise<boolean> };
  purchases: {
    create(input: { userId: string; courseId: string; amount: number }): Promise<{ id: string }>;
    attachPreference(purchaseId: string, preferenceId: string): Promise<void>;
  };
}

/**
 * Crea la compra `pending` y la preferencia de pago (FR-013).
 * Si el alumno ya posee el curso devuelve `alreadyOwned` pero permite continuar (FR-023).
 */
export async function createCheckout(
  input: { userId: string; email: string; courseId: string },
  deps: CheckoutDeps,
): Promise<{ checkoutUrl: string; alreadyOwned: boolean; purchaseId: string }> {
  const course = await deps.courses.get(input.courseId);
  if (!course || course.status !== "published") throw notFound("Curso");
  if (course.price_ars <= 0) throw invalid("El curso no tiene precio válido");

  const alreadyOwned = await deps.enrollments.hasActive(input.userId, input.courseId);
  const purchase = await deps.purchases.create({
    userId: input.userId,
    courseId: input.courseId,
    amount: course.price_ars,
  });

  const pref = await deps.gateway.createPreference({
    purchaseId: purchase.id,
    title: course.title,
    amount: course.price_ars,
    payerEmail: input.email,
  });
  await deps.purchases.attachPreference(purchase.id, pref.preferenceId);

  return { checkoutUrl: pref.checkoutUrl, alreadyOwned, purchaseId: purchase.id };
}
