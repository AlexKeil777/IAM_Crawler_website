import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const endpoint = "https://formsubmit.co/ajax/info@iamaicrawler.com";

const translations = {
  de: {
    title: "IAMAI — Intelligentes IAM-Crawling", hero: "Effizient crawlen",
    question: "Wie viel teurer sind wir?", quote: "Wow, das Originalteil ist viel zu teuer.",
    cta: "Entdecken Sie unsere Methode", method: "Unsere Methode", step: "Teil und Markt festlegen",
    contact: "Kontakt", message: "Nachricht", language: "Sprache", play: "Animationen abspielen",
    menu: "Navigation öffnen", subject: "Anfrage über die IAMAI-Website",
    required: "Bitte füllen Sie dieses Feld aus.", invalidEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
    success: "Nachricht gesendet.",
    failure: "Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt eine E-Mail.",
  },
  en: {
    title: "IAMAI — Intelligent IAM crawling", hero: "Crawl efficiently",
    question: "How much more expensive are we?", quote: "Wow, the original part is far too expensive.",
    cta: "Check out our method", method: "Our method", step: "Define the part and market",
    contact: "Contact", message: "Message", language: "Language", play: "Play animations",
    menu: "Open navigation", subject: "IAMAI website enquiry",
    required: "Please complete this field.", invalidEmail: "Please enter a valid email address.",
    success: "Message sent.",
    failure: "Message could not be sent. Please try again or email us directly.",
  },
  it: {
    title: "IAMAI — Crawling intelligente per l'IAM", hero: "Esplora con efficienza",
    question: "Quanto costiamo in più?", quote: "Accidenti, il ricambio originale costa davvero troppo.",
    cta: "Scopri il nostro metodo", method: "Il nostro metodo", step: "Definire ricambio e mercato",
    contact: "Contatti", message: "Messaggio", language: "Lingua", play: "Avvia le animazioni",
    menu: "Apri il menu di navigazione", subject: "Richiesta dal sito IAMAI",
    required: "Compila questo campo.", invalidEmail: "Inserisci un indirizzo email valido.",
    success: "Messaggio inviato.",
    failure: "Impossibile inviare il messaggio. Riprova oppure scrivici direttamente via email.",
  },
  ru: {
    title: "IAMAI — Интеллектуальный сбор данных об IAM", hero: "Собирайте эффективно",
    question: "Насколько мы дороже?", quote: "Ого, оригинальная запчасть слишком дорогая.",
    cta: "Познакомьтесь с нашим методом", method: "Наш метод", step: "Определить запчасть и рынок",
    contact: "Контакты", message: "Сообщение", language: "Язык", play: "Включить анимацию",
    menu: "Открыть меню навигации", subject: "Обращение с сайта IAMAI",
    required: "Заполните это поле.", invalidEmail: "Введите корректный адрес электронной почты.",
    success: "Сообщение отправлено.",
    failure: "Не удалось отправить сообщение. Попробуйте ещё раз или напишите нам напрямую по электронной почте.",
  },
} as const;

// Baseline and deployment tests already exercise all three served URL depths.
// Run the larger interaction/translation matrix once against development.
test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "development", "Exercise experience variants once.");
  await page.route("https://formsubmit.co/**", (route) => route.abort());
});

async function openMethod(page: Page) {
  await page.locator("#method-open").click();
  await expect(page.locator("#explanation")).toHaveAttribute("data-view", "method");
  await expect(page.locator("#method-view")).toBeVisible();
  await expect(page.locator("#story-view")).toBeHidden();
}

test("the car mirror reveals the symmetric logo within 1.2 seconds", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const start = new Date("2026-11-07T12:00:00Z");
  await page.clock.install({ time: start });
  await page.clock.pauseAt(new Date(start.getTime() + 100));
  await page.goto("./");
  const logo = page.locator("#logo-reveal");
  await expect(logo).toHaveAttribute("data-phase", "dropping");
  await expect(logo.locator(".logo-reflection-mask")).toHaveAttribute("width", "0");
  await expect(logo.locator(".logo-mirror")).toHaveCount(1);
  await expect(logo.locator(".logo-reflection image")).toHaveAttribute("transform", "translate(360 0) scale(-1 1)");
  await page.clock.runFor(1200);
  await expect(logo).toHaveAttribute("data-phase", "complete");
  await expect(logo.locator(".logo-reflection-mask")).toHaveAttribute("width", "180");
});

