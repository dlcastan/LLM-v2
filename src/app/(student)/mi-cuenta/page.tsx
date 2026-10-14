import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/db/clients";

export const dynamic = "force-dynamic";

export default async function MyAccount() {
  const user = await requireUser().catch(() => null);
  if (!user) redirect("/login");

  const { data } = await createAdminClient()
    .from("enrollments")
    .select("course_id, courses(id,title,description)")
    .eq("user_id", user.id)
    .eq("active", true);

  const courses = (data ?? []).flatMap((e) => (e.courses ? [e.courses as unknown as { id: string; title: string; description: string }] : []));

  return (
    <>
      <h1>Mis cursos</h1>
      {courses.length === 0 && <p className="muted">Todavía no tenés cursos.</p>}
      {courses.map((c) => (
        <article key={c.id} className="card">
          <h2>{c.title}</h2>
          <p className="muted">{c.description}</p>
          <Link href={`/mi-cuenta/cursos/${c.id}`}>Abrir curso</Link>
        </article>
      ))}
      <p>
        <Link href="/mi-cuenta/compras">Historial de compras</Link> ·{" "}
        <Link href="/mi-cuenta/perfil">Mis datos</Link>
      </p>
    </>
  );
}
