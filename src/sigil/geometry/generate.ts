import { createSeededRandom, getVariationSeed } from "../seed";
import type {
  PathPrimitive,
  SigilGeometry,
  SigilPlan,
  SigilPrimitive,
} from "../types";

const CENTER = 320;
const MAX_PRIMITIVES = 180;

function polar(radius: number, angle: number): { x: number; y: number } {
  const radians = (angle * Math.PI) / 180;
  return {
    x: CENTER + Math.cos(radians) * radius,
    y: CENTER + Math.sin(radians) * radius,
  };
}

function id(seed: number, index: number): string {
  return `sigil-${seed.toString(16)}-${index.toString(16)}`;
}

function addCore(primitives: SigilPrimitive[], plan: SigilPlan, stroke: number): void {
  const nextId = () => id(plan.seed, primitives.length);
  if (plan.core === "void") {
    primitives.push(
      { kind: "circle", id: nextId(), layer: "core", stroke, cx: CENTER, cy: CENTER, radius: 38 },
      { kind: "circle", id: nextId(), layer: "core", stroke, cx: CENTER, cy: CENTER, radius: 15 },
    );
    return;
  }
  if (plan.core === "eye") {
    primitives.push({
      kind: "path",
      id: nextId(),
      layer: "core",
      stroke,
      closed: true,
      points: [polar(56, 180), polar(24, 270), polar(56, 0), polar(24, 90)],
    });
    primitives.push({ kind: "dot", id: nextId(), layer: "core", stroke, x: CENTER, y: CENTER, radius: 9 });
    return;
  }
  if (plan.core === "seed") {
    primitives.push({ kind: "circle", id: nextId(), layer: "core", stroke, cx: CENTER, cy: CENTER, radius: 31 });
    primitives.push({ kind: "arc", id: nextId(), layer: "core", stroke, cx: CENTER, cy: CENTER, radius: 17, startAngle: 115, endAngle: 425 });
    return;
  }
  const teeth = plan.core === "gear" ? 12 : plan.symmetry;
  const points: PathPrimitive["points"] = [];
  for (let index = 0; index < teeth * 2; index += 1) {
    points.push(polar(index % 2 === 0 ? 48 : 23, (index * 180) / teeth - 90));
  }
  primitives.push({ kind: "path", id: nextId(), layer: "core", stroke, closed: true, points });
  if (plan.core === "gear") {
    primitives.push({ kind: "circle", id: nextId(), layer: "core", stroke, cx: CENTER, cy: CENTER, radius: 14 });
  }
}

function addRings(primitives: SigilPrimitive[], plan: SigilPlan, stroke: number): void {
  for (let index = 0; index < plan.rings; index += 1) {
    const radius = 82 + index * (150 / Math.max(1, plan.rings - 1));
    primitives.push({
      kind: "circle",
      id: id(plan.seed, primitives.length),
      layer: index % 2 === 0 ? "orbit" : "core",
      stroke: Math.max(1.4, stroke - index * 0.15),
      cx: CENTER,
      cy: CENTER,
      radius,
    });
  }
}

function radiiForStructure(plan: SigilPlan, random: () => number): [number, number] {
  const jitter = random() * 14;
  switch (plan.structure) {
    case "closed":
      return [116 + jitter, 214 - jitter];
    case "interlocking":
      return [92 + jitter, 244 - jitter];
    case "spiral":
      return [72 + jitter, 255 - jitter];
    case "branching":
      return [104 + jitter, 270 - jitter];
    case "radiating":
      return [76 + jitter, 276 - jitter];
  }
}

function addSymmetricUnit(
  primitives: SigilPrimitive[],
  plan: SigilPlan,
  stroke: number,
  random: () => number,
): void {
  const sector = 360 / plan.symmetry;
  const [inner, outer] = radiiForStructure(plan, random);
  for (let index = 0; index < plan.symmetry; index += 1) {
    const angle = index * sector - 90;
    const start = polar(inner, angle);
    const end = polar(outer, angle + (plan.structure === "spiral" ? sector * 0.34 : 0));
    primitives.push({
      kind: "line",
      id: id(plan.seed, primitives.length),
      layer: "marks",
      stroke,
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y,
    });
    if (plan.structure === "branching" || plan.structure === "interlocking") {
      const left = polar(outer - 28, angle - sector * 0.2);
      const right = polar(outer - 28, angle + sector * 0.2);
      primitives.push({
        kind: "path",
        id: id(plan.seed, primitives.length),
        layer: "marks",
        stroke,
        closed: false,
        points: [left, end, right],
      });
    }
    if (plan.ornaments.includes("arcs")) {
      primitives.push({
        kind: "arc",
        id: id(plan.seed, primitives.length),
        layer: "orbit",
        stroke: Math.max(1.4, stroke - 0.25),
        cx: CENTER,
        cy: CENTER,
        radius: inner + 36,
        startAngle: angle - sector * 0.28,
        endAngle: angle + sector * 0.28,
      });
    }
    if (plan.ornaments.includes("dots") || plan.ornaments.includes("satellites")) {
      primitives.push({
        kind: "dot",
        id: id(plan.seed, primitives.length),
        layer: "orbit",
        stroke,
        x: end.x,
        y: end.y,
        radius: plan.ornaments.includes("satellites") ? 5.5 : 3.5,
      });
    }
    if (plan.ornaments.includes("abstract-marks") || plan.ornaments.includes("spikes")) {
      const width = plan.ornaments.includes("spikes") ? sector * 0.14 : sector * 0.08;
      primitives.push({
        kind: "path",
        id: id(plan.seed, primitives.length),
        layer: "marks",
        stroke: Math.max(1.4, stroke - 0.2),
        closed: plan.ornaments.includes("spikes"),
        points: [polar(outer - 48, angle - width), polar(outer - 22, angle), polar(outer - 48, angle + width)],
      });
    }
  }
}

function numbersFor(primitive: SigilPrimitive): number[] {
  switch (primitive.kind) {
    case "circle":
      return [primitive.cx, primitive.cy, primitive.radius, primitive.stroke];
    case "line":
      return [primitive.x1, primitive.y1, primitive.x2, primitive.y2, primitive.stroke];
    case "arc":
      return [primitive.cx, primitive.cy, primitive.radius, primitive.startAngle, primitive.endAngle, primitive.stroke];
    case "path":
      return [primitive.stroke, ...primitive.points.flatMap((point) => [point.x, point.y])];
    case "dot":
      return [primitive.x, primitive.y, primitive.radius, primitive.stroke];
  }
}

export function hasFiniteCoordinates(primitives: readonly SigilPrimitive[]): boolean {
  return primitives.every((primitive) => numbersFor(primitive).every(Number.isFinite));
}

export function createSigilGeometry(plan: SigilPlan): SigilGeometry {
  const random = createSeededRandom(getVariationSeed(String(plan.seed), plan.variation));
  const primitives: SigilPrimitive[] = [];
  const stroke = Math.max(1.4, 2.8 - plan.symmetry * 0.07);
  addCore(primitives, plan, stroke);
  addRings(primitives, plan, stroke);
  addSymmetricUnit(primitives, plan, stroke, random);
  const normalized = primitives.slice(0, MAX_PRIMITIVES);
  if (!hasFiniteCoordinates(normalized)) {
    throw new Error("Sigil geometry contains a non-finite coordinate.");
  }
  return { id: `sigil-${plan.seed.toString(16)}-${plan.variation}`, viewBox: "0 0 640 640", primitives: normalized };
}
