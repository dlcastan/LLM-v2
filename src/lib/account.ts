import { z } from "zod";
import { invalid } from "@/lib/http-errors";

export interface AccountDeps {
  updateName(userId: string, fullName: string): Promise<void>;
  /** El email se cambia en autenticación; un trigger sincroniza profiles.email. */
  updateAuth(userId: string, patch: { email?: string; password?: string }): Promise<void>;
}

const schema = z.object({
  fullName: z.string().trim().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
});

/** Edita nombre, email y/o contraseña del alumno (FR-005). */
export async function updateAccount(
  userId: string,
  input: { fullName?: string; email?: string; password?: string },
  deps: AccountDeps,
): Promise<void> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw invalid(parsed.error.issues[0].message);
  const { fullName, email, password } = parsed.data;

  if (fullName) await deps.updateName(userId, fullName);
  if (email || password) await deps.updateAuth(userId, { email, password });
}
