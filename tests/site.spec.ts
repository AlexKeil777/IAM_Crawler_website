import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const endpoint = "https://formsubmit.co/info@iamaicrawl.com";
const verificationPage = "<!doctype html><title>Form verification</title><h1>Complete form verification</h1>";

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
  await expect(page.locator("#hero-title .crawl-line .line-text")).toHaveText([
    "Crawl efficiently",
    "Crawl reliably",
    "Crawl flexibly",
    "Crawl intelligently",
  ]);
  for (const [index, line] of (
    await page.locator("#hero-title .crawl-line").all()
  ).entries()) {
    await expect(line).toHaveAttribute("data-line-order", String(index));
  }
  await expect(page.locator("#home")).not.toContainText(
    "The intelligent IAM crawler",
  );
  await expect(page.locator("#home")).not.toContainText("powered by AI");
  await expect(page.locator("#language-selector")).toHaveValue("en");
  await expect(page.locator("#language-selector option")).toHaveText([
    "DE", "EN", "IT", "RU",
  ]);
  await expect(page.locator("#story-view blockquote")).toContainText(
    "Wow, the original part is far too expensive. I think I'll buy an aftermarket part instead",
  );
  await expect(page.locator("#explanation-title")).toHaveText(
    "\"If the aftermarket part is not at least 20% cheaper, i may as well buy the genuine part\"",
  );
  await expect(page.locator("#method-open")).toHaveText("Check out our method");
  await expect(page.locator("#method-view")).toBeHidden();
  await expect(page.locator("#explanation")).toHaveAttribute("data-view", "story");
  await expect(page.locator("#explanation table")).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText("info@iamaicrawler.com");
  await expect(page.locator("#contact-email-link")).toBeVisible();
  await expect(page.locator("#contact-email-link")).toHaveAttribute("href", /^mailto:info@iamaicrawl\.com/);
  await expect(page.locator("#contact-form")).toHaveAttribute(
    "action",
    "https://formsubmit.co/info@iamaicrawl.com",
  );
  await expect(page.locator("#contact-form")).toHaveAttribute(
    "method",
    /post/i,
  );
  await expect(page.locator('#contact-form [name="_captcha"][value="false"]')).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText("Form changes.");
});

test("hero lines finish revealing in order and reduced motion shows all immediately", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    const state = window as typeof window & {
      crawlRevealOrder: { index: number; time: number }[];
    };
    state.crawlRevealOrder = [];
    const observe = (time: number) => {
      document
        .querySelectorAll("#hero-title .crawl-line")
        .forEach((line, index) => {
          const text = line.querySelector(".line-text")!;
          if (
            line.getAttribute("data-revealed") === "true" &&
            Number(getComputedStyle(text).opacity) >= 0.99 &&
            !state.crawlRevealOrder.some((entry) => entry.index === index)
          ) {
            state.crawlRevealOrder.push({ index, time });
          }
        });
      if (state.crawlRevealOrder.length < 4) requestAnimationFrame(observe);
    };
    requestAnimationFrame(observe);
  });
  await page.goto("./");
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          (
            window as typeof window & {
              crawlRevealOrder: { index: number; time: number }[];
            }
          ).crawlRevealOrder.map((entry) => entry.index),
        ),
      { timeout: 12000 },
    )
    .toEqual([0, 1, 2, 3]);
  const times = await page.evaluate(() =>
    (
      window as typeof window & { crawlRevealOrder: { time: number }[] }
    ).crawlRevealOrder.map((entry) => entry.time),
  );
  expect(times[1]).toBeGreaterThan(times[0]);
  expect(times[2]).toBeGreaterThan(times[1]);
  expect(times[3]).toBeGreaterThan(times[2]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
  for (const line of await page.locator("#hero-title .crawl-line").all()) {
    await expect(line).toHaveAttribute("data-revealed", "true");
    await expect(line.locator(".line-text")).toHaveCSS("opacity", "1");
  }
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
  await expect(page.locator("#contact-status")).toHaveText("Please complete this field.");
  expect(
    await page
      .locator("#contact-form")
      .evaluate((form: HTMLFormElement) => form.checkValidity()),
  ).toBe(false);
  await fillContact(page);
  await page.locator('#contact-form [name="email"]').fill("invalid-email");
  await submit.click();
  await expect(page.locator("#contact-status")).toHaveText("Please enter a valid email address.");
  expect(
    await page
      .locator('#contact-form [name="email"]')
      .evaluate((input: HTMLInputElement) => input.validity.valid),
  ).toBe(false);
  expect(submissions).toBe(0);
});

