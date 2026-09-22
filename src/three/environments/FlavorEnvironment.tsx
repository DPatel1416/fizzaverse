"use client";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils } from "three";
import type { Flavor } from "@/data/flavors";
import type { Quality } from "@/lib/quality";
import { PhotographicFruit } from "../models/PhotographicFruit";
export function Fruit({ flavor, index = 0 }: { flavor: Flavor; index?: number }) {
  return <PhotographicFruit type={flavor.fruitType} variation={index} />;
}
const placements: [number, number, number, number][] = [
  [-.25, 2.15, -.8, .7],
  [3.75, 2.25, -.8, .64],
  [4.05, -.35, .2, .72],
  [-.25, -.65, -.6, .48],
  [3.2, -2.25, -.8, .58],
  [.55, -2.6, -.8, .48],
];
const mobilePlacements: [number, number, number, number][] = [
  [-1.25, 1.05, -1, .48],
  [2.05, 1.25, -1, .44],
  [1.95, -1.65, -.8, .48],
  [-1.3, -1.7, -1, .48],
];
const productPlacements: [number, number, number, number][] = [
  [-1.6, 1.7, -.8, .48],
  [1.65, 1.6, -.8, .46],
  [1.7, -1.45, -.6, .5],
  [-1.65, -1.55, -.8, .48],
];
export function FlavorEnvironment({
  flavor,
  quality = "medium",
  motionIntensity = 1,
  compact = false,
  centered = false,
}: {
  flavor: Flavor;
  quality?: Quality;
  motionIntensity?: number;
  compact?: boolean;
  centered?: boolean;
}) {
  const ref = useRef<Group>(null);
  const layout = centered ? productPlacements : compact ? mobilePlacements : placements;
  const fruitScale = flavor.fruitType === "cherry" ? 0.72 : 1;
  const count = Math.min(
    layout.length,
    flavor.fruitType === "cherry" || quality === "low" ? 4 : 6,
  );
  const entry = useRef(0);
  useEffect(() => {
    entry.current = motionIntensity ? 1 : 0;
  }, [flavor.id, motionIntensity]);
  useFrame(({ clock, pointer }, delta) => {
    delta = Math.min(delta, .05);
    entry.current = MathUtils.damp(entry.current, 0, 4, delta);
    ref.current?.children.forEach((g, i) => {
      const p = layout[i];
      g.position.x = p[0] * (1 + entry.current * .3) + pointer.x * (.05 + i * .012) * motionIntensity;
      g.position.z = p[2] - entry.current * 3;
      g.scale.setScalar(p[3] * fruitScale * (1 - entry.current * 0.65));
      g.position.y =
        p[1] * (1 + entry.current * 0.4) +
        Math.sin(clock.elapsedTime * 0.65 + i) * 0.1 * motionIntensity;
      g.rotation.y =
        ((i % 3) - 1) * 0.45 + entry.current * (i % 2 ? 1.5 : -1.5) +
        Math.sin(clock.elapsedTime * 0.3 + i) * 0.24 * motionIntensity;
      g.rotation.z =
        Math.sin(clock.elapsedTime * 0.4 + i) * 0.15 * motionIntensity +
        (i % 2 ? 0.4 : -0.3);
    });
  });
  return (
    <group ref={ref}>
      {layout.slice(0, count).map((p, i) => (
        <group
          key={i}
          position={[p[0], p[1], p[2]]}
          rotation={[0.25, i * 0.6, -0.3]}
          scale={p[3]}
        >
          <Fruit flavor={flavor} index={i === 3 ? 4 : i === 4 ? 3 : i} />
        </group>
      ))}
    </group>
  );
}
