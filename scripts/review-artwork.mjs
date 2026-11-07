/** Visual QA: review every sculpture at a fixed camera pose, plus page layouts.
 * Run against the local Vite server: node scripts/review-artwork.mjs */
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

await mkdir("test-results", { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
await page.goto("http://127.0.0.1:5173/");
await page.evaluate(() => document.fonts.ready);
await page.locator("#rotor[data-ready=true]").waitFor();
await page.screenshot({ path: "test-results/iamai-desktop.png", fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: "test-results/iamai-mobile.png", fullPage: true });

for (const [label, width, height] of [["desktop", 580, 520], ["mobile", 320, 300]]) {
  await page.setViewportSize({ width: width * 4, height: (height + 52) * 2 });
  const metrics = await page.evaluate(async ({ width, height }) => {
    const { ParticleRotor } = await import("/src/rotor.ts");
    document.body.innerHTML = "";
    document.body.style.cssText = `display:grid;grid-template-columns:repeat(4,${width}px);background:#000;color:#efede7;margin:0`;
    const canvas = document.createElement("canvas");
    canvas.style.cssText = `width:${width}px;height:${height}px;position:absolute;visibility:hidden`;
    document.body.append(canvas);
    const sculpture = new ParticleRotor(canvas);
    sculpture.resize();
    const results = [];
    for (let i = 0; i < sculpture.shapes.length; i++) {
      sculpture.morphTime = i * 2 + 0.5;
      sculpture.time = 0;
      const start = performance.now();
      sculpture.draw();
      results.push({ part: sculpture.shapes[i].name, drawMs: +(performance.now() - start).toFixed(2) });
      const figure = document.createElement("figure");
      figure.style.cssText = "margin:0;border:1px solid #191919";
      const image = document.createElement("img");
      image.src = canvas.toDataURL();
      image.style.cssText = `display:block;width:${width}px;height:${height}px`;
      const caption = document.createElement("figcaption");
      caption.textContent = sculpture.shapes[i].name;
      caption.style.cssText = "font:16px Manrope,sans-serif;padding:12px 20px";
      figure.append(image, caption);
      document.body.append(figure);
    }
    canvas.remove();
    await Promise.all([...document.images].map((image) => image.decode()));
    return results;
  }, { width, height });
  await page.screenshot({ path: `test-results/parts-${label}.png`, fullPage: true });
  if (label === "desktop") {
    for (const [index, name] of ["disc", "pads", "wheel", "radiator", "engine", "piston", "caliper", "control-arm"].entries()) {
      await page.locator("figure").nth(index).screenshot({ path: `test-results/part-${name}.png` });
    }
  }
  console.log(JSON.stringify({ label, metrics }));
}
await browser.close();
