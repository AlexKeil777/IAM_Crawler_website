/** Surface geometry for the automotive particle models. Units are millimetre-like;
 * finish() fits each complete assembly into the same display space. */
export type Vec3 = [number, number, number];
export type XY = [number, number];
export type PartPoint = {
  x: number; y: number; z: number;
  nx?: number; ny?: number; nz?: number;
  tone?: number;
  edge?: number;
};
export type PartShape = { name: string; points: PartPoint[] };
type SurfacePoint = { position: Vec3; normal: Vec3 };
type Surface = { area: number; sample: (u: number, v: number) => PartPoint };
type Feature = { samples: number; sample: (u: number) => PartPoint };
type Frame = { origin: Vec3; axes: [Vec3, Vec3, Vec3] };

const TAU = Math.PI * 2;
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
const sub = (a: Vec3, b: Vec3): Vec3 => add(a, mul(b, -1));
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const length = (a: Vec3) => Math.hypot(...a);
const unit = (a: Vec3): Vec3 => mul(a, 1 / (length(a) || 1));
const direction = (frame: Frame, a: Vec3): Vec3 => add(add(mul(frame.axes[0], a[0]), mul(frame.axes[1], a[1])), mul(frame.axes[2], a[2]));
const polygonArea = (p: XY[]) => p.reduce((a, v, i) => {
  const next = p[(i + 1) % p.length];
  return a + v[0] * next[1] - next[0] * v[1];
}, 0) / 2;
const inside = (x: number, y: number, p: XY[]) => {
  let hit = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    if ((p[i][1] > y) !== (p[j][1] > y) && x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) hit = !hit;
  }
  return hit;
};

