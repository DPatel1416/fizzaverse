"use client";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils } from "three";
import type { Flavor } from "@/data/flavors";
import type { Quality } from "@/lib/quality";
import {
  StrawberryModel,
  CitrusSlice,
  CherryModel,
  GrapeCluster,
  WatermelonSlice,
} from "../models/FruitModels";
export function Fruit({
  flavor,
  index = 0,
}: {
  flavor: Flavor;
  index?: number;
}) {
  switch (flavor.fruitType) {
    case "strawberry":
      return index % 2 ? <CitrusSlice /> : <StrawberryModel />;
    case "orange":
      return <CitrusSlice kind="orange" />;
    case "lime":
      return <CitrusSlice kind="lime" />;
    case "cherry":
      return <CherryModel />;
    case "grape":
      return <GrapeCluster />;
    case "watermelon":
      return <WatermelonSlice />;
  }
}
const placements: [number, number, number, number][] = [
  [0.0, 2.12, -1.1, 0.88],
  [3.85, 1.85, -1.8, 0.73],
  [4.12, -0.8, -0.7, 0.86],
  [-0.1, -2.1, -2.2, 0.64],
  [2.9, -2.1, -1.8, 0.64],
  [4.25, 2.9, -3.2, 0.52],
];
const mobilePlacements: [number, number, number, number][] = [
  [-1.6, 1.65, -2, 0.6],
  [2.15, 1.4, -1.7, 0.58],
  [2, -1.55, -1, 0.62],
  [-1.9, -1.7, -1.8, 0.65],
];
export function FlavorEnvironment({
  flavor,
  quality = "medium",
  density = 1,
  motionIntensity = 1,
  compact = false,
}: {
  flavor: Flavor;
  quality?: Quality;
  density?: number;
  motionIntensity?: number;
  compact?: boolean;
}) {
  const ref = useRef<Group>(null);
  const layout = compact ? mobilePlacements : placements;
  const fruitScale = flavor.fruitType === "cherry" ? 0.72 : 1;
  const count = Math.min(
    layout.length,
    flavor.fruitType === "cherry" || quality === "low" ? 4 : 6,
  );
  const entry = useRef(0);
  useEffect(() => {
    entry.current = motionIntensity ? 1 : 0;
  }, [flavor.id, motionIntensity]);
  useFrame(({ clock }, delta) => {
    entry.current = MathUtils.damp(entry.current, 0, 4, delta);
    ref.current?.children.forEach((g, i) => {
      const p = layout[i];
      g.position.x = p[0] * (1 + entry.current * 0.18);
      g.position.z = p[2] - entry.current;
      g.scale.setScalar(p[3] * fruitScale * (1 - entry.current * 0.65));
      g.position.y =
        p[1] * (1 + entry.current * 0.4) +
        Math.sin(clock.elapsedTime * 0.65 + i) * 0.1 * motionIntensity;
      g.rotation.y =
        ((i % 3) - 1) * 0.45 +
        Math.sin(clock.elapsedTime * 0.3 + i) * 0.24 * motionIntensity;
      g.rotation.z =
        Math.sin(clock.elapsedTime * 0.4 + i) * 0.15 * motionIntensity +
        (i % 2 ? 0.4 : -0.3);
    });
  });
  return (
    <group ref={ref}>
      {layout.slice(0, Math.floor(count * density)).map((p, i) => (
        <group
          key={i}
          position={[p[0], p[1], p[2]]}
          rotation={[0.25, i * 0.6, -0.3]}
          scale={p[3]}
        >
          <Fruit flavor={flavor} index={i} />
        </group>
      ))}
    </group>
  );
}
