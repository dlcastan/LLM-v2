import { describe, expect, it } from "vitest";
import { reconcilePending } from "@/lib/payments/reconcile";
import { FakeGateway, FakeNotifier, MemoryStore, makePurchase, payment } from "../helpers/memory-store";

const NOW = new Date("2026-10-14T12:00:00Z");
const minutesAgo = (m: number) => new Date(NOW.getTime() - m * 60_000).toISOString();

describe("conciliación de pagos (AC-09)", () => {
  it("habilita un pago aprobado cuyo webhook nunca llegó", async () => {
    const store = new MemoryStore([makePurchase({ created_at: minutesAgo(10) })]);
    const gateway = new FakeGateway();
    gateway.payments.set("pay-1", payment({ status: "approved" }));
    const notifier = new FakeNotifier();

    const report = await reconcilePending({ store, gateway, notifier }, NOW);

    expect(report.approved).toBe(1);
    expect(await store.getEnrollment("user-1", "course-1")).toMatchObject({ active: true });
    expect(notifier.sent).toEqual(["pur-1"]);
  });

  it("deja en pending las compras sin pago aprobado", async () => {
    const store = new MemoryStore([makePurchase({ created_at: minutesAgo(10) })]);
    const gateway = new FakeGateway();
    gateway.payments.set("pay-1", payment({ status: "pending" }));

    const report = await reconcilePending({ store, gateway, notifier: new FakeNotifier() }, NOW);

    expect(report.approved).toBe(0);
    expect(await store.getEnrollment("user-1", "course-1")).toBeNull();
  });

  it("ignora compras demasiado recientes (el webhook aún puede llegar)", async () => {
    const store = new MemoryStore([makePurchase({ created_at: minutesAgo(1) })]);
    const gateway = new FakeGateway();
    gateway.payments.set("pay-1", payment());

    const report = await reconcilePending({ store, gateway, notifier: new FakeNotifier() }, NOW);

    expect(report.checked).toBe(0);
  });

  it("es idempotente si corre varias veces", async () => {
    const store = new MemoryStore([makePurchase({ created_at: minutesAgo(10) })]);
    const gateway = new FakeGateway();
    gateway.payments.set("pay-1", payment());
    const notifier = new FakeNotifier();
    const deps = { store, gateway, notifier };

    await reconcilePending(deps, NOW);
    await reconcilePending(deps, NOW);

    expect(store.enrollments).toHaveLength(1);
    expect(notifier.sent).toHaveLength(1);
  });
});