test("reduced motion and pausing immediately complete the logo reflection", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await expect(page.locator("#logo-reveal")).toHaveAttribute("data-phase", "complete");
  await expect(page.locator(".logo-reflection-mask")).toHaveAttribute("width", "180");
  await expect(page.locator(".logo-mirror")).toHaveCSS("opacity", "0");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const start = new Date("2026-11-07T12:00:00Z");
  await page.clock.install({ time: start });
  await page.clock.pauseAt(new Date(start.getTime() + 100));
  await page.reload();
  await expect(page.locator("#logo-reveal")).toHaveAttribute("data-phase", "dropping");
  await page.locator(".motion-toggle").click();
  await expect(page.locator("#logo-reveal")).toHaveAttribute("data-phase", "complete");
  await expect(page.locator(".logo-reflection-mask")).toHaveAttribute("width", "180");
  await expect(page.locator(".logo-mirror")).toHaveCSS("opacity", "0");
});

for (const language of ["de", "en", "it", "ru"] as const) {
  test(`${language} translates the page, method, native validation and submission states`, async ({ page }) => {
    const copy = translations[language];
    let attempts = 0;
    let payload: Record<string, string> = {};
    await page.route(endpoint, async (route) => {
      attempts++;
      payload = route.request().postDataJSON();
      await route.fulfill({
        status: attempts === 1 ? 500 : 200,
        contentType: "application/json",
        body: JSON.stringify({ success: attempts !== 1 }),
      });
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./");
    await page.locator("#language-selector").selectOption(language);
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    await expect(page).toHaveTitle(copy.title);
    await expect(page.locator("#hero-title .line-text").first()).toHaveText(copy.hero);
    await expect(page.locator("#story-view blockquote")).toContainText(copy.quote);
    await expect(page.locator("#explanation-title")).toHaveText(copy.question);
    await expect(page.locator("#method-open")).toHaveText(copy.cta);
    await expect(page.locator("#contact-title")).toHaveText(copy.contact);
    await expect(page.locator('label[for="contact-message"]')).toHaveText(copy.message);
    await expect(page.locator("#language-selector")).toHaveAccessibleName(copy.language);
    await expect(page.locator(".motion-toggle")).toHaveAttribute("aria-label", copy.play);
    await expect(page.locator(".menu-toggle")).toHaveAttribute("aria-label", copy.menu);
    await openMethod(page);
    await expect(page.locator("#method-title")).toHaveText(copy.method);
    await expect(page.locator("#method-step-1")).toContainText(copy.step);

    const submit = page.locator('#contact-form button[type="submit"]');
    await submit.click();
    expect(await page.locator("#contact-name").evaluate((field: HTMLInputElement) => field.validationMessage)).toBe(copy.required);
    expect(attempts).toBe(0);
    await page.locator("#contact-name").fill("Market analyst");
    await page.locator("#contact-email").fill("invalid-email");
    await page.locator("#contact-message").fill("Please discuss aftermarket coverage in Germany.");
    await submit.click();
    expect(await page.locator("#contact-email").evaluate((field: HTMLInputElement) => field.validationMessage)).toBe(copy.invalidEmail);
    expect(attempts).toBe(0);
    await page.locator("#contact-email").fill("analyst@example.com");
    await submit.click();
    await expect(page.locator("#contact-status")).toHaveText(copy.failure);
    await expect(page.locator("#contact-message")).toHaveValue("Please discuss aftermarket coverage in Germany.");
    await submit.click();
    await expect(page.locator("#contact-status")).toHaveText(copy.success);
    expect(attempts).toBe(2);
    expect(payload.email).toBe("analyst@example.com");
    expect(payload._subject).toBe(copy.subject);
    await expect(page.locator("#contact-name")).toHaveValue("");
    await expect(submit).toBeEnabled();
  });
}

test("method steps work with pointer and keyboard, and back restores the story", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await openMethod(page);
  await expect(page.locator(".method-particle-transition")).toHaveCount(0);
  const tabs = page.locator("#method-view [role=tab]");
  await expect(tabs).toHaveCount(4);
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
  const details = new Set<string>();
  for (let i = 0; i < 4; i++) {
    await tabs.nth(i).click();
    await expect(tabs.nth(i)).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#method-detail")).toHaveAttribute("aria-labelledby", `method-step-${i + 1}`);
    await expect(page.locator("#method-detail-title")).not.toBeEmpty();
    await expect(page.locator("#method-detail-copy")).not.toBeEmpty();
    details.add((await page.locator("#method-detail-copy").innerText()).trim());
  }
  expect(details.size).toBe(4);
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(tabs.last()).toBeFocused();
  await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(tabs.first()).toBeFocused();
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
  await page.locator("#method-back").click();
  await expect(page.locator("#explanation")).toHaveAttribute("data-view", "story");
  await expect(page.locator("#story-view")).toBeVisible();
  await expect(page.locator("#method-view")).toBeHidden();
  await expect(page.locator("#method-open")).toBeFocused();
  await openMethod(page);
});

test("the story dissolves into moving particles and respects the global pause control", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("./");
  await page.locator("#method-open").click();
  await expect(page.locator("#explanation")).toHaveAttribute("data-view", "transition");
  const canvas = page.locator("canvas.method-particle-transition");
  await expect(canvas).toBeVisible();
  await expect.poll(async () => canvas.evaluate((element: HTMLCanvasElement) => {
    const pixels = element.getContext("2d")!.getImageData(0, 0, element.width, element.height).data;
    let alpha = 0;
    for (let i = 3; i < pixels.length; i += 64) alpha += pixels[i];
    return alpha;
  })).toBeGreaterThan(0);
  const changes = await canvas.evaluate(async (element: HTMLCanvasElement) => {
    const first = element.toDataURL();
    // Allow the animation's frame cap at high display refresh rates.
    for (let frame = 0; frame < 12; frame++) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      if (element.toDataURL() !== first) return true;
    }
    return false;
  });
  expect(changes).toBe(true);
  await expect(page.locator("#explanation")).toHaveAttribute("data-view", "method");
  await expect(canvas).toHaveCount(0);
  await page.locator("#method-back").click();
  await page.locator("#method-open").click();
  await expect(page.locator("#explanation")).toHaveAttribute("data-view", "transition");
  await page.locator(".motion-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
  await expect(page.locator("#explanation")).toHaveAttribute("data-view", "method");
  await expect(canvas).toHaveCount(0);
  await page.locator("#method-back").click();
  await openMethod(page);
  await expect(canvas).toHaveCount(0);
});

