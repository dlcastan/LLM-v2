"use client";

import { useState } from "react";

export function VerifyPaymentButton({ purchaseId }: { purchaseId: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function verify() {
    setBusy(true);
    const res = await fetch(`/api/admin/payments/${purchaseId}/verify`, { method: "POST" });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setMsg(data.error ?? "Error");
    setMsg(data.found ? `Mercado Pago: ${data.mpStatus} → ${data.status}` : "Sin pagos en Mercado Pago");
  }

  return (
    <span>
      <button onClick={verify} disabled={busy}>Verificar</button> {msg && <small>{msg}</small>}
    </span>
  );
}
