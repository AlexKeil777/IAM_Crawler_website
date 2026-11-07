import { PartBuilder, type PartShape, type Vec3, type XY } from "../part-geometry";

const TAU = Math.PI * 2;

function roundedRectangle(width: number, height: number, radius: number): XY[] {
  const vertices: XY[] = [];
  for (let corner = 0; corner < 4; corner++) {
    const angle = -Math.PI / 2 + corner * Math.PI / 2;
    const x = (corner === 0 || corner === 1 ? 1 : -1) * (width / 2 - radius);
    const y = (corner === 0 || corner === 3 ? -1 : 1) * (height / 2 - radius);
    for (let step = 0; step <= 8; step++) {
      const theta = angle + step * Math.PI / 16;
      vertices.push([x + radius * Math.cos(theta), y + radius * Math.sin(theta)]);
    }
  }
  return vertices;
}

function outline(part: PartBuilder, vertices: XY[], z: number, spacing = 2.5, tone = 1.1) {
  vertices.forEach((a, index) => {
    const b = vertices[(index + 1) % vertices.length];
    part.featureLine([a[0], a[1], z], [b[0], b[1], z],
      Math.max(3, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / spacing)), tone);
  });
}

/** Flat-bottom performance wheel: shaped grips, broad airbag pad and open spokes. */
export function buildSteeringWheel(count: number): PartShape {
  const part = new PartBuilder(19031);
  // Leave a small three-quarter angle while showing the flat lower rim clearly.
  part.group([0, 0, 0], [0.24, 0.22, 0.26], () => {
    const rimCenter = (angle: number): XY => [178 * Math.cos(angle), Math.min(158, 180 * Math.sin(angle))];
    const rimPoint = (angle: number, section: number): Vec3 => {
      const center = rimCenter(angle);
      const before = rimCenter(angle - 0.001), after = rimCenter(angle + 0.001);
      const dx = after[0] - before[0], dy = after[1] - before[1];
      const length = Math.hypot(dx, dy);
      // Thick leather sides taper into slimmer carbon sections at top/bottom.
      const width = 21 + 10 * Math.abs(Math.cos(angle)) ** 4;
      return [center[0] + dy / length * width * Math.cos(section),
        center[1] - dx / length * width * Math.cos(section), 7 + 24 * Math.sin(section)];
    };
    const segments = 128, sections = 16;
    for (let i = 0; i < segments; i++) {
      const a = i * TAU / segments, b = (i + 1) * TAU / segments;
      const tone = Math.abs(Math.cos(a)) > 0.76 ? 1.0 : 0.67;
      for (let j = 0; j < sections; j++) {
        const u = j * TAU / sections, v = (j + 1) * TAU / sections;
        part.quad(rimPoint(a, u), rimPoint(b, u), rimPoint(b, v), rimPoint(a, v), tone);
      }
      // A stitched leather seam follows the actual flattened, sculpted rim.
      part.featureLine(rimPoint(a, -1.02), rimPoint(b, -1.02), 4, 1.08);
      if (i % 2 === 0 && Math.abs(Math.cos(a)) > 0.6) {
        part.featureLine(rimPoint(a, -1.66), rimPoint(a + 0.018, -1.66), 3, 1.14);
      }
    }

    for (const side of [-1, 1]) {
      // The inboard thumb scallops make the grips less like a circular torus.
      part.ellipsoid([side * 151, -58, -2], [25, 36, 21], 1.02);
      const spoke: XY[] = [
        [side * 167, -38], [side * 143, -24], [side * 78, -30],
        [side * 73, 43], [side * 137, 58], [side * 159, 36],
      ];
      part.extrude(spoke, 18, [0, 0, -1], 0.57);
      outline(part, spoke, -10, 3.1, 1.03);
      const switchPanel: XY[] = [
        [side * 92, -17], [side * 137, -11], [side * 153, 13],
        [side * 137, 39], [side * 89, 31],
      ];
      part.extrude(switchPanel, 5, [0, 0, -14], 0.4);
      for (const [x, y] of [[112, 6], [139, 13]]) {
        part.cylinder([side * x, y, -19], 7, 5, [0, 0, 1], 3.5, 1.02);
        part.featureCircle([side * x, y, -21.5], 3.5, [0, 0, 1], 32, 1.1);
      }
      // Small lower grip accents border the two open areas either side of the spoke.
      part.extrude([[side * 93, 49], [side * 139, 57], [side * 148, 70], [side * 88, 63]],
        6, [0, 0, -15], 1.03);
    }

    const lowerSpoke: XY[] = [[-54, 71], [54, 71], [41, 143], [30, 163], [-30, 163], [-41, 143]];
    const slot: XY[] = [[-25, 100], [25, 100], [19, 142], [12, 148], [-12, 148], [-19, 142]];
    part.extrude(lowerSpoke, 19, [0, 0, 0], 0.72, [slot]);
    outline(part, lowerSpoke, -9.5, 2.2, 1.07);
    outline(part, slot, -9.5, 2.0, 1.1);

    // A broad, padded squircle echoes the photographed airbag assembly. Its
    // front bezel is a separate thin ring, leaving the center face visible.
    const pad = roundedRectangle(166, 163, 39).map(([x, y]): XY => [x, y + 19]);
    const face = roundedRectangle(154, 151, 35).map(([x, y]): XY => [x, y + 18]);
    part.extrude(pad, 28, [0, 0, -25], 0.97);
    for (let i = 0; i < pad.length; i++) {
      const j = (i + 1) % pad.length;
      part.quad([pad[i][0], pad[i][1], -39], [pad[j][0], pad[j][1], -39],
        [face[j][0], face[j][1], -48], [face[i][0], face[i][1], -48], 1.06);
    }
    part.extrude(face, 3, [0, 0, -49], 1.02);
    outline(part, face, -50.5, 2.5, 1.14);
    const bezel = roundedRectangle(126, 116, 31).map(([x, y]): XY => [x, y + 12]);
    const inset = roundedRectangle(114, 104, 27).map(([x, y]): XY => [x, y + 12]);
    part.extrude(bezel, 4, [0, 0, -52], 0.56, [inset]);
    outline(part, inset, -54, 2.5, 1.05);
    part.cylinder([0, 19, 46], 31, 48, [0, 0, 1], 12, 0.5);
  });
  return part.finish("Steering wheel", count);
}

