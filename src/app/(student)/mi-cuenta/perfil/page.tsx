import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/ProfileForm";
import { requireUser } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser().catch(() => null);
  if (!user) redirect("/login");
  return (
    <>
      <h1>Mis datos</h1>
      <ProfileForm fullName={user.fullName} email={user.email} />
    </>
  );
}
