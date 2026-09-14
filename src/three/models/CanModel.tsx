"use client";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Group, Vector2, InstancedMesh, Object3D, LatheGeometry } from "three";
import { useTexture } from "@react-three/drei";
import { FRUIT_ATLAS } from "./PhotographicFruit";
import type { Flavor } from "@/data/flavors";
import { makeLabel } from "../materials/label";
import { chilledSurface } from "../materials/chilledSurface";
import { seeded, qualityProfiles, type Quality } from "@/lib/quality";
export function CanModel({
  flavor,
  quality = "medium",
  exploded = 0,
  condensation = true,
  lidRef,
  ...props
}: {
  flavor: Flavor;
  quality?: Quality;
  exploded?: number;
  lidRef?: RefObject<Group | null>;
  condensation?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  const fruitAtlas = useTexture(FRUIT_ATLAS);
  const cold = useMemo(() => chilledSurface(), []);
  const texture = useMemo(() => makeLabel(flavor, fruitAtlas.image), [flavor, fruitAtlas.image]);
  useEffect(() => () => texture.dispose(), [texture]);
  const points = useMemo(
    () => [
      new Vector2(0.49, -1.4),
      new Vector2(0.51, -1.39),
      new Vector2(0.54, -1.35),
      new Vector2(0.55, -1.29),
      new Vector2(0.59, -1.22),
      new Vector2(0.615, -1.12),
      new Vector2(0.618, -1.02),
      new Vector2(0.618, 1.02),
      new Vector2(0.61, 1.13),
      new Vector2(0.585, 1.21),
      new Vector2(0.545, 1.28),
      new Vector2(0.535, 1.36),
      new Vector2(0.53, 1.39),
    ],
    [],
  );
  const n = qualityProfiles[quality].segments;
  const labelGeometry = useMemo(() => {
    const geometry = new LatheGeometry(points.slice(2, -1), n);
    const uv = geometry.attributes.uv;
    const pos = geometry.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setY(i, (pos.getY(i) + 1.35) / 2.71);
    uv.needsUpdate = true;
    return geometry;
  }, [points, n]);
  useEffect(() => () => labelGeometry.dispose(), [labelGeometry]);
  return (
    <group {...props}>
      <mesh>
        <latheGeometry args={[points, n]} />
        <meshPhysicalMaterial
          color="#d8d9d8"
          metalness={0.96}
          roughness={0.23}
          clearcoat={0.4}
        />
      </mesh>
      <mesh
        geometry={labelGeometry}
        rotation={[0, -0.9, 0]}
        scale={[1.001, 1, 1.001]}
      >
        <meshPhysicalMaterial
          map={texture}
          bumpMap={condensation ? cold.bump : undefined}
          bumpScale={.014}
          roughnessMap={condensation ? cold.roughness : undefined}
          metalness={0.38}
          roughness={0.36}
          clearcoat={0.8}
          clearcoatRoughness={0.22}
        />
      </mesh>
      <group ref={lidRef} position={[0, exploded * 0.6, 0]}>
        <mesh position={[0, 1.385, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.528, 0.029, 12, n]} />
          <meshStandardMaterial
            color="#e2e5e4"
            metalness={1}
            roughness={0.18}
          />
        </mesh>
        <mesh position={[0, 1.365, 0]}>
          <cylinderGeometry args={[0.52, 0.52, 0.027, n]} />
          <meshStandardMaterial
            color="#bac2c4"
            metalness={0.98}
            roughness={0.29}
          />
        </mesh>
        <mesh position={[0, 1.386, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.451, 0.008, 6, n]} />
          <meshStandardMaterial
            color="#7b898e"
            metalness={1}
            roughness={0.27}
          />
        </mesh>
        <mesh
          position={[0, 1.385, -0.21]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[0.14, 0.2, 1]}
        >
          <circleGeometry args={[1, 32]} />
          <meshStandardMaterial
            color="#27383d"
            metalness={0.8}
            roughness={0.35}
          />
        </mesh>
        <group
          position={[0, 1.409, 0.016]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[0.7, 1, 1]}
        >
          <mesh>
            <torusGeometry args={[0.145, 0.042, 12, 32]} />
            <meshStandardMaterial
              color="#f1f1ec"
              metalness={1}
              roughness={0.19}
            />
          </mesh>
        </group>
        <mesh position={[0, 1.4, 0.13]}>
          <sphereGeometry args={[0.039, 12, 8]} />
          <meshStandardMaterial color="#d2d6d6" metalness={1} roughness={0.2} />
        </mesh>
      </group>
      <mesh position={[0, -1.373, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.511, 0.033, 12, n]} />
        <meshStandardMaterial color="#d6d9d8" metalness={1} roughness={0.21} />
      </mesh>
      <mesh position={[0, -1.373, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.022, n]} />
        <meshStandardMaterial color="#a7afb3" metalness={1} roughness={0.36} />
      </mesh>
      {condensation && (
        <Condensation count={qualityProfiles[quality].droplets} />
      )}
    </group>
  );
}
function Condensation({ count }: { count: number }) {
  const ref = useRef<InstancedMesh>(null);
  useEffect(() => {
    const random = seeded(43),
      o = new Object3D();
    for (let i = 0; i < count; i++) {
      const a = random() * Math.PI * 2,
        y = (random() - 0.5) * 2.3,
        r = 0.624;
      const s = 0.005 + Math.pow(random(), 2.4) * 0.024;
      o.position.set(Math.sin(a) * r, y, Math.cos(a) * r);
      o.scale.set(s, s * (1 + random() * 0.9), s * 0.65);
      o.rotation.set(0, a, 0);
      o.updateMatrix();
      ref.current!.setMatrixAt(i, o.matrix);
    }
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [count]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshPhysicalMaterial
        color="#fff"
        metalness={0}
        roughness={0.025}
        ior={1.33}
        transmission={.96}
        thickness={.012}
        clearcoat={.65}
        clearcoatRoughness={.04}
        envMapIntensity={1.1}
      />
    </instancedMesh>
  );
}
