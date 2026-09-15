"use client";
import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { InstancedMesh, Object3D, ShaderMaterial } from "three";
import type { Quality } from "@/lib/quality";

// Soft camera-facing wisps descend along the cold shell. Their transparent
// centers and placement at the silhouette preserve the printed artwork.
export function ColdMist({ quality, reduced = false, intensity }: {
  quality: Quality; reduced?: boolean; intensity?: RefObject<number>;
}) {
  const ref = useRef<InstancedMesh>(null);
  const material = useRef<ShaderMaterial>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const count = quality === "low" ? 6 : 10;
  const uniforms = useMemo(() => ({ time: { value: 0 }, strength: { value: 1 } }), []);
  useFrame(({ clock }) => {
    if (!ref.current || !material.current) return;
    const t = reduced ? 0 : clock.elapsedTime;
    const strength = intensity?.current ?? 1;
    ref.current.visible = strength > .01;
    material.current.uniforms.time.value = t;
    material.current.uniforms.strength.value = strength;
    for (let i = 0; i < count; i++) {
      const age = (t * .065 + i / count) % 1;
      const side = i % 2 ? 1 : -1;
      dummy.position.set(side * (.65 + age * .23 + Math.sin(t * .3 + i) * .05), 1.15 - age * 2.9, -.18 + Math.sin(i * 2.4) * .4);
      dummy.scale.set(.5 + age * .62, .62 + age * .8, Math.sin(age * Math.PI));
      dummy.updateMatrix(); ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false} raycast={() => {}}>
    <planeGeometry args={[1, 1]} />
    <shaderMaterial ref={material} uniforms={uniforms} transparent depthWrite={false} toneMapped={false}
      vertexShader={`
        varying vec2 vUv; varying float vLife; varying float vSeed;
        void main(){
          vUv=uv; vLife=length(instanceMatrix[2].xyz); vSeed=float(gl_InstanceID)*3.71;
          vec4 center=modelViewMatrix*instanceMatrix*vec4(0.,0.,0.,1.);
          vec2 extent=vec2(length((modelMatrix*instanceMatrix)[0].xyz),length((modelMatrix*instanceMatrix)[1].xyz));
          center.xy+=position.xy*extent;
          gl_Position=projectionMatrix*center;
        }`}
      fragmentShader={`
        varying vec2 vUv; varying float vLife; varying float vSeed;
        uniform float time, strength;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float noise(vec2 p){
          vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
          float lower=mix(hash(i),hash(i+vec2(1.,0.)),f.x);
          float upper=mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x);
          return mix(lower,upper,f.y);
        }
        void main(){
          vec2 p=vUv-.5;
          float edge=1.-smoothstep(.12,.52,length(p*vec2(1.,.8)));
          vec2 flow=vUv*3.5+vec2(vSeed+time*.06,time*.12);
          float cloud=noise(flow)*.6+noise(flow*2.1)*.28+noise(flow*4.3)*.12;
          float alpha=edge*smoothstep(.25,.75,cloud)*vLife*.2*strength;
          gl_FragColor=vec4(.82,.93,1.,alpha);
        }`} />
  </instancedMesh>;
}
