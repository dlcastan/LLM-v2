import { describe, expect, it } from "vitest";
import { getPlayback } from "@/lib/video/playback";

const lesson: { id: string; course_id: string; bunny_video_id: string; archived_at: string | null } = {
  id: "l1",
  course_id: "c1",
  bunny_video_id: "vid-1",
  archived_at: null,
};

function deps(opts: { enrolled: boolean; lesson?: typeof lesson | null }) {
  return {
    async getLesson(id: string) {
      return id === "l1" ? (opts.lesson === undefined ? lesson : opts.lesson) : null;
    },
    async hasActiveEnrollment() {
      return opts.enrolled;
    },
    sign: (videoId: string) => ({
      url: `https://iframe.mediadelivery.net/embed/1/${videoId}?token=t&expires=1`,
      expiresAt: "2026-10-14T12:10:00.000Z",
    }),
  };
}

describe("reproducción protegida (AC-13)", () => {
  it("devuelve URL firmada, vencimiento y marca de agua para un alumno habilitado", async () => {
    const r = await getPlayback({ userId: "u1", email: "ana@test.com", lessonId: "l1" }, deps({ enrolled: true }));
    expect(r.url).toContain("token=");
    expect(r.expiresAt).toBeTruthy();
    expect(r.watermark).toBe("ana@test.com");
  });

  it("no expone enlace de descarga del archivo fuente", async () => {
    const r = await getPlayback({ userId: "u1", email: "ana@test.com", lessonId: "l1" }, deps({ enrolled: true }));
    expect(Object.keys(r).sort()).toEqual(["expiresAt", "url", "watermark"]);
    expect(JSON.stringify(r)).not.toMatch(/\.mp4|original|download/i);
  });

  it("devuelve 403 sin enrollment activo", async () => {
    await expect(
      getPlayback({ userId: "u1", email: "a@b.c", lessonId: "l1" }, deps({ enrolled: false })),
    ).rejects.toMatchObject({ status: 403 });
  });

  it("devuelve 404 si la clase no existe o está archivada", async () => {
    await expect(
      getPlayback({ userId: "u1", email: "a@b.c", lessonId: "zzz" }, deps({ enrolled: true })),
    ).rejects.toMatchObject({ status: 404 });
    await expect(
      getPlayback(
        { userId: "u1", email: "a@b.c", lessonId: "l1" },
        deps({ enrolled: true, lesson: { ...lesson, archived_at: "2026-01-01" } }),
      ),
    ).rejects.toMatchObject({ status: 404 });
  });
});
