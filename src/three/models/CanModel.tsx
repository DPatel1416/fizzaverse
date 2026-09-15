"use client";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { BackSide, DoubleSide, Group, Vector2, InstancedMesh, Object3D, LatheGeometry, Shape, Path, ExtrudeGeometry } from "three";
import { useTexture } from "@react-three/drei";
import { FRUIT_ATLAS } from "./PhotographicFruit";
import { ColdMist } from "./ColdMist";
import type { Flavor } from "@/data/flavors";
import { makeLabel } from "../materials/label";
import { chilledSurface } from "../materials/chilledSurface";
import { seeded, qualityProfiles, type Quality } from "@/lib/quality";

const profile = [
  [.49,-1.4], [.505,-1.389], [.526,-1.36], [.543,-1.32],
  [.551,-1.28], [.568,-1.24], [.591,-1.195], [.607,-1.145],
  [.615,-1.09], [.618,-1.02], [.618,.99], [.616,1.055],
  [.608,1.108], [.594,1.155], [.574,1.202], [.551,1.245],
  [.536,1.28], [.530,1.315], [.530,1.344], [.537,1.365],
].map(([r,y]) => new Vector2(r,y));

function radiusAt(y: number) {
  for (let i = 1; i < profile.length; i++) {
    if (y <= profile[i].y) {
      const a = profile[i-1], b = profile[i];
      return a.x + (b.x-a.x)*(y-a.y)/(b.y-a.y);
    }
  }
  return .53;
}

export function CanModel({
  flavor, quality = "medium", exploded = 0, condensation = true,
  chill = false, reduced = false, mistIntensity, lidRef, ...props
}: {
  flavor: Flavor; quality?: Quality; exploded?: number;
  lidRef?: RefObject<Group | null>; condensation?: boolean;
  chill?: boolean; reduced?: boolean; mistIntensity?: RefObject<number>;
  position?: [number, number, number]; rotation?: [number, number, number]; scale?: number;
}) {
  const fruitAtlas = useTexture(FRUIT_ATLAS);
  const cold = useMemo(() => chilledSurface(), []);
  const texture = useMemo(() => makeLabel(flavor, fruitAtlas.image), [flavor, fruitAtlas.image]);
  useEffect(() => () => texture.dispose(), [texture]);
  const n = quality === "high" ? 128 : quality === "medium" ? 80 : 56;
  const labelGeometry = useMemo(() => {
    const geometry = new LatheGeometry(profile.slice(3, -2), n);
    const uv = geometry.attributes.uv, pos = geometry.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setY(i, (pos.getY(i) + 1.35) / 2.71);
    uv.needsUpdate = true;
    return geometry;
  }, [n]);
  const tabGeometry = useMemo(() => {
    const s = new Shape();
    s.moveTo(-.08,-.19); s.quadraticCurveTo(-.115,-.19,-.115,-.15);
    s.lineTo(-.115,.12); s.quadraticCurveTo(-.115,.19,-.055,.195);
    s.lineTo(.055,.195); s.quadraticCurveTo(.115,.19,.115,.12);
    s.lineTo(.115,-.15); s.quadraticCurveTo(.115,-.19,.08,-.19); s.closePath();
    const hole = new Path();
    hole.absellipse(0,.055,.066,.098,0,Math.PI*2,true,0);
    s.holes.push(hole);
    return new ExtrudeGeometry(s, { depth: .018, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: .007, bevelThickness: .005, curveSegments: 20 });
  }, []);
  const base = useMemo(() => [
    new Vector2(0,-1.29), new Vector2(.18,-1.296), new Vector2(.32,-1.315),
    new Vector2(.40,-1.348), new Vector2(.455,-1.38), new Vector2(.49,-1.387),
  ], []);
  useEffect(() => () => labelGeometry.dispose(), [labelGeometry]);
  useEffect(() => () => tabGeometry.dispose(), [tabGeometry]);
  const metal = <meshPhysicalMaterial color="#e4e8e8" metalness={1} roughness={.29}
    roughnessMap={cold.metal} anisotropy={.55} clearcoat={.25} clearcoatRoughness={.12} />;
  return <group {...props}>
    <mesh>
      <latheGeometry args={[profile,n]} />
      {metal}
    </mesh>
    <mesh geometry={labelGeometry} rotation={[0,-.9,0]} scale={[1.002,1,1.002]}>
      <meshPhysicalMaterial map={texture} bumpMap={condensation ? cold.bump : undefined} bumpScale={.006}
        roughnessMap={condensation ? cold.roughness : undefined} metalness={.28} roughness={.34}
        clearcoat={1} clearcoatRoughness={.13} envMapIntensity={.85} />
    </mesh>

    {/* The stationary neck and inner wall remain convincing when the lid lifts. */}
    <mesh position={[0,1.335,0]} rotation={[Math.PI/2,0,0]}>
      <torusGeometry args={[.529,.012,8,n]} />{metal}
    </mesh>
    <mesh position={[0,1.11,0]}>
      <cylinderGeometry args={[.516,.52,.45,n,1,true]} />
      <meshStandardMaterial color="#718185" metalness={.85} roughness={.36} side={BackSide} />
    </mesh>
    <mesh position={[0,.897,0]} rotation={[-Math.PI/2,0,0]}>
      <circleGeometry args={[.517,n]} />
      <meshPhysicalMaterial color={flavor.primaryColor} roughness={.12} metalness={.1} clearcoat={1} />
    </mesh>

    <group ref={lidRef} position={[0,exploded*.6,0]}>
      <mesh position={[0,1.38,0]} rotation={[Math.PI/2,0,0]}>
        <torusGeometry args={[.535,.024,16,n]} />{metal}
      </mesh>
      <mesh position={[0,1.361,0]} rotation={[Math.PI/2,0,0]}>
        <torusGeometry args={[.524,.012,10,n]} />
        <meshStandardMaterial color="#929da2" metalness={1} roughness={.22} />
      </mesh>
      <mesh position={[0,1.351,0]}>
        <cylinderGeometry args={[.519,.519,.024,n]} />{metal}
      </mesh>
      <mesh position={[0,1.368,0]} rotation={[Math.PI/2,0,0]}>
        <torusGeometry args={[.462,.009,8,n]} />{metal}
      </mesh>
      <mesh position={[0,1.367,0]} rotation={[Math.PI/2,0,0]}>
        <torusGeometry args={[.438,.0035,6,n]} />
        <meshStandardMaterial color="#8a999e" metalness={1} roughness={.32} />
      </mesh>
      <mesh position={[0,1.367,-.225]} rotation={[-Math.PI/2,0,0]} scale={[.147,.188,1]}>
        <circleGeometry args={[1,48]} />
        <meshStandardMaterial color="#24383e" metalness={.55} roughness={.3} />
      </mesh>
      <mesh position={[0,1.37,-.225]} rotation={[Math.PI/2,0,0]} scale={[.78,1,1]}>
        <torusGeometry args={[.184,.0035,6,48]} />
        <meshStandardMaterial color="#d2dddd" metalness={1} roughness={.28} />
      </mesh>
      <mesh geometry={tabGeometry} position={[0,1.389,.025]} rotation={[-Math.PI/2,0,0]}>
        {metal}
      </mesh>
      <mesh position={[0,1.418,.16]} scale={[1,.24,1]}>
        <sphereGeometry args={[.039,20,12]} />{metal}
      </mesh>
    </group>

    <mesh position={[0,-1.375,0]} rotation={[Math.PI/2,0,0]}>
      <torusGeometry args={[.503,.024,12,n]} />{metal}
    </mesh>
    <mesh>
      <latheGeometry args={[base,n]} />
      <meshPhysicalMaterial color="#b8c3c7" metalness={1} roughness={.32} roughnessMap={cold.metal} side={DoubleSide} />
    </mesh>
    {condensation && <Condensation count={qualityProfiles[quality].droplets} quality={quality} reduced={reduced} />}
    {chill && <ColdMist quality={quality} reduced={reduced} intensity={mistIntensity} />}
  </group>;
}

