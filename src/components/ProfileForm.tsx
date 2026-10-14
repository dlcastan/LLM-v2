"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProfileForm({ fullName, email }: { fullName: string; email: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body: Record<string, string> = {
      fullName: String(f.get("fullName")),
      email: String(f.get("email")),
    };
    const password = String(f.get("password") ?? "");
    if (password) body.password = password;

    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setMsg(res.ok ? { ok: true, text: "Datos actualizados." } : { ok: false, text: data.error ?? "Error" });
    if (res.ok) router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card">
      <label htmlFor="fullName">Nombre</label>
      <input id="fullName" name="fullName" defaultValue={fullName} required />
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" defaultValue={email} required />
      <label htmlFor="password">Nueva contraseña (opcional)</label>
      <input id="password" name="password" type="password" minLength={8} autoComplete="new-password" />
      {msg && <p className={msg.ok ? "" : "error"} role="status">{msg.text}</p>}
      <p><button className="primary">Guardar</button></p>
    </form>
  );
}
