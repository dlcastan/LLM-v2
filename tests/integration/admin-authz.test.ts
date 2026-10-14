import { describe, expect, it, vi } from "vitest";

// requireAdmin lee la sesión de Supabase; se simula la sesión para probar la autorización (AC-12)
const state: { user: { id: string } | null; role: string | null } = { user: null, role: null };

vi.mock("@/lib/db/clients", () => ({
  createSessionClient: async () => ({
    auth: { getUser: async () => ({ data: { user: state.user } }) },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () =>
            state.role ? { data: { full_name: "N", email: "n@test.com", role: state.role } } : { data: null },
        }),
      }),
    }),
  }),
}));

import { requireAdmin, requireUser } from "@/lib/auth/guards";

describe("autorización del panel Admin (Principio III)", () => {
  it("401 sin sesión", async () => {
    state.user = null;
    state.role = null;
    await expect(requireAdmin()).rejects.toMatchObject({ status: 401 });
  });

  it("403 para un alumno", async () => {
    state.user = { id: "u1" };
    state.role = "student";
    await expect(requireUser()).resolves.toMatchObject({ role: "student" });
    await expect(requireAdmin()).rejects.toMatchObject({ status: 403 });
  });

  it("acepta a un Admin", async () => {
    state.user = { id: "u2" };
    state.role = "admin";
    await expect(requireAdmin()).resolves.toMatchObject({ role: "admin" });
  });
});
