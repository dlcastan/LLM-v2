import { describe, expect, it } from "vitest";

// Prueba de carga de reproducción (SC-005, SC-006). Requiere una instancia desplegada y una sesión
// de alumno habilitado: LOAD_BASE_URL, LOAD_COOKIE, LOAD_LESSON_ID. Ver quickstart.md.
const base = process.env.LOAD_BASE_URL;
const cookie = process.env.LOAD_COOKIE;
const lessonId = process.env.LOAD_LESSON_ID;
const configured = Boolean(base && cookie && lessonId);

describe.skipIf(!configured)("reproducción bajo carga", () => {
  it("50 sesiones simultáneas obtienen su enlace firmado en ≤3 s (p95)", async () => {
    const SESSIONS = 50;
    const timings = await Promise.all(
      Array.from({ length: SESSIONS }, async () => {
        const t0 = performance.now();
        const res = await fetch(`${base}/api/lessons/${lessonId}/playback`, { headers: { cookie: cookie! } });
        expect(res.status).toBe(200);
        await res.json();
        return performance.now() - t0;
      }),
    );
    timings.sort((x, y) => x - y);
    const p95 = timings[Math.ceil(SESSIONS * 0.95) - 1];
    expect(p95).toBeLessThanOrEqual(3000);
  });
});
