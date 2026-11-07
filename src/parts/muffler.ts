import { PartBuilder, type PartShape, type Vec3, type XY } from "../part-geometry";

const TAU = Math.PI * 2;
const subtract = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const length = (v: Vec3) => Math.hypot(...v);
const unit = (v: Vec3): Vec3 => {
  const size = length(v) || 1;
  return [v[0] / size, v[1] / size, v[2] / size];
};
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0],
];
const ellipse = (a: number, b: number): XY[] => Array.from({ length: 40 }, (_, i) => [a * Math.cos(i * TAU / 40), b * Math.sin(i * TAU / 40)]);

/** Hollow swept pipe; each end has an exposed metal annulus, never a solid cap. */
function tube(part: PartBuilder, path: Vec3[], outer = 8.5, inner = 6.5, tone = 0.96) {
  const sections = path.map((center, index) => {
    const tangent = unit(subtract(path[Math.min(path.length - 1, index + 1)], path[Math.max(0, index - 1)]));
    const a = unit(cross(tangent, Math.abs(tangent[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]));
    const b = cross(tangent, a);
    const point = (angle: number, radius: number): Vec3 => [
      center[0] + radius * (a[0] * Math.cos(angle) + b[0] * Math.sin(angle)),
      center[1] + radius * (a[1] * Math.cos(angle) + b[1] * Math.sin(angle)),
      center[2] + radius * (a[2] * Math.cos(angle) + b[2] * Math.sin(angle)),
    ];
    return { center, tangent, point };
  });
  for (let section = 0; section < sections.length - 1; section++) {
    const a = sections[section], b = sections[section + 1];
    for (let i = 0; i < 24; i++) {
      const u = i * TAU / 24, v = (i + 1) * TAU / 24;
      part.quad(a.point(u, outer), a.point(v, outer), b.point(v, outer), b.point(u, outer), tone);
      part.quad(a.point(u, inner), b.point(u, inner), b.point(v, inner), a.point(v, inner), 0.34);
    }
    part.featureLine(a.point(0.2, outer), b.point(0.2, outer), 35, 1.08);
  }
  for (const index of [0, sections.length - 1]) {
    const tip = sections[index];
    for (let i = 0; i < 24; i++) {
      const u = i * TAU / 24, v = (i + 1) * TAU / 24;
      part.quad(tip.point(u, outer), tip.point(v, outer), tip.point(v, inner), tip.point(u, inner), 1.15);
    }
    part.featureCircle(tip.center, outer, tip.tangent, 85, 1.16);
    part.featureCircle(tip.center, inner, tip.tangent, 70, 1.05);
  }
}

/** Flattened stamped can with bright rolled seams and inset end plates. */
function silencer(part: PartBuilder, center: Vec3, angle: number) {
  part.group(center, [0, 0, angle], () => {
    const rings = [[-57, 25, 16], [-52, 31, 21], [-45, 32, 22], [45, 32, 22], [52, 31, 21], [57, 25, 16]];
    const point = ([x, y, z]: number[], a: number): Vec3 => [x, y * Math.cos(a), z * Math.sin(a)];
    for (let ring = 0; ring < rings.length - 1; ring++) {
      for (let i = 0; i < 40; i++) {
        const a = i * TAU / 40, b = (i + 1) * TAU / 40;
        part.quad(point(rings[ring], a), point(rings[ring], b), point(rings[ring + 1], b), point(rings[ring + 1], a), 0.7);
      }
    }
    for (const side of [-1, 1]) {
      part.group([side * 57, 0, 0], [0, Math.PI / 2, 0], () => {
        part.extrude(ellipse(16, 25), 2, [0, 0, 0], 0.81);
      });
      for (let i = 0; i < 40; i++) {
        part.featureLine(point([side * 52, 31.5, 21.5], i * TAU / 40),
          point([side * 52, 31.5, 21.5], (i + 1) * TAU / 40), 5, 1.1);
      }
    }
    for (const y of [-14, 14]) {
      part.featureLine([-41, y, -20], [41, y, -20], 85, 0.95);
    }
    // Welded hanger hook above each can.
    part.cylinder([8, -38, 1], 3, 26, [0, 1, 0], 0, 0.9);
    part.cylinder([19, -51, 1], 3, 22, [1, 0, 0], 0, 0.9);
    part.ellipsoid([8, -51, 1], [3, 3, 3], 0.9);
  });
}

/** Complete twin-pipe rear exhaust with a crossover and two separate silencers. */
export function buildExhaust(count: number): PartShape {
  const part = new PartBuilder(52819);
  part.group([0, 0, 0], [0.28, 0.27, 0.24], () => {
    tube(part, [
      [193, -199, 9], [173, -176, 9], [145, -143, 10], [119, -109, 8],
      [92, -79, 4], [63, -53, 0], [31, -30, -2], [1, -15, -1],
      [-28, -11, 0], [-55, -17, 1], [-76, -24, 0], [-93, -28, 0],
    ]);
    tube(part, [
      [214, -183, 9], [193, -157, 9], [164, -125, 10], [143, -95, 9],
      [119, -65, 8], [92, -38, 6], [66, -11, 3], [47, 10, 0],
      [38, 30, 0], [40, 49, 0], [52, 67, 0], [57, 73, 0],
    ]);
    // Balance pipe connects the two exhaust banks just before they branch.
    tube(part, [[31, -30, -2], [44, -23, -1], [56, -18, 1], [66, -11, 3]], 7, 5, 0.86);
    silencer(part, [-148, -37, 0], 0.15);
    silencer(part, [57, 128, 0], Math.PI / 2);
    tube(part, [[-203, -45, 0], [-217, -49, -4], [-228, -55, -15]], 12, 9.5, 1.02);
    tube(part, [[57, 184, 0], [57, 198, -4], [53, 212, -17]], 12, 9.5, 1.02);

    // Flanged slip joints, clamps and bolts make this a full detached assembly.
    for (const [x, y, roll] of [[118, -108, -0.7], [142, -95, -0.7], [63, -53, -0.92], [92, -38, -0.84]]) {
      part.group([x, y, 8], [0, 0, roll], () => {
        part.cylinder([0, 0, 0], 11.5, 10, [1, 0, 0], 8.6, 0.84);
        part.box([0, -12, 0], [11, 5, 13], 0.85);
        part.cylinder([0, -16, 0], 3, 7, [0, 1, 0], 0, 1.09);
      });
    }
    for (const [x, y] of [[145, -143], [119, -65]]) {
      part.cylinder([x, y - 14, 5], 2.6, 26, [0, 1, 0], 0, 0.94);
      part.cylinder([x + 8, y - 27, 5], 2.6, 16, [1, 0, 0], 0, 0.94);
    }
  });
  return part.finish("Exhaust system", count);
}
