import type { SigilMeaning } from "../ai/types";

export type Symmetry = 4 | 5 | 6 | 8 | 10 | 12;
export type Core = "eye" | "star" | "void" | "seed" | "gear";
export type Structure =
  | "closed"
  | "radiating"
  | "branching"
  | "interlocking"
  | "spiral";
export type Ornament =
  | "dots"
  | "abstract-marks"
  | "arcs"
  | "spikes"
  | "satellites";
export type Palette =
  | "ivory-ink"
  | "obsidian-gold"
  | "midnight-silver"
  | "oxide-copper"
  | "deep-crimson";

export type SigilPlan = {
  seed: number;
  variation: number;
  meaning: SigilMeaning;
  symmetry: Symmetry;
  rings: number;
  core: Core;
  structure: Structure;
  ornaments: Ornament[];
  palette: Palette;
  motion: { rotation: number; pulse: number; orbit: number };
};

type PrimitiveBase = {
  id: string;
  layer: "core" | "orbit" | "marks";
  stroke: number;
};

export type CirclePrimitive = PrimitiveBase & {
  kind: "circle";
  cx: number;
  cy: number;
  radius: number;
};
export type LinePrimitive = PrimitiveBase & {
  kind: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
export type ArcPrimitive = PrimitiveBase & {
  kind: "arc";
  cx: number;
  cy: number;
  radius: number;
  startAngle: number;
  endAngle: number;
};
export type PathPrimitive = PrimitiveBase & {
  kind: "path";
  points: Array<{ x: number; y: number }>;
  closed: boolean;
};
export type DotPrimitive = PrimitiveBase & {
  kind: "dot";
  x: number;
  y: number;
  radius: number;
};

export type SigilPrimitive =
  | CirclePrimitive
  | LinePrimitive
  | ArcPrimitive
  | PathPrimitive
  | DotPrimitive;

export type SigilGeometry = {
  id: string;
  viewBox: "0 0 640 640";
  primitives: SigilPrimitive[];
};
