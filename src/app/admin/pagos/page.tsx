import { notFound, redirect } from "next/navigation";
import { VerifyPaymentButton } from "@/components/admin/VerifyPaymentButton";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/db/clients";
import { HttpError } from "@/lib/http-errors";

export const dynamic = "force-dynamic";

export default async function AdminPayments() {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof HttpError && e.status === 401) redirect("/login");
    notFound();
  }

  const { data } = await createAdminClient()
    .from("purchases")
    .select("id,status,amount,created_at,mp_payment_id,profiles(email),courses(title)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <>
      <h1>Pagos</h1>
      <table>
        <thead>
          <tr><th>Fecha</th><th>Alumno</th><th>Curso</th><th>Estado</th><th>Acción</th></tr>
        </thead>
        <tbody>
          {(data ?? []).map((p) => {
            const profile = p.profiles as unknown as { email: string } | null;
            const course = p.courses as unknown as { title: string } | null;
            return (
              <tr key={p.id}>
                <td>{new Date(p.created_at).toLocaleString("es-AR")}</td>
                <td>{profile?.email}</td>
                <td>{course?.title}</td>
                <td>{p.status}</td>
                <td><VerifyPaymentButton purchaseId={p.id} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
