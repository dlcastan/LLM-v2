import { LessonManager } from "@/components/admin/LessonManager";
import { adminPageGuard } from "@/lib/admin/page-guard";
import { createAdminClient } from "@/lib/db/clients";
import { getActiveLessons, getCourse } from "@/lib/db/queries";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLessons({ params }: { params: Promise<{ id: string }> }) {
  await adminPageGuard();
  const { id } = await params;
  const db = createAdminClient();
  const course = await getCourse(db, id);
  if (!course) notFound();
  const lessons = await getActiveLessons(db, id);
  return (
    <>
      <h1>Clases: {course.title}</h1>
      <LessonManager courseId={id} lessons={lessons} />
    </>
  );
}
