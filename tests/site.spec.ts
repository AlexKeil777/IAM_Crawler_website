import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const endpoint = "https://formsubmit.co/ajax/info@iamaicrawl.com";
const unavailableStatus = "The contact service is temporarily unavailable. Your message is still in the form. Please try again later.";
const unconfirmedStatus = "Delivery could not be confirmed. Your message is still in the form. Please try again.";
const rejectedStatus = "Message could not be sent. Your message is still in the form. Please try again.";

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
  await expect(page.locator("body")).not.toContainText("info@iamaicrawl.com");
  await expect(page.locator("body")).not.toContainText("info@iamaicrawler.com");
  await expect(page.locator(".email-link")).toHaveCount(0);
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  await expect(page.locator("#contact-form")).toHaveAttribute(
    "action",
    "https://formsubmit.co/info@iamaicrawl.com",
  );
  await expect(page.locator("#contact-form")).toHaveAttribute(
    "method",
    /post/i,
  );
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
  await expect(page.locator("#contact-status")).toHaveText("Sending…");
  release();
  await expect(page.locator("#contact-status")).toHaveText("Message sent!");
  expect(payload).toContain("Market analyst");
  expect(payload).toContain("analyst@example.com");
  const source = new URL(page.url());
  expect(JSON.parse(payload)._url).toBe(`${source.origin}${source.pathname}`);
  await expect(page.locator('#contact-form [name="name"]')).toHaveValue("");
  await expect(page.locator('#contact-form [name="email"]')).toHaveValue("");
  await expect(page.locator('#contact-form [name="message"]')).toHaveValue("");
  await expect(submit).toBeEnabled();
  await expect(page.locator("#contact-status")).toHaveText("", { timeout: 2000 });
});

test("contact form revalidates autofilled values after an invalid submission", async ({ page }) => {
  await page.route(endpoint, (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ success: true }),
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
  await expect(page.locator("#contact-status")).toHaveText("Message sent!");
  await expect(page.locator("#contact-message")).toHaveValue("");
});

test("a failed contact submission preserves the message and allows retry", async ({
  page,
}) => {
  let attempts = 0;
  await page.route(endpoint, (route) => {
    attempts++;
    return route.fulfill({
      status: attempts === 1 ? 400 : 200,
      contentType: "application/json",
      body: JSON.stringify({ success: attempts === 1 ? "false" : "true" }),
    });
  });
  await page.goto("./");
  await fillContact(page);
  const submit = page.locator('#contact-form button[type="submit"]');
  await submit.click();
  await expect(page.locator("#contact-status")).toHaveText(
    rejectedStatus,
  );
  await expect(page.locator('#contact-form [name="message"]')).toHaveValue(
    "I would like to discuss aftermarket coverage in Germany.",
  );
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.locator("#contact-status")).toHaveText("Message sent!");
  expect(attempts).toBe(2);
});

test("a FormSubmit 522 outage preserves the complete message without an automatic resend", async ({ page }) => {
  let attempts = 0;
  let sourceUrl = "";
  await page.route(endpoint, (route) => {
    attempts++;
    sourceUrl = route.request().postDataJSON()._url;
    return route.fulfill({ status: 522, contentType: "text/html", body: "<h1>Connection timed out</h1>" });
  });
  await page.goto("./?campaign=contact#contact");
  await fillContact(page);
  const name = "Müller & Partners";
  const company = "R&D + Europe";
  const message = "Please compare A&B = 20% cheaper.\nDetails: https://example.com/part?a=1&b=2\nПривет";
  await page.locator("#contact-name").fill(name);
  await page.locator("#contact-company").fill(company);
  await page.locator("#contact-message").fill(message);
  await page.locator('#contact-form button[type="submit"]').click();
  await expect(page.locator("#contact-status")).toHaveText(unavailableStatus);
  await expect(page.locator("#contact-name")).toHaveValue(name);
  await expect(page.locator("#contact-company")).toHaveValue(company);
  await expect(page.locator("#contact-message")).toHaveValue(message);
  await expect(page.locator('#contact-form button[type="submit"]')).toBeEnabled();
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  const source = new URL(page.url());
  expect(sourceUrl).toBe(`${source.origin}${source.pathname}`);
  expect(attempts).toBe(1);
});

test("a network failure leaves delivery unconfirmed without retrying automatically", async ({ page }) => {
  let attempts = 0;
  await page.route(endpoint, (route) => { attempts++; return route.abort("failed"); });
  await page.goto("./");
  await fillContact(page);
  await page.locator('#contact-form button[type="submit"]').click();
  await expect(page.locator("#contact-status")).toHaveText(unconfirmedStatus);
  await expect(page.locator("#contact-message")).toHaveValue("I would like to discuss aftermarket coverage in Germany.");
  await expect(page.locator('#contact-form button[type="submit"]')).toBeEnabled();
  expect(attempts).toBe(1);
});

test("a stalled contact request times out while preserving the message", async ({ page }) => {
  await page.clock.install();
  let attempts = 0;
  await page.route(endpoint, () => { attempts++; });
  await page.goto("./");
  await fillContact(page);
  const submit = page.locator('#contact-form button[type="submit"]');
  await submit.click();
  await expect(submit).toBeDisabled();
  await page.clock.fastForward(20001);
  await expect(page.locator("#contact-status")).toHaveText(unconfirmedStatus);
  await expect(submit).toBeEnabled();
  await expect(page.locator("#contact-message")).toHaveValue("I would like to discuss aftermarket coverage in Germany.");
  expect(attempts).toBe(1);
});

test("a non-JSON success response does not discard an undelivered contact message", async ({ page }) => {
  await page.route(endpoint, (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<h1>Temporarily unavailable</h1>" }));
  await page.goto("./");
  await fillContact(page);
  await page.locator('#contact-form button[type="submit"]').click();
  await expect(page.locator("#contact-status")).toHaveText(unavailableStatus);
  await expect(page.locator("#contact-message")).toHaveValue("I would like to discuss aftermarket coverage in Germany.");
});

for (const result of [{ success: "false" }, { message: "No success confirmation" }]) {
  test(`an unconfirmed FormSubmit result ${JSON.stringify(result)} never reports success`, async ({ page }) => {
    await page.route(endpoint, (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(result) }));
    await page.goto("./");
    await fillContact(page);
    await page.locator('#contact-form button[type="submit"]').click();
    await expect(page.locator("#contact-status")).toHaveText(rejectedStatus);
    await expect(page.locator("#contact-message")).toHaveValue("I would like to discuss aftermarket coverage in Germany.");
  });
}

test("the honeypot blocks contact delivery", async ({ page }) => {
  let attempts = 0;
  await page.route(endpoint, (route) => { attempts++; return route.abort(); });
  await page.goto("./");
  await fillContact(page);
  await page.locator('#contact-form [name="_honey"]').evaluate((field: HTMLInputElement) => { field.value = "spam"; });
  await page.locator('#contact-form button[type="submit"]').click();
  await expect(page.locator("#contact-status")).toHaveText(rejectedStatus);
  expect(attempts).toBe(0);
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
