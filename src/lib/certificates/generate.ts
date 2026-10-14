import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface CertificateData {
  studentName: string;
  courseTitle: string;
  issuedAt: Date;
}

/** Certificado de completitud en PDF con nombre, curso y fecha (FR-012). */
export async function generateCertificatePdf(data: CertificateData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]); // A4 apaisado
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const { width, height } = page.getSize();

  const center = (text: string, y: number, size: number, font = regular) => {
    const w = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - w) / 2, y, size, font, color: rgb(0.08, 0.1, 0.14) });
  };

  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: rgb(0.23, 0.36, 0.86),
    borderWidth: 3,
  });

  const date = data.issuedAt.toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" });
  center("Certificado de completitud", height - 130, 34, bold);
  center("Se certifica que", height - 200, 16);
  center(data.studentName, height - 250, 30, bold);
  center("completó el curso", height - 300, 16);
  center(data.courseTitle, height - 345, 24, bold);
  center(`Fecha: ${date}`, 110, 14);

  return pdf.save();
}
