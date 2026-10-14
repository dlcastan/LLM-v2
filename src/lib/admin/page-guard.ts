import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { HttpError } from "@/lib/http-errors";

/** Para páginas Admin: sin sesión → login; sin rol Admin → 404 (no revela el panel). */
export async function adminPageGuard() {
  try {
    return await requireAdmin();
  } catch (e) {
    if (e instanceof HttpError && e.status === 401) redirect("/login");
    notFound();
  }
}
