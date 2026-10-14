import { requireUser } from "@/lib/auth/guards";
import { updateAccount } from "@/lib/account";
import { createAdminClient } from "@/lib/db/clients";
import { toResponse } from "@/lib/http-errors";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const body = (await request.json().catch(() => ({}))) as {
      fullName?: string;
      email?: string;
      password?: string;
    };
    const db = createAdminClient();

    await updateAccount(user.id, body, {
      async updateName(userId, fullName) {
        const { error } = await db.from("profiles").update({ full_name: fullName }).eq("id", userId);
        if (error) throw error;
      },
      async updateAuth(userId, patch) {
        const { error } = await db.auth.admin.updateUserById(userId, patch);
        if (error) throw error;
      },
    });
    return Response.json({ ok: true });
  } catch (error) {
    return toResponse(error);
  }
}
