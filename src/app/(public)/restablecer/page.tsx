import { Suspense } from "react";
import { ResetForm } from "@/components/ResetForm";

export default function ResetPage() {
  return (
    <>
      <h1>Nueva contraseña</h1>
      <Suspense>
        <ResetForm />
      </Suspense>
    </>
  );
}
