import { test, expect } from "@playwright/test";

test("all production resources stay inside the project URL and load successfully", async ({
  page,
  baseURL,
}) => {
  test.skip(
    !baseURL?.includes("IAM_Crawler_website"),
    "Exercise the actual GitHub Pages URL depth.",
  );
  const failed: string[] = [];
  const resources: string[] = [];
  page.on("requestfailed", (request) => failed.push(request.url()));
  page.on("response", (response) => {
    if (response.status() >= 400)
      failed.push(`${response.status()} ${response.url()}`);
    resources.push(response.url());
  });
  await page.goto("./");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("html")).toHaveAttribute("data-motion", "playing");
  await expect(page.locator("h1")).toHaveCSS("font-family", /Manrope/);
  expect(await page.evaluate(() => document.fonts.check("16px Manrope"))).toBe(
    true,
  );
  expect(resources.some((url) => /assets\/.*\.css/.test(url))).toBe(true);
  expect(resources.some((url) => /assets\/.*\.js/.test(url))).toBe(true);
  expect(resources.some((url) => url.endsWith("manrope-latin.woff2"))).toBe(
    true,
  );
  for (const url of resources) expect(url).toContain("/IAM_Crawler_website/");
  expect(failed).toEqual([]);
});

test("development and deployed files render the same layout at both URL depths", async ({
  browser,
  baseURL,
}) => {
  test.skip(
    !baseURL?.includes("IAM_Crawler_website"),
    "Compare all three environments once.",
  );
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const signatures: unknown[] = [];
  const frames: Buffer[] = [];
  for (const [name, url] of [
    ["development", "http://127.0.0.1:5173/"],
    ["production-root", "http://127.0.0.1:4173/"],
    ["github-pages", "http://127.0.0.1:4173/IAM_Crawler_website/"],
  ]) {
    const page = await context.newPage();
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
    signatures.push(
      await page.evaluate(() =>
        [
          ...document.querySelectorAll(
            "h1, h2, #home, #explanation, #contact, .site-header, #contact-form",
          ),
        ].map((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return {
            text: element.textContent,
            color: style.color,
            background: style.backgroundColor,
            family: style.fontFamily,
            size: style.fontSize,
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          };
        }),
      ),
    );
    frames.push(
      await page.screenshot({
        path: `test-results/parity-${name}.png`,
        fullPage: true,
        animations: "disabled",
      }),
    );
    await page.close();
  }
  await context.close();
  expect(signatures[1]).toEqual(signatures[0]);
  expect(signatures[2]).toEqual(signatures[0]);
  expect(frames[1].equals(frames[0])).toBe(true);
  expect(frames[2].equals(frames[0])).toBe(true);
});

test("particles scatter around the cursor, return, and stop when motion is paused", async ({
  page,
}) => {
  await page.goto("./");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "playing");
  const canvas = page.locator("#identity-particles");
  await expect(canvas).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.playState !== "paused" &&
            animation.effect?.getTiming().iterations !== Infinity,
        )
        .map((animation) => animation.finished.catch(() => {})),
    );
  });
  // Find a populated part of the mark, then observe the rendered pixels.
  const patch = await canvas.evaluate((element: HTMLCanvasElement) => {
    const ctx = element.getContext("2d")!;
    const ratio = element.width / element.clientWidth;
    const image = ctx.getImageData(0, 0, element.width, element.height);
    let best = { x: 0, y: 0, density: 0 };
    for (const fx of [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8])
      for (const fy of [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]) {
        const x = element.clientWidth * fx,
          y = element.clientHeight * fy;
        let density = 0;
        for (let py = Math.round((y - 18) * ratio); py < (y + 18) * ratio; py++)
          for (
            let px = Math.round((x - 18) * ratio);
            px < (x + 18) * ratio;
            px++
          )
            density += image.data[(py * image.width + px) * 4 + 3];
        if (density > best.density) best = { x, y, density };
      }
    return best;
  });
  expect(patch.density).toBeGreaterThan(1000);
  const density = () =>
    canvas.evaluate((element: HTMLCanvasElement, patch) => {
      const ratio = element.width / element.clientWidth;
      const data = element
        .getContext("2d")!
        .getImageData(
          Math.round((patch.x - 18) * ratio),
          Math.round((patch.y - 18) * ratio),
          Math.ceil(36 * ratio),
          Math.ceil(36 * ratio),
        ).data;
      let sum = 0;
      for (let i = 3; i < data.length; i += 4) sum += data[i];
      return sum;
    }, patch);
  const bounds = (await canvas.boundingBox())!;
  await page.mouse.move(bounds.x + patch.x, bounds.y + patch.y);
  await expect
    .poll(density, { timeout: 5000 })
    .toBeLessThan(patch.density * 0.45);
  const scatteredDensity = await density();
  await page.mouse.move(0, 0);
  // Ambient motion can change the patch slightly; recovery still has to be clear.
  await expect
    .poll(density, { timeout: 7000 })
    .toBeGreaterThan(Math.max(patch.density * 0.5, scatteredDensity * 2));
  await page.getByRole("button", { name: "Pause animations" }).click();
  const staticFrame = await canvas.evaluate((element: HTMLCanvasElement) =>
    element.toDataURL(),
  );
  await page.mouse.move(bounds.x + patch.x, bounds.y + patch.y);
  // Wait over multiple frame opportunities without relying on renderer internals.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  expect(
    await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL()),
  ).toBe(staticFrame);
});
