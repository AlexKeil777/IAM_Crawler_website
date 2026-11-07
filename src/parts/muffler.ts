import { PartBuilder, type PartShape, type Vec3, type XY } from "../part-geometry";

const TAU = Math.PI * 2;
const subtract = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const length = (v: Vec3) => Math.hypot(...v);
const unit = (v: Vec3): Vec3 => {
  const size = length(v) || 1;
  return [v[0] / size, v[1] / size, v[2] / size];
};
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const scaled = (v: Vec3, scale: number): Vec3 => [v[0] * scale, v[1] * scale, v[2] * scale];

function ellipse(zRadius: number, yRadius: number, segments = 64): XY[] {
  return Array.from({ length: segments }, (_, i) => {
    const angle = (i / segments) * TAU;
    return [zRadius * Math.cos(angle), yRadius * Math.sin(angle)];
  });
}

/** Swept tubing retains an actual empty bore around a smooth exhaust bend. */
function exhaustTube(part: PartBuilder, path: Vec3[], outer: number, inner: number, tone: number) {
  const segments = 36;
  const frames = path.map((center, index) => {
    const tangent = unit(subtract(path[Math.min(path.length - 1, index + 1)], path[Math.max(0, index - 1)]));
    const first = unit(cross(tangent, [0, 1, 0]));
    const second = cross(tangent, first);
    const point = (angle: number, radius: number): Vec3 => [
      center[0] + radius * (first[0] * Math.cos(angle) + second[0] * Math.sin(angle)),
      center[1] + radius * (first[1] * Math.cos(angle) + second[1] * Math.sin(angle)),
      center[2] + radius * (first[2] * Math.cos(angle) + second[2] * Math.sin(angle)),
    ];
    return { center, tangent, point };
  });
  for (let section = 0; section < frames.length - 1; section++) {
    const a = frames[section], b = frames[section + 1];
    for (let i = 0; i < segments; i++) {
      const u = (i / segments) * TAU, v = ((i + 1) / segments) * TAU;
      part.quad(a.point(u, outer), a.point(v, outer), b.point(v, outer), b.point(u, outer), tone);
      part.quad(a.point(u, inner), b.point(u, inner), b.point(v, inner), a.point(v, inner), 0.47);
    }
    // Fine surface highlights follow the two front quadrants of the bent pipe.
    for (const angle of [0.2, TAU - 0.2]) {
      part.featureLine(a.point(angle, outer), b.point(angle, outer), 19, 1.1);
    }
  }
  const tip = frames[frames.length - 1];
  for (let i = 0; i < segments; i++) {
    const u = (i / segments) * TAU, v = ((i + 1) / segments) * TAU;
    part.quad(tip.point(u, outer), tip.point(v, outer), tip.point(v, inner), tip.point(u, inner), 1.18);
  }
  part.torus(tip.center, (outer + inner) / 2, (outer - inner) / 2, tip.tangent, 1.14);
  // featureCircle's normal faces the negative axis; this points out of the tip.
  const openingAxis = scaled(tip.tangent, -1);
  part.featureCircle(tip.center, inner, openingAxis, 120, 1.18);
  part.featureCircle(tip.center, outer, openingAxis, 120, 1.14);
}

/** A flattened oval silencer with stamped end caps, rolled joints and pipework. */
export function buildMuffler(count: number): PartShape {
  const part = new PartBuilder(52819);
  part.group([0, 0, 0], [0.07, 0.06, 0.1], () => {
    // The can has an oval cross section, straight middle and shallow pressed
    // shoulders. It is a sheet-metal shell rather than a rounded solid blob.
    const sections: Vec3[] = [
      [-137, 64, 43], [-132, 70, 48], [-123, 72, 50],
      [123, 72, 50], [132, 70, 48], [137, 64, 43],
    ];
    const shellPoint = ([x, yRadius, zRadius]: Vec3, angle: number): Vec3 => [
      x, yRadius * Math.cos(angle), zRadius * Math.sin(angle),
    ];
    for (let section = 0; section < sections.length - 1; section++) {
      for (let i = 0; i < 64; i++) {
        const a = (i / 64) * TAU, b = ((i + 1) / 64) * TAU;
        part.quad(
          shellPoint(sections[section], a), shellPoint(sections[section], b),
          shellPoint(sections[section + 1], b), shellPoint(sections[section + 1], a),
          section === 2 ? 0.94 : 1.04,
        );
      }
    }
    for (const side of [-1, 1]) {
      // The double-rolled crimp stands proud of the recessed end-cap face.
      part.group([side * 137, 0, 0], [0, Math.PI / 2, 0], () => {
        part.extrude(ellipse(43, 64), 2, [0, 0, 0], 0.88);
      });
      part.group([side * 132.5, 0, 0], [0, Math.PI / 2, 0], () => {
        part.extrude(ellipse(50.5, 72.5), 3.4, [0, 0, 0], 1.13, [ellipse(48, 70)]);
      });
      for (let i = 0; i < 64; i++) {
        const a = (i / 64) * TAU, b = ((i + 1) / 64) * TAU;
        part.featureLine(
          [side * 134.2, 72.5 * Math.cos(a), 50.5 * Math.sin(a)],
          [side * 134.2, 72.5 * Math.cos(b), 50.5 * Math.sin(b)],
          5, 1.1,
        );
      }
    }

    // Two shallow longitudinal strengthening beads in the broad visible face.
    for (const y of [-27, 27]) {
      part.cylinder([0, y, -47.2], 1.3, 190, [1, 0, 0], 0, 1.02);
      part.featureLine([-95, y, -48.5], [95, y, -48.5], 150, 1.08);
    }

    exhaustTube(part, [
      [-132, 18, -8], [-154, 18, -8], [-170, 18, -11],
      [-183, 18, -19], [-194, 18, -31], [-206, 18, -49],
    ], 17.5, 14.8, 0.96);
    exhaustTube(part, [
      [132, -20, 11], [154, -20, 11], [174, -24, 15],
      [191, -34, 20], [209, -40, 20],
    ], 16.5, 13.8, 0.85);

    // Welded steel hanger rods project above the can, with short bent hooks.
    for (const [x, z, direction] of [[-75, -26, 1], [81, -19, -1]]) {
      const hanger: Vec3[] = [
        [x, -61, z], [x, -93, z],
        [x + direction * 12, -108, z], [x + direction * 29, -108, z],
      ];
      part.box([x, -62, z + 3], [18, 13, 8], 0.79);
      for (let i = 0; i < hanger.length - 1; i++) {
        const a = hanger[i], b = hanger[i + 1];
        const delta = subtract(b, a);
        const center: Vec3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
        part.cylinder(center, 4, length(delta), unit(delta), 0, 0.91);
        part.featureLine([a[0], a[1], a[2] - 4], [b[0], b[1], b[2] - 4], 22, 1.02);
      }
      part.ellipsoid(hanger[1], [4, 4, 4], 0.91);
      part.ellipsoid(hanger[2], [4, 4, 4], 0.91);
    }
  });
  return part.finish("Muffler", count);
}
