/** Deterministic samples of complete 3D automotive assemblies. The original
 * brake disc is generated separately in rotor.ts. */
import { buildBrakePads, buildControlArm } from "./parts/chassis";
import { buildCaliper, buildRadiator, buildSteeringWheel } from "./parts/accessories";
import { buildEngine, buildPiston } from "./parts/powertrain";
export type { PartPoint, PartShape } from "./part-geometry";

export function createPartShapes(count: number) {
  return [
    buildControlArm(count),
    buildBrakePads(count),
    buildSteeringWheel(count),
    buildRadiator(count),
    buildEngine(count),
    buildPiston(count),
    buildCaliper(count),
  ];
}
