import Link from "next/link";
import { createAdminClient } from "@/lib/db/clients";
import { getPublishedCourses } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const courses = await getPublishedCourses(createAdminClient()).catch(() => []);

  return (
    <>
      <section>
        <h1>Aprendé a implementar IA en productos digitales</h1>
        <p>
          Cursos prácticos para quienes quieren sumar IA a su producto y para quienes quieren crear
          productos digitales usando IA.
        </p>
        <ul>
          <li><strong>Qué vas a aprender:</strong> cómo integrar IA en un producto y cómo construir productos con IA.</li>
          <li><strong>Para quién es:</strong> profesionales y emprendedores que crean productos digitales.</li>
          <li><strong>Por qué comprarlo:</strong> contenido aplicado, certificado de completitud y acceso permanente.</li>
        </ul>
        <p>
          <Link className="cta" href={courses[0] ? `/cursos/${courses[0].id}` : "/registro"}>
            Quiero empezar
          </Link>
        </p>
      </section>
      <section>
        <h2>Cursos disponibles</h2>
        {courses.map((c) => (
          <article key={c.id} className="card">
            <h3>{c.title}</h3>
            <p className="muted">{c.description}</p>
            <Link href={`/cursos/${c.id}`}>Ver detalle y comprar</Link>
          </article>
        ))}
      </section>
    </>
  );
}
