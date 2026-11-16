type Point = { x: number; y: number; z: number };
type OutlinePoint = readonly [number, number];
type Face = {
  vertices: Point[];
  normal: Point;
  center: Point;
  path: SVGPathElement;
  material: "paint" | "plastic";
};

const svgNS = "http://www.w3.org/2000/svg";
const point = (u: number, v: number, depth: number): Point => ({ x: depth, y: v, z: -u });
const dot = (a: Point, b: Point) => a.x * b.x + a.y * b.y + a.z * b.z;
const unit = (p: Point): Point => {
  const length = Math.hypot(p.x, p.y, p.z) || 1;
  return { x: p.x / length, y: p.y / length, z: p.z / length };
};
const subtract = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const average = (points: Point[]): Point => ({
  x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
  y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
  z: points.reduce((sum, p) => sum + p.z, 0) / points.length,
});

/** Sample a curved outline; each section is a cubic Bézier, in glass coordinates. */
function outline(start: OutlinePoint, curves: OutlinePoint[][]): OutlinePoint[] {
  const points: OutlinePoint[] = [];
  let from = start;
  for (const [a, b, to] of curves) {
    for (let step = 0; step < 8; step++) {
      const t = step / 8, s = 1 - t;
      points.push([
        s ** 3 * from[0] + 3 * s * s * t * a[0] + 3 * s * t * t * b[0] + t ** 3 * to[0],
        s ** 3 * from[1] + 3 * s * s * t * a[1] + 3 * s * t * t * b[1] + t ** 3 * to[1],
      ]);
    }
    from = to;
  }
  return points;
}

/** A solid side-mirror assembly, projected into the wordmark's SVG camera. */
export class SideMirror {
  private faces: Face[] = [];
  private lastYaw = NaN;
  private lastPitch = NaN;
  private finish: SVGRadialGradientElement;
  private keyLight = unit({ x: -.65, y: -.9, z: .65 });
  // The fill comes from the viewer's side so the mount reads as a rounded form.
  private fillLight = unit({ x: -.35, y: -.45, z: -.82 });

  constructor(private housing: SVGGElement) {
    this.housing.replaceChildren();
    this.finish = housing.ownerSVGElement!.querySelector<SVGRadialGradientElement>("#mirror-cap-finish")!;
    const shell = outline([-10, 8], [
      [[10, -21], [58, -32], [126, -32]],
      [[235, -34], [316, -25], [363, -5]],
      [[391, 7], [399, 31], [393, 60]],
      [[390, 78], [385, 100], [381, 115]],
      [[376, 140], [353, 154], [320, 156]],
      [[230, 158], [115, 159], [52, 157]],
      [[17, 154], [-2, 139], [-7, 116]],
      [[-10, 84], [-19, 24], [-10, 8]],
    ]);
    // The cap has genuine depth: broad shoulders taper into a rounded back.
    const shellRings = Array.from({ length: 15 }, (_, index) => {
      const angle = index / 14 * Math.PI / 2;
      const radius = Math.cos(angle) * (1 + .06 * Math.sin(2 * angle));
      return shell.map(([u, v]) => point(
        190 + (u - 190) * radius + 10 * Math.sin(angle),
        61 + (v - 61) * radius - 8 * Math.sin(angle),
        66 * Math.sin(angle),
      ));
    });
    this.loft(shellRings, point(190, 61, 24), "paint", "logo-mirror-cap");

    // The door mount sits flat on the door, at right angles to the glass and
    // inboard of it (negative u). Its outline is drawn in (depth, v): a sail
    // panel with a tall rear edge, sloping down to a blunt nose at the front.
    const sail = outline([-46, 116], [
      [[-20, 121], [30, 145], [50, 158]],
      [[60, 165], [66, 173], [64, 182]],
      [[63, 188], [58, 190], [50, 190]],
      [[20, 191], [-25, 191], [-44, 190]],
      [[-52, 189], [-56, 184], [-56, 177]],
      [[-57, 160], [-56, 142], [-55, 127]],
      [[-54, 120], [-51, 116], [-46, 116]],
    ]);
    // A gasket lip, a flat rim, then a bevelled face toward the viewer.
    const plate = [[-80, .96], [-77, 1], [-71, 1], [-66, .9]].map(([u, scale]) =>
      sail.map(([depth, v]) => point(u, 160 + (v - 160) * scale, -4 + (depth + 4) * scale)),
    );
    this.loft(plate, null, "plastic", "logo-mirror-mount");
    this.face(plate[plate.length - 1], point(-73, 160, -4), "plastic", "logo-mirror-mount");

    // One stout arm flares out of the plate, narrows to a waist and sweeps up
    // into the underside of the cap, where it ends inside the shell.
    const arm = Array.from({ length: 15 }, (_, index) => {
      const t = index / 14, flare = (1 - t) ** 2, rise = t * t * (3 - 2 * t);
      return Array.from({ length: 40 }, (_, step) => {
        const angle = step / 40 * 2 * Math.PI;
        return point(
          -70 + 122 * t,
          164 - 42 * rise + (19 + 2 * flare) * Math.sin(angle),
          -4 + 28 * t + (18 + 16 * flare) * Math.cos(angle),
        );
      });
    });
    this.loft(arm, null, "plastic", "logo-mirror-stalk");
  }

