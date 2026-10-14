import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <nav>
        <Link href="/" className="brand">
          Cursos de IA
        </Link>
        <div className="nav-links">
          <Link href="/mi-cuenta">Mi cuenta</Link>
          <Link href="/login">Ingresar</Link>
          <Link href="/registro" className="cta">
            Registrarme
          </Link>
        </div>
      </nav>
    </header>
  );
}
