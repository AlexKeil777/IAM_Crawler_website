import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("workflow supports all stages and keyboard navigation", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/IAM Crawler/);
  for (const name of ["Browse", "Understand", "Verify", "Discover"]) {
    const tab = page.getByRole("tab", { name: new RegExp(name) });
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true");
    const panel = page.locator(`#${await tab.getAttribute("aria-controls")}`);
    await expect(panel).toBeVisible();
    await expect(page.getByRole("tabpanel")).toHaveCount(1);
  }
  await page.getByRole("tab", { name: /Discover/ }).focus();
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: /Verify/ })).toBeFocused();
  await expect(page.locator("#panel-verify")).toBeVisible();
  await page.keyboard.press("Home");
  await expect(page.locator("#panel-discover")).toBeVisible();
});

test("offer decisions and filters stay coherent during quick changes", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('[data-offer="pair"]').click();
  await expect(page.locator("#explanation-title")).toHaveText(
    "Two discs are a different quantity.",
  );
  await page.getByRole("button", { name: "Comparable 1", exact: true }).click();
  await expect(page.locator(".offer-row:visible")).toHaveCount(1);
  await expect(page.locator("#explanation-title")).toHaveText(
    "The same product, in the same quantity.",
  );
  await page.getByRole("button", { name: "Excluded 3", exact: true }).click();
  await expect(page.locator(".offer-row:visible")).toHaveCount(3);
  await page.locator('[data-offer="used"]').click();
  await expect(page.locator("#explanation-title")).toHaveText(
    "The condition changes the comparison.",
  );
  await page.locator('[data-filter="all"]').click();
  await page.locator('[data-filter="kept"]').click();
  await page.locator('[data-filter="excluded"]').click();
  await expect(page.locator(".offer-row:visible")).toHaveCount(3);
  await expect(page.locator(".offer-row.selected:visible")).toHaveCount(1);
});

test("motion respects reduced preference and the pause control persists", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
  await expect(
    page.getByRole("button", { name: "Play animations" }),
  ).toBeVisible();
  await expect(page.locator(".advantage[open] .advantage-body")).toHaveCSS(
    "opacity",
    "1",
  );
  await page.getByText("The shops can change.", { exact: false }).click();
  await expect(page.locator(".advantage[open] .advantage-body")).toHaveCSS(
    "opacity",
    "1",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByRole("button", { name: "Pause animations" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
});

test("mobile navigation, disclosure and layouts work without page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "How it works" })
    .click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeHidden();
  await page.getByText("The shops can change.", { exact: false }).click();
  await expect(page.locator(".advantage[open]")).toHaveCount(1);
  for (const width of [320, 390, 620, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `Overflow at ${width}px`,
    ).toBe(true);
  }
});

test("example download has the real output schema and explicit illustrative data", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download an example CSV" }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("illustrative-offers.csv");
  const response = await request.get("/examples/illustrative-offers.csv");
  expect(response.ok()).toBe(true);
  const text = await response.text();
  const lines = text.trim().split(/\r?\n/);
  expect(lines).toHaveLength(5);
  for (const field of [
    "brand_pn",
    "price_wo_vat",
    "url",
    "kept",
    "left_out_reason",
    "left_out_detail",
  ])
    expect(lines[0].split(",")).toContain(field);
  expect(text).toContain("ILLUSTRATIVE");
  const columns = lines[0].split(",").length;
  for (const row of lines.slice(1))
    expect(row.split(",")).toHaveLength(columns);
});

test("page has no serious accessibility violations or runtime errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      document
        .getAnimations()
        .filter(
          (animation) => animation.effect?.getTiming().iterations !== Infinity,
        )
        .map((animation) => animation.finished.catch(() => {})),
    );
  });
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  expect(errors).toEqual([]);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(mobileResults.violations).toEqual([]);
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
});
