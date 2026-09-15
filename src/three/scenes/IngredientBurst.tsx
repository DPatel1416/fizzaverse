"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, Group, InstancedMesh, MathUtils, Object3D, PlaneGeometry } from "three";
import type { Flavor } from "@/data/flavors";
import { seeded } from "@/lib/quality";
import { PhotographicFruit } from "../models/PhotographicFruit";
import { cinematic } from "../cinematicState";
import { BubbleMaterial } from "../particles/BubbleSystem";
const smooth = MathUtils.smoothstep;
const paths = [
  { out: [-2.5, -1.1, 7.5], end: [-1.35, -.65, .8], size: .65 },
  { out: [2.2, 1.4, 7], end: [1.5, 1.05, -.7], size: .57 },
  { out: [-4.8, 2.1, 2], end: [-1.65, 1.05, -.6], size: .52 },
  { out: [4.7, -2, 3], end: [1.6, -.9, .4], size: .58 },
  { out: [.9, 3.4, -1.5], end: [.85, -1.7, -1], size: .36 },
  { out: [-3.2, -3.1, -2], end: [-.8, -1.65, -1.5], size: .4 },
];
function FlyingFruit({ flavor, index, mobile }: { flavor: Flavor; index: number; mobile: boolean }) {
  const ref = useRef<Group>(null);
  const defocus = useRef(0);
  useFrame(({ size, clock }) => {
    const g = ref.current;
    if (!g) return;
    const p = cinematic.progress, path = paths[index];
    g.visible = p > .415;
    const blast = 1 - Math.pow(1 - smooth(p, .42 + index * .005, .65), 3);
    const returnHome = smooth(p, .65 + index * .008, .96);
    const unit = 2 * Math.tan(Math.PI / 9) * 10 / size.height;
    const cx = (cinematic.to.x - size.width / 2) * unit;
    const cy = (size.height / 2 - cinematic.to.y) * unit;
    const scale = cinematic.to.scale;
    g.position.set(
      MathUtils.lerp(path.out[0] * blast * (mobile ? .32 : 1), cx + path.end[0] * scale, returnHome),
      MathUtils.lerp(path.out[1] * blast * (mobile ? .55 : 1), cy + path.end[1] * scale * (mobile ? .7 : 1), returnHome) + Math.sin(clock.elapsedTime * .55 + index) * .06 * returnHome,
      MathUtils.lerp(-3 + (path.out[2] + 3) * blast, path.end[2], returnHome),
    );
    const born = smooth(p, .416, .445);
    g.scale.setScalar(born * MathUtils.lerp(.8, path.size * scale * (mobile ? .78 : 1), returnHome));
    g.rotation.set(0, 0, (index % 2 ? 1 : -1) * (.1 + blast * .7 * (1 - returnHome)) + Math.sin(clock.elapsedTime * .2 + index) * .04 * returnHome);
    defocus.current = Math.max(0, (g.position.z - 2.5) / 4.5) * (1 - returnHome);
  });
  return <group ref={ref} visible={false}>
    <PhotographicFruit type={flavor.fruitType} variation={index} defocus={defocus} />
  </group>;
}

function FlyingParticles({ mobile }: { mobile: boolean }) {
  const drops = useRef<InstancedMesh>(null), leaves = useRef<InstancedMesh>(null);
  const count = mobile ? 38 : 78;
  const dummy = useMemo(() => new Object3D(), []);
  const particles = useMemo(() => {
    const r = seeded(204);
    return Array.from({ length: count }, (_, i) => ({ angle: i * 2.399, radius: 3 + r() * 7, z: -2 + r() * 9, size: .018 + r() * .065, phase: r() * 6.28 }));
  }, [count]);
  const leaf = useMemo(() => {
    const geometry = new PlaneGeometry(1, 1, 8, 16);
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const t = pos.getY(i) + .5;
      const x = pos.getX(i) * Math.sin(t * Math.PI) * .8;
      pos.setXYZ(i, x, pos.getY(i), Math.sin(t * Math.PI) * .1 + Math.abs(x) * .18);
    }
    geometry.computeVertexNormals(); return geometry;
  }, []);
  useEffect(() => () => leaf.dispose(), [leaf]);
  useFrame(({ size, clock }) => {
    if (!drops.current || !leaves.current) return;
    const p = cinematic.progress;
    drops.current.visible = leaves.current.visible = p > .42;
    const blast = 1 - Math.pow(1 - smooth(p, .42, .64), 4);
    const settle = smooth(p, .68, .98);
    const unit = 2 * Math.tan(Math.PI / 9) * 10 / size.height;
    const cx = (cinematic.to.x - size.width / 2) * unit, cy = (size.height / 2 - cinematic.to.y) * unit;
    const born = smooth(p, .42, .455);
    particles.forEach((particle, i) => {
      const a = particle.angle;
      dummy.position.set(
        MathUtils.lerp(Math.cos(a) * particle.radius * blast, cx + Math.cos(a) * (1.5 + i % 3 * .25), settle),
        MathUtils.lerp(Math.sin(a) * particle.radius * blast, cy + ((Math.sin(a) * 1.8 + clock.elapsedTime * .13 + 20) % 4.8) - 2.4, settle),
        MathUtils.lerp(-2 + particle.z * blast, -1 + Math.sin(a) * 1.5, settle),
      );
      dummy.rotation.set(a + blast, a * .7, a + clock.elapsedTime * .08);
      dummy.scale.setScalar(particle.size * born);
      dummy.updateMatrix(); drops.current!.setMatrixAt(i, dummy.matrix);
      if (i < 10) {
        dummy.scale.set(.19 * born, .32 * born, .2 * born);
        dummy.updateMatrix(); leaves.current!.setMatrixAt(i, dummy.matrix);
      }
    });
    drops.current.instanceMatrix.needsUpdate = true;
    leaves.current.instanceMatrix.needsUpdate = true;
  });
  return <>
    <instancedMesh ref={drops} args={[undefined, undefined, count]} visible={false} frustumCulled={false}>
      <sphereGeometry args={[1, 20, 16]} />
      <BubbleMaterial />
    </instancedMesh>
    <instancedMesh ref={leaves} args={[leaf, undefined, 10]} visible={false} frustumCulled={false}>
      <meshPhysicalMaterial color="#467328" side={DoubleSide} roughness={.48} clearcoat={.2} />
    </instancedMesh>
  </>;
}
export function IngredientBurst({ flavor, mobile }: { flavor: Flavor; mobile: boolean }) {
  return <>
    {paths.slice(0, mobile ? 4 : 6).map((_, i) => <FlyingFruit key={i} flavor={flavor} index={i} mobile={mobile} />)}
    <FlyingParticles mobile={mobile} />
  </>;
}