test("contact form uses a native POST with CAPTCHA and shows provider verification", async ({ page }) => {
  let attempts = 0;
  let payload = new URLSearchParams();
  let navigationRequest = false;
  let contentType = "";
  await page.route(endpoint, async (route) => {
    attempts++;
    const request = route.request();
    expect(request.method()).toBe("POST");
    navigationRequest = request.isNavigationRequest();
    contentType = request.headers()["content-type"];
    payload = new URLSearchParams(request.postData() || "");
    await route.fulfill({ status: 200, contentType: "text/html", body: verificationPage });
  });
  await page.goto("./?campaign=contact#contact");
  const source = new URL(page.url());
  await fillContact(page);
  const name = "Müller & Partners";
  const company = "R&D + Europe";
  const message = "Please compare A&B = 20% cheaper.\nDetails: https://example.com/part?a=1&b=2\nПривет";
  await page.locator("#contact-name").fill(name);
  await page.locator("#contact-company").fill(company);
  await page.locator("#contact-message").fill(message);
  const submit = page.locator('#contact-form button[type="submit"]');
  await submit.click();
  await expect(page).toHaveURL(endpoint);
  await expect(page.getByRole("heading", { name: "Complete form verification" })).toBeVisible();
  expect(attempts).toBe(1);
  expect(navigationRequest).toBe(true);
  expect(contentType).toContain("application/x-www-form-urlencoded");
  expect(payload.get("name")).toBe(name);
  expect(payload.get("email")).toBe("analyst@example.com");
  expect(payload.get("company")).toBe(company);
  expect(payload.get("message")?.replace(/\r\n/g, "\n")).toBe(message);
  expect(payload.get("_url")).toBe(source.origin + source.pathname);
  expect(payload.get("_subject")).toBe("IAMAI website enquiry");
  expect(payload.has("_honey")).toBe(false);
  expect(payload.get("_captcha")).not.toBe("false");
});

test("contact form revalidates autofilled values after an invalid submission", async ({ page }) => {
  await page.route(endpoint, (route) => route.fulfill({
    status: 200, contentType: "text/html", body: verificationPage,
  }));
  await page.goto("./");
  await page.locator('#contact-form button[type="submit"]').click();
  // Autofill can update values without emitting input events.
  await page.locator("#contact-form").evaluate((form: HTMLFormElement) => {
    (form.elements.namedItem("name") as HTMLInputElement).value = "Market analyst";
    (form.elements.namedItem("email") as HTMLInputElement).value = "analyst@example.com";
    (form.elements.namedItem("message") as HTMLTextAreaElement).value = "Please contact me.";
  });
  await page.locator('#contact-form button[type="submit"]').click();
  await expect(page).toHaveURL(endpoint);
  await expect(page.getByRole("heading", { name: "Complete form verification" })).toBeVisible();
});

test("native form submission works when JavaScript is disabled", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  let payload = new URLSearchParams();
  await context.route("https://formsubmit.co/**", (route) => {
    expect(route.request().url()).toBe(endpoint);
    expect(route.request().method()).toBe("POST");
    expect(route.request().isNavigationRequest()).toBe(true);
    payload = new URLSearchParams(route.request().postData() || "");
    return route.fulfill({ status: 200, contentType: "text/html", body: verificationPage });
  });
  try {
    await page.goto("./");
    await expect(page.locator("#contact-email-link")).toBeVisible();
    await fillContact(page);
    await page.locator('#contact-form button[type="submit"]').click();
    await expect(page).toHaveURL(endpoint);
    await expect(page.getByRole("heading", { name: "Complete form verification" })).toBeVisible();
    expect(payload.get("name")).toBe("Market analyst");
    expect(payload.get("email")).toBe("analyst@example.com");
    expect(payload.get("message")).toContain("aftermarket coverage");
    expect(payload.get("_url")).toBe("https://iamaicrawl.com/");
    expect(payload.get("_captcha")).not.toBe("false");
  } finally {
    await context.close();
  }
});

