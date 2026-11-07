import { PartBuilder, type PartShape, type XY } from "../part-geometry";

/** A chamfered stamping or casting, rather than an infinitely sharp box. */
function roundedRectangle(width: number, height: number, radius: number): XY[] {
  const vertices: XY[] = [];
  for (let corner = 0; corner < 4; corner++) {
    const angle = -Math.PI / 2 + corner * Math.PI / 2;
    const centerX = (corner === 0 || corner === 1 ? 1 : -1) * (width / 2 - radius);
    const centerY = (corner === 0 || corner === 3 ? -1 : 1) * (height / 2 - radius);
    // Traverse top right, bottom right, bottom left, top left.
    const start = angle;
    for (let step = 0; step <= 4; step++) {
      const theta = start + (step / 4) * Math.PI / 2;
      vertices.push([centerX + radius * Math.cos(theta), centerY + radius * Math.sin(theta)]);
    }
  }
  return vertices;
}

/** Keep the actual edges of a casting or seam evenly resolved in the cloud. */
function featureOutline(part: PartBuilder, vertices: XY[], z: number, spacing = 2.7, tone = 1.1) {
  vertices.forEach((a, index) => {
    const b = vertices[(index + 1) % vertices.length];
    const samples = Math.max(3, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / spacing));
    part.featureLine([a[0], a[1], z], [b[0], b[1], z], samples, tone);
  });
}

export function buildSteeringWheel(count: number): PartShape {
  const part = new PartBuilder(19031);

  // A leather grip has a round section all the way round its rim. The shallow
  // seam and the thicker thumb rests sit on that section, not on a flat disk.
  part.torus([0, 0, 10], 178, 23, [0, 0, 1], 0.78);
  part.torus([0, 0, -10], 177, 1.1, [0, 0, 1], 0.5);
  // The continuous stitching seam follows the front of the leather section.
  part.featureCircle([0, 0, -13], 178, [0, 0, 1], 500, 0.92);
  for (const side of [-1, 1]) {
    part.ellipsoid([side * 167, -49, 2], [23, 37, 23], 0.77);

    // The metal spoke narrows from the grip into the padded airbag assembly.
    const spoke: XY[] = [
      [side * 175, -48], [side * 158, -64], [side * 58, -35],
      [side * 43, 14], [side * 80, 20], [side * 156, -7],
    ];
    part.extrude(spoke, 18, [0, 0, -7], 1.05);
    part.featureLine([side * 158, -64, -16], [side * 58, -35, -16], 80, 1.12);
    part.featureLine([side * 80, 20, -16], [side * 156, -7, -16], 65, 1.12);
    const switchPod = roundedRectangle(49, 26, 7);
    part.group([side * 112, -20, -20], [0, 0, side * -0.2], () => {
      part.extrude(switchPod, 5, [0, 0, 0], 0.5);
      for (const x of [-12, 2, 15]) {
        part.box([x, 0, -3.6], [9, 11, 1.4], 0.85);
      }
    });
  }

  // Split lower spoke: the narrow open slot is a useful recognition detail.
  part.extrude(
    [[-38, 42], [38, 42], [30, 153], [0, 179], [-30, 153]],
    16, [0, 0, -2], 1.1,
    [[[-13, 78], [13, 78], [11, 146], [0, 158], [-11, 146]]],
  );
  featureOutline(part, [[-13, 78], [13, 78], [11, 146], [0, 158], [-11, 146]], -10, 2.3, 1.17);
  part.featureLine([-30, 153, -10], [0, 179, -10], 36, 1.1);
  part.featureLine([0, 179, -10], [30, 153, -10], 36, 1.1);

  const hub = roundedRectangle(139, 113, 31);
  part.extrude(hub, 23, [0, 3, -21], 0.64);
  featureOutline(part, hub.map(([x, y]) => [x, y + 3]), -32.5, 2.2, 0.94);
  // A slightly domed padded cover, with a genuine recessed seam at its edge.
  part.ellipsoid([0, 3, -30], [66, 52, 15], 0.85);
  part.cylinder([0, 3, 43], 32, 41, [0, 0, 1], 12, 0.56);
  return part.finish("Steering wheel", count);
}

