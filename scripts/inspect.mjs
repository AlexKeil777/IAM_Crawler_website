import { chromium } from "@playwright/test";
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
await page.goto("http://127.0.0.1:5173");
await page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all(
    document
      .getAnimations()
      .filter((a) => a.effect?.getTiming().iterations !== Infinity)
      .map((a) => a.finished.catch(() => {})),
  );
});
await page.screenshot({
  path: "test-results/desktop-review.png",
  fullPage: true,
});
await page.screenshot({ path: "test-results/hero-review.png" });
for (const width of [320, 390, 620, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(resolve)),
  );
  console.log(
    JSON.stringify(
      await page.evaluate(() => ({
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        overflow: [...document.querySelectorAll("body *")]
          .filter((e) => {
            const r = e.getBoundingClientRect();
            return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1);
          })
          .map((e) => ({
            tag: e.tagName,
            cls: e.className,
            left: Math.round(e.getBoundingClientRect().left),
            right: Math.round(e.getBoundingClientRect().right),
          }))
          .slice(0, 14),
      })),
    ),
  );
}
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({
  path: "test-results/mobile-review.png",
  fullPage: true,
});
await browser.close();
