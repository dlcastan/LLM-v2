import { describe, expect, it } from "vitest";
import { removeCourse, removeLesson } from "@/lib/admin/catalog";

function deps(opts: { activeEnrollments?: number; progressRows?: number }) {
  const log: string[] = [];
  return {
    log,
    deps: {
      async countActiveEnrollments() {
        return opts.activeEnrollments ?? 0;
      },
      async countProgress() {
        return opts.progressRows ?? 0;
      },
      async archiveCourse() {
        log.push("archiveCourse");
      },
      async deleteCourse() {
        log.push("deleteCourse");
      },
      async archiveLesson() {
        log.push("archiveLesson");
      },
      async deleteLesson() {
        log.push("deleteLesson");
      },
    },
  };
}

describe("eliminación de cursos y clases (FR-024, FR-025)", () => {
  it("archiva un curso con compras vigentes", async () => {
    const { deps: d, log } = deps({ activeEnrollments: 3 });
    expect(await removeCourse("c1", d)).toBe("archived");
    expect(log).toEqual(["archiveCourse"]);
  });

  it("elimina un curso sin compras", async () => {
    const { deps: d, log } = deps({ activeEnrollments: 0 });
    expect(await removeCourse("c1", d)).toBe("deleted");
    expect(log).toEqual(["deleteCourse"]);
  });

  it("archiva una clase con progreso y conserva el progreso", async () => {
    const { deps: d, log } = deps({ progressRows: 2 });
    expect(await removeLesson("l1", d)).toBe("archived");
    expect(log).toEqual(["archiveLesson"]);
  });

  it("elimina una clase sin progreso", async () => {
    const { deps: d, log } = deps({ progressRows: 0 });
    expect(await removeLesson("l1", d)).toBe("deleted");
    expect(log).toEqual(["deleteLesson"]);
  });
});
