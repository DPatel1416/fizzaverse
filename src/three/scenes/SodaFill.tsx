"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, MathUtils, Mesh, ShaderMaterial } from "three";
import type { Flavor } from "@/data/flavors";
import { cinematic } from "../cinematicState";

// A single full-frame surface: a rolling meniscus, light through the soda,
// and small rising carbonation rings. It sits behind the can and fruit.
export function SodaFill({ flavor }: { flavor: Flavor }) {
  const mesh = useRef<Mesh>(null);
  const material = useRef<ShaderMaterial>(null);
  const target = useMemo(() => new Color(flavor.primaryColor), [flavor.primaryColor]);
  const light = useMemo(() => new Color(flavor.secondaryColor), [flavor.secondaryColor]);
  const uniforms = useMemo(() => ({
    time: { value: 0 }, rise: { value: 0 }, opacity: { value: 0 }, aspect: { value: 1 },
    soda: { value: target.clone() }, glow: { value: light.clone() },
  // Keep the material alive across flavor selections; colors interpolate below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);
  useFrame(({ clock, size }, delta) => {
    if (!material.current || !mesh.current) return;
    const p = cinematic.progress;
    mesh.current.visible = p > .425 && p < .8;
    const u = material.current.uniforms;
    u.time.value = clock.elapsedTime;
    u.rise.value = MathUtils.smoothstep(p, .43, .7) * 1.15 - .06;
    u.opacity.value = 1 - MathUtils.smoothstep(p, .71, .8);
    u.aspect.value = size.width / size.height;
    const mix = 1 - Math.exp(-5 * Math.min(delta, .05));
    u.soda.value.lerp(target, mix); u.glow.value.lerp(light, mix);
  });
  return <mesh ref={mesh} frustumCulled={false} renderOrder={-10}>
    <planeGeometry args={[2, 2]} />
    <shaderMaterial ref={material} uniforms={uniforms} transparent depthWrite={false} toneMapped={false}
      vertexShader={`varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,.9999,1.);}`}
      fragmentShader={`
        varying vec2 vUv;
        uniform float time, rise, opacity, aspect;
        uniform vec3 soda, glow;
        float hash(float n){return fract(sin(n*127.1)*43758.5453);}
        void main(){
          float wave=rise+sin(vUv.x*8.+time*1.7)*.035+sin(vUv.x*19.-time*2.1)*.009;
          float depth=wave-vUv.y;
          float body=smoothstep(-.003,.008,depth);
          if(body<.001) discard;
          float rim=exp(-abs(depth)*115.);
          float folds=sin(vUv.x*14.+vUv.y*6.+time*.7)+sin(vUv.x*7.-vUv.y*11.-time*.5);
          vec3 color=mix(soda*.68,glow,.24+vUv.y*.31+folds*.025);
          color=mix(color,vec3(1.,.96,.9),rim*.75);
          float rings=0.;
          for(int i=0;i<24;i++){
            float n=float(i);
            vec2 center=vec2(hash(n+1.),fract(hash(n+12.)+time*(.025+hash(n+8.)*.045)));
            float radius=.003+hash(n+4.)*.009;
            float dist=length((vUv-center)*vec2(aspect,1.));
            rings+=exp(-abs(dist-radius)*1300.)*.33;
          }
          color+=vec3(rings)+vec3(.07,.045,.02)*pow(max(0.,folds*.5),5.);
          gl_FragColor=vec4(color,body*opacity*.96);
          #include <colorspace_fragment>
        }`} />
  </mesh>;
}
