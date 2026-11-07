import { PartBuilder, type PartShape, type Vec3, type XY } from "../part-geometry";

export function buildControlArm(count: number): PartShape {
  const part = new PartBuilder(43217);
  // A wide aluminium casting, rather than two generic rods: the thin web
  // closes the bottoms of the deep triangular pockets between cast ribs.
  const outline: XY[] = [
    [-131, -140], [-115, -153], [-94, -151], [-78, -111],
    [-60, -49], [-35, -24], [15, 1], [91, 28], [166, 39],
    [182, 52], [177, 72], [152, 82], [109, 82], [34, 67],
    [-45, 64], [-132, 80], [-155, 112], [-186, 110],
    [-201, 90], [-194, 64], [-174, 43], [-123, 4],
    [-95, -32], [-110, -86],
  ];
  const pockets: XY[][] = [
    [[-113, -114], [-99, -122], [-77, -51], [-89, -47]],
    [[-83, -25], [-51, -11], [-60, 40], [-126, 51]],
    [[-40, -4], [55, 29], [39, 47], [-46, 41]],
    [[65, 33], [132, 44], [153, 53], [129, 62], [55, 48]],
    [[-139, 29], [-119, 33], [-141, 58], [-174, 71]],
  ];
  part.group([0, 0, 0], [0.08, -0.06, 0.17], () => {
    part.extrude(outline, 7, [0, 0, 7], 0.46);
    part.extrude(outline, 26, [0, 0, -9], 0.96, pockets);
    // Fine seams catch the machined upper edges while the recessed floor
    // remains a broad, shaded surface below each pocket.
    for (const pocket of pockets) {
      pocket.forEach(([x, y], i) => {
        const [xx, yy] = pocket[(i + 1) % pocket.length];
        part.featureLine([x, y, -22], [xx, yy, -22], 45, 1.14);
      });
    }
    // The heavy lower flange bends from the inner bush toward the long arm.
    part.extrude([
      [-185, 72], [-146, 60], [-58, 45], [38, 48],
      [111, 65], [167, 56], [172, 69], [113, 81],
      [33, 64], [-45, 62], [-132, 79], [-170, 97],
    ], 16, [0, 0, -13], 1.04);
    // Small circular casting bosses occur where the three webs meet.
    for (const [x, y] of [[-92, -33], [-52, -17], [-57, 48], [-133, 58], [46, 50], [133, 65]]) {
      part.cylinder([x, y, -24], 5.5, 4, [0, 0, 1], 0, 1.1);
    }

    // Both inboard mounts retain a metal sleeve, dark rubber and an actual
    // empty bolt bore. Their differing axes are part of the reference casting.
    part.group([-174, 105, 1], [0.3, -0.1, -0.18], () => {
      part.cylinder([0, 0, 0], 28, 65, [0, 1, 0], 23, 0.96);
      part.cylinder([0, 0, 0], 23, 69, [0, 1, 0], 9, 0.3);
      part.cylinder([0, 0, 0], 11, 73, [0, 1, 0], 6, 1.05);
      part.featureCircle([0, 35, 0], 23, [0, 1, 0], 110, 0.65);
      part.featureCircle([0, 33, 0], 28, [0, 1, 0], 140, 1.13);
    });
    part.group([176, 56, 0], [0.02, -0.22, 0.04], () => {
      part.cylinder([0, 0, 0], 28, 51, [1, 0, 0], 22, 0.96);
      part.cylinder([0, 0, 0], 22, 58, [1, 0, 0], 9, 0.29);
      part.cylinder([0, 0, 0], 10.5, 63, [1, 0, 0], 6, 1.05);
      // Separate pressed mounting ears form the flange beyond the bush.
      const flange: XY[] = [
        [-18, -33], [-12, -59], [3, -67], [13, -61], [11, -32],
        [26, -15], [29, 14], [13, 35], [11, 57], [-2, 63],
        [-15, 57], [-18, 29], [-29, 10], [-27, -12],
      ];
      part.group([24, 0, 0], [0, Math.PI / 2, 0], () => {
        const holes = [-53, 51].map((y) => Array.from({ length: 24 }, (_, i): XY => {
          const angle = i * Math.PI * 2 / 24;
          return [-1 + 6 * Math.cos(angle), y + 6 * Math.sin(angle)];
        }));
        part.extrude(flange, 9, [0, 0, 0], 1.02, holes);
      });
    });

    // A stacked rubber boot and threaded ball-joint stud top the short stem.
    part.cylinder([-112, -146, -5], 21, 26, [0, 1, 0], 0, 0.79);
    for (const [y, radius] of [[-165, 20], [-172, 18], [-179, 15]]) {
      part.torus([-112, y, -5], radius, 3, [0, 1, 0], 0.38);
    }
    part.cylinder([-112, -191, -5], 8, 37, [0, 1, 0], 0, 1.1);
    for (let y = -207; y < -189; y += 3) {
      part.torus([-112, y, -5], 8, 0.65, [0, 1, 0], 0.98);
    }
  });
  return part.finish("Control arm", count);
}

export function buildBrakePads(count: number): PartShape {
  const part = new PartBuilder(7351);
  const plate: XY[] = [
    [-137, -29], [-119, -52], [-72, -68], [0, -75], [72, -68],
    [119, -52], [137, -29], [133, 32], [117, 49], [-117, 49], [-133, 32],
  ];
  const frictionHalf: XY[] = [
    [-4, -63], [-65, -57], [-103, -43], [-119, -24],
    [-112, 28], [-98, 38], [-4, 38],
  ];
  for (const [y, z, roll] of [[-91, 19, -0.08], [90, -9, 0.1]]) {
    part.group([0, y, z], [0.08, -0.12, roll], () => {
      part.extrude(plate, 9, [0, 0, 6], 0.53);
      // The wear slot separates the friction blocks down to their backing.
      for (const sign of [-1, 1]) {
        const block: XY[] = sign === -1 ? frictionHalf
          : frictionHalf.map(([x, y]): XY => [-x, y]).reverse();
        part.extrude(block, 22, [0, 0, -9], 0.68);
        const bevel = block.map(([x, y]): XY => [x * 0.96 + sign * 1.8, y * 0.96]);
        part.extrude(bevel, 1, [0, 0, -27], 0.82);
        part.featureLine([sign * 5.5, -60, -28], [sign * 5.5, 36, -28], 95, 0.85);
        block.forEach(([x, y], i) => {
          const j = (i + 1) % block.length;
          part.quad([x, y, -20], [block[j][0], block[j][1], -20],
            [bevel[j][0], bevel[j][1], -26.5], [bevel[i][0], bevel[i][1], -26.5], 1.05);
        });
        part.extrude([[sign * 137, -19], [sign * 153, -19], [sign * 153, 8], [sign * 135, 8]], 8, [0, 0, 6], 1.08);
        part.cylinder([sign * 143, -5, -1], 4, 9, [0, 0, 1], 0, 0.5);
      }
      part.extrude([[-110, -47], [-55, -64], [55, -64], [110, -47], [118, 32], [-118, 32]], 3, [0, 0, 13], 0.52);
      part.box([0, 44, 3], [36, 5, 14], 1.05);
    });
  }
  return part.finish("Brake pads", count);
}
