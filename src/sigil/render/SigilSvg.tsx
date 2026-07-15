import type { CSSProperties, ReactNode } from "react";
import { PALETTE_COLORS, arcPath, pointsPath } from "./serialize";
import type { SigilGeometry, SigilPlan, SigilPrimitive } from "../types";

type Props = {
  geometry: SigilGeometry;
  plan: SigilPlan;
  paused: boolean;
};

function Primitive({ primitive }: { primitive: SigilPrimitive }): ReactNode {
  const common = {
    id: primitive.id,
    strokeWidth: primitive.stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (primitive.kind) {
    case "circle":
      return <circle {...common} fill="none" cx={primitive.cx} cy={primitive.cy} r={primitive.radius} />;
    case "line":
      return <line {...common} x1={primitive.x1} y1={primitive.y1} x2={primitive.x2} y2={primitive.y2} />;
    case "arc":
      return <path {...common} fill="none" d={arcPath(primitive.cx, primitive.cy, primitive.radius, primitive.startAngle, primitive.endAngle)} />;
    case "path":
      return <path {...common} fill="none" d={pointsPath(primitive.points, primitive.closed)} />;
    case "dot":
      return <circle id={primitive.id} className="sigil-dot" cx={primitive.x} cy={primitive.y} r={primitive.radius} />;
  }
}

export function SigilSvg({ geometry, plan, paused }: Props) {
  const colors = PALETTE_COLORS[plan.palette];
  const style = {
    "--sigil-ink": colors.ink,
    "--sigil-accent": colors.accent,
    "--rotation-duration": `${plan.motion.rotation}s`,
    "--pulse-duration": `${plan.motion.pulse}s`,
    "--orbit-duration": `${plan.motion.orbit}s`,
  } as CSSProperties;
  const layer = (name: SigilPrimitive["layer"]) =>
    geometry.primitives.filter((primitive) => primitive.layer === name).map((primitive) => (
      <Primitive key={primitive.id} primitive={primitive} />
    ));

  return (
    <svg
      className={`sigil ${paused ? "sigil--paused" : ""}`}
      style={style}
      viewBox={geometry.viewBox}
      role="img"
      aria-label="입력 의미를 바탕으로 생성한 추상 기하 문양"
      data-testid="sigil-svg"
    >
      <title>Digital Sigil abstract geometry</title>
      <g className="sigil__orbit">{layer("orbit")}</g>
      <g className="sigil__marks">{layer("marks")}</g>
      <g className="sigil__core">{layer("core")}</g>
    </svg>
  );
}
