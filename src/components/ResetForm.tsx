"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabase } from "@/lib/db/browser";

export function ResetForm() {
  const params = useSearchParams();
  const linkError = params.get("error") ?? params.get("error_code");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(
    linkError ? "El enlace venció o ya fue usado. Pedí uno nuevo." : null,
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password"));
    const { error: err } = await createBrowserSupabase().auth.updateUser({ password });
    if (err) return setError(err.message);
    setError(null);
    setDone(true);
  }

  if (done) return <p>Tu contraseña fue actualizada con éxito. Ya podés <a href="/login">ingresar</a>.</p>;
  return (
    <form onSubmit={onSubmit} className="card">
      <label htmlFor="password">Nueva contraseña</label>
      <input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" />
      {error && <p className="error" role="alert">{error}</p>}
      <p><button className="primary">Guardar contraseña</button></p>
    </form>
  );
}
