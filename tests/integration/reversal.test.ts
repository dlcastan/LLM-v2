import { describe, expect, it } from "vitest";
import { processPayment } from "@/lib/payments/process-payment";
import { FakeGateway, FakeNotifier, MemoryStore, makePurchase, payment } from "../helpers/memory-store";

async function approved() {
  const store = new MemoryStore([makePurchase()]);
  const gateway = new FakeGateway();
  const notifier = new FakeNotifier();
  gateway.payments.set("pay-1", payment({ status: "approved", dateLastUpdated: "t1" }));
  await processPayment("pay-1", { store, gateway, notifier });
  return { store, gateway, notifier };
}

describe("reversión de pagos (AC-10)", () => {
  for (const status of ["refunded", "charged_back", "cancelled"] as const) {
    it(`${status} revoca el acceso y actualiza la compra`, async () => {
      const { store, gateway, notifier } = await approved();
      gateway.payments.set("pay-1", payment({ status, dateLastUpdated: "t2" }));

      await processPayment("pay-1", { store, gateway, notifier });

      expect((await store.getPurchase("pur-1"))!.status).toBe("reverted");
      expect(await store.getEnrollment("user-1", "course-1")).toMatchObject({ active: false });
    });
  }

  it("una reversión recibida antes que la aprobación no habilita el curso", async () => {
    const store = new MemoryStore([makePurchase()]);
    const gateway = new FakeGateway();
    const notifier = new FakeNotifier();
    const deps = { store, gateway, notifier };

    gateway.payments.set("pay-1", payment({ status: "refunded", dateLastUpdated: "t2" }));
    await processPayment("pay-1", deps);
    // llega tarde la notificación de la aprobación original
    gateway.payments.set("pay-1", payment({ status: "approved", dateLastUpdated: "t1" }));
    await processPayment("pay-1", deps);

    expect((await store.getPurchase("pur-1"))!.status).toBe("reverted");
    expect(await store.getEnrollment("user-1", "course-1")).toBeNull();
    expect(notifier.sent).toHaveLength(0);
  });

  it("el certificado ya emitido no se toca (solo cambia la habilitación)", async () => {
    // El procesamiento de pagos nunca escribe en `certificates` (FR-017, aclaración 2)
    const { store, gateway, notifier } = await approved();
    gateway.payments.set("pay-1", payment({ status: "refunded", dateLastUpdated: "t2" }));
    await processPayment("pay-1", { store, gateway, notifier });
    expect(Object.keys(store)).not.toContain("certificates");
  });
});
