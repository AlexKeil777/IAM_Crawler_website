import { PartBuilder, type PartShape, type Vec3, type XY } from "../part-geometry";

/** A detached swept headlamp, with open reflector bowls behind its front bezel. */
export function buildHeadlight(count: number): PartShape {
  const part = new PartBuilder(49157);
  const outline: XY[] = [
    [-214, -48], [-195, -82], [-117, -96], [27, -88],
    [197, -125], [217, -105], [191, -28], [151, 41],
    [94, 66], [-136, 69], [-190, 48], [-212, 14],
  ];
  const opening = outline.map(([x, y]): XY => [x * 0.945, y * 0.875]);
  const rear = outline.map(([x, y]): XY => [x * 0.925, y * 0.9]);

  // Keep the broad optical face readable while revealing the housing's depth.
  part.group([0, 0, 0], [0.28, 0.32, 0.28], () => {
    part.extrude(rear, 16, [0, 0, 67], 0.34);
    part.extrude(outline, 9, [0, 0, -21], 0.73, [opening]);
    outline.forEach(([x, y], index) => {
      const next = (index + 1) % outline.length;
      // The lens flange and rear moulding enclose a deep, empty optical cavity.
      part.quad(
        [x, y, -16.5],
        [outline[next][0], outline[next][1], -16.5],
        [rear[next][0], rear[next][1], 59],
        [rear[index][0], rear[index][1], 59],
        0.46,
      );
      const edgeLength = Math.hypot(outline[next][0] - x, outline[next][1] - y);
      part.featureLine([x, y, -25.5], [outline[next][0], outline[next][1], -25.5],
        Math.round(edgeLength * 0.53), 1.04);
    });

    const projector = (center: Vec3, radius: number, lensRadius: number, samples: number) => {
      part.group(center, [0, 0, 0], () => {
        // A deep black barrel supports the bright, concave reflector surface.
        part.cylinder([0, 0, 4], radius + 4, 63, [0, 0, 1], radius, 0.39);
        part.torus([0, 0, -28], radius + 1.2, 2.8, [0, 0, 1], 1.08);

        const inner = lensRadius + 1;
        const steps = 5;
        const segments = 48;
        const bowlPoint = (angle: number, r: number): Vec3 => [
          Math.cos(angle) * r,
          Math.sin(angle) * r,
          17 - 44 * ((r * r - inner * inner) / (radius * radius - inner * inner)),
        ];
        for (let ring = 0; ring < steps; ring++) {
          const r0 = inner + (radius - inner) * ring / steps;
          const r1 = inner + (radius - inner) * (ring + 1) / steps;
          for (let segment = 0; segment < segments; segment++) {
            const a0 = segment * Math.PI * 2 / segments;
            const a1 = (segment + 1) * Math.PI * 2 / segments;
            part.quad(bowlPoint(a0, r0), bowlPoint(a1, r0),
              bowlPoint(a1, r1), bowlPoint(a0, r1), 1.08);
          }
        }

        // The curved projector lens is recessed within a separate metal collar.
        part.ellipsoid([0, 0, 3], [lensRadius, lensRadius, 15], 0.86);
        part.cylinder([0, 0, -8], lensRadius + 4, 8, [0, 0, 1], lensRadius - 1, 1.03);
        part.featureCircle([0, 0, -28], radius + 1.2, [0, 0, 1], samples, 1.15);
        part.featureCircle([0, 0, -12], lensRadius - 1, [0, 0, 1], samples - 40, 1.1);
        // An adjustment boss remains behind the bowl instead of obscuring it.
        part.cylinder([0, 0, 47], lensRadius + 4, 28, [0, 0, 1], 0, 0.37);
      });
    };
    projector([-110, -5, 0], 53, 28, 220);
    projector([24, -2, 3], 43, 24, 200);

    // A solid LED lightguide follows the brow and sweeps up into the wing tip.
    const brow: Vec3[] = [
      [-194, -54, -32], [-164, -72, -35], [-60, -71, -36],
      [34, -62, -35], [188, -108, -27],
    ];
    for (let index = 0; index < brow.length - 1; index++) {
      const a = brow[index], b = brow[index + 1];
      const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const nx = -(b[1] - a[1]) / length * 2.8;
      const ny = (b[0] - a[0]) / length * 2.8;
      part.quad([a[0] - nx, a[1] - ny, a[2]], [a[0] + nx, a[1] + ny, a[2]],
        [b[0] + nx, b[1] + ny, b[2]], [b[0] - nx, b[1] - ny, b[2]], 1.15);
      part.quad([a[0] - nx, a[1] - ny, a[2]], [b[0] - nx, b[1] - ny, b[2]],
        [b[0] - nx, b[1] - ny, b[2] + 6], [a[0] - nx, a[1] - ny, a[2] + 6], 0.93);
      part.featureLine(a, b, Math.round(length * 0.91), 1.2);
    }

    // A separate segmented reflector occupies the tapered indicator chamber.
    part.extrude([[100, -23], [176, -62], [157, -6], [126, 31], [96, 34]],
      12, [0, 0, -1], 0.64);
    for (let i = 0; i < 5; i++) {
      const x = 108 + i * 10;
      const y = -18 - i * 5;
      part.featureLine([x, y, -8], [x - 3, y + 41, -8], 24, 0.95);
    }

    // Slotted top ears and one lower bracket identify the detached assembly.
    for (const [x, y, roll] of [[-156, -109, -0.06], [119, -125, -0.19]]) {
      part.group([x, y, 24], [0, 0, roll], () => {
        const hole: XY[] = Array.from({ length: 24 }, (_, i) => {
          const a = i * Math.PI * 2 / 24;
          return [Math.cos(a) * 6, Math.sin(a) * 6 - 3];
        });
        part.extrude([[-17, 15], [-15, -15], [13, -17], [18, 13]],
          8, [0, 0, 0], 0.66, [hole]);
        part.featureCircle([0, -3, -4], 6, [0, 0, 1], 60, 1.0);
      });
    }
    part.box([-87, 78, 36], [33, 23, 13], 0.51);
    part.box([46, 15, 89], [44, 36, 29], 0.36);
  });
  return part.finish("Headlight", count);
}
