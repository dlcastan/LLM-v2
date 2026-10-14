import { describe, expect, it } from "vitest";
import { generateCertificatePdf } from "@/lib/certificates/generate";
import { issueCertificate } from "@/lib/certificates/issue";

function deps(opts: {
  enrolled: boolean;
  existing?: boolean;
  watched?: string[];
  lessons?: Array<{ id: string; archived_at: string | null }>;
}) {
  const issued: string[] = [];
  return {
    issued,
    deps: {
      async getExistingCertificate() {
        return opts.existing ? { issued_at: "2026-09-01T00:00:00Z" } : null;
      },
      async hasActiveEnrollment() {
        return opts.enrolled;
      },
      async listLessons() {
        return opts.lessons ?? [
          { id: "a", archived_at: null },
          { id: "b", archived_at: null },
        ];
      },
      async listWatchedIds() {
        return new Set(opts.watched ?? []);
      },
      async saveCertificate() {
        issued.push("saved");
        return { issued_at: "2026-10-14T00:00:00Z" };
      },
    },
  };
}

describe("elegibilidad del certificado (AC-06)", () => {
  it("emite con el 100% de las clases vistas", async () => {
    const { deps: d, issued } = deps({ enrolled: true, watched: ["a", "b"] });
    const r = await issueCertificate({ userId: "u1", courseId: "c1" }, d);
    expect(r.issuedAt).toBe("2026-10-14T00:00:00Z");
    expect(issued).toHaveLength(1);
  });

  it("no emite con clases pendientes", async () => {
    const { deps: d } = deps({ enrolled: true, watched: ["a"] });
    await expect(issueCertificate({ userId: "u1", courseId: "c1" }, d)).rejects.toMatchObject({ status: 403 });
  });

  it("ignora clases archivadas en el 100% (FR-025)", async () => {
    const { deps: d } = deps({
      enrolled: true,
      watched: ["a"],
      lessons: [
        { id: "a", archived_at: null },
        { id: "b", archived_at: "2026-01-01" },
      ],
    });
    await expect(issueCertificate({ userId: "u1", courseId: "c1" }, d)).resolves.toBeTruthy();
  });

  it("conserva un certificado ya emitido aunque el acceso se haya revocado (FR-017)", async () => {
    const { deps: d, issued } = deps({ enrolled: false, existing: true });
    const r = await issueCertificate({ userId: "u1", courseId: "c1" }, d);
    expect(r.issuedAt).toBe("2026-09-01T00:00:00Z");
    expect(issued).toHaveLength(0);
  });

  it("sin habilitación ni certificado previo devuelve 403", async () => {
    const { deps: d } = deps({ enrolled: false, watched: ["a", "b"] });
    await expect(issueCertificate({ userId: "u1", courseId: "c1" }, d)).rejects.toMatchObject({ status: 403 });
  });
});

describe("generación del PDF", () => {
  it("produce un PDF válido con nombre, curso y fecha", async () => {
    const bytes = await generateCertificatePdf({
      studentName: "Ana Pérez",
      courseTitle: "IA aplicada a productos digitales",
      issuedAt: new Date("2026-10-14T00:00:00Z"),
    });
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe("%PDF-");
    expect(bytes.length).toBeGreaterThan(500);
  });
});
