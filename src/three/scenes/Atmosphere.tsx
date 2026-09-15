"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, MathUtils, PointLight } from "three";
import type { Flavor } from "@/data/flavors";
import { IceCube } from "../models/IceCube";

export function FlavorLight({ flavor, reduced = false }: { flavor: Flavor; reduced?: boolean }) {
  const ref = useRef<PointLight>(null);
  const sweep = useRef(0);
  const color = useMemo(() => new Color(flavor.accentColor), [flavor.accentColor]);
  useEffect(() => { sweep.current = reduced ? 0 : 1; }, [flavor.id, reduced]);
  useFrame(({ clock }, delta) => {
    sweep.current = MathUtils.damp(sweep.current, 0, 2.8, Math.min(delta, .05));
    if (!ref.current) return;
    ref.current.color.lerp(color, .06);
    ref.current.position.set(-4 + 10 * (1 - sweep.current), 3, 4);
    ref.current.intensity = 12 + sweep.current * 48 + (reduced ? 0 : Math.sin(clock.elapsedTime * .6) * 2);
  });
  return <pointLight ref={ref} position={[-4, 3, 4]} intensity={18} distance={18} decay={2} />;
}

export function ChilledAtmosphere({ flavor, reduced = false, mobile = false, ingredient = false }: {
  flavor: Flavor; reduced?: boolean; mobile?: boolean; ingredient?: boolean;
}) {
  return <>
    <FlavorLight flavor={flavor} reduced={reduced} />
    <IceCube position={ingredient ? [-1.75, 1.05, -.9] : [3.55, .15, 1.5]} scale={ingredient ? .65 : .85} seed={2} reduced={reduced} background={flavor.backgroundColor} />
    <IceCube position={ingredient ? [1.8, -.8, 1] : [-.15, -1.65, .8]} scale={ingredient ? .5 : .65} seed={4} reduced={reduced} background={flavor.backgroundColor} simple={mobile} />
  </>;
}
