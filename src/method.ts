import "./method.css";
import { getLanguage, t } from "./i18n";

const icons = [
  "M12 4v4m0 16v4M4 16h4m16 0h4M12 16h8m-4-4v8M16 6a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z",
  "M4 25h24M6 25V12h8v13m4 0V8h8v17M4 12l6-5 6 5M18 8l4-4 6 4M9 16h2m-2 4h2m10-8h2m-2 5h2m-2 5h2",
  "M10 5H6v23h20V5h-4M11 4h10v5H11zM10 18l4 4 8-9",
  "M5 5v22h23M10 20l5-6 5 3 7-10M10 25v-2m5 2v-4m5 4v-5m7 5V14",
];
const stepKey = (index: number, suffix: string) => `methodStep${index + 1}${suffix}`;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const n = clamp(value); return n * n * (3 - 2 * n); };
type MaskPoint = { x: number; y: number; accent: boolean };
type Grain = { from: MaskPoint; to: MaskPoint; angle: number; spread: number; seed: number };
type Transition = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  grains: Grain[];
  frame: number;
  start: number;
  last: number;
  duration: number;
};

/** A finite, user-triggered transition from the business question to its method. */
export class MethodExperience {
  private section = document.querySelector<HTMLElement>("#explanation");
  private story = document.querySelector<HTMLElement>("#story-view");
  private view = document.querySelector<HTMLElement>("#method-view");
  private openButton = document.querySelector<HTMLButtonElement>("#method-open");
  private tabs: HTMLButtonElement[] = [];
  private nodes: HTMLElement | null = null;
  private map: HTMLElement | null = null;
  private links: SVGSVGElement | null = null;
  private detail: HTMLElement | null = null;
  private selected = 0;
  private animation: Transition | null = null;
  private sourceSnapshot: { canvas: HTMLCanvasElement; left: number; top: number } | null = null;
  private layoutFrame = 0;
  private language = getLanguage();
  private originalLabel = "explanation-title";
  private motion = window.matchMedia("(prefers-reduced-motion: reduce)");

