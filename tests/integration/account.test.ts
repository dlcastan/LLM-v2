import { describe, expect, it } from "vitest";
import { updateAccount } from "@/lib/account";
import { purchaseHistoryRows } from "@/lib/purchase-history";

function deps() {
  const calls: string[] = [];
  return {
    calls,
    deps: {
      async updateName(_u: string, name: string) {
        calls.push(`name:${name}`);
      },
      async updateAuth(_u: string, patch: { email?: string; password?: string }) {
        if (patch.email) calls.push(`email:${patch.email}`);
        if (patch.password) calls.push("password");
      },
    },
  };
}

describe("edición de datos personales (AC-03)", () => {
  it("actualiza nombre y email de autenticación (profiles.email se sincroniza por trigger)", async () => {
    const { deps: d, calls } = deps();
    await updateAccount("u1", { fullName: "Ana Pérez", email: "ana@test.com" }, d);
    expect(calls).toEqual(["name:Ana Pérez", "email:ana@test.com"]);
  });

  it("cambia la contraseña", async () => {
    const { deps: d, calls } = deps();
    await updateAccount("u1", { password: "UnaClaveLarga1" }, d);
    expect(calls).toEqual(["password"]);
  });

  it("rechaza email inválido y contraseña corta", async () => {
    const { deps: d } = deps();
    await expect(updateAccount("u1", { email: "no-es-email" }, d)).rejects.toMatchObject({ status: 422 });
    await expect(updateAccount("u1", { password: "corta" }, d)).rejects.toMatchObject({ status: 422 });
  });
});

describe("historial de compras (FR-007)", () => {
  it("muestra curso, fecha y estado, con rótulo de pago duplicado", () => {
    const rows = purchaseHistoryRows([
      { id: "1", course_title: "IA", created_at: "2026-10-14T10:00:00Z", status: "approved" },
      { id: "2", course_title: "IA", created_at: "2026-10-14T11:00:00Z", status: "duplicate" },
      { id: "3", course_title: "IA", created_at: "2026-10-15T11:00:00Z", status: "reverted" },
    ]);
    expect(rows.map((r) => r.statusLabel)).toEqual(["Aprobada", "Pago duplicado", "Revertida"]);
    expect(rows[0]).toMatchObject({ course: "IA" });
  });
});
