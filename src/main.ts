import "./style.css";
import { ParticleRotor } from "./rotor";

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
const rotor = new ParticleRotor(
  document.querySelector<HTMLCanvasElement>("#rotor")!,
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
  rotor.setPaused(paused);
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

// One expanded advantage keeps the comparison readable while retaining native details behaviour.
const advantages = [
  ...document.querySelectorAll<HTMLDetailsElement>(".advantage"),
];
advantages.forEach((detail) =>
  detail.addEventListener("toggle", () => {
    if (detail.open)
      advantages.forEach((other) => {
        if (other !== detail) other.open = false;
      });
  }),
);

const tabs = [...document.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
const panels = [...document.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
let transition = 0;
async function activateTab(index: number) {
  const target = tabs[index];
  if (target.getAttribute("aria-selected") === "true") return;
  const token = ++transition;
  tabs.forEach((tab, i) => {
    tab.setAttribute("aria-selected", String(i === index));
    tab.tabIndex = i === index ? 0 : -1;
  });
  const current = panels.find((panel) => !panel.hidden);
  if (current && !paused) {
    const animation = current.animate(
      [
        { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" },
        { opacity: 0, filter: "blur(7px)", transform: "translateY(-7px)" },
      ],
      { duration: 200, easing: "ease-in", fill: "forwards" },
    );
    await animation.finished.catch(() => {});
    animation.cancel();
  }
  if (token !== transition) return;
  panels.forEach((panel, i) => {
    panel.hidden = i !== index;
    panel.classList.toggle("panel-enter", i === index && !paused);
  });
}
tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    void activateTab(index);
  });
  tab.addEventListener("keydown", (event) => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    tabs[next].focus();
    void activateTab(next);
  });
});

const explanations: Record<string, { title: string; text: string }> = {
  single: {
    title: "The same product, in the same quantity.",
    text: "One new rear disc with the required dimensions. The offer can be compared with the single BMW disc.",
  },
  pair: {
    title: "Two discs are a different quantity.",
    text: "The BMW description calls for one disc. A pair buys something different, so this offer is excluded as “other product” rather than mixed into the comparison.",
  },
  used: {
    title: "The condition changes the comparison.",
    text: "The page describes a pre-owned part. Used offers are excluded from the new-part comparison, and “used” is recorded as the reason.",
  },
  variant: {
    title: "The dimensions identify a different variant.",
    text: "A 300 × 22 mm disc differs from the required 330 × 20 mm part. Sharing a search result or a part-number reference is not enough; this offer is excluded as “other product”.",
  },
};
const offers = [...document.querySelectorAll<HTMLButtonElement>(".offer-row")];
function selectOffer(row: HTMLButtonElement) {
  offers.forEach((offer) => {
    offer.classList.toggle("selected", offer === row);
    offer.setAttribute("aria-pressed", String(offer === row));
  });
  const explanation = explanations[row.dataset.offer!];
  document.querySelector("#explanation-title")!.textContent = explanation.title;
  document.querySelector("#explanation-text")!.textContent = explanation.text;
}
offers.forEach((row) => row.addEventListener("click", () => selectOffer(row)));
const filters = [
  ...document.querySelectorAll<HTMLButtonElement>("[data-filter]"),
];
let filtering = 0;
filters.forEach((button) =>
  button.addEventListener("click", async () => {
    if (button.getAttribute("aria-pressed") === "true") return;
    const token = ++filtering;
    filters.forEach((filter) =>
      filter.setAttribute("aria-pressed", String(filter === button)),
    );
    const matches = (row: HTMLButtonElement) =>
      button.dataset.filter === "all" ||
      row.dataset.verdict === button.dataset.filter;
    const leaving = offers.filter((row) => !row.hidden && !matches(row));
    const animations = paused
      ? []
      : leaving.map((row, i) =>
          row.animate(
            [
              { opacity: 1, filter: "blur(0px)", transform: "translate(0, 0)" },
              {
                opacity: 0,
                filter: "blur(8px)",
                transform: `translate(${6 + i * 5}px, -12px)`,
              },
            ],
            {
              duration: 420,
              delay: i * 35,
              easing: "ease-in",
              fill: "forwards",
            },
          ),
        );
    await Promise.all(
      animations.map((animation) => animation.finished.catch(() => {})),
    );
    animations.forEach((animation) => animation.cancel());
    if (token !== filtering) return;
    offers.forEach((row) => {
      row.hidden = !matches(row);
    });
    const visible = offers.filter(matches);
    if (!visible.some((row) => row.classList.contains("selected")))
      selectOffer(visible[0]);
  }),
);
