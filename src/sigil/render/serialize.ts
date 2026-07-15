import type { Palette, SigilGeometry, SigilPrimitive } from "../types";

export type PaletteColors = { background: string; ink: string; accent: string };

export const PALETTE_COLORS: Record<Palette, PaletteColors> = {
  "ivory-ink": { background: "#f4efdf", ink: "#15201d", accent: "#9a6b38" },
  "obsidian-gold": { background: "#eee5cf", ink: "#171815", accent: "#ad7b2e" },
  "midnight-silver": { background: "#e9e7df", ink: "#17232a", accent: "#77858c" },
  "oxide-copper": { background: "#f1e9d9", ink: "#18302c", accent: "#a1583f" },
  "deep-crimson": { background: "#eee6d9", ink: "#251719", accent: "#8e3135" },
};

function format(value: number): string {
  return Number(value.toFixed(3)).toString();
}

export function arcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const point = (angle: number): [number, number] => {
    const radians = (angle * Math.PI) / 180;
    return [cx + Math.cos(radians) * radius, cy + Math.sin(radians) * radius];
  };
  const start = point(startAngle);
  const end = point(endAngle);
  const sweep = Math.abs(endAngle - startAngle);
  return `M ${format(start[0])} ${format(start[1])} A ${format(radius)} ${format(radius)} 0 ${sweep > 180 ? 1 : 0} 1 ${format(end[0])} ${format(end[1])}`;
}

export function pointsPath(points: Array<{ x: number; y: number }>, closed: boolean): string {
  const first = points[0];
  if (!first) return "";
  const segments = points.slice(1).map((point) => `L ${format(point.x)} ${format(point.y)}`);
  return [`M ${format(first.x)} ${format(first.y)}`, ...segments, closed ? "Z" : ""].filter(Boolean).join(" ");
}

function primitiveMarkup(primitive: SigilPrimitive, colors: PaletteColors): string {
  const common = `id="${primitive.id}" stroke="${colors.ink}" stroke-width="${format(primitive.stroke)}" stroke-linecap="round" stroke-linejoin="round"`;
  switch (primitive.kind) {
    case "circle":
      return `<circle ${common} fill="none" cx="${format(primitive.cx)}" cy="${format(primitive.cy)}" r="${format(primitive.radius)}"/>`;
    case "line":
      return `<line ${common} x1="${format(primitive.x1)}" y1="${format(primitive.y1)}" x2="${format(primitive.x2)}" y2="${format(primitive.y2)}"/>`;
    case "arc":
      return `<path ${common} fill="none" d="${arcPath(primitive.cx, primitive.cy, primitive.radius, primitive.startAngle, primitive.endAngle)}"/>`;
    case "path":
      return `<path ${common} fill="none" d="${pointsPath(primitive.points, primitive.closed)}"/>`;
    case "dot":
      return `<circle id="${primitive.id}" fill="${colors.accent}" cx="${format(primitive.x)}" cy="${format(primitive.y)}" r="${format(primitive.radius)}"/>`;
  }
}

export function serializeSvg(geometry: SigilGeometry, palette: Palette): string {
  const colors = PALETTE_COLORS[palette];
  const body = geometry.primitives.map((primitive) => primitiveMarkup(primitive, colors)).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${geometry.viewBox}" role="img" aria-label="Abstract geometric sigil"><g fill="none">${body}</g></svg>`;
}