  constructor(private paused: boolean) {
    if (!this.section || !this.story || !this.view || !this.openButton) return;
    this.originalLabel = this.section.getAttribute("aria-labelledby") || this.originalLabel;
    this.section.dataset.view = "story";
    this.view.setAttribute("role", "region");
    this.view.setAttribute("aria-labelledby", "method-title");
    this.view.tabIndex = -1;
    this.view.inert = true;
    this.openButton.setAttribute("aria-controls", "method-view");
    this.openButton.setAttribute("aria-expanded", "false");
    this.view.innerHTML = `
      <div class="method-content">
        <button type="button" class="method-back" id="method-back">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="m10 5-7 7 7 7M3 12h18"/></svg>
          <span data-i18n="methodBack">Back to the question</span>
        </button>
        <header class="method-header">
          <h2 class="method-title" id="method-title" data-i18n="methodTitle">From a part to its market.</h2>
          <p class="method-intro" data-i18n="methodIntro">Follow the search from a precise question to comparable offers and their sources.</p>
        </header>
        <div class="method-map">
          <svg class="method-connections" aria-hidden="true" focusable="false"><path/><path/><path/></svg>
          <div class="method-nodes" role="tablist" aria-label="The four steps of our method">
            ${icons.map((path, index) => `
              <button type="button" class="method-node" id="method-step-${index + 1}" role="tab" data-step="${index}"
                aria-controls="method-detail" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}">
                <span class="method-node-symbol" aria-hidden="true">
                  <svg viewBox="0 0 32 32" width="32" height="32" focusable="false"><path d="${path}"/></svg>
                  <span class="method-step-number">${index + 1}</span>
                </span>
                <span class="method-node-copy">
                  <span class="method-node-title" data-i18n="${stepKey(index, "Title")}"></span>
                  <span class="method-node-summary" data-i18n="${stepKey(index, "Summary")}"></span>
                </span>
              </button>`).join("")}
          </div>
        </div>
        <p class="method-hint" data-i18n="methodHint">Select a step to take a closer look.</p>
        <div class="method-detail" id="method-detail" role="tabpanel" tabindex="0" aria-labelledby="method-step-1">
          <div class="method-detail-heading">
            <span class="method-detail-index" aria-hidden="true">01</span>
            <h3 id="method-detail-title"></h3>
          </div>
          <p id="method-detail-copy" aria-live="polite" aria-atomic="true"></p>
        </div>
        <div class="method-output">
          <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" focusable="false"><path d="M8 3h12l6 6v20H8zM20 3v7h6M12 15h10M12 20h10M12 25h6"/></svg>
          <div>
            <p class="method-output-label" data-i18n="methodOutputLabel">What you take away</p>
            <h3 data-i18n="methodOutputTitle">A market view you can trace.</h3>
            <p class="method-output-detail" data-i18n="methodOutputDetail">Comparable prices, shop names and source links stay together.</p>
          </div>
        </div>
        <p class="method-note" data-i18n="methodNote">Shop access and geography can limit the sample. Representativeness is the goal, rather than exhaustive coverage.</p>
      </div>`;
    this.tabs = [...this.view.querySelectorAll<HTMLButtonElement>(".method-node")];
    this.nodes = this.view.querySelector(".method-nodes");
    this.map = this.view.querySelector(".method-map");
    this.links = this.view.querySelector(".method-connections");
    this.detail = this.view.querySelector("#method-detail");
    this.openButton.addEventListener("click", () => this.open());
    this.view.querySelector("#method-back")!.addEventListener("click", () => this.close());
    this.tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => this.select(index));
      tab.addEventListener("keydown", (event) => {
        let next = this.selected;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % 4;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index + 3) % 4;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = 3;
        else return;
        event.preventDefault();
        this.select(next);
        this.tabs[next].focus();
      });
    });
    this.view.addEventListener("keydown", (event) => {
      if (event.key === "Escape") { event.preventDefault(); this.close(); }
    });
    window.addEventListener("languagechange", () => {
      this.language = getLanguage();
      this.translate();
      // Finish with the newly translated DOM instead of retaining an old mask.
      if (this.animation) this.finish();
      this.queueLayout();
    });
    window.addEventListener("resize", () => {
      if (this.animation) this.finish();
      this.queueLayout();
    });
    this.motion.addEventListener("change", () => {
      if (this.motion.matches && this.animation) this.finish();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && this.animation) this.finish();
    });
    new ResizeObserver(() => this.queueLayout()).observe(this.map!);
    this.translate();
  }

  setPaused(paused: boolean) {
    this.paused = paused;
    if (paused && this.animation) this.finish();
  }

  private translate() {
    this.view?.querySelectorAll<HTMLElement>("[data-i18n]").forEach((element) => {
      element.textContent = t(element.dataset.i18n!);
    });
    this.nodes?.setAttribute("aria-label", t("methodDiagramLabel"));
    this.select(this.selected);
  }

  private select(index: number) {
    this.selected = index;
    this.tabs.forEach((tab, i) => {
      tab.setAttribute("aria-selected", String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    });
    if (!this.view || !this.detail) return;
    this.detail.setAttribute("aria-labelledby", `method-step-${index + 1}`);
    this.view.querySelector("#method-detail-title")!.textContent = t(stepKey(index, "Title"));
    this.view.querySelector("#method-detail-copy")!.textContent = t(stepKey(index, "Detail"));
    this.view.querySelector(".method-detail-index")!.textContent = String(index + 1).padStart(2, "0");
    this.links?.querySelectorAll("path").forEach((path, i) => path.classList.toggle("is-traversed", i < index));
  }

  private queueLayout() {
    cancelAnimationFrame(this.layoutFrame);
    this.layoutFrame = requestAnimationFrame(() => { this.layoutFrame = 0; this.layout(); });
  }

  private layout() {
    if (!this.map || !this.links || !this.nodes || this.view?.hidden) return;
    const vertical = window.matchMedia("(max-width: 760px)").matches;
    this.nodes.setAttribute("aria-orientation", vertical ? "vertical" : "horizontal");
    const bounds = this.map.getBoundingClientRect();
    this.links.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`);
    const symbols = this.tabs.map((tab) => tab.querySelector(".method-node-symbol")!.getBoundingClientRect());
    this.links.querySelectorAll("path").forEach((path, i) => {
      const a = symbols[i], b = symbols[i + 1];
      if (vertical) {
        const x = a.left + a.width / 2 - bounds.left;
        const start = a.bottom - bounds.top + 4, end = b.top - bounds.top - 5;
        const gap = end - start;
        path.setAttribute("d", `M${x} ${start}C${x + 6} ${start + gap * 0.3} ${x + 6} ${end - gap * 0.3} ${x} ${end}m-3-4 3 4 3-4`);
      } else {
        const y = a.top + a.height / 2 - bounds.top;
        const start = a.right - bounds.left + 6, end = b.left - bounds.left - 7;
        const gap = end - start;
        path.setAttribute("d", `M${start} ${y}C${start + gap * 0.3} ${y - 7} ${end - gap * 0.3} ${y - 7} ${end} ${y}m-4-3 4 3-4 3`);
      }
    });
  }

  private open() {
    if (!this.section || !this.story || !this.view || !this.openButton || this.section.dataset.view !== "story") return;
    const source = this.buttonMask();
    this.openButton.disabled = true;
    this.openButton.setAttribute("aria-expanded", "true");
    this.story.hidden = true;
    this.story.inert = true;
    this.view.hidden = false;
    this.view.inert = true;
    this.view.style.opacity = "0";
    this.view.setAttribute("aria-hidden", "true");
    this.section.setAttribute("aria-labelledby", "method-title");
    this.section.dataset.view = "transition";
    this.view.scrollIntoView({ block: "start", behavior: "instant" });
    this.layout();
    if (this.paused || this.motion.matches || !source.length) { this.finish(); return; }

    const destination = this.diagramMask();
    const canvas = document.createElement("canvas");
    canvas.className = "method-particle-transition";
    canvas.setAttribute("aria-hidden", "true");
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.ceil(window.innerWidth * ratio);
    canvas.height = Math.ceil(window.innerHeight * ratio);
    const context = canvas.getContext("2d", { alpha: true });
    if (!context || !destination.length) { this.finish(); return; }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    document.body.append(canvas);
    const total = window.innerWidth < 621 ? 2400 : 4400;
    let seed = 3517;
    const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const grains = Array.from({ length: total }, (): Grain => ({
      from: source[Math.floor(random() * source.length)],
      to: destination[Math.floor(random() * destination.length)],
      angle: random() * Math.PI * 2,
      spread: 35 + random() * Math.min(200, window.innerWidth * 0.3),
      seed: random(),
    }));
    this.animation = { canvas, context, grains, frame: 0, start: performance.now(), last: 0, duration: 1650 };
    this.render(0);
    this.animation.frame = requestAnimationFrame((now) => this.tick(now));
  }

  private tick(now: number) {
    const animation = this.animation;
    if (!animation) return;
    const progress = clamp((now - animation.start) / animation.duration);
    if (progress >= 1) { this.finish(); return; }
    if (!animation.last || now - animation.last >= 27) {
      animation.last = now;
      this.render(progress);
    }
    animation.frame = requestAnimationFrame((next) => this.tick(next));
  }

  private render(progress: number) {
    const animation = this.animation;
    if (!animation) return;
    const { context: ctx } = animation;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const travel = smooth((progress - 0.07) / 0.73);
    const burst = Math.sin(Math.PI * clamp(progress / 0.85)) * (1 - smooth((progress - 0.52) / 0.34));
    const fade = 1 - smooth((progress - 0.8) / 0.2);
    // Keep the clicked lettering intact for its first instant, then trade that
    // raster for fine grains so the button visibly dissolves in place.
    if (this.sourceSnapshot && progress < 0.16) {
      ctx.globalAlpha = 1 - smooth(progress / 0.16);
      ctx.drawImage(this.sourceSnapshot.canvas, this.sourceSnapshot.left, this.sourceSnapshot.top);
    }
    const emergence = smooth(progress / 0.1);
    for (const grain of animation.grains) {
      const bend = grain.angle + progress * (grain.seed - 0.5) * 2.4;
      const x = grain.from.x + (grain.to.x - grain.from.x) * travel + Math.cos(bend) * grain.spread * burst;
      const y = grain.from.y + (grain.to.y - grain.from.y) * travel + (Math.sin(bend) * grain.spread - 45) * burst;
      const accent = progress < 0.48 ? grain.from.accent : grain.to.accent;
      ctx.fillStyle = accent ? "#b69af7" : "#efede7";
      ctx.globalAlpha = (0.56 + grain.seed * 0.44) * fade * emergence;
      const size = 0.55 + grain.seed * 0.65;
      ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1;
    if (this.view) this.view.style.opacity = String(smooth((progress - 0.78) / 0.2));
  }

  private finish() {
    if (!this.section || !this.view || !this.story || !this.openButton) return;
    if (this.animation) {
      cancelAnimationFrame(this.animation.frame);
      this.animation.canvas.remove();
      this.animation = null;
    }
    this.sourceSnapshot = null;
    this.story.hidden = true;
    this.story.inert = true;
    this.view.hidden = false;
    this.view.inert = false;
    this.view.style.removeProperty("opacity");
    this.view.removeAttribute("aria-hidden");
    this.openButton.disabled = false;
    this.openButton.style.removeProperty("opacity");
    this.section.dataset.view = "method";
    this.view.focus({ preventScroll: true });
    this.queueLayout();
  }

  private close() {
    if (!this.section || !this.view || !this.story || !this.openButton) return;
    if (this.animation) {
      cancelAnimationFrame(this.animation.frame);
      this.animation.canvas.remove();
      this.animation = null;
    }
    this.sourceSnapshot = null;
    this.view.hidden = true;
    this.view.inert = true;
    this.view.style.removeProperty("opacity");
    this.view.removeAttribute("aria-hidden");
    this.story.hidden = false;
    this.story.inert = false;
    this.openButton.disabled = false;
    this.openButton.style.removeProperty("opacity");
    this.openButton.setAttribute("aria-expanded", "false");
    this.section.setAttribute("aria-labelledby", this.originalLabel);
    this.section.dataset.view = "story";
    this.openButton.scrollIntoView({ block: "center", behavior: "instant" });
    this.openButton.focus({ preventScroll: true });
  }

  private newMask(width = window.innerWidth, height = window.innerHeight) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.ceil(width));
    canvas.height = Math.max(1, Math.ceil(height));
    return canvas;
  }

  private samples(canvas: HTMLCanvasElement, offsetX = 0, offsetY = 0): MaskPoint[] {
    const pixels = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data;
    const points: MaskPoint[] = [];
    for (let y = 0; y < canvas.height; y += 2) {
      for (let x = 0; x < canvas.width; x += 2) {
        const i = (y * canvas.width + x) * 4;
        if (pixels[i + 3] > 35) points.push({ x: x + offsetX, y: y + offsetY, accent: pixels[i + 2] > pixels[i] + 20 });
      }
    }
    return points;
  }

  private buttonMask(): MaskPoint[] {
    const button = this.openButton;
    if (!button) return [];
    const bounds = button.getBoundingClientRect();
    const canvas = this.newMask(bounds.width + 4, bounds.height + 4);
    const ctx = canvas.getContext("2d");
    if (!ctx) return [];
    const style = getComputedStyle(button);
    ctx.lineWidth = Math.max(1, parseFloat(style.borderTopWidth));
    ctx.strokeStyle = style.borderTopColor;
    ctx.fillStyle = style.backgroundColor;
    ctx.beginPath();
    ctx.roundRect(1, 1, bounds.width - 2, bounds.height - 2, Math.min(24, parseFloat(style.borderRadius) || 1));
    if (style.backgroundColor !== "rgba(0, 0, 0, 0)") ctx.fill();
    if (parseFloat(style.borderTopWidth) > 0) ctx.stroke();
    const label = button.querySelector<HTMLElement>("[data-i18n], span");
    this.paintText(ctx, label || button, -bounds.left, -bounds.top);
    button.querySelectorAll<SVGSVGElement>("svg").forEach((svg) => this.paintSvg(ctx, svg, -bounds.left, -bounds.top));
    this.sourceSnapshot = { canvas, left: bounds.left, top: bounds.top };
    return this.samples(canvas, bounds.left, bounds.top);
  }

  private diagramMask(): MaskPoint[] {
    const canvas = this.newMask();
    const ctx = canvas.getContext("2d");
    if (!ctx || !this.view) return [];
    this.view.querySelectorAll<HTMLElement>(".method-title, .method-intro, .method-node-title, .method-node-summary, #method-detail-title, #method-detail-copy")
      .forEach((element) => this.paintText(ctx, element));
    this.view.querySelectorAll<SVGSVGElement>(".method-connections, .method-node-symbol svg")
      .forEach((svg) => this.paintSvg(ctx, svg));
    this.view.querySelectorAll<HTMLElement>(".method-node-symbol").forEach((element) => {
      const box = element.getBoundingClientRect(), style = getComputedStyle(element);
      ctx.beginPath();
      ctx.strokeStyle = style.borderTopColor;
      ctx.lineWidth = 1;
      ctx.arc(box.left + box.width / 2, box.top + box.height / 2, box.width / 2 - 0.5, 0, Math.PI * 2);
      ctx.stroke();
    });
    return this.samples(canvas);
  }

  private paintText(ctx: CanvasRenderingContext2D, element: HTMLElement, offsetX = 0, offsetY = 0) {
    const box = element.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const style = getComputedStyle(element), fontSize = parseFloat(style.fontSize);
    const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.4;
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    ctx.letterSpacing = style.letterSpacing === "normal" ? "0px" : style.letterSpacing;
    ctx.fillStyle = style.color;
    ctx.textBaseline = "top";
    ctx.textAlign = style.textAlign === "center" ? "center" : "left";
    const x = box.left + offsetX + (ctx.textAlign === "center" ? box.width / 2 : 0);
    let y = box.top + offsetY + Math.max(0, (lineHeight - fontSize) / 2);
    let line = "";
    for (const word of (element.textContent || "").trim().split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(candidate).width > box.width + 1) {
        ctx.fillText(line, x, y);
        line = word;
        y += lineHeight;
      } else line = candidate;
    }
    if (line) ctx.fillText(line, x, y);
  }

  private paintSvg(ctx: CanvasRenderingContext2D, svg: SVGSVGElement, offsetX = 0, offsetY = 0) {
    const bounds = svg.getBoundingClientRect(), view = svg.viewBox.baseVal;
    if (!bounds.width || !bounds.height || !view.width || !view.height) return;
    ctx.save();
    ctx.translate(bounds.left + offsetX, bounds.top + offsetY);
    ctx.scale(bounds.width / view.width, bounds.height / view.height);
    ctx.translate(-view.x, -view.y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    svg.querySelectorAll("path").forEach((path) => {
      const style = getComputedStyle(path);
      ctx.strokeStyle = style.stroke === "none" ? getComputedStyle(svg).color : style.stroke;
      ctx.lineWidth = parseFloat(style.strokeWidth) || 1.5;
      ctx.stroke(new Path2D(path.getAttribute("d") || ""));
    });
    ctx.restore();
  }
}
