import { CanvasTexture, SRGBColorSpace } from "three";
import type { Flavor } from "@/data/flavors";
// At most two resolutions for each of the six catalog flavors. All cans in a
// pack share their label instead of allocating a 2048px texture per instance.
const labels = new Map<string, CanvasTexture>();
export function makeLabel(flavor: Flavor, fruitImage: HTMLImageElement, resolution = 1024) {
  const key = `${flavor.id}:${resolution}`;
  const cached = labels.get(key);
  if (cached) return cached;
  const canvas = document.createElement("canvas");
  canvas.width = resolution;
  canvas.height = resolution;
  const c = canvas.getContext("2d")!;
  c.scale(resolution / 2048, resolution / 2048);
  c.fillStyle = flavor.primaryColor;
  c.fillRect(0, 0, 2048, 2048);
  for (let side = 0; side < 2; side++) {
    const x = side * 1024;
    c.save();
    c.translate(x, 0);
    c.beginPath(); c.rect(0, 0, 1024, 2048); c.clip();
    c.fillStyle = flavor.secondaryColor;
    c.beginPath();
    c.moveTo(820, 0);
    c.bezierCurveTo(470, 500, 1250, 1000, 590, 2048);
    c.lineTo(1100, 2048);
    c.lineTo(1100, 0);
    c.fill();
    const cellSize = fruitImage.width / 3;
    const fruitCell = { strawberry: 0, orange: 2, cherry: 3, watermelon: 4, grape: 5, lime: 6 }[flavor.fruitType];
    const drawFruit = (cell: number, xx: number, yy: number, width: number, height: number) => {
      c.drawImage(fruitImage, (cell % 3) * cellSize + 1, Math.floor(cell / 3) * cellSize + 1, cellSize - 2, cellSize - 2, xx, yy, width, height);
    };
    drawFruit(fruitCell, 15, 160, 330, 380);
    drawFruit(flavor.fruitType === "strawberry" ? 1 : fruitCell, 650, 1020, 640, 740);
    c.fillStyle = "#fff8e9";
    c.font = "bold 35px Arial";
    c.textAlign = "center";
    c.fillText("FIZZA FLAVOR DEPT.", 510, 105);
    c.save();
    c.translate(590, 1330);
    c.rotate(-Math.PI / 2);
    c.font = '1000 355px "Arial Black", Arial';
    c.textAlign = "left";
    c.fillText("FIZZA", 0, 0);
    c.restore();
    c.font = "bold 67px Arial";
    c.textAlign = "left";
    flavor.name
      .toUpperCase()
      .split(" ")
      .forEach((word, i) => c.fillText(word, 155, 1480 + i * 76));
    c.font = "28px Arial";
    c.fillText("SPARKLING SODA", 155, 1705);
    c.fillText("FRUIT WITH VOLUME.", 155, 1755);
    c.font = "30px Arial";
    c.fillText("12 FL OZ (355 mL)", 155, 1920);
    c.restore();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  labels.set(key, texture);
  return texture;
}
