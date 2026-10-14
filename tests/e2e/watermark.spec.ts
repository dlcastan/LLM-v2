import { expect, test } from "@playwright/test";

// Requiere un alumno habilitado y una librería de Bunny de prueba (ver quickstart.md).
const configured = Boolean(process.env.E2E_STUDENT_EMAIL && process.env.E2E_LESSON_URL);

test.describe("marca de agua (AC-14)", () => {
  test.skip(!configured, "faltan E2E_STUDENT_EMAIL / E2E_LESSON_URL");

  test("muestra el email del alumno durante la reproducción", async ({ page }) => {
    await page.goto(process.env.E2E_LESSON_URL!);
    const mark = page.getByTestId("watermark");
    await expect(mark).toHaveText(process.env.E2E_STUDENT_EMAIL!);

    const first = await mark.boundingBox();
    await page.waitForTimeout(6000);
    await expect(mark).toBeVisible();
    expect(await mark.boundingBox()).not.toEqual(first); // la posición cambia
  });
});
