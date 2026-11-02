/** Assemble each real, accessible headline line from a field of fine particles. */
type TextParticle = {
  x: number;
  y: number;
  startX: number;
  startY: number;
  seed: number;
};
type TextLine = {
  element: HTMLElement;
  text: HTMLElement;
  points: TextParticle[];
  color: string;
};

export class ParticleTextReveal {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private lines: TextLine[];
  private width = 0;
  private height = 0;
  private elapsed = 0;
  private last = 0;
  private frame = 0;
  private ready = false;
  private finished = false;
  private paused: boolean;

  constructor(
    private container: HTMLElement,
    paused: boolean,
  ) {
    this.paused = paused;
    this.canvas =
      container.querySelector<HTMLCanvasElement>("#text-particles")!;
    this.ctx = this.canvas.getContext("2d");
    this.lines = [
      ...container.querySelectorAll<HTMLElement>(".crawl-line"),
    ].map((element) => ({
      element,
      text: element.querySelector<HTMLElement>(".line-text")!,
      points: [],
      color: "",
    }));
    container.dataset.reveal = "pending";
    this.lines.forEach((line) => {
      line.text.style.opacity = "0";
      line.element.dataset.revealed = "false";
    });
    if (paused || !this.ctx) this.finish();
    new ResizeObserver(() => {
      if (this.ready) this.rebuild();
    }).observe(container);
    document.addEventListener("visibilitychange", () => this.schedule());
    void document.fonts.ready.then(() => {
      this.ready = true;
      this.rebuild();
      if (!this.finished) {
        container.dataset.reveal = "running";
        this.schedule();
      }
    });
  }

  setPaused(paused: boolean) {
    this.paused = paused;
    if (paused) this.finish();
    else this.schedule();
  }

  private finish() {
    this.finished = true;
    cancelAnimationFrame(this.frame);
    this.lines.forEach((line) => {
      line.text.style.opacity = "1";
      line.element.dataset.revealed = "true";
    });
    this.container.dataset.reveal = "complete";
    this.ctx?.clearRect(0, 0, this.width, this.height);
  }

  private rebuild() {
    const bounds = this.container.getBoundingClientRect();
    this.width = bounds.width;
    this.height = bounds.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.finished || !this.width || !this.height) return;
    let seed = 15473;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    this.lines.forEach((line) => {
      const rect = line.text.getBoundingClientRect();
      const style = getComputedStyle(line.text);
      const mask = document.createElement("canvas");
      mask.width = Math.ceil(rect.width);
      mask.height = Math.ceil(rect.height);
      const context = mask.getContext("2d", { willReadFrequently: true });
      if (!context || !mask.width || !mask.height) return;
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      context.fontKerning = "normal";
      context.letterSpacing = style.letterSpacing;
      context.textAlign = style.textAlign === "center" ? "center" : "left";
      context.fillStyle = "#fff";
      const metrics = context.measureText("Mg");
      const size = parseFloat(style.fontSize);
      const ascent = metrics.fontBoundingBoxAscent || size * 0.8;
      const descent = metrics.fontBoundingBoxDescent || size * 0.2;
      const baseline = (rect.height - ascent - descent) / 2 + ascent;
      context.fillText(
        line.text.textContent || "",
        style.textAlign === "center" ? mask.width / 2 : 0,
        baseline,
      );
      const pixels = context.getImageData(0, 0, mask.width, mask.height).data;
      line.points = [];
      line.color = style.color;
      for (let y = 0; y < mask.height; y += 2)
        for (let x = 0; x < mask.width; x += 2) {
          if (pixels[(y * mask.width + x) * 4 + 3] < 80) continue;
          const targetX = x + rect.left - bounds.left;
          const targetY = y + rect.top - bounds.top;
          line.points.push({
            x: targetX,
            y: targetY,
            startX: Math.max(
              0,
              Math.min(this.width, targetX + (random() - 0.5) * 130),
            ),
            startY: Math.max(
              0,
              Math.min(this.height, targetY + (random() - 0.5) * 85),
            ),
            seed: random(),
          });
        }
    });
    this.draw();
  }

  private schedule() {
    cancelAnimationFrame(this.frame);
    this.last = 0;
    if (this.ready && !this.paused && !this.finished && !document.hidden)
      this.frame = requestAnimationFrame((timestamp) => this.tick(timestamp));
  }

  private tick(timestamp: number) {
    if (this.paused || this.finished || document.hidden) return;
    if (!this.last || timestamp - this.last >= 31) {
      this.elapsed += this.last ? Math.min(timestamp - this.last, 80) : 33;
      this.last = timestamp;
      this.draw();
    }
    if (!this.finished)
      this.frame = requestAnimationFrame((next) => this.tick(next));
  }

  private draw() {
    const ctx = this.ctx;
    if (!ctx || this.finished) return;
    ctx.clearRect(0, 0, this.width, this.height);
    let complete = true;
    this.lines.forEach((line, index) => {
      const time = this.elapsed - 150 - index * 1450;
      const textOpacity = Math.max(0, Math.min(1, (time - 850) / 400));
      line.text.style.opacity = String(textOpacity);
      line.element.dataset.revealed = String(textOpacity >= 1);
      if (textOpacity < 1) complete = false;
      if (time < 0 || textOpacity >= 1) return;
      ctx.fillStyle = line.color;
      for (const p of line.points) {
        const progress = Math.max(0, Math.min(1, (time - p.seed * 190) / 800));
        if (!progress) continue;
        const settle = 1 - (1 - progress) ** 3;
        const curl = Math.sin(progress * Math.PI) * Math.sin(p.seed * 40) * 9;
        const x = p.startX + (p.x - p.startX) * settle + curl;
        const y =
          p.startY +
          (p.y - p.startY) * settle -
          Math.sin(progress * Math.PI) * 9;
        ctx.globalAlpha =
          Math.min(1, progress * 3) * (1 - textOpacity) * (0.6 + p.seed * 0.4);
        const size = 0.7 + p.seed * 0.8;
        ctx.fillRect(x, y, size, size);
      }
    });
    ctx.globalAlpha = 1;
    if (complete) this.finish();
  }
}
