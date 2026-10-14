import { describe, expect, it } from "vitest";
import { processPayment } from "@/lib/payments/process-payment";
import { FakeGateway, FakeNotifier, MemoryStore, makePurchase, payment } from "../helpers/memory-store";

describe("idempotencia del webhook (AC-08)", () => {
  it("la misma notificación 3 veces no duplica habilitación, compra ni email", async () => {
    const store = new MemoryStore([makePurchase()]);
    const gateway = new FakeGateway();
    gateway.payments.set("pay-1", payment());
    const notifier = new FakeNotifier();
    const deps = { store, gateway, notifier };

    const first = await processPayment("pay-1", deps);
    const second = await processPayment("pay-1", deps);
    const third = await processPayment("pay-1", deps);

    expect(first.eventIsNew).toBe(true);
    expect(second.eventIsNew).toBe(false);
    expect(third.eventIsNew).toBe(false);
    expect(store.enrollments).toHaveLength(1);
    expect(store.purchases.size).toBe(1);
    expect(notifier.sent).toHaveLength(1);
  });

  it("notificaciones concurrentes envían un solo email", async () => {
    const store = new MemoryStore([makePurchase()]);
    const gateway = new FakeGateway();
    gateway.payments.set("pay-1", payment());
    const notifier = new FakeNotifier();
    const deps = { store, gateway, notifier };

    await Promise.all([1, 2, 3, 4, 5].map(() => processPayment("pay-1", deps)));

    expect(notifier.sent).toHaveLength(1);
    expect(store.enrollments).toHaveLength(1);
  });
});