test("language selection persists and translates an already open method", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await page.locator("#language-selector").selectOption("it");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "it");
  await expect(page.locator("#language-selector")).toHaveValue("it");
  await openMethod(page);
  await expect(page.locator("#method-title")).toHaveText("Il nostro metodo");
  const thirdTab = page.locator("#method-step-3");
  await thirdTab.click();
  const italianDetail = await page.locator("#method-detail-copy").innerText();
  await page.locator("#language-selector").selectOption("ru");
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.locator("#explanation")).toHaveAttribute("data-view", "method");
  await expect(page.locator("#method-title")).toHaveText("Наш метод");
  await expect(thirdTab).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#method-detail-copy")).not.toHaveText(italianDetail);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.locator("#language-selector")).toHaveValue("ru");
});

test("switching language updates an in-flight contact submission and its result", async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => { release = resolve; });
  await page.route(endpoint, async (route) => {
    await pending;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await page.locator("#contact-name").fill("Market analyst");
  await page.locator("#contact-email").fill("analyst@example.com");
  await page.locator("#contact-message").fill("Please discuss aftermarket coverage.");
  const submit = page.locator('#contact-form button[type="submit"]');
  await submit.click();
  await expect(submit).toBeDisabled();
  await expect(page.locator(".submit-label")).toHaveText("Sending…");
  await page.locator("#language-selector").selectOption("de");
  await expect(page.locator(".submit-label")).toHaveText("Wird gesendet…");
  await expect(page.locator("#contact-message")).toHaveValue("Please discuss aftermarket coverage.");
  release();
  await expect(page.locator("#contact-status")).toHaveText(translations.de.success);
  await expect(submit).toBeEnabled();
  await page.locator("#language-selector").selectOption("ru");
  await expect(page.locator("#contact-status")).toHaveText(translations.ru.success);
});

test("all languages fit phone, tablet and desktop in both story and method views", async ({ page }) => {
  test.setTimeout(45000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await page.evaluate(() => document.fonts.ready);
  const checkLayout = async (language: string, width: number, view: string) => {
    const metrics = await page.evaluate(() => ({
      viewport: innerWidth,
      document: document.documentElement.scrollWidth,
      lines: [...document.querySelectorAll<HTMLElement>("#hero-title .line-text")]
        .map((line) => ({ width: line.clientWidth, content: line.scrollWidth })),
    }));
    expect(metrics.document, `${language} ${view} overflows at ${width}px`).toBeLessThanOrEqual(metrics.viewport);
    for (const line of metrics.lines)
      expect(line.content, `${language} hero line clips at ${width}px`).toBeLessThanOrEqual(line.width + 1);
  };
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const language of ["de", "en", "it", "ru"]) {
      await page.locator("#language-selector").selectOption(language);
      await checkLayout(language, width, "story");
      await openMethod(page);
      await checkLayout(language, width, "method");
      await page.locator("#method-step-4").click();
      await checkLayout(language, width, "last method step");
      await page.locator("#method-back").click();
    }
  }
});

test("the interactive method has no accessibility violations or runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await openMethod(page);
  await page.locator("#method-step-4").click();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  }
  expect(errors).toEqual([]);
});
