import { expect, test } from "@playwright/test";

test("valid submit shows recommendation details", async ({ page }) => {
  await page.goto("/rekomendasi");
  await page.getByPlaceholder("Tuliskan nama lengkap").fill("E2E Valid User");
  await page.getByRole("button", { name: "Hitung Rekomendasi" }).click();

  await expect(page.getByText(/^Aturan:/)).toBeVisible();
});

test("rate limit displays cooldown message", async ({ page }) => {
  await page.goto("/rekomendasi");
  await page.getByPlaceholder("Tuliskan nama lengkap").fill("E2E Rate Limit");

  let cooldownVisible = false;
  const cooldownMessage = page.getByText(/Terlalu banyak permintaan\. Coba lagi dalam \d+ detik\./);
  for (let i = 0; i < 45; i += 1) {
    cooldownVisible = await cooldownMessage.isVisible();
    if (cooldownVisible) break;

    const submitButton = page.getByRole("button", { name: /Hitung Rekomendasi|Coba lagi \d+ detik/ });
    const isDisabled = await submitButton.isDisabled();
    if (isDisabled) {
      cooldownVisible = true;
      break;
    }

    await submitButton.click();
  }

  expect(cooldownVisible).toBe(true);
});
