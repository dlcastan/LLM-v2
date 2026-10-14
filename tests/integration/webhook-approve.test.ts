import { describe, expect, it } from "vitest";
import { processPayment } from "@/lib/payments/process-payment";
import { FakeGateway, FakeNotifier, MemoryStore, makePurchase, payment } from "../helpers/memory-store";

describe("webhook con pago aprobado (AC-07)", () => {
  it("aprueba la compra y habilita el curso sin intervención manual", async () => {
    const store = new MemoryStore([makePurchase()]);
    const gateway = new FakeGateway();
    gateway.payments.set("pay-1", payment({ status: "approved" }));
    const notifier = new FakeNotifier();

    const result = await processPayment("pay-1", { store, gateway, notifier });

    expect(result.to).toBe("approved");
    expect((await store.getPurchase("pur-1"))!.status).toBe("approved");
    expect(await store.getEnrollment("user-1", "course-1")).toMatchObject({ active: true, purchaseId: "pur-1" });
    expect(notifier.sent).toEqual(["pur-1"]);
  });

  it("usa el estado consultado a la API, no el del payload", async () => {
    const store = new MemoryStore([makePurchase()]);
    const gateway = new FakeGateway();
    gateway.payments.set("pay-1", payment({ status: "pending" }));

    await processPayment("pay-1", { store, gateway, notifier: new FakeNotifier() });

    expect(await store.getEnrollment("user-1", "course-1")).toBeNull();
    expect((await store.getPurchase("pur-1"))!.status).toBe("pending");
  });
});
