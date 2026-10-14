import { CourseManager } from "@/components/admin/CourseManager";
import { adminPageGuard } from "@/lib/admin/page-guard";
import { createAdminClient } from "@/lib/db/clients";

export const dynamic = "force-dynamic";

export default async function AdminCourses() {
  await adminPageGuard();
  const { data } = await createAdminClient()
    .from("courses")
    .select("id,title,status,price_ars")
    .order("created_at", { ascending: false });
  return (
    <>
      <h1>Cursos</h1>
      <CourseManager courses={data ?? []} />
    </>
  );
}
