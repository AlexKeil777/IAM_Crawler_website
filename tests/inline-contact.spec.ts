import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const endpoint = "https://api.web3forms.com/submit";
const accessKey = "11111111-1111-4111-8111-111111111111";
const captchaScript = "https://js.hcaptcha.com/**";

// Exercise the real integration with a configured public key, while replacing
// the external CAPTCHA SDK and intercepting every delivery endpoint.
const mockCaptcha = `(() => {
  let nextId = 0;
  let nextToken = 0;
  const widgets = new Map();
  const invoke = (callback, ...args) => {
    if (typeof callback === 'function') callback(...args);
    else if (typeof callback === 'string') window[callback]?.(...args);
  };
  const find = (id) => id === undefined ? [...widgets.values()][0] : widgets.get(String(id));
  window.hcaptcha = {
    render(container, options) {
      const element = typeof container === 'string' ? document.getElementById(container) : container;
      const id = String(++nextId);
      const checkbox = document.createElement('button');
      checkbox.type = 'button';
      checkbox.setAttribute('role', 'checkbox');
      checkbox.setAttribute('aria-label', 'Complete CAPTCHA');
      checkbox.setAttribute('aria-checked', 'false');
      checkbox.textContent = 'Complete CAPTCHA';
      checkbox.style.cssText = 'background:#b69af7;color:#000';
      const widget = { element, options, checkbox, token: '' };
      checkbox.addEventListener('click', () => {
        widget.token = 'mock-captcha-' + id + '-' + (++nextToken);
        checkbox.setAttribute('aria-checked', 'true');
        invoke(options.callback, widget.token);
      });
      widgets.set(id, widget);
      element.append(checkbox);
      return id;
    },
    getResponse(id) { return find(id)?.token || ''; },
    reset(id) {
      const widget = find(id);
      if (!widget) return;
      widget.token = '';
      widget.checkbox.setAttribute('aria-checked', 'false');
    },
    remove(id) {
      const widget = find(id);
      widget?.element.replaceChildren();
      widgets.delete(String(id));
    }
  };
  window.expireMockCaptcha = () => {
    const widget = [...widgets.values()].at(-1);
    widget.token = '';
    widget.checkbox.setAttribute('aria-checked', 'false');
    invoke(widget.options['expired-callback']);
  };
  window.iamaiCaptchaReady();
})();`;

