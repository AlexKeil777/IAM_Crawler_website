import { expect, test } from "@playwright/test";

test("particle sculpture follows live reduced-motion changes and resumes morphing", async ({ page }) => {
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

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
  const first = await signature();
  await page.waitForTimeout(2200);
  expect(await signature()).toEqual(first);

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForTimeout(2300);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
  const second = await signature();
  expect(difference(first, second)).toBeGreaterThan(0.2);

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForTimeout(2300);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
  const third = await signature();
  expect(difference(second, third)).toBeGreaterThan(0.2);
});

test("all seven reference parts render in sequence and loop back to the control arm", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const start = new Date("2026-11-07T12:00:00Z");
  await page.clock.install({ time: start });
  await page.clock.pauseAt(new Date(start.getTime() + 100));
  await page.goto("./");
  const canvas = page.locator("#rotor");
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await expect(canvas).toHaveAttribute("data-part", "Control arm");

  const priceCounts = new Set<number>();
  const currencies = new Set<string>();
  await page.clock.runFor(300);
  for (const part of ["Control arm", "Steering wheel", "Alloy wheel", "Exhaust system", "Brake caliper", "Headlight", "V8 engine block"]) {
    await expect(canvas).toHaveAttribute("data-part", part);
    const prices: string[] = JSON.parse((await canvas.getAttribute("data-prices"))!);
    expect(prices.length).toBeGreaterThanOrEqual(3);
    expect(prices.length).toBeLessThanOrEqual(6);
    await expect(canvas).toHaveAttribute("data-price-count", String(prices.length));
    priceCounts.add(prices.length);
    for (const price of prices) {
      expect(price).toMatch(/\d+[.,]\d{2}$/);
      expect(price).not.toMatch(/[.,]00$/);
      currencies.add(price.replace(/[\d\s.,']/g, ""));
    }
    const visiblePixels = await canvas.evaluate((element: HTMLCanvasElement) => {
      const pixels = element.getContext("2d")!.getImageData(0, 0, element.width, element.height).data;
      let visible = 0;
      for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 20) visible++;
      return visible;
    });
    expect(visiblePixels).toBeGreaterThan(1000);
    await page.clock.runFor(2000);
  }
  await expect(canvas).toHaveAttribute("data-part", "Control arm");
  expect([...priceCounts].sort()).toEqual([3, 4, 5, 6]);
  expect(currencies.size).toBeGreaterThanOrEqual(3);
});
