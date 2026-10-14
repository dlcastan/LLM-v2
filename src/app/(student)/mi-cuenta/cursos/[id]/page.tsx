import Link from "next/link";
import { notFound } from "next/navigation";
import { loadStudentCourse } from "@/lib/student-course";

export const dynamic = "force-dynamic";

export default async function StudentCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { course, lessons, watchedIds, summary } = await loadStudentCourse(id);
  if (!course) notFound();

  return (
    <>
      <h1>{course.title}</h1>
      <p>
        Avance: <strong>{summary.percent}%</strong> ({summary.watched}/{summary.total} clases)
      </p>
      <ol>
        {lessons.map((l) => (
          <li key={l.id}>
            <Link href={`/mi-cuenta/cursos/${id}/clases/${l.id}`}>{l.title}</Link>{" "}
            {watchedIds.has(l.id) ? <span aria-label="vista">✓ vista</span> : <span className="muted">no vista</span>}
          </li>
        ))}
      </ol>
      {summary.completed && (
        <p>
          <a className="cta" href={`/api/certificates/${id}`}>
            Descargar certificado
          </a>
        </p>
      )}
    </>
  );
}
