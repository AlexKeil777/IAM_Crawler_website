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

test("particles scatter around the cursor, return, and stop with reduced motion", async ({
  page,
  context,
}) => {
  const control = await context.newPage();
  const start = new Date("2026-11-07T12:00:00Z");
  for (const scene of [page, control]) {
    await scene.emulateMedia({ reducedMotion: "no-preference" });
    await scene.clock.install({ time: start });
    await scene.clock.pauseAt(new Date(start.getTime() + 100));
    await scene.goto("./");
    await scene.evaluate(() => document.fonts.ready);
    await expect(scene.locator("html")).toHaveAttribute("data-motion", "playing");
    await expect(scene.locator("#rotor")).toHaveAttribute("data-ready", "true");
  }
  const canvas = page.locator("#rotor");
  const controlCanvas = control.locator("#rotor");
  const advance = async (milliseconds: number) => {
    await Promise.all([
      page.clock.runFor(milliseconds),
      control.clock.runFor(milliseconds),
    ]);
  };
  // An untouched sculpture at the same elapsed time separates cursor effects
  // from ordinary changes of part, camera pose and ambient particle movement.
  const signature = (target: typeof canvas) => target.evaluate((element: HTMLCanvasElement) => {
    const { width, height } = element;
    const pixels = element.getContext("2d")!.getImageData(0, 0, width, height).data;
    const cells = Array<number>(32 * 32).fill(0);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        cells[Math.floor(y * 32 / height) * 32 + Math.floor(x * 32 / width)] +=
          pixels[(y * width + x) * 4 + 3];
      }
    }
    const total = cells.reduce((sum, value) => sum + value, 0);
    return cells.map((value) => value / total);
  });
  const difference = (a: number[], b: number[]) =>
    a.reduce((sum, value, i) => sum + Math.abs(value - b[i]), 0);
  await advance(250);
  expect(difference(await signature(canvas), await signature(controlCanvas))).toBeLessThan(0.02);
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
  const density = (target: typeof canvas) =>
    target.evaluate((element: HTMLCanvasElement, patch) => {
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
  await advance(450);
  expect(await density(canvas)).toBeLessThan((await density(controlCanvas)) * 0.45);
  const scatteredDifference = difference(await signature(canvas), await signature(controlCanvas));
  expect(scatteredDifference).toBeGreaterThan(0.08);
  await page.mouse.move(0, 0);
  // Let the spring settle and compare during a later part's hold, where a
  // frame of initial scheduling variation cannot become a fast morph change.
  await advance(4300);
  await expect(canvas).toHaveAttribute("data-part", "Alloy wheel");
  await expect(controlCanvas).toHaveAttribute("data-part", "Alloy wheel");
  const recoveredDifference = difference(await signature(canvas), await signature(controlCanvas));
  expect(recoveredDifference).toBeLessThan(0.07);
  expect(recoveredDifference).toBeLessThan(scatteredDifference * 0.35);
  await control.close();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
  const staticFrame = await canvas.evaluate((element: HTMLCanvasElement) =>
    element.toDataURL(),
  );
  await page.mouse.move(bounds.x + patch.x, bounds.y + patch.y);
  // Run beyond another part transition while reduced motion keeps the exact
  // rendered frame unchanged, including when the pointer enters the sculpture.
  await page.clock.runFor(2200);
  expect(
    await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL()),
  ).toBe(staticFrame);
});