  /** Join consecutive rings; without an origin, each band faces away from its own axis. */
  private loft(rings: Point[][], origin: Point | null, material: Face["material"], className: string) {
    for (let ring = 0; ring < rings.length - 1; ring++) {
      const inside = origin ?? average([...rings[ring], ...rings[ring + 1]]);
      for (let i = 0; i < rings[ring].length; i++) {
        const next = (i + 1) % rings[ring].length;
        this.face([rings[ring][i], rings[ring][next], rings[ring + 1][next], rings[ring + 1][i]], inside, material, className);
      }
    }
  }

  private face(vertices: Point[], origin: Point, material: Face["material"], className: string) {
    const center = average(vertices);
    const a = subtract(vertices[1], vertices[0]), b = subtract(vertices[2], vertices[0]);
    let normal = unit({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x });
    if (dot(normal, subtract(center, origin)) < 0) normal = { x: -normal.x, y: -normal.y, z: -normal.z };
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("class", className);
    // Seal shared antialiased edges so bright lettering cannot leak through.
    path.setAttribute("stroke-width", material === "paint" ? "1.2" : ".35");
    path.setAttribute("stroke-linejoin", "round");
    this.faces.push({ vertices, center, normal, path, material });
    this.housing.append(path);
  }

  render(yaw: number, pitch: number) {
    // An unchanged pose, as in the pause before the turn, needs no rebuilding.
    if (yaw === this.lastYaw && pitch === this.lastPitch) return;
    this.lastYaw = yaw;
    this.lastPitch = pitch;
    const c = Math.cos(yaw), s = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const depth = (p: Point) => (p.x * s + p.z * c) * cp - p.y * sp;
    const view = { x: -s * cp, y: sp, z: -c * cp };
    const half = unit({ x: this.keyLight.x + view.x, y: this.keyLight.y + view.y, z: this.keyLight.z + view.z });
    let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
    this.faces.sort((a, b) => depth(b.center) - depth(a.center));
    for (const face of this.faces) {
      const paint = face.material === "paint";
      const visible = dot(face.normal, view) > 0;
      const diffuse = Math.max(0, dot(face.normal, this.keyLight));
      const fill = Math.max(0, dot(face.normal, this.fillLight));
      const specular = Math.max(0, dot(face.normal, half)) ** 12;
      // Satin black plastic; the painted cap takes its colour from the gradient below.
      const brightness = 15 + diffuse * 34 + fill * 50 + specular * 24;
      // One continuous studio reflection gives the painted cap a smooth finish;
      // its silhouette, depth and occlusion still come from the curved 3D mesh.
      const color = paint ? "url(#mirror-cap-finish)" : `rgb(${Math.round(brightness * .92)} ${Math.round(brightness * .97)} ${Math.round(brightness * 1.08)})`;
      face.path.setAttribute("d", face.vertices.map((p, index) => {
        const x = 180 + p.x * c - p.z * s;
        const y = p.y * cp + (p.x * s + p.z * c) * sp;
        if (paint && visible) {
          left = Math.min(left, x); right = Math.max(right, x);
          top = Math.min(top, y); bottom = Math.max(bottom, y);
        }
        return `${index ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`;
      }).join("") + "Z");
      face.path.setAttribute("fill", color);
      face.path.setAttribute("stroke", color);
      face.path.setAttribute("display", visible ? "inline" : "none");
      this.housing.append(face.path);
    }
    this.finish.setAttribute("gradientTransform", `translate(${(left + right) / 2} ${(top + bottom) / 2}) scale(${(right - left) / 2} ${(bottom - top) / 2})`);
    this.finish.setAttribute("fx", String(-.35 + Math.sin(yaw) * .3));
  }
}
