import { describe, expect, it } from "vitest";
import { computeProgress } from "@/lib/progress";

const lesson = (id: string, archived = false) => ({ id, archived_at: archived ? "2026-01-01" : null });

describe("porcentaje de avance (FR-011)", () => {
  it("es 0% sin clases vistas", () => {
    expect(computeProgress([lesson("a"), lesson("b")], new Set()).percent).toBe(0);
  });

  it("calcula el porcentaje según las clases vistas", () => {
    const r = computeProgress([lesson("a"), lesson("b"), lesson("c"), lesson("d")], new Set(["a"]));
    expect(r).toMatchObject({ watched: 1, total: 4, percent: 25, completed: false });
  });

  it("es 100% y completado cuando todas están vistas", () => {
    const r = computeProgress([lesson("a"), lesson("b")], new Set(["a", "b"]));
    expect(r).toMatchObject({ percent: 100, completed: true });
  });

  it("excluye clases archivadas del total (FR-025)", () => {
    const r = computeProgress([lesson("a"), lesson("b", true)], new Set(["a"]));
    expect(r).toMatchObject({ total: 1, percent: 100, completed: true });
  });

  it("un curso sin clases activas no está completado", () => {
    expect(computeProgress([], new Set()).completed).toBe(false);
  });
});