function Condensation({ count, quality, reduced }: { count: number; quality: Quality; reduced: boolean }) {
  const ref = useRef<InstancedMesh>(null);
  const moving = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const streams = quality === "low" ? 3 : 7;
  useEffect(() => {
    const random = seeded(43), o = new Object3D();
    for (let i=0; i<count; i++) {
      const a = random()*Math.PI*2, y=(random()-.5)*2.45;
      const s=.004+Math.pow(random(),3)*.022;
      // Embed the flattened bead into the shell instead of floating a sphere above it.
      o.position.set(Math.sin(a)*(radiusAt(y)+s*.2),y,Math.cos(a)*(radiusAt(y)+s*.2));
      o.scale.set(s,s*(1+random()*.7),s*.52);
      o.rotation.set(0,a,0); o.updateMatrix(); ref.current!.setMatrixAt(i,o.matrix);
    }
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [count]);
  useFrame(({ clock }) => {
    if (!moving.current) return;
    const t = reduced ? 0 : clock.elapsedTime;
    for (let i=0; i<streams; i++) {
      const phase = (i*.173+t*(.019+i*.0015))%1;
      const y = 1.04-phase*2.12, a=.24+i*2.399, r=radiusAt(y)+.007;
      dummy.position.set(Math.sin(a)*r,y,Math.cos(a)*r);
      dummy.rotation.set(0,a,0);
      const s=.016+(i%3)*.003;
      dummy.scale.set(s,s*(1.4+Math.sin(phase*Math.PI)*.7),s*.55);
      dummy.updateMatrix(); moving.current.setMatrixAt(i,dummy.matrix);
    }
    moving.current.instanceMatrix.needsUpdate = true;
  });
  const water = <meshPhysicalMaterial color="#f4fcff" metalness={0} roughness={.035} ior={1.333}
    transmission={.98} thickness={.015} clearcoat={1} clearcoatRoughness={.025} envMapIntensity={.75} />;
  return <>
    <instancedMesh ref={ref} args={[undefined,undefined,count]} frustumCulled={false} raycast={() => {}}>
      <sphereGeometry args={[1,quality === "low" ? 12 : 16,quality === "low" ? 8 : 12]} />
      {water}
    </instancedMesh>
    <instancedMesh ref={moving} args={[undefined,undefined,streams]} frustumCulled={false} raycast={() => {}}>
      <sphereGeometry args={[1,24,16]} />{water}
    </instancedMesh>
  </>;
}

