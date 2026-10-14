import { createSessionClient } from "@/lib/db/clients";
import { forbidden, unauthorized } from "@/lib/http-errors";
import type { Role } from "@/lib/db/types";

export interface AuthedUser {
  id: string;
  email: string;
  role: Role;
  fullName: string;
}

/** Exige sesión válida; el rol se lee de `profiles` en el servidor (Principio III). */
export async function requireUser(): Promise<AuthedUser> {
  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw unauthorized();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email,role")
    .eq("id", data.user.id)
    .maybeSingle();
  if (!profile) throw unauthorized();

  return {
    id: data.user.id,
    email: profile.email,
    role: profile.role as Role,
    fullName: profile.full_name,
  };
}

export async function requireAdmin(): Promise<AuthedUser> {
  const user = await requireUser();
  if (user.role !== "admin") throw forbidden();
  return user;
}
