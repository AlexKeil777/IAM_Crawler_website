import { PartBuilder, type PartShape, type XY } from "../part-geometry";

const circle = (x: number, y: number, radius: number, sides = 40): XY[] =>
  Array.from({ length: sides }, (_, index) => {
    const angle = index / sides * Math.PI * 2;
    return [x + Math.cos(angle) * radius, y + Math.sin(angle) * radius];
  });

/** Bare V8 casting: two machined, four-bore decks and an open central valley. */
export function buildEngine(count: number): PartShape {
  const part = new PartBuilder(75289);
  const stations = [-120, -40, 40, 120];

  // Expose the near bank's four large bores as well as the valley and front web.
  part.group([0, 0, 0], [1.23, 0.36, 0.98], () => {
    part.extrude(
      [[-83, 30], [83, 30], [94, 108], [72, 128], [-72, 128], [-94, 108]],
      326, [0, 0, 0], 0.7,
    );
    // A narrow oil-pan rail belongs to the casting; no sump or assembled heads.
    part.box([0, 130, 0], [176, 9, 338], 1.08);
    for (const side of [-1, 1]) {
      part.group([side * 64, -5, 0], [0, 0, side * 0.65], () => {
        const boltHoles = [-159, -80, 0, 80, 159].flatMap((z) =>
          [-44, 44].map((x) => circle(x, z, 3.6, 16)),
        );
        const bores = stations.map((z) => circle(0, z, 34));
        part.group([0, -69, 0], [Math.PI / 2, 0, 0], () => {
          part.extrude(
            [[-56, -170], [56, -170], [56, 170], [-56, 170]],
            12, [0, 0, 0], 1.2, [...bores, ...boltHoles],
          );
        });
        // Cast side walls stay outside the cylinder liners, preserving the bores.
        for (const x of [-52, 52]) {
          part.box([x, -2, 0], [9, 124, 324], 0.68);
          part.featureLine([x, -75, -170], [x, -75, 170], 110, 1.08);
        }
        for (const z of [-164, 164]) {
          part.box([0, -2, z], [102, 124, 10], 0.8);
          part.featureLine([-56, -75, z], [56, -75, z], 50, 1.1);
        }
        for (const z of stations) {
          part.cylinder([0, -18, z], 37, 96, [0, 1, 0], 34, 0.23);
          part.cylinder([0, -75, z], 37, 2, [0, 1, 0], 34, 1.2);
          part.featureCircle([0, -76, z], 34, [0, -1, 0], 180, 1.2);
          // Core plugs and exterior ribs create the scalloped cast silhouette.
          part.cylinder([side * 57, 12, z], 16, 7, [1, 0, 0], 0, 0.65);
          part.cylinder([side * 61, 12, z], 12.5, 2, [1, 0, 0], 0, 0.9);
          part.box([side * 56, -10, z + 33], [9, 92, 10], 0.92);
        }
        for (const z of [-159, -80, 0, 80, 159]) {
          for (const x of [-44, 44]) {
            part.featureCircle([x, -75.5, z], 3.6, [0, -1, 0], 26, 0.98);
          }
        }
      });
    }

    // A recessed valley is broken up by cast webs and pairs of lifter bores.
    part.box([0, 21, 0], [38, 9, 314], 0.42);
    for (const z of [-151, -80, 0, 80, 151]) {
      part.extrude([[-24, 13], [-19, -11], [19, -11], [24, 13]], 11, [0, 0, z], 0.78);
      for (const side of [-1, 1]) {
        part.cylinder([side * 17, -13, z], 7, 9, [0, 1, 0], 4.5, 0.97);
      }
    }

    // The front timing face includes an open crank bearing and lower arch.
    const front: XY[] = [
      [-105, -21], [-62, -57], [-35, -15], [35, -15], [62, -57],
      [105, -21], [110, 98], [91, 129], [57, 129], [51, 104],
      [40, 82], [21, 70], [0, 66], [-21, 70], [-40, 82],
      [-51, 104], [-57, 129], [-91, 129], [-110, 98],
    ];
    part.extrude(front, 13, [0, 0, -174], 1.02, [circle(0, 25, 24)]);
    part.cylinder([0, 25, -184], 32, 8, [0, 0, 1], 24, 1.08);
    part.featureCircle([0, 25, -189], 24, [0, 0, 1], 160, 1.15);
    for (const [x, y] of [[-78, -13], [78, -13], [-94, 54], [94, 54], [-76, 111], [76, 111], [-42, 25], [42, 25]]) {
      part.cylinder([x, y, -183], 6.5, 5, [0, 0, 1], 3, 0.98);
      part.featureCircle([x, y, -186], 3, [0, 0, 1], 30, 1.06);
    }
    for (const side of [-1, 1]) {
      part.featureLine([side * 88, 111, -164], [side * 88, 111, 164], 110, 1.08);
      for (const z of [-107, 100]) {
        part.box([side * 98, 77, z], [27, 28, 26], 0.81);
        part.cylinder([side * 107, 77, z - 17], 10, 8, [0, 0, 1], 4.5, 1.04);
      }
    }
  });
  return part.finish("V8 engine block", count);
}
