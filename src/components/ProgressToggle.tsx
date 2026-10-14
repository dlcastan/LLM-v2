"use client";

import { useState } from "react";

export function ProgressToggle({ lessonId, initialWatched }: { lessonId: string; initialWatched: boolean }) {
  const [watched, setWatched] = useState(initialWatched);
  const [percent, setPercent] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const next = !watched;
    const res = await fetch(`/api/lessons/${lessonId}/progress`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ watched: next }),
    });
    setBusy(false);
    if (!res.ok) return;
    const data = await res.json();
    setWatched(next);
    setPercent(data.percent);
  }

  return (
    <div>
      <button className="primary" onClick={toggle} disabled={busy} aria-pressed={watched}>
        {watched ? "Marcar como no vista" : "Marcar como vista"}
      </button>
      {percent !== null && <p className="muted">Avance del curso: {percent}%</p>}
    </div>
  );
}
