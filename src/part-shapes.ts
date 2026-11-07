/** The seven reference-inspired automotive assemblies in display order. */
import { buildControlArm } from "./parts/chassis";
import { buildCaliper, buildSteeringWheel } from "./parts/accessories";
import { buildAlloyWheel } from "./parts/alloy-wheel";
import { buildEngine } from "./parts/powertrain";
import { buildHeadlight } from "./parts/headlight";
import { buildExhaust } from "./parts/muffler";
export type { PartPoint, PartShape } from "./part-geometry";

export function createPartShapes(count: number) {
  return [
    buildControlArm(count),
    buildSteeringWheel(count),
    buildAlloyWheel(count),
    buildExhaust(count),
    buildCaliper(count),
    buildHeadlight(count),
    buildEngine(count),
  ];
}
