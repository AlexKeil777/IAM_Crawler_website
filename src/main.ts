import "./style.css";
import { ParticleRotor } from "./rotor";
import { ParticleTextReveal } from "./text-reveal";
import { MethodExperience } from "./method";
import { initI18n, t } from "./i18n";
import { LogoReveal } from "./logo-reveal";

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
const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
const submitLabel = submit.querySelector<HTMLElement>(".submit-label")!;
const status = document.querySelector<HTMLElement>("#contact-status")!;
const fields = [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input[required], textarea[required]")];
let sending = false;
type SubmissionFailure = "errorStatus" | "unavailableStatus" | "deliveryUnknownStatus";
let statusKey: "sentStatus" | SubmissionFailure | "validationRequired" | "validationEmail" | "sendingLabel" | null = null;
let statusTimeout: number | undefined;
// Validate current values in the submit handler, including browser autofill.
form.noValidate = true;

function localizeValidity(field: HTMLInputElement | HTMLTextAreaElement) {
  field.setCustomValidity("");
  if (field.validity.valueMissing) field.setCustomValidity(t("validationRequired"));
  else if (field.validity.typeMismatch) field.setCustomValidity(t("validationEmail"));
}
fields.forEach((field) => {
  field.addEventListener("invalid", () => {
    localizeValidity(field);
    window.clearTimeout(statusTimeout);
    statusKey = field.validity.typeMismatch ? "validationEmail" : "validationRequired";
    status.className = "error";
    renderFormState();
  });
  field.addEventListener("input", () => localizeValidity(field));
});
function renderFormState() {
  submitLabel.textContent = t(sending ? "sendingLabel" : "submitLabel");
  status.textContent = statusKey ? t(statusKey) : "";
}
function evaporateText(element: HTMLElement) {
  if (paused || motionQuery.matches) return;
  const isMessage = element instanceof HTMLTextAreaElement;
  const value = isMessage ? element.value : element.textContent;
  if (!value) return;
  const style = getComputedStyle(element);
  const vapor = document.createElement("div");
  vapor.className = "contact-evaporation";
  vapor.setAttribute("aria-hidden", "true");
  Object.assign(vapor.style, {
    left: `${element.offsetLeft}px`, top: `${element.offsetTop}px`,
    width: `${element.offsetWidth}px`, height: `${element.offsetHeight}px`,
    font: style.font, lineHeight: style.lineHeight, letterSpacing: style.letterSpacing,
    color: style.color, padding: style.padding, borderWidth: style.borderWidth,
    whiteSpace: isMessage ? "pre-wrap" : style.whiteSpace,
    overflowWrap: style.overflowWrap, wordBreak: style.wordBreak,
  });
  const text = document.createElement("span");
  text.textContent = value;
  text.style.display = "block";
  text.style.transform = `translate(${-element.scrollLeft}px, ${-element.scrollTop}px)`;
  vapor.append(text);
  element.parentElement!.append(vapor);
  const animation = vapor.animate([
    { opacity: 1, filter: "blur(0px)", transform: "translateY(0) scale(1)" },
    { opacity: 0.65, filter: "blur(2px)", offset: 0.35 },
    { opacity: 0, filter: "blur(7px)", transform: "translateY(-22px) scale(1.025)" },
  ], { duration: 650, easing: "ease-out", fill: "forwards" });
  void animation.finished.then(() => vapor.remove());
}
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (sending) return;
  fields.forEach(localizeValidity);
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  if (data.get("_honey")) {
    statusKey = "errorStatus";
    status.className = "error";
    renderFormState();
    return;
  }
  // Identify the page even when cross-origin referrers omit its path.
  data.set("_url", `${window.location.origin}${window.location.pathname}`);
  window.clearTimeout(statusTimeout);
  sending = true;
  submit.disabled = true;
  statusKey = "sendingLabel";
  status.className = "";
  renderFormState();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20000);
  // A lost response does not tell us whether the service accepted the message.
  // Keep the visitor's text and let them choose whether to retry.
  let failureKey: SubmissionFailure = "deliveryUnknownStatus";
  try {
    const endpoint = form.action.replace("https://formsubmit.co/", "https://formsubmit.co/ajax/");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(Object.fromEntries(data.entries())),
      signal: controller.signal,
    });
    failureKey = response.status >= 500 ? "unavailableStatus" : "errorStatus";
    if (!response.ok) throw new Error(`Contact service returned HTTP ${response.status}`);
    // Outages can return HTML or plain text instead of the expected JSON.
    failureKey = "unavailableStatus";
    const result = await response.json();
    failureKey = "errorStatus";
    if (!result || ![true, "true"].includes(result.success)) throw new Error("Submission failed");
    evaporateText(form.querySelector<HTMLTextAreaElement>("#contact-message")!);
    form.reset();
    fields.forEach((field) => field.setCustomValidity(""));
    statusKey = "sentStatus";
    status.className = "success";
    statusTimeout = window.setTimeout(() => {
      evaporateText(status);
      statusKey = null;
      renderFormState();
    }, 1000);
  } catch {
    statusKey = controller.signal.aborted ? "deliveryUnknownStatus" : failureKey;
    status.className = "error";
  } finally {
    window.clearTimeout(timeout);
    sending = false;
    submit.disabled = false;
    renderFormState();
  }
});
window.addEventListener("languagechange", () => {
  menuLabel();
  fields.forEach(localizeValidity);
  renderFormState();
  fitHero();
  void document.fonts.ready.then(fitHero);
});
