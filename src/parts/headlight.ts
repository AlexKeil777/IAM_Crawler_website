import { PartBuilder, type PartShape, type Vec3, type XY } from "../part-geometry";

const circle = (x: number, y: number, radius: number): XY[] =>
  Array.from({ length: 32 }, (_, i) => [x + Math.cos(i * Math.PI / 16) * radius, y + Math.sin(i * Math.PI / 16) * radius]);

/** Long single-projector lamp with a squared inner end and curved outer tip. */
export function buildHeadlight(count: number): PartShape {
  const part = new PartBuilder(49157);
  const outline: XY[] = [
    [-211, 56], [-202, 29], [-199, -36], [-196, -61], [-183, -76],
    [-158, -80], [108, -80], [143, -75], [171, -63], [193, -44],
    [210, -21], [218, 1], [213, 24], [198, 43], [175, 57],
    [143, 67], [94, 73], [-176, 75], [-199, 70],
  ];
  const opening = outline.map(([x, y]): XY => [x * 0.947, y * 0.84]);
  const rear = outline.map(([x, y]): XY => [x * 0.93, y * 0.91]);

  // A mild local rotation shows the long face and the depth of the moulding.
  part.group([0, 0, 0], [0.31, 0.37, 0.29], () => {
    part.extrude(rear, 12, [0, 0, 51], 0.24);
    part.extrude(outline, 8, [0, 0, -22], 0.66, [opening]);
    outline.forEach(([x, y], i) => {
      const next = (i + 1) % outline.length;
      const [xx, yy] = outline[next];
      part.quad([x, y, -18], [xx, yy, -18],
        [rear[next][0], rear[next][1], 45], [rear[i][0], rear[i][1], 45], 0.4);
      part.featureLine([x, y, -26], [xx, yy, -26], Math.round(Math.hypot(xx - x, yy - y) * 0.65), 1.06);
    });

    // The continuous light guide runs straight across the top, around the
    // rounded outside end, and back along the lower edge of the optical face.
    const guide: Vec3[] = [
      [-164, -42, -30], [-72, -43, -30], [51, -43, -30], [133, -42, -30],
      [159, -34, -30], [181, -17, -30], [190, 1, -30], [184, 20, -30],
      [166, 37, -30], [141, 45, -30], [65, 52, -30], [-173, 53, -30],
    ];
    for (let i = 0; i < guide.length - 1; i++) {
      const a = guide[i], b = guide[i + 1];
      const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const nx = -(b[1] - a[1]) / length * 2.1;
      const ny = (b[0] - a[0]) / length * 2.1;
      part.quad([a[0] - nx, a[1] - ny, a[2]], [a[0] + nx, a[1] + ny, a[2]],
        [b[0] + nx, b[1] + ny, b[2]], [b[0] - nx, b[1] - ny, b[2]], 1.25);
      part.featureLine(a, b, Math.round(length * 1.45), 1.25);
    }

    // Separate narrow upper marker and lower-left indicator are recessed in
    // the black surround rather than additional circular projector elements.
    part.extrude([[-169, -67], [112, -67], [124, -60], [116, -52], [-170, -52]],
      7, [0, 0, -13], 0.57);
    part.featureLine([-169, -67, -17], [111, -67, -17], 200, 0.97);
    const indicator: XY[] = [[-167, -10], [-45, -10], [-27, 1], [-18, 12], [-35, 22], [-170, 22]];
    part.extrude(indicator, 11, [0, 0, -10], 0.82);
    indicator.forEach(([x, y], i) => {
      const b = indicator[(i + 1) % indicator.length];
      part.featureLine([x, y, -16], [b[0], b[1], -16], Math.round(Math.hypot(b[0] - x, b[1] - y) * 0.8), 1.03);
    });
    for (let x = -160; x < -32; x += 8) {
      part.featureLine([x, -7, -16.5], [x, 18, -16.5], 15, 0.92);
    }

    // One large lens near the rounded end, with its own deep projector barrel.
    part.group([89, 6, -1], [0, 0, 0], () => {
      part.cylinder([0, 0, 9], 45, 58, [0, 0, 1], 39, 0.42);
      part.cylinder([0, 0, -20], 46, 5, [0, 0, 1], 39, 0.9);
      part.torus([0, 0, -24], 42.5, 2.2, [0, 0, 1], 1.07);
      part.ellipsoid([0, 0, 4], [35, 35, 16], 0.44);
      part.featureCircle([0, 0, -24], 43, [0, 0, 1], 240, 1.12);
      part.featureCircle([0, 0, -17], 36, [0, 0, 1], 190, 0.92);
      // A small off-axis reflection gives the lens curvature without a halo.
      part.torus([-8, -8, -10], 13, 1.2, [0, 0, 1], 0.75, 0.2, 2.3);
    });
    part.extrude([[133, -17], [166, -12], [178, 2], [164, 16], [137, 20]],
      8, [0, 0, 3], 0.43);

    // A detached service part retains the mounting tabs above and below it.
    for (const x of [-107, 121]) {
      part.extrude([[-19, 8], [-17, -23], [10, -23], [22, -9], [20, 8]],
        8, [x, -82, 25], 0.68, [circle(0, -10, 5)]);
      part.featureCircle([x, -92, 20.5], 5, [0, 0, 1], 55, 1.02);
    }
    part.box([-113, 84, 19], [43, 17, 26], 0.46);
    part.box([114, 76, 24], [31, 17, 25], 0.46);
    part.box([-25, 28, 75], [75, 45, 35], 0.28);
  });
  return part.finish("Headlight", count);
}
