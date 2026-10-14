import { describe, expect, it } from "vitest";
import { createCheckout } from "@/lib/payments/checkout";
import { FakeGateway } from "../helpers/memory-store";

function makeDeps(opts: { owned?: boolean } = {}) {
  const created: Array<{ userId: string; courseId: string; amount: number }> = [];
  const attached: Array<{ purchaseId: string; preferenceId: string }> = [];
  return {
    created,
    attached,
    deps: {
      gateway: new FakeGateway(),
      courses: {
        async get(id: string) {
          return id === "course-1"
            ? { id, title: "IA aplicada", price_ars: 49900, status: "published" as const }
            : null;
        },
      },
      enrollments: {
        async hasActive() {
          return opts.owned ?? false;
        },
      },
      purchases: {
        async create(input: { userId: string; courseId: string; amount: number }) {
          created.push(input);
          return { id: `pur-${created.length}` };
        },
        async attachPreference(purchaseId: string, preferenceId: string) {
          attached.push({ purchaseId, preferenceId });
        },
      },
    },
  };
}

describe("POST /api/checkout (servicio)", () => {
  it("crea la compra pending y devuelve la URL de pago", async () => {
    const { deps, created, attached } = makeDeps();
    const res = await createCheckout({ userId: "u1", email: "a@b.c", courseId: "course-1" }, deps);

    expect(created).toEqual([{ userId: "u1", courseId: "course-1", amount: 49900 }]);
    expect(attached).toHaveLength(1);
    expect(res.checkoutUrl).toContain("https://mp.test/");
    expect(res.alreadyOwned).toBe(false);
  });

  it("avisa cuando el alumno ya posee el curso pero permite continuar (FR-023)", async () => {
    const { deps } = makeDeps({ owned: true });
    const res = await createCheckout({ userId: "u1", email: "a@b.c", courseId: "course-1" }, deps);
    expect(res.alreadyOwned).toBe(true);
    expect(res.checkoutUrl).toBeTruthy();
  });

  it("rechaza cursos inexistentes o no publicados", async () => {
    const { deps } = makeDeps();
    await expect(
      createCheckout({ userId: "u1", email: "a@b.c", courseId: "nope" }, deps),
    ).rejects.toMatchObject({ status: 404 });
  });
});
