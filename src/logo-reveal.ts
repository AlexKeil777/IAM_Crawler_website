/** The second half of the palindrome is a reflection of the first half. */
export class LogoReveal {
  private element = document.querySelector<HTMLElement>("#logo-reveal")!;
  private mask = this.element.querySelector<SVGRectElement>(".logo-reflection-mask")!;
  private mirror = this.element.querySelector<SVGGElement>(".logo-mirror")!;
  private glint = this.element.querySelector<SVGLineElement>(".logo-reflection-glint")!;
  private frame = 0;
  private finished = false;
  private started = performance.now();

  constructor(paused: boolean) {
    if (paused || document.hidden) this.finish();
    else {
      this.element.dataset.phase = "dropping";
      this.mask.setAttribute("width", "0");
      this.frame = requestAnimationFrame((time) => this.draw(time));
    }
    document.addEventListener("visibilitychange", () => { if (document.hidden) this.finish(); });
  }

  setPaused(paused: boolean) { if (paused) this.finish(); }

  private finish() {
    cancelAnimationFrame(this.frame);
    this.finished = true;
    this.mask.setAttribute("width", "180");
    this.mirror.style.opacity = "0";
    this.glint.style.opacity = "0";
    this.element.dataset.phase = "complete";
  }

  private draw(time: number) {
    if (this.finished) return;
    const elapsed = (time - this.started) / 1000;
    const drop = Math.min(1, elapsed / 0.94);
    const ease = 1 - (1 - drop) ** 3;
    const settle = Math.sin(drop * Math.PI * 2) * 2.5 * drop;
    this.mirror.setAttribute("transform", `translate(0 ${-154 * (1 - ease) + settle}) rotate(${-7 * (1 - ease)} 180 5)`);
    this.mirror.style.opacity = String(Math.min(1, elapsed * 7) * (1 - Math.max(0, (elapsed - 1.1) / 0.5)));
    const progress = Math.max(0, Math.min(1, (elapsed - 0.58) / 0.42));
    const reveal = progress * progress * (3 - 2 * progress);
    this.mask.setAttribute("width", String(180 * reveal));
    this.glint.style.opacity = String(Math.sin(progress * Math.PI) * 0.9);
    if (elapsed >= 1) this.element.dataset.phase = "complete";
    if (elapsed >= 1.6) this.finish();
    else this.frame = requestAnimationFrame((next) => this.draw(next));
  }
}
