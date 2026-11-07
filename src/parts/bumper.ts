import { PartBuilder, type PartShape, type Vec3, type XY } from "../part-geometry";

/** A detached front fascia: the painted skin wraps back around real openings. */
export function buildBumper(count: number): PartShape {
  const part = new PartBuilder(39461);
  // A shallow three-quarter presentation keeps both side apertures readable;
  // the shared camera still exposes the thickness and rearward corner returns.
  part.group([0, 0, 0], [0.15, 0.38, 0.23], () => {
    // The nose is convex across its width; its ends return towards the wheel
    // arches. The slight vertical crown keeps the broad upper skin rounded.
    const front = (x: number, y: number) =>
      -30 + 108 * (Math.abs(x) / 220) ** 3.6 + 6 * ((y - 4) / 65) ** 2;
    const point = (x: number, y: number, inset = 0): Vec3 => [x, y, front(x, y) + inset];
    const top = (x: number) => -64 + 8 * (Math.abs(x) / 220) ** 3;
    const bottom = (x: number) => 67 - 12 * (Math.abs(x) / 220) ** 3;
    const xs = Array.from({ length: 25 }, (_, i) => -220 + i * (440 / 24));

    // All polygons passed here are convex. Their front/back skins and perimeter
    // walls form an actual moulding, without a hidden panel across the intakes.
    const skin = (vertices: XY[], depth = 6, tone = 0.92, inset = 0) => {
      const area = vertices.reduce((sum, a, i) => {
        const b = vertices[(i + 1) % vertices.length];
        return sum + a[0] * b[1] - b[0] * a[1];
      }, 0);
      const loop = area > 0 ? vertices : [...vertices].reverse();
      for (let i = 1; i < loop.length - 1; i++) {
        const a = point(...loop[0], inset), b = point(...loop[i], inset), c = point(...loop[i + 1], inset);
        part.quad(a, c, b, b, tone);
        const aa = point(...loop[0], inset + depth), bb = point(...loop[i], inset + depth), cc = point(...loop[i + 1], inset + depth);
        part.quad(aa, bb, cc, cc, tone * 0.8);
      }
      loop.forEach((a, i) => {
        const b = loop[(i + 1) % loop.length];
        part.quad(point(...a, inset), point(...b, inset), point(...b, inset + depth), point(...a, inset + depth), tone * 0.85);
      });
    };
    const seam = (vertices: XY[], samples: number, inset = -0.5, closed = false, tone = 1.1) => {
      const loop = closed ? [...vertices, vertices[0]] : vertices;
      const lengths = loop.slice(1).map((b, i) => Math.hypot(b[0] - loop[i][0], b[1] - loop[i][1]));
      const total = lengths.reduce((sum, length) => sum + length, 0);
      loop.slice(1).forEach((b, i) => part.featureLine(
        point(...loop[i], inset), point(...b, inset), Math.max(2, Math.round(samples * lengths[i] / total)), tone,
      ));
    };
    const reflect = (vertices: XY[], side: number): XY[] =>
      vertices.map(([x, y]): XY => [x * side, y]);

    // Subdivided bands follow the curved nose instead of spanning it with one
    // flat face. The upper band carries the number-plate mounting pad.
    for (let i = 0; i < xs.length - 1; i++) {
      const a = xs[i], b = xs[i + 1];
      skin([[a, top(a)], [b, top(b)], [b, -22], [a, -22]], 7, 0.96);
      skin([[a, 44], [b, 44], [b, bottom(b)], [a, bottom(a)]], 8, 0.88);
      // A separate lower splitter projects forwards from the painted skin.
      skin([[a, bottom(a) - 2], [b, bottom(b) - 2], [b, bottom(b) + 5], [a, bottom(a) + 5]], 17, 0.64, -9);
    }

    const grille: XY[] = [[-111, -22], [111, -22], [98, 44], [-98, 44]];
    const intake: XY[] = [[136, -22], [187, -22], [198, -10], [193, 35], [182, 44], [128, 44]];
    const openingWall = (vertices: XY[], depth: number) => {
      vertices.forEach((a, i) => {
        const b = vertices[(i + 1) % vertices.length];
        // Normals point into the aperture so its recessed reveal remains visible.
        part.quad(point(...b), point(...a), point(...a, depth), point(...b, depth), 0.65);
      });
    };
    openingWall(grille, 25);
    seam(grille, 320, -0.7, true, 1.15);

    for (const side of [-1, 1]) {
      // The diagonal bridge separates the main grille from a deep side intake.
      skin(reflect([[111, -22], [136, -22], [128, 44], [98, 44]], side), 12, 1.02);
      skin(reflect([[187, -22], [220, -22], [220, -10], [198, -10]], side), 7, 0.93);
      skin(reflect([[198, -10], [220, -10], [220, 35], [193, 35]], side), 8, 0.92);
      skin(reflect([[193, 35], [220, 35], [220, 44], [182, 44]], side), 8, 0.89);
      const hole = reflect(intake, side);
      // Reflection reverses the winding; preserve inward-facing reveal normals.
      openingWall(side < 0 ? hole.reverse() : hole, 21);
      seam(hole, 145, -0.7, true, 1.08);

      // Hollow wheel-arch returns continue behind the fascia's curved corners.
      const x = side * 220;
      const upper = point(x, top(x)), lower = point(x, bottom(x));
      const rearUpper: Vec3 = [side * 205, -44, 133];
      const rearLower: Vec3 = [side * 205, 44, 133];
      const outer = side > 0 ? [upper, rearUpper, rearLower, lower] : [upper, lower, rearLower, rearUpper];
      part.quad(outer[0], outer[1], outer[2], outer[3], 0.86);
      part.quad([rearUpper[0] - side * 5, rearUpper[1], rearUpper[2]],
        [rearLower[0] - side * 5, rearLower[1], rearLower[2]],
        [lower[0] - side * 5, lower[1], lower[2]],
        [upper[0] - side * 5, upper[1], upper[2]], 0.67);
      part.featureLine(upper, rearUpper, 42, 1.03);
      part.featureLine(lower, rearLower, 42, 0.98);
      part.featureLine(rearUpper, rearLower, 45, 0.96);
      part.box([side * 202, -35, 123], [15, 12, 8], 0.72);

      // A small round fog-lamp bezel is set inside each intake, following the
      // local tangent of the curved skin. Empty space remains around its body.
      const lampX = side * 163;
      const slope = side * 108 * 3.6 / 220 * (163 / 220) ** 2.6;
      part.group([lampX, 11, front(lampX, 11) + 8], [0, -Math.atan(slope), 0], () => {
        part.cylinder([0, 0, 0], 17, 13, [0, 0, 1], 13, 0.95);
        part.torus([0, 0, -6], 15.5, 1.5, [0, 0, 1], 1.08);
        part.cylinder([0, 0, 3], 12.5, 2, [0, 0, 1], 0, 0.49);
        part.featureCircle([0, 0, -7], 16, [0, 0, 1], 95, 1.15);
        part.featureCircle([0, 0, 1.5], 11.8, [0, 0, 1], 65, 0.91);
      });
      // The side grille's thin vanes sit behind, rather than filling, its mouth.
      for (const y of [-10, 11, 32]) {
        const left = side * 139, right = side * 188;
        skin([[left, y - 1], [right, y - 1], [right, y + 1], [left, y + 1]], 5, 0.47, 22);
      }
    }

    // Recessed horizontal louvres and sparse vertical supports leave the central
    // grille open. Their depth is clear against the thick aperture surround.
    for (const y of [-10, 7, 24, 39]) {
      const half = 108 - (y + 22) * 13 / 66;
      const row = Array.from({ length: 11 }, (_, i) => -half + i * (half * 2 / 10));
      for (let i = 0; i < row.length - 1; i++) {
        const a = row[i], b = row[i + 1];
        skin([[a, y - 1.2], [b, y - 1.2], [b, y + 1.2], [a, y + 1.2]], 6, 0.6, 19);
      }
      seam(row.map((x): XY => [x, y - 1.2]), 58, 18.5, false, 0.93);
    }
    for (const x of [-72, -36, 0, 36, 72]) {
      skin([[x - 1.4, -20], [x + 1.4, -20], [x + 1.4, 43], [x - 1.4, 43]], 7, 0.51, 26);
    }

    const mount: XY[] = [[-43, -51], [43, -51], [43, -29], [-43, -29]];
    skin(mount, 8, 0.55, -4);
    seam(mount, 100, -4.5, true, 0.88);
    for (const x of [-31, 31]) part.cylinder(point(x, -40, -5), 1.8, 2, [0, 0, 1], 0, 0.92);
    for (const x of [-181, -123, 123, 181]) {
      part.box(point(x, top(x) - 3, 7), [13, 8, 12], 0.76);
    }
    seam(xs.map((x): XY => [x, top(x)]), 240, -0.5, false, 1.08);
    seam(xs.map((x): XY => [x, bottom(x) + 5]), 240, -9.6, false, 1.14);
    seam(xs.map((x): XY => [x, -22]), 140, -0.6, false, 1.04);
  });
  return part.finish("Front bumper", count);
}