export class PartBuilder {
  private surfaces: Surface[] = [];
  private features: Feature[] = [];
  private frame: Frame = { origin: [0, 0, 0], axes: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] };

  constructor(private seed = 8317) {}

  private random() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  private surface(area: number, sample: (u: number, v: number) => SurfacePoint, tone: number, edge = 0) {
    if (area <= 0) return;
    const frame = this.frame;
    this.surfaces.push({ area, sample: (u, v) => {
      const point = sample(u, v);
      const position = add(frame.origin, direction(frame, point.position));
      const normal = unit(direction(frame, point.normal));
      return { x: position[0], y: position[1], z: position[2], nx: normal[0], ny: normal[1], nz: normal[2], tone, edge };
    } });
  }

  private feature(samples: number, sample: (u: number) => SurfacePoint, tone: number) {
    const frame = this.frame;
    this.features.push({ samples, sample: (u) => {
      const p = sample(u);
      const position = add(frame.origin, direction(frame, p.position));
      const normal = unit(direction(frame, p.normal));
      return { x: position[0], y: position[1], z: position[2], nx: normal[0], ny: normal[1], nz: normal[2], tone, edge: 1 };
    } });
  }

  /** Evenly spaced particles on a real machined seam or opening. */
  featureLine(a: Vec3, b: Vec3, samples = 100, tone = 1.1) {
    this.feature(samples, (u) => ({ position: add(a, mul(sub(b, a), u)), normal: [0, 0, -1] }), tone);
  }

  featureCircle(center: Vec3, radius: number, axis: Vec3 = [0, 0, 1], samples = 180, tone = 1.1) {
    const n = unit(axis);
    const a = unit(cross(n, Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]));
    const b = cross(n, a);
    this.feature(samples, (u) => ({
      position: add(center, add(mul(a, Math.cos(u * TAU) * radius), mul(b, Math.sin(u * TAU) * radius))),
      normal: mul(n, -1),
    }), tone);
  }

  /** Child primitives share a local frame; rotations are X, then Y, then Z. */
  group(origin: Vec3, rotation: Vec3, build: () => void) {
    const parent = this.frame;
    const rotate = (v: Vec3): Vec3 => {
      const [rx, ry, rz] = rotation;
      const y = v[1] * Math.cos(rx) - v[2] * Math.sin(rx);
      const z = v[1] * Math.sin(rx) + v[2] * Math.cos(rx);
      const x = v[0] * Math.cos(ry) + z * Math.sin(ry);
      const zz = -v[0] * Math.sin(ry) + z * Math.cos(ry);
      return [x * Math.cos(rz) - y * Math.sin(rz), x * Math.sin(rz) + y * Math.cos(rz), zz];
    };
    this.frame = {
      origin: add(parent.origin, direction(parent, origin)),
      axes: [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map((v) => direction(parent, rotate(v as Vec3))) as [Vec3, Vec3, Vec3],
    };
    try { build(); } finally { this.frame = parent; }
  }

  private triangle(a: Vec3, b: Vec3, c: Vec3, tone: number) {
    const ab = sub(b, a), ac = sub(c, a), normal = cross(ab, ac);
    this.surface(length(normal) / 2, (u, v) => {
      const root = Math.sqrt(u);
      return { position: add(a, add(mul(ab, root * (1 - v)), mul(ac, root * v))), normal };
    }, tone);
  }

  quad(a: Vec3, b: Vec3, c: Vec3, d: Vec3, tone = 1) {
    this.triangle(a, b, c, tone);
    this.triangle(a, c, d, tone);
  }

  box(center: Vec3, size: Vec3, tone = 1) {
    this.extrude([[-size[0] / 2, -size[1] / 2], [size[0] / 2, -size[1] / 2], [size[0] / 2, size[1] / 2], [-size[0] / 2, size[1] / 2]], size[2], center, tone);
  }

  /** A solid extrusion with real walls around its through-holes. */
  extrude(vertices: XY[], depth: number, center: Vec3 = [0, 0, 0], tone = 1, holes: XY[][] = []) {
    const minX = Math.min(...vertices.map((p) => p[0]));
    const maxX = Math.max(...vertices.map((p) => p[0]));
    const minY = Math.min(...vertices.map((p) => p[1]));
    const maxY = Math.max(...vertices.map((p) => p[1]));
    const area = Math.abs(polygonArea(vertices)) - holes.reduce((a, p) => a + Math.abs(polygonArea(p)), 0);
    for (const sign of [-1, 1]) {
      this.surface(area, (u, v) => {
        let x = minX + u * (maxX - minX), y = minY + v * (maxY - minY);
        while (!inside(x, y, vertices) || holes.some((p) => inside(x, y, p))) {
          x = minX + this.random() * (maxX - minX);
          y = minY + this.random() * (maxY - minY);
        }
        return { position: add(center, [x, y, sign * depth / 2]), normal: [0, 0, sign] };
      }, tone);
    }
    for (const [index, loop] of [vertices, ...holes].entries()) {
      const sign = (polygonArea(loop) > 0 ? 1 : -1) * (index === 0 ? 1 : -1);
      loop.forEach((a, i) => {
        const b = loop[(i + 1) % loop.length];
        const dx = b[0] - a[0], dy = b[1] - a[1];
        this.surface(Math.hypot(dx, dy) * depth, (u, v) => ({
          position: add(center, [a[0] + dx * u, a[1] + dy * u, (v - 0.5) * depth]),
          normal: [dy * sign, -dx * sign, 0],
        }), tone);
        // A small, separate edge population catches the machined boundary.
        // Faces still carry the bulk of the particles and their volume.
        for (const side of [-1, 1]) {
          const outward = unit([dy * sign, -dx * sign, 0]);
          this.surface(Math.hypot(dx, dy) * 3, (u) => ({
            position: add(center, [a[0] + dx * u, a[1] + dy * u, side * depth / 2]),
            normal: [outward[0] * 0.35, outward[1] * 0.35, side * 0.94],
          }), Math.min(1.25, tone + 0.25), 1);
        }
      });
    }
  }

  cylinder(center: Vec3, radius: number, depth: number, axis: Vec3 = [0, 0, 1], inner = 0, tone = 1, caps = true) {
    const n = unit(axis);
    const a = unit(cross(n, Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]));
    const b = cross(n, a);
    const radial = (angle: number) => add(mul(a, Math.cos(angle)), mul(b, Math.sin(angle)));
    for (const r of inner > 0 ? [radius, inner] : [radius]) {
      this.surface(TAU * r * depth, (u, v) => ({
        position: add(center, add(mul(radial(u * TAU), r), mul(n, (v - 0.5) * depth))),
        normal: mul(radial(u * TAU), r === radius ? 1 : -1),
      }), tone);
    }
    if (caps) for (const sign of [-1, 1]) {
      this.surface(Math.PI * (radius * radius - inner * inner), (u, v) => ({
        position: add(center, add(mul(radial(u * TAU), Math.sqrt(inner * inner + v * (radius * radius - inner * inner))), mul(n, sign * depth / 2))),
        normal: mul(n, sign),
      }), tone);
      for (const radiusAtEdge of inner > 0 ? [radius, inner] : [radius]) {
        this.surface(TAU * radiusAtEdge * 3, (u) => ({
          position: add(center, add(mul(radial(u * TAU), radiusAtEdge), mul(n, sign * depth / 2))),
          normal: mul(n, sign),
        }), Math.min(1.25, tone + 0.25), 1);
      }
    }
  }

  torus(center: Vec3, major: number, minor: number, axis: Vec3 = [0, 0, 1], tone = 1, start = 0, end = TAU) {
    const n = unit(axis);
    const a = unit(cross(n, Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]));
    const b = cross(n, a);
    this.surface((end - start) * TAU * major * minor, (u, v) => {
      const angle = start + u * (end - start), tube = v * TAU;
      const radial = add(mul(a, Math.cos(angle)), mul(b, Math.sin(angle)));
      return {
        position: add(center, add(mul(radial, major + minor * Math.cos(tube)), mul(n, minor * Math.sin(tube)))),
        normal: add(mul(radial, Math.cos(tube)), mul(n, Math.sin(tube))),
      };
    }, tone);
  }

  ellipsoid(center: Vec3, radii: Vec3, tone = 1) {
    const [a, b, c] = radii;
    this.surface(4 * Math.PI * ((a * b) ** 1.6075 + (a * c) ** 1.6075 + (b * c) ** 1.6075) ** (1 / 1.6075) / 3 ** (1 / 1.6075), (u, v) => {
      const y = 2 * v - 1, r = Math.sqrt(1 - y * y), angle = u * TAU;
      const x = r * Math.cos(angle), z = r * Math.sin(angle);
      return { position: add(center, [a * x, b * y, c * z]), normal: [x / a, y / b, z / c] };
    }, tone);
  }

  finish(name: string, count: number): PartShape {
    const cumulative: number[] = [];
    let area = 0;
    for (const surface of this.surfaces) cumulative.push(area += surface.area);
    const featureScale = Math.min(count / 8800, count * 0.3 / Math.max(1, this.features.reduce((n, f) => n + f.samples, 0)));
    const allocations = this.features.map((feature) => Math.floor(feature.samples * featureScale));
    const surfaceCount = count - allocations.reduce((n, size) => n + size, 0);
    const points = Array.from({ length: surfaceCount }, () => {
      // Spend most samples on surfaces visible from the sculpture's camera.
      // Retain a small rear population for parallax as the camera moves.
      for (;;) {
        const target = this.random() * area;
        let lo = 0, hi = cumulative.length - 1;
        while (lo < hi) {
          const mid = (lo + hi) >>> 1;
          if (target > cumulative[mid]) lo = mid + 1;
          else hi = mid;
        }
        const p = this.surfaces[lo].sample(this.random(), this.random());
        const rx = p.nx! * Math.cos(-0.34) - p.ny! * Math.sin(-0.34);
        const ry = p.nx! * Math.sin(-0.34) + p.ny! * Math.cos(-0.34);
        const zz = -rx * Math.sin(-0.55) + p.nz! * Math.cos(-0.55);
        const facing = -(ry * Math.sin(-0.4) + zz * Math.cos(-0.4));
        if (this.random() < 0.06 + 0.94 * Math.max(0, facing)) return p;
      }
    });
    this.features.forEach((feature, index) => {
      const size = allocations[index];
      for (let i = 0; i < size; i++) points.push(feature.sample((i + 0.15 * this.random()) / size));
    });
    // Mix surface/edge populations so morphs do not move whole seams together.
    for (let i = points.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [points[i], points[j]] = [points[j], points[i]];
    }
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    for (const p of points) [p.x, p.y, p.z].forEach((v, i) => { min[i] = Math.min(min[i], v); max[i] = Math.max(max[i], v); });
    const scale = 420 / Math.max(...max.map((v, i) => v - min[i]));
    for (const p of points) {
      p.x = (p.x - (min[0] + max[0]) / 2) * scale;
      p.y = (p.y - (min[1] + max[1]) / 2) * scale;
      p.z = (p.z - (min[2] + max[2]) / 2) * scale;
    }
    return { name, points };
  }
}
