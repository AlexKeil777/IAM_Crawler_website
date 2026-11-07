import { PartBuilder, type PartShape, type Vec3, type XY } from "../part-geometry";

const TAU = Math.PI * 2;
const circle = (x: number, y: number, radius: number, sides = 40): XY[] =>
  Array.from({ length: sides }, (_, i) => {
    const angle = i * TAU / sides;
    return [x + radius * Math.cos(angle), y + radius * Math.sin(angle)];
  });

/** A bare, concave alloy rim: ten split spokes, five bolt bores and a deep barrel. */
export function buildAlloyWheel(count: number): PartShape {
  const part = new PartBuilder(94613);
  part.group([0, 0, 0], [0.05, 0.05, 0.14], () => {
    // The inner barrel is genuinely hollow, leaving large dark spaces behind
    // the spokes; its rolled rear bead gives the wheel a clear depth profile.
    part.weightedSurfaces(0.18, () => {
      part.cylinder([0, 0, 8], 201, 105, [0, 0, 1], 196, 0.56);
      part.cylinder([0, 0, 62], 205, 9, [0, 0, 1], 193, 0.69);
      part.torus([0, 0, 67], 201, 3.3, [0, 0, 1], 0.84);
    });
    part.cylinder([0, 0, -47], 208, 13, [0, 0, 1], 192, 1.06);
    part.torus([0, 0, -54], 204, 3.2, [0, 0, 1], 1.18);
    part.torus([0, 0, -51], 192, 2.3, [0, 0, 1], 1.1);
    part.featureCircle([0, 0, -56], 205, [0, 0, 1], 420, 1.17);
    part.featureCircle([0, 0, -53], 193, [0, 0, 1], 400, 1.1);

    const boltHoles = Array.from({ length: 5 }, (_, i) => {
      const angle = i * TAU / 5 - Math.PI / 2;
      return circle(37 * Math.cos(angle), 37 * Math.sin(angle), 9.7, 24);
    });
    part.extrude(circle(0, 0, 61, 64), 27, [0, 0, -21], 0.94, boltHoles);
    part.cylinder([0, 0, -36], 24, 5, [0, 0, 1], 0, 0.97);
    part.featureCircle([0, 0, -39], 24, [0, 0, 1], 160, 1.16);
    for (let i = 0; i < 5; i++) {
      const angle = i * TAU / 5 - Math.PI / 2;
      const x = 37 * Math.cos(angle), y = 37 * Math.sin(angle);
      part.cylinder([x, y, -28], 12.8, 15, [0, 0, 1], 9.7, 1.02);
      part.featureCircle([x, y, -36], 10, [0, 0, 1], 76, 1.14);
    }

    // Each spoke rises from the recessed hub to the rim lip. The two branches
    // share a root but separate physically after the first third of the span.
    const depthAt = (x: number) => -23 - (x - 55) * 0.215;
    const spoke = (outline: XY[]) => {
      const front = outline.map(([x, y]): Vec3 => [x, y, depthAt(x)]);
      // Triangulate these convex strips explicitly to retain their dished face.
      const a = front[0];
      for (let j = 1; j < front.length - 1; j++) {
        part.quad(a, front[j + 1], front[j], front[j], 1.02);
      }
      front.forEach((a, j) => {
        const b = front[(j + 1) % front.length];
        part.quad(a, [a[0], a[1], a[2] + 13], [b[0], b[1], b[2] + 13], b, 0.74);
      });
    };
    for (let i = 0; i < 10; i++) {
      part.group([0, 0, 0], [0, 0, i * TAU / 10], () => {
        spoke([[54, -10], [111, -9], [116, -1], [87, 10], [54, 10]]);
        spoke([[98, -9], [143, -20], [195, -28], [196, -18], [145, -9], [108, 2]]);
        spoke([[100, 1], [143, 10], [196, 18], [195, 28], [142, 20], [98, 10]]);
        // Narrow highlights reinforce the actual spoke shoulders rather than
        // replacing the sampled front and side faces with a line drawing.
        part.featureLine([61, -10, depthAt(61) - 0.4], [108, -9, depthAt(108) - 0.4], 36, 1.08);
        part.featureLine([111, -10, depthAt(111) - 0.4], [194, -27, depthAt(194) - 0.4], 65, 1.12);
        part.featureLine([110, 9, depthAt(110) - 0.4], [194, 27, depthAt(194) - 0.4], 65, 1.12);
      });
    }
    // Small valve stem, visible in one of the open spoke windows.
    part.group([111, 155, -43], [0, 0, -0.59], () => {
      part.cylinder([0, 0, 0], 3.6, 18, [0, 1, 0], 0, 0.9);
      part.cylinder([0, -9, 0], 4.3, 6, [0, 1, 0], 0, 1.03);
    });
  });
  return part.finish("Alloy wheel", count);
}
