/** Deterministic point clouds for the hero's automotive components.
 * Coordinates share the rotor's roughly 450-unit drawing space. */
export type PartPoint = { x: number; y: number; z: number };
export type PartShape = { name: string; points: PartPoint[] };
type XY = [number, number];
type Sampler = { weight: number; point: () => PartPoint };

export function createPartShapes(count: number): PartShape[] {
  let seed = 8317;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const between = (a: number, b: number) => a + random() * (b - a);
  const shapes: PartShape[] = [];
  let samplers: Sampler[] = [];
  const add = (weight: number, point: () => PartPoint) => samplers.push({ weight, point });
  const edge = (a: XY, b: XY, weight = 1, z = 18) => {
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
    add(length * weight, () => {
      const t = random();
      return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, z: z + between(-2, 2) };
    });
  };
  const outline = (vertices: XY[], weight = 1, z = 18) => {
    vertices.forEach((v, i) => edge(v, vertices[(i + 1) % vertices.length], weight, z));
  };
  const inside = (x: number, y: number, vertices: XY[]) => {
    let hit = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const [xi, yi] = vertices[i], [xj, yj] = vertices[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
  };
  const panel = (vertices: XY[], weight = 1, z = 12, holes: XY[][] = []) => {
    const xs = vertices.map((v) => v[0]), ys = vertices.map((v) => v[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    // Weight by bounding area; the outline is sampled separately for crisp edges.
    add((maxX - minX) * (maxY - minY) * 0.016 * weight, () => {
      let x: number, y: number;
      do { x = between(minX, maxX); y = between(minY, maxY); }
      while (!inside(x, y, vertices) || holes.some((hole) => inside(x, y, hole)));
      return { x, y, z: z + between(-3, 3) };
    });
    outline(vertices, 1.1 * weight, z + 5);
    holes.forEach((hole) => outline(hole, 1.1 * weight, z + 5));
  };
  const ring = (x: number, y: number, outer: number, inner: number, weight = 1, z = 20, squish = 1) => {
    add(Math.PI * (outer * outer - inner * inner) * 0.018 * weight, () => {
      const a = between(0, Math.PI * 2), r = Math.sqrt(between(inner * inner, outer * outer));
      return { x: x + Math.cos(a) * r, y: y + Math.sin(a) * r * squish, z: z + between(-3, 3) };
    });
    for (const r of [inner, outer]) add(2 * Math.PI * r * 1.2 * weight, () => {
      const a = between(0, Math.PI * 2);
      return { x: x + Math.cos(a) * r, y: y + Math.sin(a) * r * squish, z: z + 5 };
    });
  };
  const finish = (name: string) => {
    const total = samplers.reduce((sum, item) => sum + item.weight, 0);
    const points = Array.from({ length: count }, () => {
      let choice = random() * total;
      for (const item of samplers) {
        choice -= item.weight;
        if (choice <= 0) return item.point();
      }
      return samplers[samplers.length - 1].point();
    });
    shapes.push({ name, points });
    samplers = [];
  };

  // A pressed wishbone, with the open centre and three mounting bushes.
  panel([[-175,-166],[-121,-164],[170,-35],[198,0],[170,35],[-121,164],[-175,166],[-153,105],[103,0],[-153,-105]], 1.3);
  ring(-158,-140,39,19,1.2); ring(-158,140,39,19,1.2); ring(165,0,39,16,1.2);
  edge([-117,-120],[115,-17],.8); edge([-117,120],[115,17],.8);
  finish("Control arm");

  // Two pads, with backing plates and the characteristic broad friction faces.
  for (const dx of [-105, 105]) {
    const shape: XY[] = [[dx-83,-133],[dx-60,-160],[dx+58,-160],[dx+83,-133],[dx+83,102],[dx+60,145],[dx-60,145],[dx-83,102]];
    panel(shape, 1.05);
    outline([[dx-68,-119],[dx-48,-138],[dx+46,-138],[dx+68,-119],[dx+68,91],[dx+48,119],[dx-48,119],[dx-68,91]], 1.1, 28);
    edge([dx,-127],[dx,111],1.5,30);
    edge([dx-84,102],[dx+84,102],.7,28);
    ring(dx-55,-147,7,3,.45,30); ring(dx+55,-147,7,3,.45,30);
  }
  finish("Brake pads");

  // Rim, three spokes and central airbag hub.
  ring(0,0,213,182,1.2,8);
  ring(0,0,192,188,.45,25);
  panel([[-170,-62],[-145,-80],[-47,-30],[-36,11],[-65,30],[-151,-25]],.9,17);
  panel([[170,-62],[145,-80],[47,-30],[36,11],[65,30],[151,-25]],.9,17);
  panel([[-37,25],[37,25],[28,164],[0,185],[-28,164]],.9,17);
  ring(0,0,58,7,1,35);
  ring(0,0,39,34,.6,42);
  finish("Steering wheel");

  // Header tanks, parallel fins and pipe connections.
  panel([[-178,-180],[178,-180],[178,180],[-178,180]],.4,0,[[[-148,-140],[148,-140],[148,140],[-148,140]]]);
  panel([[-146,-138],[146,-138],[146,138],[-146,138]],.16,-2);
  for (let y = -130; y <= 130; y += 10) edge([-145,y],[145,y],.55,13);
  for (let x = -132; x <= 132; x += 44) edge([x,-135],[x,135],.35,15);
  panel([[-165,-180],[165,-180],[165,-147],[-165,-147]],.55,25);
  panel([[-165,147],[165,147],[165,180],[-165,180]],.55,25);
  ring(-120,-189,18,10,.5,26); ring(119,189,18,10,.5,26);
  finish("Radiator");

  // V-shaped engine block, with four cylinder bores along each bank.
  panel([[-105,-64],[105,-64],[137,110],[100,163],[-100,163],[-137,110]],.7,0);
  panel([[-193,-112],[-130,-166],[-20,-42],[-64,25]],.85,18);
  panel([[193,-112],[130,-166],[20,-42],[64,25]],.85,18);
  for (let i = 0; i < 4; i++) {
    const x = 147 - i * 27, y = -127 + i * 30;
    ring(-x,y,24,14,.8,35,.72); ring(x,y,24,14,.8,35,.72);
  }
  outline([[-80,54],[80,54],[88,128],[-88,128]],1.2,30);
  ring(0,95,28,16,.7,35);
  edge([-105,150],[105,150],1.2,30);
  finish("V8 engine block");

  // Crown, ring grooves, skirt and connecting rod.
  panel([[-106,-164],[106,-164],[106,62],[82,105],[-82,105],[-106,62]],1,10);
  ring(0,-164,106,92,.85,25,.24);
  for (const y of [-130,-112,-94]) {
    edge([-102,y],[102,y],1.15,30);
    edge([-102,y+5],[102,y+5],.5,30);
  }
  ring(0,32,36,23,.8,35);
  panel([[-28,83],[28,83],[40,173],[26,198],[-26,198],[-40,173]],.65,0);
  ring(0,170,35,20,.9,25);
  finish("Piston");

  // Caliper body with a large opening and stepped mounting ears.
  const caliper: XY[] = [[-185,-112],[-145,-157],[91,-157],[154,-124],[175,-81],[175,87],[144,135],[92,157],[-147,157],[-185,116],[-168,76],[-120,76],[-120,-76],[-168,-76]];
  const opening: XY[] = [[-78,-83],[62,-83],[96,-54],[96,54],[62,83],[-78,83]];
  panel(caliper,1,12,[opening]);
  outline([[-135,-135],[81,-135],[132,-110],[151,-75],[151,75],[128,111],[81,135],[-135,135]],1,30);
  edge([-98,-103],[78,-103],.8,30); edge([-98,103],[78,103],.8,30);
  ring(-151,-113,12,5,.55,32); ring(-151,113,12,5,.55,32);
  ring(134,-52,13,6,.5,32); ring(134,52,13,6,.5,32);
  finish("Brake caliper");

  return shapes;
}
