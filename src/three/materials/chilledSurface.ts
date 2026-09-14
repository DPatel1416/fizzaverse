import { CanvasTexture, RepeatWrapping } from "three";
import { seeded } from "@/lib/quality";

let surface: { bump: CanvasTexture; roughness: CanvasTexture } | undefined;

// A shared microdroplet map complements the larger instanced water beads.
// Both maps use the label UVs; they cost no additional draw calls.
export function chilledSurface() {
  if (surface) return surface;
  const bumpCanvas = document.createElement("canvas");
  const roughCanvas = document.createElement("canvas");
  bumpCanvas.width = bumpCanvas.height = 1024;
  roughCanvas.width = roughCanvas.height = 1024;
  const bump = bumpCanvas.getContext("2d")!;
  const rough = roughCanvas.getContext("2d")!;
  bump.fillStyle = "#303030";
  bump.fillRect(0, 0, 1024, 1024);
  rough.fillStyle = "#b5b5b5";
  rough.fillRect(0, 0, 1024, 1024);
  const random = seeded(274);
  for (let i = 0; i < 1600; i++) {
    const x = random() * 1024, y = random() * 1024;
    const radius = .7 + Math.pow(random(), 2.6) * 5;
    const gradient = bump.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, "#f8f8f8");
    gradient.addColorStop(.5, "#c8c8c8");
    gradient.addColorStop(.85, "#595959");
    gradient.addColorStop(1, "#303030");
    bump.fillStyle = gradient;
    bump.beginPath(); bump.arc(x, y, radius, 0, Math.PI * 2); bump.fill();
    rough.fillStyle = "#292929";
    rough.beginPath(); rough.arc(x, y, radius, 0, Math.PI * 2); rough.fill();
  }
  const bumpMap = new CanvasTexture(bumpCanvas);
  const roughMap = new CanvasTexture(roughCanvas);
  [bumpMap, roughMap].forEach(map => {
    map.wrapS = map.wrapT = RepeatWrapping;
    map.anisotropy = 4;
  });
  surface = { bump: bumpMap, roughness: roughMap };
  return surface;
}
