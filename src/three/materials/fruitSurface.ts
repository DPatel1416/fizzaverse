import { CanvasTexture, RepeatWrapping } from "three";
import { seeded } from "@/lib/quality";
const cache = new Map<string, CanvasTexture>();
export function fruitSurface(kind: "peel" | "berry" | "pulp") {
  const existing = cache.get(kind);
  if (existing) return existing;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const c = canvas.getContext("2d")!;
  const data = c.createImageData(256, 256);
  const random = seeded(kind === "peel" ? 4 : kind === "berry" ? 12 : 8);
  for (let y = 0; y < 256; y++)
    for (let x = 0; x < 256; x++) {
      const i = (y * 256 + x) * 4;
      const n =
        kind === "pulp"
          ? 145 +
            Math.sin(x * 0.9 + Math.sin(y * 0.13) * 2) * 30 +
            random() * 45
          : 120 + random() * 95;
      data.data[i] = data.data[i + 1] = data.data[i + 2] = n;
      data.data[i + 3] = 255;
    }
  c.putImageData(data, 0, 0);
  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(kind === "berry" ? 3 : 2, 2);
  cache.set(kind, texture);
  return texture;
}
