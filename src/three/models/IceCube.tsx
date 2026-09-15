"use client";
import { useMemo, useRef } from "react";
import { MeshTransmissionMaterial, RoundedBox, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Color, Group, SRGBColorSpace } from "three";
import { seeded } from "@/lib/quality";

// A small refraction buffer for the closest ice; distant cubes share Three's
// physical pass. Frost and air pockets sit inside each beveled shell.
export function IceCube({ position, scale = 1, seed = 1, reduced = false, background = "#ffd6df", simple = false, environmentPlate = false }: {
  position: [number, number, number]; scale?: number; seed?: number; reduced?: boolean; background?: string; simple?: boolean; environmentPlate?: boolean;
}) {
  const ref = useRef<Group>(null);
  const scenery = useTexture("/images/cinematic-world-v2.webp");
  scenery.colorSpace = SRGBColorSpace;
  const backdrop = useMemo(() => new Color(background), [background]);
  const pockets = useMemo(() => {
    const r = seeded(seed * 31);
    return Array.from({ length: 9 }, () => [
      (r() - .5) * .43, (r() - .5) * .48, (r() - .5) * .43, .009 + r() * .024,
    ]);
  }, [seed]);
  useFrame(({ clock }, delta) => {
    if (!ref.current || reduced) return;
    const t = clock.elapsedTime;
    ref.current.position.y = position[1] + Math.sin(t * .38 + seed) * .13;
    ref.current.rotation.y += Math.min(delta, .04) * .085;
    ref.current.rotation.z = .3 + Math.sin(t * .24 + seed) * .16;
  });
  return <group ref={ref} position={position} scale={scale} rotation={[.4, seed * .8, .3]}>
    <RoundedBox args={[.74, .81, .72]} radius={.115} smoothness={3}>
      {simple ? <meshPhysicalMaterial color="#ffffff" transmission={.96} thickness={.6}
        transparent opacity={.32} ior={1.31} roughness={.045} clearcoat={.5} envMapIntensity={.65} /> :
        <MeshTransmissionMaterial background={environmentPlate ? scenery : backdrop} resolution={128} samples={3}
          color="#ffffff" transmission={1} thickness={.65} ior={1.31} roughness={.045}
          chromaticAberration={.015} distortion={.12} distortionScale={.25} temporalDistortion={0}
          clearcoat={.5} clearcoatRoughness={.08} envMapIntensity={.65} />}
    </RoundedBox>
    <RoundedBox args={[.43, .48, .41]} radius={.12} smoothness={2} rotation={[.1, .2, .14]}>
      <meshPhysicalMaterial color="#e8faff" roughness={.72} transparent opacity={.055} depthWrite={false} />
    </RoundedBox>
    {pockets.map((p, i) => <mesh key={i} position={[p[0], p[1], p[2]]} scale={[p[3], p[3] * 1.5, p[3]]}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshPhysicalMaterial color="white" roughness={.12} transparent opacity={.3} depthWrite={false} />
    </mesh>)}
    {[0, 1, 2].map(i => <mesh key={i} position={[-.1 + i * .07, .06 - i * .08, .16]} rotation={[.3, .2, .7 + i * .45]}>
      <boxGeometry args={[.22 - i * .03, .006, .06]} />
      <meshBasicMaterial color="#f3ffff" transparent opacity={.3} depthWrite={false} />
    </mesh>)}
  </group>;
}
