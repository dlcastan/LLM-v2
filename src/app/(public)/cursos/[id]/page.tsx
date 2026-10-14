import { notFound } from "next/navigation";
import { BuyButton } from "@/components/BuyButton";
import { createAdminClient, createSessionClient } from "@/lib/db/clients";
import { getActiveEnrollment, getActiveLessons, getCourse } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();
  const course = await getCourse(admin, id);
  if (!course || course.status !== "published") notFound();

  const lessons = await getActiveLessons(admin, id);
  const session = await createSessionClient();
  const { data } = await session.auth.getUser();
  const owned = data.user ? Boolean(await getActiveEnrollment(admin, data.user.id, id)) : false;

  return (
    <>
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      <p><strong>${course.price_ars.toLocaleString("es-AR")} ARS</strong></p>
      <h2>Contenido</h2>
      <ol>
        {lessons.map((l) => (
          <li key={l.id}>{l.title}</li>
        ))}
      </ol>
      {owned && <p className="muted">Ya tenés este curso. Podés verlo desde Mi cuenta.</p>}
      <BuyButton courseId={course.id} alreadyOwned={owned} />
    </>
  );
}