/** A sculpted fixed caliper, with two banks and an empty channel for the disc. */
export function buildCaliper(count: number): PartShape {
  const part = new PartBuilder(31607);
  part.group([0, 0, 0], [0.45, 0.03, 0.16], () => {
    const casting: XY[] = [
      [-176, 0], [-158, -30], [-126, -55], [-86, -72], [-35, -78],
      [47, -77], [95, -68], [133, -49], [160, -23], [177, 7],
      [166, 24], [135, 23], [108, 36], [62, 39], [-67, 39],
      [-109, 33], [-137, 22], [-166, 20],
    ];
    const face = casting.map(([x, y]): XY => [x * 0.94, y * 0.84 - 5]);
    part.extrude(casting, 35, [0, 0, -20], 0.89);
    part.extrude(casting, 31, [0, 0, 69], 0.71);
    // The chamfered shoulder rolls from the top and ends into a broad front
    // casting, rather than leaving a rectangular bracket silhouette.
    for (let i = 0; i < casting.length; i++) {
      const j = (i + 1) % casting.length;
      part.quad([casting[j][0], casting[j][1], -37.5], [casting[i][0], casting[i][1], -37.5],
        [face[i][0], face[i][1], -55], [face[j][0], face[j][1], -55], 1.07);
    }
    part.extrude(face, 3, [0, 0, -55], 0.96);
    outline(part, face, -56.5, 2.8, 1.12);

    // Arched shoulder rib and a lower casting seam give the front its familiar
    // long, curved performance-caliper profile without an applied brand mark.
    const shoulder: Vec3[] = [[-142, -30, -56.8], [-114, -48, -57], [-74, -58, -57],
      [0, -61, -57], [73, -55, -57], [117, -38, -56.8], [142, -16, -55.8]];
    for (let i = 0; i < shoulder.length - 1; i++) {
      part.featureLine(shoulder[i], shoulder[i + 1], 38, 1.12);
    }
    part.featureLine([-101, 21, -57], [98, 21, -57], 125, 1.04);

    // Separate bridges span the rotor slot only at its ends, leaving the long
    // central channel open all the way through the lower side of the casting.
    for (const x of [-125, 125]) {
      part.extrude(roundedRectangle(35, 66, 10), 96, [x, -12, 24], 0.85);
      part.cylinder([x, -21, -59], 7.5, 7, [0, 0, 1], 3, 1.13);
      part.featureCircle([x, -21, -62.5], 3, [0, 0, 1], 40, 1.16);
    }
    // Three different-size piston cups sit inside the opposing bank. Their
    // circular lips remain visible from the open edge and in three-quarter view.
    for (const [x, radius] of [[-86, 32], [0, 35], [86, 30]]) {
      part.cylinder([x, 10, 55], radius, 35, [0, 0, 1], radius - 6, 0.64);
      part.cylinder([x, 10, 35], radius + 1, 5, [0, 0, 1], radius - 5, 1.13);
      part.featureCircle([x, 10, 32.5], radius - 5, [0, 0, 1], 100, 1.16);
      part.ellipsoid([x, 26, 79], [radius + 3, 30, 13], 0.75);
    }
    for (const side of [-1, 1]) {
      part.box([side * 112, 42, 70], [31, 37, 26], 0.73);
      part.cylinder([side * 112, 65, 67], 21, 32, [0, 0, 1], 9, 0.96);
      part.featureCircle([side * 112, 65, 51], 9, [0, 0, 1], 65, 1.14);
    }
    part.box([0, 31, -3], [178, 10, 8], 0.46);
    part.box([0, 31, 40], [178, 10, 8], 0.46);

    // Hydraulic bleeder and the bent crossover pipe are attached to the casting.
    part.cylinder([-113, -79, 61], 5, 25, [0, 1, 0], 1.7, 1.13);
    part.cylinder([-113, -73, 61], 8, 7, [0, 1, 0], 0, 0.93);
    for (const [a, b] of [
      [[139, -43, -27], [154, -57, -18]],
      [[154, -57, -18], [154, -57, 64]],
      [[154, -57, 64], [139, -43, 72]],
    ] as [Vec3, Vec3][]) {
      const axis: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      part.cylinder([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2],
        3, Math.hypot(...axis), axis, 0, 1.08);
      part.featureLine(a, b, 24, 1.13);
    }
  });
  return part.finish("Brake caliper", count);
}
