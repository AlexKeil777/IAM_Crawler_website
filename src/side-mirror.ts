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
  private fillLight = unit({ x: .8, y: -.3, z: -.4 });

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

    const stalk = outline([61, 115], [
      [[41, 127], [12, 150], [-12, 163]],
      [[-29, 174], [-54, 180], [-64, 171]],
      [[-75, 162], [-65, 152], [-49, 145]],
      [[-22, 133], [3, 113], [27, 109]],
      [[43, 107], [54, 110], [61, 115]],
    ]);
    this.extrude(stalk, -23, 39, [-4, 145], "logo-mirror-stalk");
    const mount = outline([-116, 112], [
      [[-113, 103], [-108, 105], [-100, 115]],
      [[-83, 133], [-61, 154], [-53, 170]],
      [[-45, 183], [-49, 193], [-64, 195]],
      [[-78, 197], [-107, 195], [-116, 188]],
      [[-125, 174], [-123, 128], [-116, 112]],
    ]);
    this.extrude(mount, -34, 26, [-88, 155], "logo-mirror-mount");
  }

  private extrude(shape: OutlinePoint[], depth: number, thickness: number, center: OutlinePoint, className: string) {
    const rings = [[0, .9], [3, 1], [thickness - 3, 1], [thickness, .9]].map(([offset, scale]) =>
      shape.map(([u, v]) => point(center[0] + (u - center[0]) * scale, center[1] + (v - center[1]) * scale, depth + offset)),
    );
    const origin = point(center[0], center[1], depth + thickness / 2);
    this.loft(rings, origin, "plastic", className);
    this.face(rings[0], origin, "plastic", className);
    this.face(rings[rings.length - 1], origin, "plastic", className);
  }

  private loft(rings: Point[][], origin: Point, material: Face["material"], className: string) {
    for (let ring = 0; ring < rings.length - 1; ring++) {
      for (let i = 0; i < rings[ring].length; i++) {
        const next = (i + 1) % rings[ring].length;
        this.face([rings[ring][i], rings[ring][next], rings[ring + 1][next], rings[ring + 1][i]], origin, material, className);
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
    // Descent moves the parent only; the solid assembly does not need rebuilding.
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
      const specular = Math.max(0, dot(face.normal, half)) ** (paint ? 28 : 12);
      const brightness = (paint ? 24 : 16) + diffuse * (paint ? 87 : 38) + fill * 27 + specular * (paint ? 95 : 17);
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
