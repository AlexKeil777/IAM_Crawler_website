/** The favicon's shared IAM/AI geometry, rendered as interactive particles. */
type Particle = {
  x: number;
  y: number;
  seed: number;
  size: number;
  copper: boolean;
  offsetX: number;
  offsetY: number;
  vx: number;
  vy: number;
};

export class ParticleIdentity {
  private ctx: CanvasRenderingContext2D | null;
  private particles: Particle[] = [];
  private width = 0;
  private height = 0;
  private frame = 0;
  private last = 0;
  private time = 0;
  private paused = true;
  private visible = true;
  private cursor = { x: 0, y: 0, active: false };

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d");
    new ResizeObserver(() => this.resize()).observe(canvas);
    new IntersectionObserver(
      (entries) => {
        this.visible = entries[0].isIntersecting;
        this.schedule();
      },
      { rootMargin: "80px" },
    ).observe(canvas);
    canvas.addEventListener("pointermove", (event) => {
      if (this.paused || event.pointerType === "touch") return;
      const rect = canvas.getBoundingClientRect();
      this.cursor = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        active: true,
      };
    });
    const clearCursor = () => {
      this.cursor.active = false;
    };
    canvas.addEventListener("pointerleave", clearCursor);
    canvas.addEventListener("pointercancel", clearCursor);
    window.addEventListener("blur", clearCursor);
    document.addEventListener("visibilitychange", () => this.schedule());
    void this.loadMark();
  }

  private async loadMark() {
    const image = new Image();
    image.src = new URL("logo.svg", document.baseURI).href;
    try {
      await image.decode();
    } catch {
      return;
    } // The vector fallback remains visible if loading fails.
    const mask = document.createElement("canvas");
    mask.width = mask.height = 480;
    const ctx = mask.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(image, 0, 0, 480, 480);
    const data = ctx.getImageData(0, 0, 480, 480).data;
    let seed = 7391;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let y = 0; y < 480; y += 3)
      for (let x = 0; x < 480; x += 3) {
        const index = (y * 480 + x) * 4;
        if (data[index + 3] < 100) continue;
        this.particles.push({
          x: (x + random() * 2 - 1) / 480 - 0.5,
          y: (y + random() * 2 - 1) / 480 - 0.5,
          seed: random(),
          size: 0.7 + random() * 0.65,
          copper: data[index] > data[index + 1] * 1.12,
          offsetX: 0,
          offsetY: 0,
          vx: 0,
          vy: 0,
        });
      }
    this.draw();
    this.canvas.dataset.ready = "true";
    this.canvas.closest(".hero-identity")?.classList.add("is-ready");
    this.schedule();
  }

  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw();
  }

  setPaused(paused: boolean) {
    this.paused = paused;
    if (paused) {
      this.cursor.active = false;
      this.particles.forEach((p) => {
        p.offsetX = p.offsetY = p.vx = p.vy = 0;
      });
    }
    this.schedule();
    this.draw();
  }

  private schedule() {
    cancelAnimationFrame(this.frame);
    this.last = 0;
    if (!this.paused && this.visible && !document.hidden)
      this.frame = requestAnimationFrame((timestamp) => this.tick(timestamp));
  }

  private tick(timestamp: number) {
    if (this.paused || !this.visible || document.hidden) return;
    if (!this.last || timestamp - this.last >= 31) {
      const delta = this.last
        ? Math.min((timestamp - this.last) / 1000, 0.1)
        : 0.033;
      this.last = timestamp;
      this.time += delta;
      this.draw(delta);
    }
    this.frame = requestAnimationFrame((next) => this.tick(next));
  }

  private draw(delta = 0) {
    const ctx = this.ctx;
    if (!ctx || !this.width || !this.height) return;
    ctx.clearRect(0, 0, this.width, this.height);
    const scale = Math.min(this.width * 0.9, this.height * 0.9);
    const centerX = this.width * 0.5,
      centerY = this.height * 0.48;
    const radius = Math.max(55, Math.min(85, this.width * 0.16));
    const damping = Math.exp(-5.5 * delta);
    for (const p of this.particles) {
      const phase = (this.time * 0.045 + p.seed * 7) % 1;
      const evaporating = !this.paused && p.seed > 0.95 && phase > 0.25;
      const drift = evaporating
        ? Math.sin(((phase - 0.25) / 0.75) * Math.PI)
        : 0;
      const baseX = centerX + p.x * scale + Math.sin(p.seed * 30) * drift * 37;
      const baseY = centerY + p.y * scale - drift * 50;
      if (delta && !this.paused) {
        let fx = 0,
          fy = 0;
        if (this.cursor.active) {
          const dx = baseX + p.offsetX - this.cursor.x,
            dy = baseY + p.offsetY - this.cursor.y;
          const distance = Math.hypot(dx, dy);
          if (distance < radius) {
            const angle =
              distance > 0.1 ? Math.atan2(dy, dx) : p.seed * Math.PI * 2;
            const force = (1 - distance / radius) ** 2 * 4400;
            const swirl = (p.seed - 0.5) * 0.7;
            fx = (Math.cos(angle) - Math.sin(angle) * swirl) * force;
            fy = (Math.sin(angle) + Math.cos(angle) * swirl) * force;
          }
        }
        p.vx = (p.vx + (fx - p.offsetX * 14) * delta) * damping;
        p.vy = (p.vy + (fy - p.offsetY * 14) * delta) * damping;
        p.offsetX += p.vx * delta;
        p.offsetY += p.vy * delta;
      }
      const alpha = (0.62 + p.seed * 0.36) * (1 - drift * 0.65);
      ctx.fillStyle = p.copper
        ? `rgba(220,164,119,${alpha})`
        : `rgba(239,237,231,${alpha})`;
      const size = Math.max(0.7, (p.size * scale) / 340);
      ctx.fillRect(baseX + p.offsetX, baseY + p.offsetY, size, size);
    }
    for (let i = 0; i < 65; i++) {
      const progress = (i / 65 + this.time * 0.012) % 1;
      const angle = i * 2.39996;
      const distance = scale * (0.33 + progress * 0.31);
      ctx.fillStyle = `rgba(220,164,119,${Math.sin(progress * Math.PI) * 0.28})`;
      const size = i % 7 === 0 ? 1.2 : 0.65;
      ctx.fillRect(
        centerX + Math.cos(angle) * distance,
        centerY + Math.sin(angle) * distance * 0.78 - progress * 15,
        size,
        size,
      );
    }
  }
}
