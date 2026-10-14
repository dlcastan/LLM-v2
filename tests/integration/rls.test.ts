import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

// Requiere un proyecto Supabase de prueba con las migraciones aplicadas y dos alumnos creados.
// E2E_STUDENT_A / E2E_STUDENT_B: "email:password". Ver quickstart.md.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const a = process.env.E2E_STUDENT_A;
const b = process.env.E2E_STUDENT_B;
const configured = Boolean(url && anon && a && b);

async function login(creds: string) {
  const [email, password] = creds.split(":");
  const client = createClient(url!, anon!, { auth: { persistSession: false } });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { client, userId: data.user.id };
}

describe.skipIf(!configured)("RLS: acceso cruzado entre alumnos (Principio III)", () => {
  it("un alumno no ve las compras de otro", async () => {
    const A = await login(a!);
    const B = await login(b!);
    const { data } = await A.client.from("purchases").select("user_id");
    expect((data ?? []).every((p) => p.user_id === A.userId)).toBe(true);
    expect((data ?? []).some((p) => p.user_id === B.userId)).toBe(false);
  });

  it("un alumno no puede leer payment_events", async () => {
    const A = await login(a!);
    const { data } = await A.client.from("payment_events").select("id");
    expect(data ?? []).toHaveLength(0);
  });

  it("un alumno no puede promoverse a admin", async () => {
    const A = await login(a!);
    await A.client.from("profiles").update({ role: "admin" }).eq("id", A.userId);
    const { data } = await A.client.from("profiles").select("role").eq("id", A.userId).single();
    expect(data?.role).toBe("student");
  });

  it("un alumno no puede crear habilitaciones propias", async () => {
    const A = await login(a!);
    const { error } = await A.client
      .from("enrollments")
      .insert({ user_id: A.userId, course_id: "00000000-0000-0000-0000-000000000001", purchase_id: A.userId });
    expect(error).not.toBeNull();
  });
});
