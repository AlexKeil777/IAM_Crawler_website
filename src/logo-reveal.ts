import { SideMirror } from "./side-mirror";

const dropDistance = 280;
const dropDuration = 1.8;
const turnStart = dropDuration + .2;
const turnDuration = 1.6;

const smooth = (value: number) => {
  const n = Math.max(0, Math.min(1, value));
  return n * n * (3 - 2 * n);
};

/** A complete car side mirror descends, then turns its glass toward the viewer. */
export class LogoReveal {
  private element = document.querySelector<HTMLElement>("#logo-reveal")!;
  private source = this.element.querySelector<SVGGElement>(".logo-source")!;
  private virtual = this.element.querySelector<SVGGElement>(".logo-virtual")!;
  private mirror = this.element.querySelector<SVGGElement>(".logo-mirror")!;
  private plane = this.element.querySelector<SVGGElement>(".logo-mirror-plane")!;
  private sheen = this.element.querySelector<SVGGElement>(".logo-mirror-sheen")!;
  private glass = this.element.querySelector<SVGPathElement>(".logo-mirror-clip")!;
  private edge = this.element.querySelector<SVGPathElement>(".logo-mirror-edge")!;
  private reflection = this.element.querySelector<SVGGElement>(".logo-reflection")!;
  private assembly = new SideMirror(this.element.querySelector<SVGGElement>(".logo-mirror-housing")!);
  private frame = 0;
  private finished = false;
  private started = performance.now();

  constructor(paused: boolean) {
    if (paused || document.hidden) this.finish();
    else {
      this.element.dataset.phase = "dropping";
      this.render(0, -dropDistance);
      this.frame = requestAnimationFrame((time) => this.draw(time));
    }
    document.addEventListener("visibilitychange", () => { if (document.hidden) this.finish(); });
  }

  setPaused(paused: boolean) { if (paused) this.finish(); }

  private finish() {
    cancelAnimationFrame(this.frame);
    this.finished = true;
    this.render(1, 0);
    this.element.dataset.phase = "complete";
  }

  private render(turn: number, drop: number) {
    // Glass faces exactly left during descent, edge-on to the viewer. Any
    // positive turn opens the glass immediately toward the lettering's camera.
    const yaw = turn * 28 * Math.PI / 180;
    const mirrorYaw = yaw;
    const pitch = turn * 4 * Math.PI / 180;
    const c = Math.cos(yaw), s = Math.sin(yaw);
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const lettering = `matrix(${c} ${s * sp} 0 ${cp} ${180 * (1 - c)} ${-180 * s * sp})`;
    const surface = `matrix(${Math.sin(mirrorYaw)} ${-Math.cos(mirrorYaw) * sp} 0 ${cp} 180 0)`;
    this.source.setAttribute("transform", lettering);
    // The virtual image uses the same camera and is visible only through the
    // projected glass. It cannot appear beside or outside the physical mirror.
    this.virtual.setAttribute("transform", lettering);
    this.plane.setAttribute("transform", surface);
    this.sheen.setAttribute("transform", surface);
    this.glass.setAttribute("transform", surface);
    this.mirror.setAttribute("transform", `translate(0 ${drop})`);
    this.assembly.render(mirrorYaw, pitch);
    // Projection alone reveals the reflection as soon as the glass turns.
    // Hide the exactly edge-on surface, including its strokes, on descent.
    const visibility = turn > 0 ? 1 : 0;
    for (const face of [this.plane, this.reflection, this.sheen, this.edge]) {
      face.setAttribute("opacity", String(visibility));
    }
    this.edge.setAttribute("transform", surface);
  }

  private draw(time: number) {
    if (this.finished) return;
    const elapsed = (time - this.started) / 1000;
    const drop = smooth(elapsed / dropDuration);
    const turn = smooth((elapsed - turnStart) / turnDuration);
    this.render(turn, -dropDistance * (1 - drop));
    this.element.dataset.phase = elapsed < turnStart ? "dropping" : "turning";
    if (elapsed >= turnStart + turnDuration) this.finish();
    else this.frame = requestAnimationFrame((next) => this.draw(next));
  }
}