test("direct email includes the complete form text without sending it through FormSubmit", async ({ page }) => {
  let providerRequests = 0;
  page.on("request", (request) => {
    if (request.url().startsWith("https://formsubmit.co/")) providerRequests++;
  });
  await page.goto("./");
  const name = "Müller & Partners";
  const company = "R&D + Europe";
  const message = "A&B = 20% cheaper.\nDetails: https://example.com/part?a=1&b=2\nПривет";
  await page.locator("#contact-name").fill(name);
  await page.locator("#contact-email").fill("analyst@example.com");
  await page.locator("#contact-company").fill(company);
  await page.locator("#contact-message").fill(message);
  const link = page.locator("#contact-email-link");
  await expect(link).toBeVisible();
  const email = new URL((await link.getAttribute("href"))!);
  expect(email.protocol).toBe("mailto:");
  expect(email.pathname).toBe("info@iamaicrawl.com");
  expect(email.searchParams.get("subject")).toBe("IAMAI website enquiry");
  const body = email.searchParams.get("body")?.replace(/\r\n/g, "\n") || "";
  for (const value of [name, "analyst@example.com", company, message]) expect(body).toContain(value);
  // Autofill and Back can change fields without input events. Refresh the
  // draft on activation while preventing the test from opening a mail app.
  await page.locator("#contact-message").evaluate((field: HTMLTextAreaElement) => {
    field.value = "Restored message & updated details";
  });
  await link.evaluate((anchor: HTMLAnchorElement) => {
    anchor.addEventListener("click", (event) => event.preventDefault(), { once: true });
    anchor.click();
  });
  const refreshed = new URL((await link.getAttribute("href"))!);
  expect(refreshed.searchParams.get("body")).toContain("Restored message & updated details");
  expect(providerRequests).toBe(0);
});

test("contact submission survives autofill of text fields", async ({ page }) => {
  let attempts = 0;
  await page.route(endpoint, (route) => {
    attempts++;
    return route.fulfill({ status: 200, contentType: "text/html", body: verificationPage });
  });
  await page.goto("./");
  await fillContact(page);
  // Some autofill tools fill text inputs even when they are visually hidden
  // and autocomplete is off. A real enquiry must still reach verification.
  await page.locator('#contact-form input[type="text"]').evaluateAll((fields: HTMLInputElement[]) => {
    fields.forEach((field) => { field.value = "Autofilled contact"; });
  });
  await page.locator('#contact-form button[type="submit"]').click();
  await expect(page).toHaveURL(endpoint);
  await expect(page.getByRole("heading", { name: "Complete form verification" })).toBeVisible();
  expect(attempts).toBe(1);
});

test("motion follows the device preference without a header control or stored override", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem("iam-motion", "paused"));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("./");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "playing");
  await expect(page.locator(".site-header .motion-toggle")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /(?:play|pause) animations/i })).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".automotive-background")).toHaveCount(0);
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
  await expect(page.locator("h1")).toHaveCSS("opacity", "1");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("html")).toHaveAttribute("data-motion", "playing");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "playing");
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
  for (const width of [320, 360, 390, 480, 620, 768, 900, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `Overflow at ${width}px`,
    ).toBe(true);
    for (const selector of ["#hero-title", "#text-particles", "#rotor"]) {
      const rect = (await page.locator(selector).boundingBox())!;
      expect(
        rect.x,
        `${selector} left edge at ${width}px`,
      ).toBeGreaterThanOrEqual(-0.5);
      expect(
        rect.x + rect.width,
        `${selector} right edge at ${width}px`,
      ).toBeLessThanOrEqual(width + 0.5);
    }
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
