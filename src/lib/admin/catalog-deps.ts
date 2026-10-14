import { createAdminClient } from "@/lib/db/clients";
import type { CatalogDeps } from "./catalog";

export function productionCatalogDeps(): CatalogDeps {
  const db = createAdminClient();
  const must = (error: { message: string } | null) => {
    if (error) throw new Error(error.message);
  };

  return {
    async countActiveEnrollments(courseId) {
      const { count, error } = await db
        .from("enrollments")
        .select("id", { count: "exact", head: true })
        .eq("course_id", courseId)
        .eq("active", true);
      must(error);
      return count ?? 0;
    },
    async countProgress(lessonId) {
      const { count, error } = await db
        .from("lesson_progress")
        .select("lesson_id", { count: "exact", head: true })
        .eq("lesson_id", lessonId);
      must(error);
      return count ?? 0;
    },
    async archiveCourse(courseId) {
      must((await db.from("courses").update({ status: "archived", updated_at: new Date().toISOString() }).eq("id", courseId)).error);
    },
    async deleteCourse(courseId) {
      must((await db.from("courses").delete().eq("id", courseId)).error);
    },
    async archiveLesson(lessonId) {
      must((await db.from("lessons").update({ archived_at: new Date().toISOString() }).eq("id", lessonId)).error);
    },
    async deleteLesson(lessonId) {
      must((await db.from("lessons").delete().eq("id", lessonId)).error);
    },
  };
}
