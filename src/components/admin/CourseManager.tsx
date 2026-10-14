"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CourseRow {
  id: string;
  title: string;
  status: string;
  price_ars: number;
}

export function CourseManager({ courses }: { courses: CourseRow[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: f.get("title"),
        description: f.get("description"),
        price_ars: Number(f.get("price_ars")),
        status: f.get("status"),
      }),
    });
    if (!res.ok) return setError((await res.json()).error);
    (e.target as HTMLFormElement).reset();
    setError(null);
    router.refresh();
  }

  async function setStatus(id: string, status: string) {
    await fetch(`/api/admin/courses/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar el curso? Si tiene alumnos, se archiva y ellos conservan el acceso.")) return;
    await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <form onSubmit={create} className="card">
        <h2>Nuevo curso</h2>
        <label htmlFor="title">Título</label>
        <input id="title" name="title" required />
        <label htmlFor="description">Descripción</label>
        <textarea id="description" name="description" />
        <label htmlFor="price_ars">Precio (ARS)</label>
        <input id="price_ars" name="price_ars" type="number" min={0} step="0.01" required />
        <label htmlFor="status">Estado</label>
        <select id="status" name="status" defaultValue="draft">
          <option value="draft">Borrador</option>
          <option value="published">Publicado</option>
        </select>
        {error && <p className="error" role="alert">{error}</p>}
        <p><button className="primary">Crear curso</button></p>
      </form>

      {courses.map((c) => (
        <article key={c.id} className="card">
          <h3>{c.title}</h3>
          <p className="muted">${c.price_ars} ARS · {c.status}</p>
          <Link href={`/admin/cursos/${c.id}/clases`}>Gestionar clases</Link>{" · "}
          {c.status !== "published" && <button onClick={() => setStatus(c.id, "published")}>Publicar</button>}{" "}
          {c.status === "published" && <button onClick={() => setStatus(c.id, "draft")}>Despublicar</button>}{" "}
          <button onClick={() => remove(c.id)}>Eliminar</button>
        </article>
      ))}
    </>
  );
}
