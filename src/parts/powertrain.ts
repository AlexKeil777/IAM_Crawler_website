import { PartBuilder, type PartShape, type Vec3, type XY } from "../part-geometry";

const circle = (x: number, y: number, radius: number, sides = 32): XY[] =>
  Array.from({ length: sides }, (_, index) => {
    const angle = (index / sides) * Math.PI * 2;
    return [x + Math.cos(angle) * radius, y + Math.sin(angle) * radius];
  });

/** An open casting: the cylinder liners continue down from two machined decks. */
export function buildEngine(count: number): PartShape {
  const part = new PartBuilder(25819);

  // Tip the decks towards the camera; the shared sculpture rotation then gives
  // a conventional three-quarter view of the block's front and both banks.
  part.group([0, 0, 0], [1.42, 0.5, 0.25], () => {
    part.extrude(
      [[-85, 32], [85, 32], [94, 101], [70, 125], [-70, 125], [-94, 101]],
      294,
      [0, 0, 0],
      0.73,
    );
    // The pan flange and sump give the lower casting its familiar stepped base.
    part.box([0, 125, 0], [157, 10, 306], 1.03);
    part.box([0, 145, 0], [136, 31, 280], 0.66);

    for (const side of [-1, 1]) {
      part.group([side * 62, -1, 0], [0, 0, side * 0.64], () => {
        // These walls support the deck but do not cover the hollow cylinders.
        part.box([-45, -8, 0], [12, 115, 294], 0.75);
        part.box([45, -8, 0], [12, 115, 294], 0.75);
        part.box([0, -8, -145], [96, 115, 12], 0.8);
        part.box([0, -8, 145], [96, 115, 12], 0.8);
        part.box([0, 45, 0], [96, 12, 294], 0.64);

        // Local XY becomes the deck's XZ plane, with thickness along the bore.
        const borePositions = [-108, -36, 36, 108];
        part.group([0, -72, 0], [Math.PI / 2, 0, 0], () => {
          part.extrude(
            [[-50, -151], [50, -151], [50, 151], [-50, 151]],
            13,
            [0, 0, 0],
            1.2,
            borePositions.map((z) => circle(0, z, 30.5)),
          );
        });
        for (const x of [-50, 50]) {
          part.featureLine([x, -78.5, -151], [x, -78.5, 151], 100, 1.1);
        }
        for (const z of [-151, 151]) {
          part.featureLine([-50, -78.5, z], [50, -78.5, z], 60, 1.1);
        }
        for (const z of borePositions) {
          part.cylinder([0, -28, z], 34, 100, [0, 1, 0], 30.5, 0.25);
          // A narrow bright lip defines each real opening against its dark bore.
          part.cylinder([0, -78, z], 34.5, 2, [0, 1, 0], 30.5, 1.25);
          part.torus([0, -79, z], 32.3, 1.4, [0, 1, 0], 1.25);
          part.featureCircle([0, -79, z], 30.5, [0, -1, 0], 150, 1.2);
        }
        for (const z of [-144, -72, 0, 72, 144]) {
          for (const x of [-40, 40]) {
            part.cylinder([x, -80, z], 5, 4, [0, 1, 0], 2.7, 0.86);
          }
        }
        // Short cast webs and core plugs break up the exterior of each bank.
        for (const z of [-108, -36, 36, 108]) {
          part.box([side * 52, -9, z], [7, 87, 8], 0.91);
          part.cylinder([side * 53, 7, z + 3], 14, 5, [1, 0, 0], 0, 0.7);
          part.cylinder([side * 56, 7, z + 3], 11, 2, [1, 0, 0], 0, 0.91);
        }
      });
    }

    // Recessed valley, end webs and bolt bosses remain visible between banks.
    part.box([0, 13, 0], [39, 12, 276], 0.53);
    for (const z of [-132, -44, 44, 132]) {
      part.box([0, -1, z], [32, 15, 12], 0.77);
      part.cylinder([0, -11, z], 6, 5, [0, 1, 0], 2.8, 1.1);
    }

    part.extrude(
      [[-67, 23], [-48, 0], [48, 0], [67, 23], [78, 92], [51, 117], [-51, 117], [-78, 92]],
      13,
      [0, 0, -157],
      0.95,
      [circle(0, 77, 24)],
    );
    part.cylinder([0, 77, -170], 34, 17, [0, 0, 1], 24, 0.98);
    part.cylinder([0, 77, -181], 27, 5, [0, 0, 1], 20, 1.18);
    part.featureCircle([0, 77, -183.5], 20, [0, 0, -1], 130, 1.15);
    part.featureCircle([0, 77, -183.5], 27, [0, 0, -1], 130, 1.15);
    for (const [x, y] of [[-51, 28], [51, 28], [-63, 82], [63, 82], [-39, 108], [39, 108]]) {
      part.cylinder([x, y, -167], 7, 6, [0, 0, 1], 2.5, 1.08);
    }

    // Mounting lugs and longitudinal ribs belong to the lower crankcase.
    for (const side of [-1, 1]) {
      for (const z of [-92, 75]) {
        part.box([side * 96, 90, z], [25, 25, 28], 0.8);
        part.cylinder([side * 104, 90, z - 17], 10, 8, [0, 0, 1], 4.5, 1.02);
      }
      part.box([side * 88, 94, 0], [8, 11, 273], 0.92);
    }
  });
  return part.finish("V8 engine block", count);
}