export function buildRadiator(count: number): PartShape {
  const part = new PartBuilder(28411);

  // A real cross-flow radiator: broad, thin aluminium core, with polymer tanks
  // at the sides. Leave the spaces between tubes open throughout its depth.
  const coreWidth = 316;
  for (let row = 0; row < 25; row++) {
    const y = -104 + row * (208 / 24);
    part.box([0, y, 0], [coreWidth, 1.8, 25], 1.05);
    // Flattened tube mouths remain in front of the recessed fin pack. Their
    // bright lips define the rows even when the sculpture is seen small.
    part.box([0, y, -16], [coreWidth, 2.5, 4], 1.22);
    part.cylinder([0, y, -18], 1.2, coreWidth, [1, 0, 0], 0, 1.3);
    part.featureLine([-158, y, -19.2], [158, y, -19.2], 56, 1.2);
  }

  // Thin corrugated metal fins between the horizontal coolant tubes. Each
  // strip has a shallow fold; the front edges make the dense core readable.
  for (let column = 0; column < 53; column++) {
    const x = -155 + column * (310 / 52);
    part.quad([x, -108, -9], [x + 1.3, 108, -9], [x + 3, 108, 0], [x + 1.7, -108, 0], 0.48);
    part.quad([x + 1.7, -108, 0], [x + 3, 108, 0], [x + 1.3, 108, -9], [x, -108, -9], 0.48);
    part.quad([x + 1.7, -108, 0], [x + 3, 108, 0], [x + 1.3, 108, 9], [x, -108, 9], 0.48);
    part.quad([x, -108, 9], [x + 1.3, 108, 9], [x + 3, 108, 0], [x + 1.7, -108, 0], 0.48);
  }

  for (const side of [-1, 1]) {
    part.extrude(roundedRectangle(37, 237, 11), 42, [side * 181, 0, 0], 0.58);
    for (const x of [side * 162.5, side * 199.5]) {
      part.featureLine([x, -107.5, -21], [x, 107.5, -21], 72, 1.03);
    }
    // Rolled header plate and crimp tabs securing the tank to the core.
    part.box([side * 160, 0, 0], [7, 230, 38], 0.95);
    for (let y = -102; y <= 103; y += 18.5) {
      part.box([side * 165, y, -23], [9, 7, 5], 1.05);
    }
    part.box([0, side * 113, 0], [327, 8, 36], 0.91);
    part.featureLine([-163.5, side * 117, -18], [163.5, side * 117, -18], 90, 1.12);
    part.cylinder([side * 177, -130, 0], 6, 25, [0, 1, 0], 0, 0.67);
    part.cylinder([side * 177, 130, 0], 6, 25, [0, 1, 0], 0, 0.67);
    part.cylinder([side * 177, 132, 0], 10, 5, [0, 1, 0], 6, 0.48);
  }

  // Offset inlet/outlet necks, with a retaining bead and visible hollow ends.
  for (const [side, y] of [[-1, -72], [1, 72]]) {
    part.cylinder([side * 211, y, -2], 14, 46, [1, 0, 0], 10, 0.69);
    part.torus([side * 229, y, -2], 13.6, 1.7, [1, 0, 0], 0.91);
    part.featureCircle([side * 234, y, -2], 10, [1, 0, 0], 60, 1.12);
  }
  // The small drain plug belongs below the outlet tank.
  part.cylinder([181, 116, -13], 7, 14, [0, 1, 0], 0, 0.63);
  return part.finish("Radiator", count);
}

export function buildCaliper(count: number): PartShape {
  const part = new PartBuilder(31607);
  part.group([0, 0, 0], [0.65, -0.1, 0.03], () => {
    // An open-bottom casting embraces the disc. The jaws have individual
    // rounded ends, rather than making an undifferentiated rectangular frame.
    const jaw: XY[] = [
      [-153, 65], [-154, -28], [-133, -70], [-88, -98],
      [77, -98], [126, -81], [151, -44], [157, 45],
      [141, 73], [116, 79], [96, 61], [96, -8],
      [73, -36], [-74, -36], [-99, -13], [-99, 59],
      [-119, 81], [-143, 78],
    ];
    part.extrude(jaw, 32, [0, 0, -55], 0.94);
    part.extrude(jaw, 38, [0, 0, 46], 0.78);
    featureOutline(part, jaw, -71, 2.8, 1.12);

    // The paired cylindrical piston housings protrude from the inboard bank.
    // The machined lips are visible down in the open slot between the jaws.
    for (const x of [-58, 58]) {
      part.cylinder([x, -36, 49], 47, 48, [0, 0, 1], 34, 0.83);
      part.ellipsoid([x, -36, 78], [47, 47, 17], 0.76);
      part.cylinder([x, -36, 37], 32, 8, [0, 0, 1], 0, 0.5);
      part.cylinder([x, -36, 23], 38, 3, [0, 0, 1], 34, 1.13);
      part.featureCircle([x, -36, 21.5], 34, [0, 0, 1], 180, 1.18);
    }

    // Two side bridges cross the deep rotor channel. The broad central gap is
    // left empty through the whole part so its depth is visible in this pose.
    for (const x of [-126, 126]) {
      part.extrude(roundedRectangle(35, 92, 12), 125, [x, -15, -1], 0.88);
      part.extrude(roundedRectangle(31, 104, 11), 6, [x, -13, -75], 1.04);
      for (const edgeX of [x - 15.5, x + 15.5]) {
        part.featureLine([edgeX, -54, -78], [edgeX, 28, -78], 70, 1.13);
      }
    }
    part.extrude(roundedRectangle(205, 18, 8), 7, [-3, -79, -75], 1.08);
    part.featureLine([-97.5, -88, -78.5], [91.5, -88, -78.5], 95, 1.15);
    part.featureLine([-97.5, -70, -78.5], [91.5, -70, -78.5], 95, 1.15);
    // Short pad ledges sit high in the casting instead of filling the slot.
    part.box([0, -37, -30], [174, 12, 8], 0.56);
    part.box([0, -37, 18], [174, 12, 8], 0.56);

    for (const x of [-165, 165]) {
      const side = Math.sign(x);
      part.box([side * 145, 54, 44], [43, 25, 31], 0.82);
      part.cylinder([x, 54, 41], 18, 41, [0, 0, 1], 9, 0.99);
      part.cylinder([side * 127, -51, -78], 7, 8, [0, 0, 1], 3, 1.09);
      part.featureCircle([x, 54, 20.5], 9, [0, 0, 1], 60, 1.18);
      part.featureCircle([side * 127, -51, -82], 7, [0, 0, 1], 65, 1.16);
    }
    // One offset hydraulic inlet and a bleeder produce the asymmetry of an
    // actual cast component; a thin crossover pipe joins the two banks.
    part.cylinder([93, -102, 52], 5, 26, [0, 1, 0], 1.7, 1.14);
    part.cylinder([93, -97, 52], 8, 6, [0, 1, 0], 0, 0.86);
    part.cylinder([-112, -96, 0], 3, 103, [0, 0, 1], 0, 1.15);
    part.cylinder([-153, -17, 53], 8, 22, [1, 0, 0], 3, 1.08);
  });
  return part.finish("Brake caliper", count);
}
