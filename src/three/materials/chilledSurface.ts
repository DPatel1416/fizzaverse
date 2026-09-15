import { CanvasTexture, RepeatWrapping } from "three";
import { seeded } from "@/lib/quality";

let surface: { bump: CanvasTexture; roughness: CanvasTexture; metal: CanvasTexture } | undefined;

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
  for (let i = 0; i < 2800; i++) {
    const x = random() * 1024, y = random() * 1024;
    const radius = .5 + Math.pow(random(), 2.8) * 3.8;
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
  const metalCanvas = document.createElement("canvas");
  metalCanvas.width = metalCanvas.height = 512;
  const metal = metalCanvas.getContext("2d")!;
  metal.fillStyle = "#bdbdbd"; metal.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y++) {
    const tone = Math.floor(155 + random() * 70);
    metal.fillStyle = `rgb(${tone},${tone},${tone})`;
    metal.fillRect(0, y, 512, 1);
  }
  const metalMap = new CanvasTexture(metalCanvas);
  [bumpMap, roughMap, metalMap].forEach(map => {
    map.wrapS = map.wrapT = RepeatWrapping;
    map.anisotropy = 4;
  });
  surface = { bump: bumpMap, roughness: roughMap, metal: metalMap };
  return surface;
}
