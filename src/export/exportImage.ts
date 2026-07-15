import { PALETTE_COLORS, serializeSvg } from "../sigil/render/serialize";
import type { Palette, SigilGeometry } from "../sigil/types";

export type PngMode = "transparent" | "poster";
export type PngSpec = { size: number; padding: number; background: string | null };

export function getPngSpec(mode: PngMode, palette: Palette): PngSpec {
  return mode === "transparent"
    ? { size: 1600, padding: 0, background: null }
    : { size: 2400, padding: 180, background: PALETTE_COLORS[palette].background };
}

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("SVG를 PNG로 변환하지 못했습니다."));
    image.src = url;
  });
}

export function downloadSvg(
  geometry: SigilGeometry,
  palette: Palette,
  filename: string,
): void {
  const source = serializeSvg(geometry, palette);
  download(new Blob([source], { type: "image/svg+xml;charset=utf-8" }), filename);
}

export async function renderPng(
  geometry: SigilGeometry,
  palette: Palette,
  mode: PngMode,
): Promise<Blob> {
  const spec = getPngSpec(mode, palette);
  const canvas = document.createElement("canvas");
  canvas.width = spec.size;
  canvas.height = spec.size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas를 사용할 수 없습니다.");
  if (spec.background) {
    context.fillStyle = spec.background;
    context.fillRect(0, 0, spec.size, spec.size);
  }
  const svg = serializeSvg(geometry, palette);
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const image = await loadImage(url);
    const drawSize = spec.size - spec.padding * 2;
    context.drawImage(image, spec.padding, spec.padding, drawSize, drawSize);
  } finally {
    URL.revokeObjectURL(url);
  }
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("PNG 데이터를 만들지 못했습니다."))),
      "image/png",
    );
  });
}

export async function downloadPng(
  geometry: SigilGeometry,
  palette: Palette,
  mode: PngMode,
  filename: string,
): Promise<void> {
  download(await renderPng(geometry, palette, mode), filename);
}
