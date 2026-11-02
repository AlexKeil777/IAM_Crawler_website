import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const endpoint = "https://formsubmit.co/ajax/iamaicrawler@gmail.com";

// Never send real contact emails during automated browser checks.
test.beforeEach(async ({ page }) => {
  await page.route("https://formsubmit.co/**", (route) => route.abort());
});

async function fillContact(page: Page) {
  await page.locator('#contact-form [name="name"]').fill("Market analyst");
  await page
    .locator('#contact-form [name="email"]')
    .fill("analyst@example.com");
  await page
    .locator('#contact-form [name="message"]')
    .fill("I would like to discuss aftermarket coverage in Germany.");
}

test("the page has three focused sections and the requested hero copy", async ({
  page,
}) => {
  await page.goto("./");
  await expect(page.locator("main > section")).toHaveCount(3);
  await expect(page.locator("#home h1")).toHaveText(
    "The intelligent IAM crawler",
  );
  await expect(
    page.locator("#home").getByText("powered by AI", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("#explanation")).toContainText(/representative/i);
  await expect(page.locator("#explanation")).toContainText(/BMW/);
  await expect(page.locator("#contact-form")).toHaveAttribute(
    "action",
    "https://formsubmit.co/iamaicrawler@gmail.com",
  );
  await expect(page.locator("#contact-form")).toHaveAttribute(
    "method",
    /post/i,
  );
  await expect(page.locator("body")).not.toContainText("Form changes.");
});

test("contact form validates required fields before sending", async ({
  page,
}) => {
  let submissions = 0;
  page.on("request", (request) => {
    if (
      request.url().startsWith("https://formsubmit.co/") &&
      request.method() === "POST"
    )
      submissions++;
  });
  await page.goto("./");
  const submit = page.locator('#contact-form button[type="submit"]');
  await submit.click();
  expect(
    await page
      .locator("#contact-form")
      .evaluate((form: HTMLFormElement) => form.checkValidity()),
  ).toBe(false);
  await fillContact(page);
  await page.locator('#contact-form [name="email"]').fill("invalid-email");
  await submit.click();
  expect(
    await page
      .locator('#contact-form [name="email"]')
      .evaluate((input: HTMLInputElement) => input.validity.valid),
  ).toBe(false);
  expect(submissions).toBe(0);
});

test("contact form sends to the intended endpoint and confirms success", async ({
  page,
}) => {
  let payload = "";
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(endpoint, async (route) => {
    expect(route.request().method()).toBe("POST");
    payload = route.request().postData() || "";
    await pending;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: "true" }),
    });
  });
  await page.goto("./");
  await fillContact(page);
  const submit = page.locator('#contact-form button[type="submit"]');
  await submit.click();
  await expect(submit).toBeDisabled();
  release();
  await expect(page.locator("#contact-status")).toHaveText("Message sent.");
  expect(payload).toContain("Market analyst");
  expect(payload).toContain("analyst@example.com");
  await expect(page.locator('#contact-form [name="name"]')).toHaveValue("");
  await expect(page.locator('#contact-form [name="email"]')).toHaveValue("");
  await expect(page.locator('#contact-form [name="message"]')).toHaveValue("");
  await expect(submit).toBeEnabled();
});

test("a failed contact submission preserves the message and allows retry", async ({
  page,
}) => {
  let attempts = 0;
  await page.route(endpoint, (route) => {
    attempts++;
    return route.fulfill({
      status: attempts === 1 ? 500 : 200,
      contentType: "application/json",
      body: JSON.stringify({ success: attempts === 1 ? "false" : "true" }),
    });
  });
  await page.goto("./");
  await fillContact(page);
  const submit = page.locator('#contact-form button[type="submit"]');
  await submit.click();
  await expect(page.locator("#contact-status")).toHaveText(
    "Message could not be sent. Please try again or email us directly.",
  );
  await expect(page.locator('#contact-form [name="message"]')).toHaveValue(
    "I would like to discuss aftermarket coverage in Germany.",
  );
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.locator("#contact-status")).toHaveText("Message sent.");
  expect(attempts).toBe(2);
});

test("motion respects reduced preference and the pause control persists", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  const background = page.locator(".automotive-background");
  const part = background.locator(".floating-part").first();
  const artwork = part.locator("svg.part-art");
  await expect(background).toHaveAttribute("aria-hidden", "true");
  await expect(background).toHaveAttribute("inert", "");
  await expect(background).toHaveCSS("pointer-events", "none");
  await expect(artwork).toHaveCSS("pointer-events", "none");
  for (const type of ["brake-disc", "piston", "wipers", "wheel"]) {
    expect(
      await background.locator(`.floating-part[data-part="${type}"]`).count(),
    ).toBeGreaterThan(0);
  }
  await expect(part).toHaveCSS("animation-name", "none");
  await expect(artwork).toHaveCSS("animation-name", "none");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
  await expect(
    page.getByRole("button", { name: "Play animations" }),
  ).toBeVisible();
  await expect(page.locator("h1")).toHaveCSS("opacity", "1");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(part).not.toHaveCSS("animation-name", "none");
  await expect(artwork).not.toHaveCSS("animation-name", "none");
  await expect(part).toHaveCSS("animation-play-state", "running");
  await expect(artwork).toHaveCSS("animation-play-state", "running");
  await page.getByRole("button", { name: "Pause animations" }).click();
  await expect(part).toHaveCSS("animation-play-state", "paused");
  await expect(artwork).toHaveCSS("animation-play-state", "paused");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
  await expect(page.locator(".floating-part").first()).toHaveCSS(
    "animation-play-state",
    "paused",
  );
});

test("mobile navigation and layouts work without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  const navigation = page.getByRole("navigation", {
    name: "Mobile navigation",
  });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(navigation).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await navigation.getByRole("link", { name: "The crawler" }).click();
  await expect(navigation).toBeHidden();
  await expect(page).toHaveURL(/#explanation$/);
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

test("page has no accessibility violations or runtime errors", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await page.evaluate(() => document.fonts.ready);
  for (const [name, width, height] of [
    ["desktop", 1440, 1000],
    ["mobile", 390, 844],
  ] as const) {
    await page.setViewportSize({ width, height });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    await page.screenshot({
      path: `test-results/${testInfo.project.name}-${name}.png`,
      fullPage: true,
      animations: "disabled",
    });
  }
  expect(errors).toEqual([]);
});
