/** A code-drawn particle sculpture. No external images or WebGL dependency. */
import { createPartShapes, type PartShape } from "./part-shapes";

type Particle = {
  x: number;
  y: number;
  z: number;
  seed: number;
  size: number;
  accent: boolean;
  offsetX: number;
  offsetY: number;
  velocityX: number;
  velocityY: number;
};

export class ParticleRotor {
  private ctx: CanvasRenderingContext2D | null;
  private particles: Particle[] = [];
  private width = 0;
  private height = 0;
  private frame = 0;
  private last = 0;
  private time = 0;
  private morphTime = 0;
  private shapes: PartShape[] = [];
  private paused = true;
  private visible = true;
  private pointer = { x: 0, y: 0 };
  private pointerTarget = { x: 0, y: 0 };
  private cursor = { x: 0, y: 0, active: false };
  // Reused projection buffers keep surface lighting and hidden-surface removal
  // inexpensive without introducing WebGL or a graphics dependency.
  private projected = new Float32Array(0);
  private depthBuffer = new Float32Array(0);
  private depthWidth = 0;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d", { alpha: true });
    this.makeParticles();
    const otherShapes = createPartShapes(this.particles.length);
    this.shapes = [
      { name: "brake disc", points: this.particles.map(({ x, y, z }) => ({ x, y, z })) },
      ...otherShapes.slice(1),
      otherShapes[0],
    ];
    this.projected = new Float32Array(this.particles.length * 7);
    new ResizeObserver(() => this.resize()).observe(canvas);
    new IntersectionObserver(
      (entries) => {
        this.visible = entries[0].isIntersecting;
        this.schedule();
      },
      { rootMargin: "100px" },
    ).observe(canvas);
    canvas.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch" || this.paused) return;
      const rect = canvas.getBoundingClientRect();
      this.cursor = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        active: true,
      };
      this.pointerTarget = {
        x: (event.clientX - rect.left) / rect.width - 0.5,
        y: (event.clientY - rect.top) / rect.height - 0.5,
      };
    });
    canvas.addEventListener("pointerleave", () => {
      this.pointerTarget = { x: 0, y: 0 };
      this.cursor.active = false;
    });
    canvas.addEventListener("pointercancel", () => {
      this.cursor.active = false;
    });
    window.addEventListener("blur", () => {
      this.cursor.active = false;
    });
    document.addEventListener("visibilitychange", () => this.schedule());
  }

  private makeParticles() {
    // Deterministic distribution keeps the sculpture stable across resizes.
    let seed = 7391;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const count = window.innerWidth < 621 ? 4200 : 7600;
    for (let i = 0; i < count; i++) {
      const angle = random() * Math.PI * 2;
      let radius: number;
      let z: number;
      if (i < count * 0.73) {
        radius = Math.sqrt(112 ** 2 + random() * (224 ** 2 - 112 ** 2));
        z = (random() > 0.32 ? 12 : -12) + random() * 2;
        // Drilled holes on the braking surface leave recognisable negative space.
        const holeAngle = (Math.round(angle / (Math.PI / 6)) * Math.PI) / 6;
        const distance = Math.hypot(
          Math.cos(angle) * radius - Math.cos(holeAngle) * 177,
          Math.sin(angle) * radius - Math.sin(holeAngle) * 177,
        );
        if (distance < 8) continue;
      } else if (i < count * 0.86) {
        radius = 224 + random() * 2;
        z = random() * 24 - 12;
      } else if (i < count * 0.95) {
        radius = 90 + random() * 23;
        z = 13 + random() * 40;
      } else {
        radius = 47 + random() * 44;
        z = 53 + random() * 2;
      }
      this.particles.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z,
        seed: random(),
        size: 0.42 + random() * 0.7,
        accent: random() > 0.9,
        offsetX: 0,
        offsetY: 0,
        velocityX: 0,
        velocityY: 0,
      });
    }
    // Edge rings make a mechanical object legible without drawing a solid surface.
    for (const radius of [47, 90, 112, 224]) {
      for (let i = 0; i < 330; i++) {
        const angle = (i / 330) * Math.PI * 2;
        this.particles.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          z: radius < 112 ? 54 : 13,
          seed: random(),
          size: 0.75,
          accent: false,
          offsetX: 0,
          offsetY: 0,
          velocityX: 0,
          velocityY: 0,
        });
      }
    }
  }

  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.depthWidth = Math.ceil(rect.width / 3);
    this.depthBuffer = new Float32Array(this.depthWidth * Math.ceil(rect.height / 3));
    this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw();
    if (this.ctx && this.width > 0 && this.height > 0)
      this.canvas.dataset.ready = "true";
  }

  setPaused(paused: boolean) {
    this.paused = paused;
    if (paused) {
      this.cursor.active = false;
      this.pointerTarget = { x: 0, y: 0 };
      this.particles.forEach((p) => {
        p.offsetX = p.offsetY = p.velocityX = p.velocityY = 0;
      });
    }
    this.schedule();
    if (paused) this.draw();
  }

  private schedule() {
    cancelAnimationFrame(this.frame);
    this.last = 0;
    if (!this.paused && this.visible && !document.hidden)
      this.frame = requestAnimationFrame((timestamp) => this.tick(timestamp));
  }

  private tick(timestamp: number) {
    if (this.paused || !this.visible || document.hidden) return;
    // Cap rendering at 30 fps; animation time remains independent of refresh rate.
    if (!this.last || timestamp - this.last >= 31) {
      const delta = this.last
        ? Math.min((timestamp - this.last) / 1000, 0.1)
        : 0.033;
      this.time += delta;
      this.morphTime += delta;
      this.last = timestamp;
      this.pointer.x += (this.pointerTarget.x - this.pointer.x) * 0.035;
      this.pointer.y += (this.pointerTarget.y - this.pointer.y) * 0.035;
      this.draw(delta);
    }
    this.frame = requestAnimationFrame((next) => this.tick(next));
  }

  private draw(delta = 0) {
    const ctx = this.ctx;
    if (!ctx || !this.width || !this.height) return;
    ctx.clearRect(0, 0, this.width, this.height);
    const t = this.time;
    // Hold each component long enough to read it, then move the same particles
    // into the next one. The last component transitions back into the disc.
    const hold = 1.25;
    const transition = 0.75;
    const cycle = hold + transition;
    const shapeIndex = Math.floor(this.morphTime / cycle) % this.shapes.length;
    const nextIndex = (shapeIndex + 1) % this.shapes.length;
    const progress = Math.max(0, Math.min(1, (this.morphTime % cycle - hold) / transition));
    const blend = progress * progress * (3 - 2 * progress);
    const from = this.shapes[shapeIndex].points;
    const to = this.shapes[nextIndex].points;
    this.canvas.dataset.part = this.shapes[shapeIndex].name;
    const surfaceBlend = (from[0].nz === undefined ? 0 : 1) * (1 - blend)
      + (to[0].nz === undefined ? 0 : 1) * blend;
    // Gradually loosen the surface during morphs and re-form it at the end.
    // This avoids hidden particles popping into view at the transition edges.
    // The original brake disc retains its original rendering.
    const occlusionWeight = surfaceBlend * Math.cos(Math.PI * blend) ** 2;
    const occlude = occlusionWeight > 0.001;
    if (occlude) this.depthBuffer.fill(Infinity);
    const scale = Math.min(this.width / 590, this.height / 520) * 0.95;
    const yaw = -0.55 + Math.sin(t * 0.12) * 0.14 + this.pointer.x * 0.15;
    const tilt = -0.4 + this.pointer.y * 0.13;
    const turn = -0.34 + Math.sin(t * 0.12) * 0.06;
    const cy = Math.cos(yaw),
      sy = Math.sin(yaw),
      cx = Math.cos(tilt),
      sx = Math.sin(tilt),
      cz = Math.cos(turn),
      sz = Math.sin(turn);
    const centerX = this.width * 0.48;
    const centerY = this.height * 0.51;
    const radius = Math.max(55, Math.min(100, this.width * 0.17));
    const damping = Math.exp(-5.5 * delta);
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const x = from[i].x + (to[i].x - from[i].x) * blend;
      const y = from[i].y + (to[i].y - from[i].y) * blend;
      let px = x * cz - y * sz;
      let py = x * sz + y * cz;
      let pz = from[i].z + (to[i].z - from[i].z) * blend;
      const rotatedX = px * cy + pz * sy;
      pz = -px * sy + pz * cy;
      px = rotatedX;
      const rotatedY = py * cx - pz * sx;
      pz = py * sx + pz * cx;
      py = rotatedY;
      const phase = (t * 0.045 + p.seed * 4) % 1;
      const escaping = p.seed > 0.76 && phase > 0.55;
      let dissolve = escaping ? (phase - 0.55) / 0.45 : 0;
      if (this.paused) dissolve = 0;
      px += dissolve * (120 + p.seed * 130);
      py -= dissolve * (70 + Math.sin(p.seed * 50 + t * 0.25) * 70);
      const perspective = 700 / (700 + pz);
      const baseX = centerX + px * scale * perspective;
      const baseY = centerY + py * scale * perspective;
      if (delta > 0 && !this.paused) {
        let forceX = 0,
          forceY = 0;
        if (this.cursor.active) {
          const dx = baseX + p.offsetX - this.cursor.x;
          const dy = baseY + p.offsetY - this.cursor.y;
          const distance = Math.hypot(dx, dy);
          if (distance < radius) {
            const angle =
              distance > 0.1 ? Math.atan2(dy, dx) : p.seed * Math.PI * 2;
            const force = (1 - distance / radius) ** 2 * 4400;
            // A little tangential variation makes the scatter feel like loose dust.
            const swirl = (p.seed - 0.5) * 0.65;
            forceX = (Math.cos(angle) - Math.sin(angle) * swirl) * force;
            forceY = (Math.sin(angle) + Math.cos(angle) * swirl) * force;
          }
        }
        // A damped spring brings each particle back to its moving position.
        p.velocityX =
          (p.velocityX + (forceX - p.offsetX * 12) * delta) * damping;
        p.velocityY =
          (p.velocityY + (forceY - p.offsetY * 12) * delta) * damping;
        p.offsetX += p.velocityX * delta;
        p.offsetY += p.velocityY * delta;
      }
      const screenX = baseX + p.offsetX;
      const screenY = baseY + p.offsetY;
      let shading = 1;
      if (surfaceBlend > 0) {
        // Transform surface normals with the same rigid camera transform.
        const nx = (from[i].nx ?? 0) * (1 - blend) + (to[i].nx ?? 0) * blend;
        const ny = (from[i].ny ?? 0) * (1 - blend) + (to[i].ny ?? 0) * blend;
        const nz = (from[i].nz ?? -1) * (1 - blend) + (to[i].nz ?? -1) * blend;
        const rx = nx * cz - ny * sz, ry = nx * sz + ny * cz;
        const xx = rx * cy + nz * sy, zz = -rx * sy + nz * cy;
        const yy = ry * cx - zz * sx, normalZ = ry * sx + zz * cx;
        const diffuse = Math.max(0, -xx * 0.3 - yy * 0.45 - normalZ * 0.84);
        const tone = (from[i].tone ?? 1) * (1 - blend) + (to[i].tone ?? 1) * blend;
        const lit = Math.min(1.3, (0.5 + diffuse * 0.8) * tone);
        shading = 1 + (lit - 1) * surfaceBlend;
        const feature = (from[i].edge ?? 0) * (1 - blend) + (to[i].edge ?? 0) * blend;
        if (feature > 0.9) shading = Math.max(shading, 0.85);
        if (occlude && normalZ > 0.12 && dissolve === 0 && feature < 0.9)
          shading *= 1 - occlusionWeight;
      }
      const depth = Math.max(0.28, Math.min(0.98, 0.68 + pz / 450));
      const surfaceDepth = Math.max(0.65, Math.min(1, 0.86 - pz / 1800));
      const edge = (from[i].edge ?? 0) * (1 - blend) + (to[i].edge ?? 0) * blend;
      const alpha = Math.min(1, (depth + (surfaceDepth - depth) * surfaceBlend)
        * shading * (1 - dissolve) * (0.7 + p.seed * 0.3) * (1 + edge * 0.28));
      const size = Math.max(0.45 + surfaceBlend * 0.15,
        p.size * scale * perspective * (1.15 + surfaceBlend * 0.18));
      const offset = i * 7;
      this.projected[offset] = screenX;
      this.projected[offset + 1] = screenY;
      this.projected[offset + 2] = pz;
      this.projected[offset + 3] = alpha;
      this.projected[offset + 4] = size;
      this.projected[offset + 5] = p.accent || escaping ? 1 : 0;
      const cellX = Math.floor(screenX / 3), cellY = Math.floor(screenY / 3);
      const cell = cellY * this.depthWidth + cellX;
      const inside = cellX >= 0 && cellX < this.depthWidth && cellY >= 0 && cell < this.depthBuffer.length;
      this.projected[offset + 6] = inside && dissolve === 0 ? cell : -1;
      if (occlude && inside && alpha > 0 && dissolve === 0)
        this.depthBuffer[cell] = Math.min(this.depthBuffer[cell], pz);
    }
    for (let i = 0; i < this.particles.length; i++) {
      const offset = i * 7;
      let alpha = this.projected[offset + 3];
      if (alpha <= 0) continue;
      const cell = this.projected[offset + 6];
      if (occlude && cell >= 0 && this.projected[offset + 2] > this.depthBuffer[cell] + 18)
        alpha *= 1 - occlusionWeight;
      if (alpha <= 0.001) continue;
      ctx.fillStyle = this.projected[offset + 5]
        ? `rgba(182,154,247,${alpha * 0.95})`
        : `rgba(234,235,220,${alpha})`;
      const size = this.projected[offset + 4];
      ctx.fillRect(this.projected[offset], this.projected[offset + 1], size, size);
    }
    // Sparse motes slowly travel away from the component and evaporate.
    for (let i = 0; i < 43; i++) {
      const progress = (i / 43 + t * 0.016) % 1;
      const angle = i * 2.39996;
      const radius = (228 + progress * 90) * scale;
      const x = centerX + Math.cos(angle) * radius + progress * 32;
      const y = centerY + Math.sin(angle) * radius * 0.75 - progress * 34;
      ctx.fillStyle = `rgba(182,154,247,${Math.sin(progress * Math.PI) * 0.35})`;
      ctx.fillRect(x, y, i % 5 === 0 ? 1.3 : 0.7, i % 5 === 0 ? 1.3 : 0.7);
    }
  }
}
