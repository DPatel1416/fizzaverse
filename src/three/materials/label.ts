import { CanvasTexture, SRGBColorSpace } from "three";
import type { Flavor } from "@/data/flavors";
function citrus(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.3);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * 1.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff7cc";
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.88, r * 1.06, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 9; i++) {
    ctx.save();
    ctx.scale(1, 1.2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(
      0,
      0,
      r * 0.79,
      (i * Math.PI * 2) / 9 + 0.045,
      ((i + 1) * Math.PI * 2) / 9 - 0.045,
    );
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
export function makeLabel(flavor: Flavor) {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 2048;
  const c = canvas.getContext("2d")!;
  c.fillStyle = flavor.primaryColor;
  c.fillRect(0, 0, 2048, 2048);
  for (let side = 0; side < 2; side++) {
    const x = side * 1024;
    c.save();
    c.translate(x, 0);
    c.fillStyle = flavor.secondaryColor;
    c.beginPath();
    c.moveTo(820, 0);
    c.bezierCurveTo(470, 500, 1250, 1000, 590, 2048);
    c.lineTo(1100, 2048);
    c.lineTo(1100, 0);
    c.fill();
    c.globalAlpha = 0.18;
    c.fillStyle = "#fff";
    for (let n = 0; n < 22; n++) {
      c.beginPath();
      c.arc(
        (n * 173) % 1024,
        (n * 239) % 2048,
        15 + (n % 4) * 16,
        0,
        Math.PI * 2,
      );
      c.fill();
    }
    c.globalAlpha = 1;
    c.fillStyle = "#fff8e9";
    c.font = "bold 35px Arial";
    c.textAlign = "center";
    c.fillText("BRIGHTER DAYS AHEAD", 510, 105);
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
    c.fillText("REAL FRUIT. FEEL-GOOD FIZZ.", 155, 1755);
    c.font = "30px Arial";
    c.fillText("12 FL OZ (355 mL)", 155, 1920);
    if (["strawberry", "orange", "lime"].includes(flavor.fruitType))
      citrus(
        c,
        855,
        1410,
        220,
        flavor.fruitType === "orange"
          ? "#ffb22c"
          : flavor.fruitType === "lime"
            ? "#b5d947"
            : "#ffdc37",
      );
    else {
      c.fillStyle = flavor.accentColor;
      c.beginPath();
      c.arc(830, 1270, 220, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = flavor.primaryColor;
      c.font = "bold 65px Arial";
      c.textAlign = "center";
      c.fillText("GOOD", 830, 1250);
      c.fillText("MOOD", 830, 1325);
    }
    if (flavor.fruitType === "strawberry") {
      c.save();
      c.translate(220, 300);
      c.rotate(0.2);
      c.fillStyle = "#b71335";
      c.beginPath();
      c.moveTo(-100, -50);
      c.bezierCurveTo(-190, 40, -30, 260, 10, 270);
      c.bezierCurveTo(80, 260, 205, 30, 110, -45);
      c.bezierCurveTo(60, -85, -50, -85, -100, -50);
      c.fill();
      c.fillStyle = "#ffe198";
      for (let n = 0; n < 22; n++) {
        c.beginPath();
        c.ellipse(
          -80 + ((n * 43) % 175),
          -10 + Math.floor(n / 5) * 45,
          4,
          8,
          0.2,
          0,
          Math.PI * 2,
        );
        c.fill();
      }
      c.fillStyle = "#346d37";
      for (let n = 0; n < 5; n++) {
        c.save();
        c.rotate(n * 1.25);
        c.beginPath();
        c.ellipse(0, -48, 20, 65, 0, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
      c.restore();
    }
    c.restore();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
