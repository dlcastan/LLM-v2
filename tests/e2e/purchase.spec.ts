import { expect, test } from "@playwright/test";

// Requiere un proyecto Supabase y sandbox de Mercado Pago configurados (ver quickstart.md).
const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.MP_ACCESS_TOKEN);

test.describe("compra de un curso (AC-01, AC-07)", () => {
  test.skip(!configured, "faltan credenciales de Supabase/Mercado Pago sandbox");

  test("visitante llega a la compra en 2 clics o menos desde la home", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.getByRole("link", { name: /comprar|empezar|registrarme/i }).first().click(); // clic 1
    await page.getByRole("link", { name: /comprar/i }).first().click(); // clic 2
    await expect(page).toHaveURL(/\/cursos\/|\/registro|\/login/);
  });
});
