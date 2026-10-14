import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <>
      <h1>Ingresar</h1>
      <AuthForm mode="login" />
      <p>
        <Link href="/recuperar">Olvidé mi contraseña</Link> · <Link href="/registro">Crear cuenta</Link>
      </p>
    </>
  );
}
