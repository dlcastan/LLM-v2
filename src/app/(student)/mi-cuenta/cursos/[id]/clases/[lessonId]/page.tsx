import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { ProgressToggle } from "@/components/ProgressToggle";
import { loadStudentCourse } from "@/lib/student-course";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;
  const { lessons, watchedIds } = await loadStudentCourse(id);
  const lesson = lessons.find((l) => l.id === lessonId);
  if (!lesson) notFound();

  return (
    <>
      <p>
        <Link href={`/mi-cuenta/cursos/${id}`}>← Volver al curso</Link>
      </p>
      <h1>{lesson.title}</h1>
      <VideoPlayer lessonId={lesson.id} />
      <p>{lesson.description}</p>
      {lesson.keywords.length > 0 && (
        <p>
          <strong>Palabras clave:</strong> {lesson.keywords.join(", ")}
        </p>
      )}
      <ProgressToggle lessonId={lesson.id} initialWatched={watchedIds.has(lesson.id)} />
    </>
  );
}
