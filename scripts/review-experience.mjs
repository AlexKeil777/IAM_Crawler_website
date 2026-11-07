/** Screenshot the story, interactive method and opening mirror at local Vite. */
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

await mkdir("test-results", { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
await page.route("https://formsubmit.co/**", (route) => route.abort());
await page.goto("http://127.0.0.1:5173/");
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: "test-results/experience-desktop.png", fullPage: true });
await page.locator("#story-view").screenshot({ path: "test-results/experience-story.png" });
await page.locator("#method-open").click();
await page.locator("#explanation[data-view=method]").waitFor();
await page.locator("#method-view").screenshot({ path: "test-results/experience-method.png" });
for (const language of ["de", "it", "ru"]) {
  await page.locator("#language-selector").selectOption(language);
  await page.evaluate(() => document.fonts.ready);
  await page.locator("#method-step-3").click();
  await page.locator("#method-view").screenshot({ path: `test-results/experience-method-${language}.png` });
}
await page.setViewportSize({ width: 390, height: 844 });
await page.locator("#language-selector").selectOption("en");
await page.locator("#method-view").screenshot({ path: "test-results/experience-method-mobile.png" });
await page.locator("#method-back").click();
await page.locator(".customer-quote").screenshot({ path: "test-results/experience-quote-mobile.png" });
await page.locator(".story-answer").screenshot({ path: "test-results/experience-question-mobile.png" });
await page.close();

const opening = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "no-preference" });
const start = new Date("2026-11-07T12:00:00Z");
await opening.clock.install({ time: start });
await opening.clock.pauseAt(new Date(start.getTime() + 100));
await opening.goto("http://127.0.0.1:5173/");
await opening.evaluate(() => document.fonts.ready);
const rect = await opening.locator("#logo-reveal").boundingBox();
const frames = [];
let elapsed = 0;
for (const time of [0, 1200, 1900, 2700, 3700]) {
  if (time > elapsed) await opening.clock.runFor(time - elapsed);
  elapsed = time;
  const buffer = await opening.screenshot({ clip: { x: rect.x - 10, y: Math.max(0, rect.y - 110), width: rect.width + 20, height: rect.height + 130 } });
  frames.push({ time, image: buffer.toString("base64") });
}
await opening.setContent(`<html><body style="margin:0;background:#000;color:#efede7;display:flex;font:14px Arial">${frames.map((frame) => `<figure style="margin:0;padding:16px"><img src="data:image/png;base64,${frame.image}" style="display:block"><figcaption style="padding-top:12px">${frame.time} ms</figcaption></figure>`).join("")}</body></html>`);
await opening.setViewportSize({ width: Math.ceil((rect.width + 52) * frames.length), height: Math.ceil(rect.height + 205) });
await opening.screenshot({ path: "test-results/experience-logo-sequence.png" });
await opening.close();

const transition = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "no-preference" });
await transition.clock.install({ time: start });
await transition.clock.pauseAt(new Date(start.getTime() + 100));
await transition.goto("http://127.0.0.1:5173/");
await transition.evaluate(() => document.fonts.ready);
await transition.locator("#method-open").click();
elapsed = 0;
for (const time of [200, 600, 1300]) {
  await transition.clock.runFor(time - elapsed);
  elapsed = time;
  await transition.screenshot({ path: `test-results/experience-transition-${time}.png` });
}
await browser.close();
