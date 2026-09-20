"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { InstancedMesh, Object3D } from "three";
import { seeded } from "@/lib/quality";

const vertex = `
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vec4 p = modelViewMatrix * instanceMatrix * vec4(position, 1.);
  vNormal = normalize(normalMatrix * mat3(instanceMatrix) * normal);
  vView = -p.xyz;
  gl_Position = projectionMatrix * p;
}`;

// Clear centers and thin optical rims avoid the opaque appearance of soap.
const fragment = `
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(vView);
  float rim = pow(1. - abs(dot(n, v)), 4.5);
  float glint = pow(max(dot(n, normalize(vec3(-.45, .7, .6))), 0.), 90.);
  float bounce = pow(max(dot(n, normalize(vec3(.5, -.65, .55))), 0.), 110.);
  float light = smoothstep(-.55, .65, n.y);
  vec3 reflection = mix(vec3(.16, .18, .19), vec3(.96, .99, 1.), light);
  vec3 color = mix(reflection, vec3(1.), clamp(glint + bounce, 0., 1.));
  float alpha = rim * .42 + glint * .7 + bounce * .24;
  gl_FragColor = vec4(color, min(alpha, .78));
}`;

export function BubbleSystem({ count = 90, reduced = false, burst = 0, hero = false }: {
  count?: number;
  reduced?: boolean;
  burst?: number;
  hero?: boolean;
}) {
  const ref = useRef<InstancedMesh>(null);
  const time = useRef(0);
  const dummy = useMemo(() => new Object3D(), []);
  const bubbles = useMemo(() => {
    const r = seeded(11);
    return Array.from({ length: count }, (_, i) => {
      const size = .014 + Math.pow(r(), 3) * .075;
      // Loose nucleation streams surround the product, leaving the copy quiet.
      const lane = hero ? [.06, .16, .59, .7, .81, .94][i % 6] : r();
      return {
        x: lane + (r() - .5) * .06,
        y: r(), z: -1 - r() * 3,
        size, speed: .18 + r() * .18 + size * 4,
        phase: r() * Math.PI * 2,
      };
    });
  }, [count, hero]);
  useFrame(({ viewport }, delta) => {
    if (!ref.current) return;
    if (!reduced) time.current += Math.min(delta, .05);
    const t = reduced ? 0 : time.current;
    bubbles.forEach((b, i) => {
      const depth = 1 - b.z / 10;
      const span = viewport.height * depth * 1.25;
      const rise = (b.y + t * b.speed / span) % 1;
      dummy.position.set(
        (b.x - .5) * viewport.width * depth + Math.sin(t * 1.4 + b.phase) * .035,
        (rise - .5) * span,
        b.z,
      );
      const size = b.size * (.8 + rise * .3) * (1 + burst * .6);
      dummy.scale.set(size, size * (1 + Math.sin(t * 2 + b.phase) * .025), size);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 16, 12]} />
      <BubbleMaterial />
    </instancedMesh>
  );
}

export function BubbleMaterial() {
  return <shaderMaterial vertexShader={vertex} fragmentShader={fragment} transparent depthWrite={false} toneMapped={false} />;
}
