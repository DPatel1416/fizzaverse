"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { InstancedMesh, Object3D } from "three";
import { seeded } from "@/lib/quality";
const vertex = `varying vec3 vNormal; varying vec3 vView; void main(){vec4 p=modelViewMatrix*instanceMatrix*vec4(position,1.);vNormal=normalize(normalMatrix*mat3(instanceMatrix)*normal);vView=-p.xyz;gl_Position=projectionMatrix*p;}`;
const fragment = `varying vec3 vNormal; varying vec3 vView; void main(){vec3 n=normalize(vNormal);vec3 v=normalize(vView);float edge=pow(1.-abs(dot(n,v)),2.8);float shine=pow(max(dot(n,normalize(vec3(-.55,.65,.8))),0.),38.);float secondary=pow(max(dot(n,normalize(vec3(.7,-.4,.55))),0.),55.);vec3 iridescent=mix(vec3(1.,.69,.78),vec3(.72,.92,1.),n.y*.5+.5);vec3 col=mix(iridescent,vec3(1.),shine);float alpha=clamp(edge*.7+shine*.9+secondary*.4,0.,.92);gl_FragColor=vec4(col,alpha);}`;
export function BubbleSystem({
  count = 35,
  reduced = false,
  burst = 0,
}: {
  count?: number;
  reduced?: boolean;
  burst?: number;
}) {
  const ref = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const bubbles = useMemo(() => {
    const r = seeded(11);
    return Array.from({ length: count }, () => ({
      x: (r() - 0.5) * 15,
      y: (r() - 0.5) * 9,
      z: (r() - 0.5) * 6,
      s: 0.025 + r() * 0.19,
      speed: 0.1 + r() * 0.24,
      p: r() * 6.28,
    }));
  }, [count]);
  useFrame(({ clock }) => {
    const t = reduced ? 0 : clock.elapsedTime;
    bubbles.forEach((b, i) => {
      dummy.position.set(
        b.x + Math.sin(t * 0.25 + b.p) * 0.25,
        ((b.y + 4.5 + t * b.speed) % 9) - 4.5,
        b.z,
      );
      dummy.scale.setScalar(b.s * (1 + burst * 0.6));
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 20, 16]} />
      <BubbleMaterial />
    </instancedMesh>
  );
}
export function BubbleMaterial() {
  return <shaderMaterial vertexShader={vertex} fragmentShader={fragment} transparent depthWrite={false} />;
}
