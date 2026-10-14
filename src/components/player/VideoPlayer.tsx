"use client";

import { useEffect, useRef, useState } from "react";

interface Playback {
  url: string;
  expiresAt: string;
  watermark: string;
}

const POSITIONS = [
  { top: "8%", left: "6%" },
  { top: "8%", right: "6%" },
  { bottom: "14%", left: "6%" },
  { bottom: "14%", right: "6%" },
  { top: "45%", left: "35%" },
];

/**
 * Reproductor protegido: pide la URL firmada al servidor y superpone una marca de agua
 * con el email del alumno durante toda la reproducción (RF-21). Renueva el enlace antes de vencer.
 */
export function VideoPlayer({ lessonId }: { lessonId: string }) {
  const [playback, setPlayback] = useState<Playback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pos, setPos] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const res = await fetch(`/api/lessons/${lessonId}/playback`, { cache: "no-store" });
      if (cancelled) return;
      if (!res.ok) return setError("No tenés acceso a este video.");
      const data = (await res.json()) as Playback;
      setPlayback(data);
      const ms = Math.max(new Date(data.expiresAt).getTime() - Date.now() - 60_000, 30_000);
      timer.current = setTimeout(load, ms); // renueva antes del vencimiento
    }

    load();
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [lessonId]);

  // La marca de agua cambia de lugar cada 5 s
  useEffect(() => {
    const t = setInterval(() => setPos((p) => (p + 1) % POSITIONS.length), 5000);
    return () => clearInterval(t);
  }, []);

  if (error) return <p className="error" role="alert">{error}</p>;
  if (!playback) return <p className="muted">Cargando video…</p>;

  return (
    <div style={{ position: "relative", aspectRatio: "16 / 9", background: "#000" }}>
      <iframe
        src={playback.url}
        title="Video de la clase"
        allow="accelerometer; gyroscope; encrypted-media; picture-in-picture"
        allowFullScreen
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
      />
      <span
        data-testid="watermark"
        aria-hidden="true"
        style={{
          position: "absolute",
          ...POSITIONS[pos],
          color: "rgba(255,255,255,0.65)",
          background: "rgba(0,0,0,0.25)",
          padding: "2px 8px",
          borderRadius: 4,
          fontSize: 14,
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 2,
        }}
      >
        {playback.watermark}
      </span>
    </div>
  );
}
