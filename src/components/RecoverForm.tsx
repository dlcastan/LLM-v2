"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/db/browser";

export function RecoverForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email"));
    const { error: err } = await createBrowserSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/restablecer`,
    });
    if (err) return setError(err.message);
    setSent(true);
  }

  if (sent) return <p>Si el email existe, te enviamos un enlace para restablecer tu contraseña.</p>;
  return (
    <form onSubmit={onSubmit} className="card">
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required autoComplete="email" />
      {error && <p className="error" role="alert">{error}</p>}
      <p><button className="primary">Enviar enlace</button></p>
    </form>
  );
}
