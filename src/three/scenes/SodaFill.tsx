"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Color, MathUtils, Mesh, SRGBColorSpace, ShaderMaterial } from "three";
import type { Flavor } from "@/data/flavors";
import { cinematic } from "../cinematicState";

// The camera travels through a photographic liquid field. Two sparse bubble
// layers refract that field; no offscreen render target or postprocessing pass.
export function SodaFill({ flavor }: { flavor: Flavor }) {
  const mesh = useRef<Mesh>(null);
  const material = useRef<ShaderMaterial>(null);
  const [liquid, world] = useTexture(["/images/soda-macro.webp", "/images/cinematic-world-v2.webp"]);
  liquid.colorSpace = world.colorSpace = SRGBColorSpace;
  const target = useMemo(() => new Color(flavor.primaryColor), [flavor.primaryColor]);
  const light = useMemo(() => new Color(flavor.secondaryColor), [flavor.secondaryColor]);
  const uniforms = useMemo(() => ({
    time: { value: 0 }, rise: { value: 0 }, opacity: { value: 0 }, aspect: { value: 1 },
    soda: { value: target.clone() }, glow: { value: light.clone() },
    liquid: { value: liquid }, world: { value: world },
  // Keep the material alive across flavor selections; colors interpolate below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [liquid, world]);
  useFrame(({ clock, size }, delta) => {
    if (!material.current || !mesh.current) return;
    const p = cinematic.progress;
    mesh.current.visible = p > .425 && p < .86;
    const u = material.current.uniforms;
    u.time.value = clock.elapsedTime;
    u.rise.value = MathUtils.smoothstep(p, .43, .68) * 1.5 - .2;
    u.opacity.value = 1 - MathUtils.smoothstep(p, .72, .86);
    u.aspect.value = size.width / size.height;
    const mix = 1 - Math.exp(-5 * Math.min(delta, .05));
    u.soda.value.lerp(target, mix); u.glow.value.lerp(light, mix);
  });
  return <mesh ref={mesh} frustumCulled={false} renderOrder={-10} raycast={() => {}}>
    <planeGeometry args={[2, 2]} />
    <shaderMaterial ref={material} uniforms={uniforms} transparent depthWrite={false} toneMapped={false}
      vertexShader={`varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,.9999,1.);}`}
      fragmentShader={`
        varying vec2 vUv;
        uniform float time, rise, opacity, aspect;
        uniform vec3 soda, glow;
        uniform sampler2D liquid, world;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        vec2 cover(vec2 uv,float imageAspect){
          return (uv-.5)*vec2(min(aspect/imageAspect,1.),min(imageAspect/aspect,1.))+.5;
        }
        vec2 flow(vec2 p){
          return vec2(sin(p.y*9.+p.x*5.-time*.42),cos(p.x*8.-p.y*6.+time*.31))*.014
            +vec2(sin(p.y*21.-time*.28),cos(p.x*17.+time*.22))*.003;
        }
        vec3 sodaField(vec2 uv){
          vec2 moving=cover(uv,1.7778)*.87+.065+flow(uv);
          vec3 photograph=texture2D(liquid,clamp(moving,.002,.998)).rgb;
          float luminance=dot(photograph,vec3(.2126,.7152,.0722));
          vec3 tint=soda/max(max(soda.r,soda.g),max(soda.b,.01));
          // Preserve the photograph's shadow range and clear highlights.
          // Flattening it into two colors makes liquid resemble chrome.
          vec3 drink=mix(vec3(luminance),photograph,.18)*mix(vec3(1.),tint,.48);
          drink=mix(drink,mix(glow,vec3(1.),.8)*luminance,pow(luminance,4.)*.4);
          vec3 reflection=texture2D(world,clamp(cover(uv+flow(uv)*3.,1.7778),.002,.998)).rgb;
          return mix(drink,reflection*.2+drink*.88,.12);
        }
        // Each cell contains one drifting, optically shaded CO2 bubble.
        // Different scales and ascent rates produce depth without a pixel loop.
        vec3 carbonation(vec3 base,vec2 uv,float density,float speed,float seed){
          vec2 grid=uv*vec2(aspect,1.)*density;
          grid.y-=time*speed;
          vec2 cell=floor(grid), local=fract(grid);
          float random=hash(cell+seed);
          vec2 center=vec2(.22+hash(cell+17.+seed)*.56,.22+hash(cell+33.+seed)*.56);
          center.x+=sin(time*.8+random*20.)*.035;
          float radius=mix(.027,.115,pow(random,2.));
          vec2 q=(local-center)/radius;
          float r2=dot(q,q);
          if(r2>1. || random<.2) return base;
          float z=sqrt(max(0.,1.-r2));
          vec3 normal=vec3(q,z);
          float fresnel=pow(1.-z,3.);
          vec2 offset=q*(1.-z)*radius/density*.65/vec2(aspect,1.);
          vec3 refracted=sodaField(uv+offset);
          float spec=pow(max(0.,dot(normal,normalize(vec3(-.45,.64,.63)))),64.);
          float rim=pow(max(0.,dot(normal,normalize(vec3(.55,-.5,.15)))),8.)*fresnel;
          vec3 bubble=refracted*(.87-fresnel*.35)+vec3(1.,.98,.94)*(spec*.85+rim*.5+fresnel*.12);
          return mix(base,bubble,1.-smoothstep(.84,1.,r2));
        }
        void main(){
          float swell=sin(vUv.x*5.4+time*.42)*.072+sin(vUv.x*12.5-time*.63)*.022;
          float surface=rise+swell+.085*exp(-pow((vUv.x-.72)*4.,2.));
          float depth=surface-vUv.y;
          float body=smoothstep(-.002,.006,depth);
          if(body<.001 || opacity<.001) discard;
          // A curved, thick meniscus magnifies the image below the surface.
          float meniscus=exp(-max(0.,depth)*35.);
          vec2 lens=vUv+vec2(cos(vUv.x*8.+time*.35)*.014,-.052)*meniscus;
          vec3 color=sodaField(lens);
          color=carbonation(color,lens,8.,.31,3.7);
          color=carbonation(color,lens,19.,.56,18.2);
          float crest=exp(-abs(depth-.004)*520.);
          float trough=exp(-abs(depth-.022)*95.);
          color*=1.-trough*.22;
          color+=vec3(1.,.98,.92)*crest*.26;
          color+=vec3(.025,.02,.015)*meniscus;
          gl_FragColor=vec4(color,body*opacity*.985);
          #include <colorspace_fragment>
        }`} />
  </mesh>;
}
