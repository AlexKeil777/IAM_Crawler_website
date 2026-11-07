import { PartBuilder, type PartShape, type Vec3, type XY } from "../part-geometry";

export function buildControlArm(count: number): PartShape {
  const part = new PartBuilder(4321);
  // Pressed steel follows two swept arms. The open centre and differently
  // oriented inboard bushes are physical features rather than painted rings.
  const outline: XY[] = [
    [-165, -128], [-133, -151], [-91, -126], [157, -43],
    [190, -24], [197, 20], [160, 46], [-91, 127],
    [-133, 151], [-165, 128], [-137, 88], [109, 0], [-137, -88],
  ];
  part.extrude(outline, 24, [0, 0, 0], 0.84);
  for (const sign of [-1, 1]) {
    const rib: XY[] = [[-132, sign * 119], [-107, sign * 118], [143, sign * 25], [134, sign * 15], [-117, sign * 100]];
    part.extrude(rib, 9, [0, 0, -16], 1.08);
    // A transverse front bush and a vertical rear compliance bush.
    const axis: Vec3 = sign < 0 ? [0, 1, 0] : [0, 0, 1];
    part.cylinder([-145, sign * 119, 0], 29, 64, axis, 20, 0.9);
    part.cylinder([-145, sign * 119, 0], 20, 54, axis, 11, 0.4);
    part.cylinder([-145, sign * 119, 0], 12, 70, axis, 7, 1.1);
    for (const end of [-1, 1]) {
      const cap: Vec3 = [-145, sign * 119 + axis[1] * end * 34, axis[2] * end * 34];
      part.cylinder([-145, sign * 119 + axis[1] * end * 32, axis[2] * end * 32], 31, 4, axis, 20, 1);
      part.featureCircle(cap, 20, axis, 80, 1.05);
      part.featureCircle(cap, 31, axis, 100, 1.05);
    }
  }
  part.cylinder([163, 0, -1], 35, 45, [0, 0, 1], 0, 0.85);
  part.cylinder([163, 0, -27], 27, 10, [0, 0, 1], 0, 0.5);
  part.torus([163, 0, -32], 22, 4, [0, 0, 1], 0.55);
  part.cylinder([163, 0, -50], 11, 37, [0, 0, 1], 0, 1.12);
  part.cylinder([163, 0, -67], 15, 10, [0, 0, 1], 0, 1.05);
  part.featureCircle([163, 0, -32], 27, [0, 0, 1], 160);
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
