import { forbidden, notFound } from "@/lib/http-errors";

export interface PlaybackDeps {
  getLesson(
    id: string,
  ): Promise<{ id: string; course_id: string; bunny_video_id: string; archived_at: string | null } | null>;
  hasActiveEnrollment(userId: string, courseId: string): Promise<boolean>;
  sign(videoId: string): { url: string; expiresAt: string };
}

/**
 * Emite el enlace firmado solo tras verificar en el servidor que el alumno tiene
 * una habilitación activa (Principio II y III). No devuelve datos del archivo fuente.
 */
export async function getPlayback(
  input: { userId: string; email: string; lessonId: string },
  deps: PlaybackDeps,
): Promise<{ url: string; expiresAt: string; watermark: string }> {
  const lesson = await deps.getLesson(input.lessonId);
  if (!lesson || lesson.archived_at !== null) throw notFound("Clase");
  if (!(await deps.hasActiveEnrollment(input.userId, lesson.course_id))) throw forbidden();

  const { url, expiresAt } = deps.sign(lesson.bunny_video_id);
  return { url, expiresAt, watermark: input.email };
}
