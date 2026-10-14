import { describe, expect, it } from "vitest";
import { processPayment } from "@/lib/payments/process-payment";
import { FakeGateway, FakeNotifier, MemoryStore, makePurchase, payment } from "../helpers/memory-store";

describe("compra duplicada (FR-023)", () => {
  it("un segundo pago aprobado queda como duplicate sin duplicar la habilitación", async () => {
    const store = new MemoryStore([makePurchase({ id: "pur-1" }), makePurchase({ id: "pur-2" })]);
    const gateway = new FakeGateway();
    const notifier = new FakeNotifier();
    const deps = { store, gateway, notifier };

    gateway.payments.set("pay-1", payment({ id: "pay-1", externalReference: "pur-1" }));
    gateway.payments.set("pay-2", payment({ id: "pay-2", externalReference: "pur-2" }));
    await processPayment("pay-1", deps);
    const second = await processPayment("pay-2", deps);

    expect(second.to).toBe("duplicate");
    expect((await store.getPurchase("pur-2"))!.status).toBe("duplicate");
    expect(store.enrollments).toHaveLength(1);
    expect(store.enrollments[0].purchaseId).toBe("pur-1");
    expect(notifier.sent).toEqual(["pur-1"]);
  });

  it("revertir el pago duplicado no quita el acceso del pago original", async () => {
    const store = new MemoryStore([makePurchase({ id: "pur-1" }), makePurchase({ id: "pur-2" })]);
    const gateway = new FakeGateway();
    const deps = { store, gateway, notifier: new FakeNotifier() };

    gateway.payments.set("pay-1", payment({ id: "pay-1", externalReference: "pur-1" }));
    gateway.payments.set("pay-2", payment({ id: "pay-2", externalReference: "pur-2" }));
    await processPayment("pay-1", deps);
    await processPayment("pay-2", deps);

    gateway.payments.set("pay-2", payment({ id: "pay-2", externalReference: "pur-2", status: "refunded", dateLastUpdated: "t9" }));
    await processPayment("pay-2", deps);

    expect((await store.getPurchase("pur-2"))!.status).toBe("reverted");
    expect(await store.getEnrollment("user-1", "course-1")).toMatchObject({ active: true, purchaseId: "pur-1" });
  });
});