test.beforeEach(async ({ page }) => {
  await page.route("https://formsubmit.co/**", (route) => route.abort());
  await page.route("https://api.web3forms.com/**", (route) => route.abort());
  await page.route(captchaScript, (route) => route.fulfill({
    contentType: "text/javascript", body: mockCaptcha,
  }));
  await page.route("http://127.0.0.1:*/**", async (route) => {
    const request = route.request();
    if (request.method() !== "GET" || !request.isNavigationRequest() || request.frame() !== page.mainFrame()) {
      return route.fallback();
    }
    const response = await route.fetch();
    const html = await response.text();
    expect(html).toMatch(/name="access_key"\s+value="[^"]*"/);
    return route.fulfill({
      response,
      body: html.replace(/(name="access_key"\s+value=")[^"]*(")/, (_match, prefix, suffix) => `${prefix}${accessKey}${suffix}`),
    });
  });
});

async function fillContact(page: Page) {
  await page.locator("#contact-name").fill("Müller & Partners");
  await page.locator("#contact-email").fill("analyst@example.com");
  await page.locator("#contact-company").fill("R&D + Europe");
  await page.locator("#contact-message").fill("Please compare A&B = 20% cheaper.\nПривет");
}

async function solveCaptcha(page: Page) {
  await page.getByRole("checkbox", { name: "Complete CAPTCHA" }).click();
}

test("inline CAPTCHA is required, expires, and follows the selected language", async ({ page }) => {
  let attempts = 0;
  await page.route(endpoint, (route) => { attempts++; return route.abort(); });
  await page.goto("./");
  const initialUrl = page.url();
  await fillContact(page);
  const submit = page.locator('#contact-form button[type="submit"]');
  await submit.click();
  await expect(page.locator("#contact-status")).toHaveText("Please complete the CAPTCHA.");
  await solveCaptcha(page);
  await page.evaluate(() => (window as typeof window & { expireMockCaptcha: () => void }).expireMockCaptcha());
  await submit.click();
  await expect(page.locator("#contact-status")).toHaveText("Please complete the CAPTCHA.");
  await page.locator("#language-selector").selectOption("de");
  await submit.click();
  await expect(page.locator("#contact-status")).toHaveText("Bitte bestätigen Sie das CAPTCHA.");
  expect(page.url()).toBe(initialUrl);
  expect(attempts).toBe(0);
});

test("inline submission keeps visitors on the page and sends the verified Unicode enquiry once", async ({ page }) => {
  const clockStart = new Date("2026-11-08T12:00:00Z");
  await page.clock.install({ time: clockStart });
  let attempts = 0;
  let payload: Record<string, unknown> = {};
  let release!: () => void;
  const pending = new Promise<void>((resolve) => { release = resolve; });
  await page.route(endpoint, async (route) => {
    attempts++;
    expect(route.request().isNavigationRequest()).toBe(false);
    payload = route.request().postDataJSON();
    await pending;
    return route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true }) });
  });
  await page.goto("./?campaign=inline#contact");
  const initialUrl = page.url();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 844 });
  await expect(page.getByRole("checkbox", { name: "Complete CAPTCHA" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(accessibility.violations).toEqual([]);
  await fillContact(page);
  await solveCaptcha(page);
  const submit = page.locator('#contact-form button[type="submit"]');
  await submit.click();
  await expect(submit).toBeDisabled();
  await expect(page.locator("#contact-status")).toHaveText("Sending…");
  await page.locator("#contact-form").evaluate((form: HTMLFormElement) => form.requestSubmit());
  expect(attempts).toBe(1);
  await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now()) + 1000));
  release();
  await expect(page.locator("#contact-status")).toHaveText("Thank you. Your message has been submitted.");
  await expect(submit).toBeEnabled();
  expect(page.url()).toBe(initialUrl);
  expect(payload.access_key).toBe(accessKey);
  expect(payload["h-captcha-response"]).toMatch(/^mock-captcha-/);
  expect(payload.subject).toBe("IAMAI website enquiry");
  expect(payload.name).toBe("Müller & Partners");
  expect(payload.email).toBe("analyst@example.com");
  expect(payload.company).toBe("R&D + Europe");
  expect(payload.message).toBe("Please compare A&B = 20% cheaper.\nПривет");
  expect(payload).not.toHaveProperty("_honey");
  expect(payload).not.toHaveProperty("_next");
  for (const field of ["name", "email", "company", "message"]) {
    await expect(page.locator(`#contact-${field}`)).toHaveValue("");
  }
  const emailDraft = new URL((await page.locator("#contact-email-link").getAttribute("href"))!);
  expect(emailDraft.searchParams.get("body")).not.toContain(String(payload.name));
  expect(emailDraft.searchParams.get("body")).not.toContain(String(payload.email));
  expect(emailDraft.searchParams.get("body")).not.toContain(String(payload.company));
  expect(emailDraft.searchParams.get("body")).not.toContain(String(payload.message));
  await expect(page.getByRole("checkbox", { name: "Complete CAPTCHA" })).not.toBeChecked();
  await page.clock.fastForward(999);
  await expect(page.locator("#contact-status")).toHaveText("Thank you. Your message has been submitted.");
  await page.clock.fastForward(1);
  await expect(page.locator("#contact-status")).toBeEmpty();
  await page.locator("#language-selector").selectOption("de");
  await expect(page.locator("#contact-status")).toBeEmpty();
});

