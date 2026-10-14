import { forbidden } from "@/lib/http-errors";
import { computeProgress } from "@/lib/progress";

export interface CertificateDeps {
  getExistingCertificate(userId: string, courseId: string): Promise<{ issued_at: string } | null>;
  hasActiveEnrollment(userId: string, courseId: string): Promise<boolean>;
  listLessons(courseId: string): Promise<Array<{ id: string; archived_at: string | null }>>;
  listWatchedIds(userId: string, courseId: string): Promise<Set<string>>;
  saveCertificate(userId: string, courseId: string): Promise<{ issued_at: string }>;
}

/**
 * Devuelve el certificado del alumno, emitiéndolo si cumple el 100% de las clases vistas (FR-012).
 * Un certificado ya emitido se conserva y sigue descargable aunque el acceso se revoque (FR-017).
 */
export async function issueCertificate(
  input: { userId: string; courseId: string },
  deps: CertificateDeps,
): Promise<{ issuedAt: string }> {
  const existing = await deps.getExistingCertificate(input.userId, input.courseId);
  if (existing) return { issuedAt: existing.issued_at };

  if (!(await deps.hasActiveEnrollment(input.userId, input.courseId))) throw forbidden();

  const [lessons, watched] = await Promise.all([
    deps.listLessons(input.courseId),
    deps.listWatchedIds(input.userId, input.courseId),
  ]);
  if (!computeProgress(lessons, watched).completed) throw forbidden();

  const saved = await deps.saveCertificate(input.userId, input.courseId);
  return { issuedAt: saved.issued_at };
}
