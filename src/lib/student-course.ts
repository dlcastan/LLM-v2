import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/db/clients";
import { getActiveEnrollment, getActiveLessons, getCourse } from "@/lib/db/queries";
import { computeProgress } from "@/lib/progress";

/** Carga el curso del alumno verificando en el servidor que tiene acceso (Principio III). */
export async function loadStudentCourse(courseId: string) {
  const user = await requireUser().catch(() => null);
  if (!user) redirect("/login");

  const db = createAdminClient();
  const enrollment = await getActiveEnrollment(db, user.id, courseId);
  if (!enrollment) redirect(`/cursos/${courseId}`);

  const [course, lessons, progressRows] = await Promise.all([
    getCourse(db, courseId),
    getActiveLessons(db, courseId),
    db.from("lesson_progress").select("lesson_id,watched").eq("user_id", user.id).eq("watched", true),
  ]);
  const watchedIds = new Set((progressRows.data ?? []).map((r) => r.lesson_id as string));
  return { user, course, lessons, watchedIds, summary: computeProgress(lessons, watchedIds) };
}