test("a rejected inline token preserves the message and permits a fresh verified retry", async ({ page }) => {
  const tokens: unknown[] = [];
  await page.route(endpoint, (route) => {
    tokens.push(route.request().postDataJSON()["h-captcha-response"]);
    return route.fulfill({
      status: tokens.length === 1 ? 400 : 200,
      contentType: "application/json",
      body: JSON.stringify(tokens.length === 1
        ? { success: false, message: "Captcha verification failed" }
        : { success: true }),
    });
  });
  await page.goto("./");
  await fillContact(page);
  await solveCaptcha(page);
  const submit = page.locator('#contact-form button[type="submit"]');
  await submit.click();
  await expect(page.locator("#contact-status")).toContainText("Your message was not accepted. Please try again or email us directly.");
  await expect(page.locator("#contact-status")).toContainText("Captcha verification failed");
  await expect(page.locator("#contact-name")).toHaveValue("Müller & Partners");
  await expect(page.locator("#contact-email")).toHaveValue("analyst@example.com");
  await expect(page.locator("#contact-company")).toHaveValue("R&D + Europe");
  await expect(page.locator("#contact-message")).toHaveValue("Please compare A&B = 20% cheaper.\nПривет");
  await submit.click();
  await expect(page.locator("#contact-status")).toHaveText("Please complete the CAPTCHA.");
  expect(tokens).toHaveLength(1);
  await solveCaptcha(page);
  await submit.click();
  await expect(page.locator("#contact-status")).toHaveText("Thank you. Your message has been submitted.");
  expect(tokens).toHaveLength(2);
  expect(tokens[1]).not.toBe(tokens[0]);
  for (const field of ["name", "email", "company", "message"]) {
    await expect(page.locator(`#contact-${field}`)).toHaveValue("");
  }
});

test("success keeps fresh edits and its timer cannot hide a newer validation error", async ({ page }) => {
  const clockStart = new Date("2026-11-08T12:00:00Z");
  await page.clock.install({ time: clockStart });
  let release!: () => void;
  const pending = new Promise<void>((resolve) => { release = resolve; });
  await page.route(endpoint, async (route) => {
    await pending;
    return route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true }) });
  });
  await page.goto("./");
  await fillContact(page);
  await solveCaptcha(page);
  const submit = page.locator('#contact-form button[type="submit"]');
  await submit.click();
  await expect(submit).toBeDisabled();
  await page.locator("#contact-company").fill("New company for the next enquiry");
  await page.locator("#contact-message").fill("New message written while the previous request was sending");
  await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now()) + 1000));
  release();
  await expect(page.locator("#contact-status")).toHaveText("Thank you. Your message has been submitted.");
  await expect(submit).toBeEnabled();
  await expect(page.locator("#contact-name")).toHaveValue("");
  await expect(page.locator("#contact-email")).toHaveValue("");
  await expect(page.locator("#contact-company")).toHaveValue("New company for the next enquiry");
  await expect(page.locator("#contact-message")).toHaveValue("New message written while the previous request was sending");
  await submit.click();
  await expect(page.locator("#contact-status")).toHaveText("Please complete this field.");
  await page.clock.fastForward(1000);
  await expect(page.locator("#contact-status")).toHaveText("Please complete this field.");
});

test("a blocked inline CAPTCHA keeps the draft and direct email available", async ({ page }) => {
  await page.route(captchaScript, (route) => route.abort());
  await page.goto("./");
  await expect(page.locator("#contact-status")).toHaveText("The CAPTCHA could not load. Please reload the page or email us directly.");
  await fillContact(page);
  await expect(page.locator("#contact-message")).toHaveValue("Please compare A&B = 20% cheaper.\nПривет");
  await expect(page.locator("#contact-email-link")).toBeVisible();
  await expect(page.locator("#contact-email-link")).toHaveAttribute("href", /^mailto:info@iamaicrawl\.com/);
});
