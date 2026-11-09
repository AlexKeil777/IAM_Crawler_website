import "./style.css";
import { ParticleRotor } from "./rotor";
import { ParticleTextReveal } from "./text-reveal";
import { MethodExperience } from "./method";
import { initI18n, t } from "./i18n";
import { LogoReveal } from "./logo-reveal";
import { initInlineContact, type InlineStatusKey } from "./inline-contact";

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let paused = motionQuery.matches;
const rotor = new ParticleRotor(document.querySelector<HTMLCanvasElement>("#rotor")!);
const logoReveal = new LogoReveal(paused);
const method = new MethodExperience(paused);
initI18n();
const textReveal = new ParticleTextReveal(document.querySelector<HTMLElement>(".hero-message")!, paused);

function applyMotion() {
  document.documentElement.dataset.motion = paused ? "paused" : "playing";
  rotor.setPaused(paused);
  textReveal.setPaused(paused);
  method.setPaused(paused);
  logoReveal.setPaused(paused);
}
motionQuery.addEventListener("change", (event) => { paused = event.matches; applyMotion(); });
applyMotion();

const menuButton = document.querySelector<HTMLButtonElement>(".menu-toggle")!;
const mobileNav = document.querySelector<HTMLElement>("#mobile-nav")!;
function menuLabel() {
  menuButton.setAttribute("aria-label", t(mobileNav.hidden ? "menuOpen" : "menuClose"));
}
function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  mobileNav.hidden = true;
  menuLabel();
}
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  mobileNav.hidden = !open;
  menuLabel();
});
mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !mobileNav.hidden) { closeMenu(); menuButton.focus(); }
});
window.matchMedia("(min-width: 621px)").addEventListener("change", (event) => { if (event.matches) closeMenu(); });
menuLabel();

// Translations have different lengths. Fit all four lines together to preserve
// their hierarchy without clipping long German, Italian or Russian headlines.
const heroTitle = document.querySelector<HTMLElement>("#hero-title")!;
function fitHero() {
  heroTitle.style.fontSize = "";
  const available = heroTitle.getBoundingClientRect().width;
  if (!available) return;
  const base = parseFloat(getComputedStyle(heroTitle).fontSize);
  let factor = 1;
  heroTitle.querySelectorAll<HTMLElement>(".line-text").forEach((line) => {
    const range = document.createRange();
    range.selectNodeContents(line);
    const width = range.getBoundingClientRect().width;
    if (width > 0) factor = Math.min(factor, available / width);
  });
  if (factor < 1) heroTitle.style.fontSize = `${base * factor * 0.985}px`;
  textReveal.refresh();
}
let resizeFrame = 0;
window.addEventListener("resize", () => {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(fitHero);
});
void document.fonts.ready.then(fitHero);

const form = document.querySelector<HTMLFormElement>("#contact-form")!;
const status = document.querySelector<HTMLElement>("#contact-status")!;
const emailLink = document.querySelector<HTMLAnchorElement>("#contact-email-link")!;
const sourceUrl = form.querySelector<HTMLInputElement>('[name="_url"]')!;
const returnUrl = form.querySelector<HTMLInputElement>('[name="_next"]')!;
const fields = [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input[required], textarea[required]")];
type FormStatusKey = InlineStatusKey | "validationRequired" | "validationEmail";
let statusKey: FormStatusKey | null = null;
let statusDetail = "";
let successTimeout: number | undefined;
// Validate current values in the submit handler, including browser autofill.
form.noValidate = true;
function updateFormUrls() {
  sourceUrl.value = `${window.location.origin}${window.location.pathname}`;
  returnUrl.value = `${sourceUrl.value}?contact=submitted#contact`;
}
updateFormUrls();

// FormSubmit redirects here after accepting the submission. This is a
// thank-you message, not evidence of inbox delivery; don't reset any fields.
const pageUrl = new URL(window.location.href);
if (pageUrl.searchParams.get("contact") === "submitted") {
  setFormStatus("submittedStatus", "success");
  pageUrl.searchParams.delete("contact");
  window.history.replaceState(window.history.state, "", pageUrl);
}
renderFormState();

function localizeValidity(field: HTMLInputElement | HTMLTextAreaElement) {
  field.setCustomValidity("");
  if (field.validity.valueMissing) field.setCustomValidity(t("validationRequired"));
  else if (field.validity.typeMismatch) field.setCustomValidity(t("validationEmail"));
}
fields.forEach((field) => {
  field.addEventListener("invalid", () => {
    localizeValidity(field);
    setFormStatus(field.validity.typeMismatch ? "validationEmail" : "validationRequired", "error");
  });
  field.addEventListener("input", () => localizeValidity(field));
});
function renderFormState() {
  status.textContent = statusKey ? [t(statusKey), statusDetail].filter(Boolean).join(" ") : "";
}
function setFormStatus(key: FormStatusKey | null, kind: "success" | "error" | "" = "", detail = "") {
  window.clearTimeout(successTimeout);
  successTimeout = undefined;
  statusKey = key;
  statusDetail = detail;
  status.className = kind;
  renderFormState();
  if (key === "submittedStatus") {
    successTimeout = window.setTimeout(() => setFormStatus(null), 1000);
  }
}

// Visitors can use their mail app if the delivery service rejects a submission.
// Keep their text in the form and encode it without losing punctuation or lines.
function updateEmailLink() {
  const data = new FormData(form);
  const body = [
    `${t("nameLabel")}: ${data.get("name") || ""}`,
    `${t("emailLabel")}: ${data.get("email") || ""}`,
    `${t("companyLabel")}: ${data.get("company") || ""}`,
    "",
    String(data.get("message") || ""),
  ].join("\r\n");
  emailLink.href = `mailto:info@iamaicrawl.com?subject=${encodeURIComponent(t("formSubject"))}&body=${encodeURIComponent(body)}`;
}
form.addEventListener("input", updateEmailLink);
// Autofill and browser history restoration may not emit an input event.
emailLink.addEventListener("click", updateEmailLink);
updateEmailLink();

const inlineContact = initInlineContact(form, setFormStatus);

form.addEventListener("submit", (event) => {
  if (inlineContact) event.preventDefault();
  fields.forEach(localizeValidity);
  if (!form.reportValidity()) {
    event.preventDefault();
    return;
  }
  updateFormUrls();
  if (inlineContact) {
    void inlineContact.submit();
    return;
  }
  setFormStatus(null);
  // Keep the native POST for CAPTCHA, activation and rejection details. The
  // provider uses _next to return here instead of showing its thank-you page.
});
window.addEventListener("languagechange", () => {
  menuLabel();
  fields.forEach(localizeValidity);
  renderFormState();
  updateEmailLink();
  inlineContact?.localize();
  fitHero();
  void document.fonts.ready.then(fitHero);
});
