import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/db/clients";
import type { PurchaseStatus } from "@/lib/db/types";
import { purchaseHistoryRows } from "@/lib/purchase-history";

export const dynamic = "force-dynamic";

export default async function PurchasesPage() {
  const user = await requireUser().catch(() => null);
  if (!user) redirect("/login");

  const { data } = await createAdminClient()
    .from("purchases")
    .select("id,status,created_at,courses(title)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = purchaseHistoryRows(
    (data ?? []).map((p) => ({
      id: p.id,
      created_at: p.created_at,
      status: p.status as PurchaseStatus,
      course_title: (p.courses as unknown as { title: string } | null)?.title ?? "—",
    })),
  );

  return (
    <>
      <h1>Historial de compras</h1>
      {rows.length === 0 && <p className="muted">Todavía no hay compras.</p>}
      <table>
        <thead><tr><th>Curso</th><th>Fecha</th><th>Estado</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.course}</td>
              <td>{new Date(r.date).toLocaleDateString("es-AR")}</td>
              <td>{r.statusLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
