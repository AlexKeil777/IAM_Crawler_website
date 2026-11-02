import "./style.css";
import { ParticleIdentity } from "./identity";

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let storedMotion: string | null = null;
try {
  storedMotion = localStorage.getItem("iam-motion");
} catch {
  /* Storage is optional. */
}
let paused = motionQuery.matches || storedMotion === "paused";
const motionButton =
  document.querySelector<HTMLButtonElement>(".motion-toggle")!;
const identity = new ParticleIdentity(
  document.querySelector<HTMLCanvasElement>("#identity-particles")!,
);

function applyMotion() {
  document.documentElement.dataset.motion = paused ? "paused" : "playing";
  motionButton.setAttribute("aria-pressed", String(paused));
  motionButton.setAttribute(
    "aria-label",
    paused ? "Play animations" : "Pause animations",
  );
  document.querySelector(".motion-label")!.textContent = paused
    ? "Motion off"
    : "Motion on";
  identity.setPaused(paused);
}
motionButton.addEventListener("click", () => {
  paused = !paused;
  try {
    localStorage.setItem("iam-motion", paused ? "paused" : "playing");
  } catch {
    /* Storage is optional. */
  }
  applyMotion();
});
motionQuery.addEventListener("change", (event) => {
  paused = event.matches;
  applyMotion();
});
applyMotion();

const menuButton = document.querySelector<HTMLButtonElement>(".menu-toggle")!;
const mobileNav = document.querySelector<HTMLElement>("#mobile-nav")!;
function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
  mobileNav.hidden = true;
}
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
  mobileNav.hidden = !open;
});
mobileNav
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !mobileNav.hidden) {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia("(min-width: 621px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});

const form = document.querySelector<HTMLFormElement>("#contact-form")!;
const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
const status = document.querySelector<HTMLElement>("#contact-status")!;
let sending = false;
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (sending || !form.reportValidity()) return;
  const data = new FormData(form);
  if (data.get("_honey")) return;
  sending = true;
  submit.disabled = true;
  submit.textContent = "Sending…";
  status.textContent = "";
  status.className = "";
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(
      "https://formsubmit.co/ajax/iamaicrawler@gmail.com",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(Object.fromEntries(data.entries())),
        signal: controller.signal,
      },
    );
    const result = await response.json();
    if (!response.ok || ![true, "true"].includes(result.success))
      throw new Error("Submission failed");
    form.reset();
    status.textContent = "Message sent.";
    status.className = "success";
  } catch {
    status.textContent =
      "Message could not be sent. Please try again or email us directly.";
    status.className = "error";
  } finally {
    window.clearTimeout(timeout);
    sending = false;
    submit.disabled = false;
    submit.innerHTML = 'Send message <span aria-hidden="true">↗</span>';
  }
});
