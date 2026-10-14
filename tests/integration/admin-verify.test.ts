import { describe, expect, it } from "vitest";
import { verifyAndForce } from "@/lib/payments/admin-verify";
import { FakeGateway, FakeNotifier, MemoryStore, makePurchase, payment } from "../helpers/memory-store";

describe("verificación manual por Admin (AC-11)", () => {
  it("fuerza la habilitación si el pago está aprobado en Mercado Pago", async () => {
    const store = new MemoryStore([makePurchase()]);
    const gateway = new FakeGateway();
    gateway.payments.set("pay-1", payment({ status: "approved" }));

    const r = await verifyAndForce("pur-1", { store, gateway, notifier: new FakeNotifier() });

    expect(r).toMatchObject({ found: true, status: "approved" });
    expect(await store.getEnrollment("user-1", "course-1")).toMatchObject({ active: true });
  });

  it("informa que no hay pagos cuando Mercado Pago no tiene registros", async () => {
    const store = new MemoryStore([makePurchase()]);
    const r = await verifyAndForce("pur-1", {
      store,
      gateway: new FakeGateway(),
      notifier: new FakeNotifier(),
    });
    expect(r).toMatchObject({ found: false });
    expect(await store.getEnrollment("user-1", "course-1")).toBeNull();
  });

  it("devuelve 404 si la compra no existe", async () => {
    await expect(
      verifyAndForce("nope", { store: new MemoryStore(), gateway: new FakeGateway(), notifier: new FakeNotifier() }),
    ).rejects.toMatchObject({ status: 404 });
  });
});