/** Machined piston, pin bores and an I-section connecting rod with an open big end. */
export function buildPiston(count: number): PartShape {
  const part = new PartBuilder(64093);
  part.group([0, 0, 0], [0.94, 0.4, 0.25], () => {
    const axis: Vec3 = [0, 1, 0];
    part.cylinder([0, -145, 0], 82, 14, axis, 0, 1.13);
    part.featureCircle([0, -152, 0], 82, [0, -1, 0], 240, 1.15);

    // Separate lands leave genuinely recessed, circumferential ring grooves.
    for (const y of [-130, -117, -104]) {
      part.cylinder([0, y, 0], 81, 9, axis, 73, 1.18);
      part.torus([0, y - 4, 0], 80, 1.5, axis, 1.15);
      part.featureCircle([0, y - 4.5, 0], 81, [0, -1, 0], 240, 1.15);
    }
    for (const y of [-123.5, -110.5, -97.5]) {
      part.cylinder([0, y, 0], 74.5, 4, axis, 73, 0.35);
    }

    // Sample the curved skirt with actual openings through both pin bosses.
    // Four-sided patches retain cylindrical normals rather than a front stencil.
    const segments = 64;
    const rows = 20;
    const top = -95;
    const bottom = 4;
    const pinY = -47;
    const wall = (radius: number, inward: boolean) => {
      for (let row = 0; row < rows; row++) {
        const y0 = top + ((bottom - top) * row) / rows;
        const y1 = top + ((bottom - top) * (row + 1)) / rows;
        for (let segment = 0; segment < segments; segment++) {
          const a0 = (segment / segments) * Math.PI * 2;
          const a1 = ((segment + 1) / segments) * Math.PI * 2;
          const mid = (a0 + a1) / 2;
          const midX = Math.cos(mid) * radius;
          const midZ = Math.sin(mid) * radius;
          if (Math.abs(midZ) > 55 && midX * midX + ((y0 + y1) / 2 - pinY) ** 2 < 27 ** 2) continue;
          const a: Vec3 = [Math.cos(a0) * radius, y0, Math.sin(a0) * radius];
          const b: Vec3 = [Math.cos(a0) * radius, y1, Math.sin(a0) * radius];
          const c: Vec3 = [Math.cos(a1) * radius, y1, Math.sin(a1) * radius];
          const d: Vec3 = [Math.cos(a1) * radius, y0, Math.sin(a1) * radius];
          if (inward) part.quad(d, c, b, a, 0.6);
          else part.quad(a, b, c, d, 0.95);
        }
      }
    };
    wall(80, false);
    wall(73, true);
    part.cylinder([0, 3, 0], 80, 3, axis, 73, 1.04);
    for (const z of [-67, 67]) {
      part.cylinder([0, pinY, z], 29, 29, [0, 0, 1], 22, 1.13);
      part.featureCircle([0, pinY, z + Math.sign(z) * 14.5], 22, [0, 0, Math.sign(z)], 140, 1.15);
    }

    // The rod's small end sits behind the wrist pin; the shaft emerges below.
    part.cylinder([0, pinY, 0], 26, 21, [0, 0, 1], 21, 0.8);
    const rod: XY[] = [
      [-14, -36], [14, -36], [11, 55], [17, 109], [29, 138],
      [24, 145], [17, 141], [10, 132], [-10, 132], [-17, 141],
      [-24, 145], [-29, 138], [-17, 109], [-11, 55],
    ];
    part.extrude(rod, 10, [0, 0, 0], 0.69);
    const flange: XY[] = [
      [-14, -34], [-10, -34], [-9, 52], [-15, 109], [-27, 139],
      [-31, 137], [-19, 105], [-13, 52],
    ];
    part.extrude(flange, 24, [0, 0, 0], 1.01);
    part.extrude(flange.map(([x, y]) => [-x, y] as XY).reverse(), 24, [0, 0, 0], 1.01);
    for (const side of [-1, 1]) {
      part.featureLine([side * 13, 4, -12], [side * 13, 52, -12], 60, 1.08);
      part.featureLine([side * 13, 52, -12], [side * 19, 105, -12], 65, 1.08);
      part.featureLine([side * 19, 105, -12], [side * 31, 137, -12], 55, 1.08);
    }

    part.cylinder([0, 171, 0], 42, 25, [0, 0, 1], 27, 0.91);
    part.cylinder([0, 171, 0], 29, 26, [0, 0, 1], 27, 0.62);
    part.featureCircle([0, 171, -13], 27, [0, 0, -1], 140, 1.15);
    part.featureCircle([0, 171, -12.5], 42, [0, 0, -1], 140, 1.15);
    for (const z of [-13, 13]) {
      part.torus([0, 171, z], 35.5, 1.5, [0, 0, 1], 1.17);
    }
    // The two cap bolts flank the bearing, leaving its opening unobstructed.
    for (const x of [-36, 36]) {
      part.cylinder([x, 185, 0], 6, 28, axis, 0, 0.88);
      part.group([x, 200, 0], [Math.PI / 2, 0, 0], () => {
        part.extrude(circle(0, 0, 8.5, 6), 6, [0, 0, 0], 1.1);
      });
    }
  });
  return part.finish("Piston", count);
}
