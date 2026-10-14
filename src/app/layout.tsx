import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cursos de IA",
  description: "Aprendé a implementar IA en productos digitales y a crear productos usando IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
