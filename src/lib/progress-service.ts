import { forbidden, notFound } from "@/lib/http-errors";
import { computeProgress, type ProgressLesson, type ProgressSummary } from "./progress";

export interface ProgressDeps {
  getLesson(id: string): Promise<{ id: string; course_id: string } | null>;
  hasActiveEnrollment(userId: string, courseId: string): Promise<boolean>;
  setWatched(userId: string, lessonId: string, watched: boolean): Promise<void>;
  listActiveLessons(courseId: string): Promise<ProgressLesson[]>;
  listWatchedIds(userId: string, courseId: string): Promise<Set<string>>;
}

/** Marca una clase como vista/no vista y devuelve el avance del curso (FR-010, FR-011). */
export async function setLessonProgress(
  input: { userId: string; lessonId: string; watched: boolean },
  deps: ProgressDeps,
): Promise<ProgressSummary> {
  const lesson = await deps.getLesson(input.lessonId);
  if (!lesson) throw notFound("Clase");
  if (!(await deps.hasActiveEnrollment(input.userId, lesson.course_id))) throw forbidden();

  await deps.setWatched(input.userId, input.lessonId, input.watched);
  const [lessons, watched] = await Promise.all([
    deps.listActiveLessons(lesson.course_id),
    deps.listWatchedIds(input.userId, lesson.course_id),
  ]);
  return computeProgress(lessons, watched);
}
