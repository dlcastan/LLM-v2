"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function BuyButton({ courseId, alreadyOwned }: { courseId: string; alreadyOwned: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    if (alreadyOwned && !window.confirm("Ya tenés este curso. ¿Querés pagarlo de nuevo igualmente?")) {
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      return setError(data.error ?? "No se pudo iniciar el pago");
    }
    window.location.href = data.checkoutUrl;
  }

  return (
    <div>
      <button className="primary" onClick={buy} disabled={loading}>
        {loading ? "Redirigiendo…" : "Comprar curso"}
      </button>
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  );
}
