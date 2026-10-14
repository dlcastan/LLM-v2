import { createAdminClient } from "@/lib/db/clients";
import type { ProgressDeps } from "./progress-service";

/** Dependencias de producción (Supabase con rol de servicio; la autorización ya se verificó). */
export function productionProgressDeps(): ProgressDeps {
  const db = createAdminClient();
  return {
    async getLesson(id) {
      const { data } = await db.from("lessons").select("id,course_id").eq("id", id).maybeSingle();
      return data;
    },
    async hasActiveEnrollment(userId, courseId) {
      const { data } = await db
        .from("enrollments")
        .select("id")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .eq("active", true)
        .maybeSingle();
      return Boolean(data);
    },
    async setWatched(userId, lessonId, watched) {
      const { error } = await db
        .from("lesson_progress")
        .upsert({ user_id: userId, lesson_id: lessonId, watched, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    async listActiveLessons(courseId) {
      const { data, error } = await db
        .from("lessons")
        .select("id,archived_at")
        .eq("course_id", courseId)
        .is("archived_at", null);
      if (error) throw error;
      return data ?? [];
    },
    async listWatchedIds(userId, courseId) {
      const { data, error } = await db
        .from("lesson_progress")
        .select("lesson_id, lessons!inner(course_id)")
        .eq("user_id", userId)
        .eq("watched", true)
        .eq("lessons.course_id", courseId);
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.lesson_id as string));
    },
  };
}
