import { expect, test } from "@playwright/test";

test("particle sculpture changes shape and continues after being paused", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("./");
  const canvas = page.locator("#rotor");
  await expect(canvas).toHaveAttribute("data-ready", "true");

  const signature = () =>
    canvas.evaluate((element: HTMLCanvasElement) => {
      const { width, height } = element;
      const pixels = element.getContext("2d")!.getImageData(0, 0, width, height).data;
      // Coarse alpha densities describe the sculpture's shape without depending
      // on the exact position or colour of individual animated particles.
      const cells = Array<number>(16 * 16).fill(0);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const cell = Math.floor((y * 16) / height) * 16 + Math.floor((x * 16) / width);
          cells[cell] += pixels[(y * width + x) * 4 + 3];
        }
      }
      const total = cells.reduce((sum, value) => sum + value, 0);
      return cells.map((value) => value / total);
    });
  const difference = (a: number[], b: number[]) =>
    a.reduce((sum, value, i) => sum + Math.abs(value - b[i]), 0);

  await page.getByRole("button", { name: "Pause animations" }).click();
  const first = await signature();
  await page.waitForTimeout(2200);
  expect(await signature()).toEqual(first);

  await page.getByRole("button", { name: "Play animations" }).click();
  await page.waitForTimeout(2300);
  await page.getByRole("button", { name: "Pause animations" }).click();
  const second = await signature();
  expect(difference(first, second)).toBeGreaterThan(0.2);

  await page.getByRole("button", { name: "Play animations" }).click();
  await page.waitForTimeout(2300);
  await page.getByRole("button", { name: "Pause animations" }).click();
  const third = await signature();
  expect(difference(second, third)).toBeGreaterThan(0.2);
});
