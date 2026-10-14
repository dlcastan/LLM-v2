import { describe, expect, it } from "vitest";
import { setLessonProgress } from "@/lib/progress-service";

function deps(opts: { enrolled: boolean; watched?: string[] }) {
  const watched = new Set(opts.watched ?? []);
  return {
    watched,
    deps: {
      async getLesson(id: string) {
        return id === "l1" || id === "l2" ? { id, course_id: "c1" } : null;
      },
      async hasActiveEnrollment() {
        return opts.enrolled;
      },
      async setWatched(_userId: string, lessonId: string, value: boolean) {
        if (value) watched.add(lessonId);
        else watched.delete(lessonId);
      },
      async listActiveLessons() {
        return [
          { id: "l1", archived_at: null },
          { id: "l2", archived_at: null },
        ];
      },
      async listWatchedIds() {
        return watched;
      },
    },
  };
}

describe("progreso de clases (AC-05)", () => {
  it("guarda el estado y devuelve el porcentaje", async () => {
    const { deps: d } = deps({ enrolled: true });
    const r = await setLessonProgress({ userId: "u1", lessonId: "l1", watched: true }, d);
    expect(r.percent).toBe(50);
  });

  it("permite desmarcar una clase", async () => {
    const { deps: d } = deps({ enrolled: true, watched: ["l1", "l2"] });
    const r = await setLessonProgress({ userId: "u1", lessonId: "l1", watched: false }, d);
    expect(r.percent).toBe(50);
  });

  it("devuelve 403 sin enrollment activo", async () => {
    const { deps: d } = deps({ enrolled: false });
    await expect(
      setLessonProgress({ userId: "u1", lessonId: "l1", watched: true }, d),
    ).rejects.toMatchObject({ status: 403 });
  });

  it("devuelve 404 si la clase no existe", async () => {
    const { deps: d } = deps({ enrolled: true });
    await expect(
      setLessonProgress({ userId: "u1", lessonId: "nope", watched: true }, d),
    ).rejects.toMatchObject({ status: 404 });
  });
});
