"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabase } from "@/lib/db/browser";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const supabase = createBrowserSupabase();

    const { error: err } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: String(form.get("full_name") ?? "") } },
          });

    setLoading(false);
    if (err) return setError(err.message);
    router.push("/mi-cuenta");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card">
      {mode === "register" && (
        <>
          <label htmlFor="full_name">Nombre</label>
          <input id="full_name" name="full_name" required autoComplete="name" />
        </>
      )}
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required autoComplete="email" />
      <label htmlFor="password">Contraseña</label>
      <input
        id="password"
        name="password"
        type="password"
        required
        minLength={8}
        autoComplete={mode === "login" ? "current-password" : "new-password"}
      />
      {error && <p className="error" role="alert">{error}</p>}
      <p>
        <button className="primary" disabled={loading}>
          {mode === "login" ? "Ingresar" : "Crear cuenta"}
        </button>
      </p>
    </form>
  );
}
