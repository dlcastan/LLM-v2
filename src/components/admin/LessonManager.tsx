"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface LessonRow {
  id: string;
  title: string;
  position: number;
  bunny_video_id: string;
  keywords: string[];
}

export function LessonManager({ courseId, lessons }: { courseId: string; lessons: LessonRow[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/lessons", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        course_id: courseId,
        title: f.get("title"),
        description: f.get("description"),
        bunny_video_id: f.get("bunny_video_id"),
        keywords: String(f.get("keywords") ?? "").split(",").map((k) => k.trim()).filter(Boolean),
      }),
    });
    if (!res.ok) return setError((await res.json()).error);
    (e.target as HTMLFormElement).reset();
    setError(null);
    router.refresh();
  }

  async function move(index: number, delta: -1 | 1) {
    const ids = lessons.map((l) => l.id);
    const j = index + delta;
    if (j < 0 || j >= ids.length) return;
    [ids[index], ids[j]] = [ids[j], ids[index]];
    await fetch("/api/admin/lessons/reorder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ courseId, ids }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar la clase? Si tiene progreso, se archiva y se conserva el progreso.")) return;
    await fetch(`/api/admin/lessons/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <ol>
        {lessons.map((l, i) => (
          <li key={l.id}>
            {l.title} <small className="muted">({l.bunny_video_id})</small>{" "}
            <button onClick={() => move(i, -1)} aria-label="Subir">↑</button>
            <button onClick={() => move(i, 1)} aria-label="Bajar">↓</button>
            <button onClick={() => remove(l.id)}>Eliminar</button>
          </li>
        ))}
      </ol>
      <form onSubmit={create} className="card">
        <h2>Nueva clase</h2>
        <label htmlFor="title">Título</label>
        <input id="title" name="title" required />
        <label htmlFor="description">Descripción</label>
        <textarea id="description" name="description" />
        <label htmlFor="bunny_video_id">ID del video en Bunny Stream</label>
        <input id="bunny_video_id" name="bunny_video_id" required />
        <label htmlFor="keywords">Palabras clave (separadas por coma)</label>
        <input id="keywords" name="keywords" />
        {error && <p className="error" role="alert">{error}</p>}
        <p><button className="primary">Agregar clase</button></p>
      </form>
    </>
  );
}
