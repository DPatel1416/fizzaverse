"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CatmullRomCurve3, Color, Group, MathUtils, MeshPhysicalMaterial, PointLight, Vector3 } from "three";
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

export function LiquidRibbon({ flavor, reduced = false, ingredient = false }: {
  flavor: Flavor; reduced?: boolean; ingredient?: boolean;
}) {
  const ref = useRef<Group>(null);
  const material = useRef<MeshPhysicalMaterial>(null);
  const initialColor = useRef(flavor.primaryColor);
  const target = useMemo(() => new Color(flavor.primaryColor), [flavor.primaryColor]);
  const curve = useMemo(() => new CatmullRomCurve3([
    new Vector3(-5, -2.6, -3), new Vector3(-2, -2.9, -2),
    new Vector3(2.2, -1.9, -3), new Vector3(4.5, .3, -4),
    new Vector3(3.3, 3.2, -5), new Vector3(.3, 4.2, -5),
  ]), []);
  useFrame(({ clock, pointer }, delta) => {
    if (!ref.current) return;
    const t = reduced ? 0 : clock.elapsedTime;
    ref.current.rotation.z = Math.sin(t * .15) * .06 + (reduced ? 0 : pointer.x * .015);
    ref.current.position.y = Math.sin(t * .32) * .08;
    material.current?.color.lerp(target, 1 - Math.exp(-3 * Math.min(delta, .05)));
  });
  return <group ref={ref} scale={ingredient ? .75 : 1}>
    <mesh scale={[1, 1, .38]}>
      <tubeGeometry args={[curve, 80, ingredient ? .12 : .19, 10, false]} />
      <meshPhysicalMaterial ref={material} color={initialColor.current} metalness={.22} roughness={.14}
        clearcoat={1} clearcoatRoughness={.09} envMapIntensity={1.6} />
    </mesh>
    <mesh position={[0, -.21, -.2]} scale={[1, 1, .38]}>
      <tubeGeometry args={[curve, 64, .035, 8, false]} />
      <meshPhysicalMaterial color={flavor.accentColor} metalness={.3} roughness={.19} clearcoat={1} />
    </mesh>
  </group>;
}

export function ChilledAtmosphere({ flavor, reduced = false, mobile = false, ingredient = false }: {
  flavor: Flavor; reduced?: boolean; mobile?: boolean; ingredient?: boolean;
}) {
  return <>
    <FlavorLight flavor={flavor} reduced={reduced} />
    {ingredient && <LiquidRibbon flavor={flavor} reduced={reduced} ingredient />}
    <IceCube position={ingredient ? [-1.75, 1.05, -.9] : [3.55, .15, 1.5]} scale={ingredient ? .65 : .85} seed={2} reduced={reduced} background={ingredient ? "#fff5eb" : flavor.backgroundColor} />
    <IceCube position={ingredient ? [1.8, -.8, 1] : [-.15, -1.65, .8]} scale={ingredient ? .5 : .65} seed={4} reduced={reduced} background={ingredient ? "#fff5eb" : flavor.backgroundColor} simple={mobile} />
  </>;
}
