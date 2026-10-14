import { expect, test } from "@playwright/test";

// Requiere Supabase con un buzón de pruebas (p. ej. Inbucket local); ver quickstart.md.
const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.E2E_RESET_LINK);

test.describe("recuperación de contraseña (AC-02)", () => {
  test.skip(!configured, "faltan NEXT_PUBLIC_SUPABASE_URL / E2E_RESET_LINK");

  test("el enlace válido permite definir una nueva contraseña", async ({ page }) => {
    await page.goto(process.env.E2E_RESET_LINK!);
    await page.getByLabel(/nueva contraseña/i).fill("NuevaClave123!");
    await page.getByRole("button", { name: /guardar|restablecer/i }).click();
    await expect(page.getByText(/actualizada|éxito/i)).toBeVisible();
  });

  test("un enlace vencido muestra un error", async ({ page }) => {
    await page.goto("/restablecer?error=otp_expired");
    await expect(page.getByRole("alert")).toBeVisible();
  });
});
