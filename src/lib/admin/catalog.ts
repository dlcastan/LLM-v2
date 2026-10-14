export interface CatalogDeps {
  countActiveEnrollments(courseId: string): Promise<number>;
  countProgress(lessonId: string): Promise<number>;
  archiveCourse(courseId: string): Promise<void>;
  deleteCourse(courseId: string): Promise<void>;
  archiveLesson(lessonId: string): Promise<void>;
  deleteLesson(lessonId: string): Promise<void>;
}

/** Un curso con compras vigentes se archiva (deja de venderse) en vez de borrarse (FR-024). */
export async function removeCourse(courseId: string, deps: CatalogDeps): Promise<"archived" | "deleted"> {
  if ((await deps.countActiveEnrollments(courseId)) > 0) {
    await deps.archiveCourse(courseId);
    return "archived";
  }
  await deps.deleteCourse(courseId);
  return "deleted";
}

/** Una clase con progreso se archiva: se conserva el progreso y deja de contar (FR-025). */
export async function removeLesson(lessonId: string, deps: CatalogDeps): Promise<"archived" | "deleted"> {
  if ((await deps.countProgress(lessonId)) > 0) {
    await deps.archiveLesson(lessonId);
    return "archived";
  }
  await deps.deleteLesson(lessonId);
  return "deleted";
}
