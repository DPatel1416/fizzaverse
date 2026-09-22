"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, MathUtils, Mesh, ShaderMaterial } from "three";
import type { Flavor } from "@/data/flavors";
import { cinematic } from "../cinematicState";

// A texture-free liquid layer: scroll controls volume; time controls the
// moving free surface, refractive highlights and rising carbonation.
export function SodaFill({ flavor }: { flavor: Flavor }) {
  const mesh = useRef<Mesh>(null);
  const material = useRef<ShaderMaterial>(null);
  const previous = useRef(0);
  const target = useMemo(() => new Color(flavor.primaryColor), [flavor.primaryColor]);
  const light = useMemo(() => new Color(flavor.secondaryColor), [flavor.secondaryColor]);
  const uniforms = useMemo(() => ({
    time: { value: 0 }, rise: { value: -.16 }, opacity: { value: 0 },
    aspect: { value: 1 }, slosh: { value: 0 },
    soda: { value: new Color() }, glow: { value: new Color() },
  }), []);
  useFrame(({ clock, size }, delta) => {
    if (!material.current || !mesh.current) return;
    const p = cinematic.progress, d = Math.min(delta, .05);
    const u = material.current.uniforms;
    mesh.current.visible = p > .30 && p < .96;
    // Fill from below, hold a full glass, then drain to reveal ingredients.
    const fill = MathUtils.smoothstep(p, .32, .65);
    const drain = MathUtils.smoothstep(p, .76, .95);
    const volume = -.16 + fill * 1.38 - drain * 1.4;
    const impulse = MathUtils.clamp((p - previous.current) / Math.max(d, .001), -.6, .6);
    previous.current = p;
    u.time.value = clock.elapsedTime;
    u.rise.value = volume;
    u.slosh.value = MathUtils.damp(u.slosh.value, impulse * .12, 3, d);
    u.opacity.value = MathUtils.smoothstep(p, .30, .33) * (1 - MathUtils.smoothstep(p, .94, .96));
    u.aspect.value = size.width / size.height;
    if (!mesh.current.visible) {
      u.soda.value.copy(target); u.glow.value.copy(light);
    } else {
      const blend = 1 - Math.exp(-6 * d);
      u.soda.value.lerp(target, blend); u.glow.value.lerp(light, blend);
    }
  });
  return <mesh ref={mesh} visible={false} frustumCulled={false} renderOrder={20} raycast={() => {}}>
    <planeGeometry args={[2, 2]} />
    <shaderMaterial ref={material} uniforms={uniforms} transparent depthTest={false} depthWrite={false} toneMapped={false}
      vertexShader={`varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`}
      fragmentShader={`
        varying vec2 vUv;
        uniform float time, rise, opacity, aspect, slosh;
        uniform vec3 soda, glow;
        float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
        float surface(float x) {
          return rise + sin(x*7.4+time*1.5)*.022
            + sin(x*17.3-time*2.1)*.008
            + sin(x*31.1+time*2.7)*.003
            + slosh*(x-.5)*2. + sin(x*4.-time*1.3)*abs(slosh);
        }
        vec2 flow(vec2 uv) {
          return vec2(sin(uv.y*8.-time*.7)+sin(uv.x*11.+time*.5),
                      cos(uv.x*7.+time*.6))*.012;
        }
        vec3 liquidField(vec2 uv) {
          float depth = max(surface(uv.x)-uv.y,0.);
          vec2 q = uv+flow(uv);
          // Colored absorption increases with optical depth; moving caustics
          // supply light variation rather than a tinted photograph.
          vec3 absorption = (vec3(1.)-soda)*1.65 + vec3(.18);
          vec3 transmitted = exp(-absorption*(.52+depth*.95));
          vec3 body = soda*(.48+.22*uv.y) + glow*.07;
          vec3 color = mix(body, transmitted*soda*1.45, .48);
          float bands = sin(q.x*13.+q.y*7.+time*.35)
                      + sin(q.x*8.-q.y*11.-time*.48);
          float caustic = pow(max(0.,1.-abs(bands)*.7),12.);
          float lightShaft = pow(.5+.5*sin(q.x*9.+sin(q.y*4.-time*.3)),8.);
          color += mix(soda,glow,.45)*(caustic*.10+lightShaft*.08);
          float sideLight = exp(-pow((uv.x-.78)*2.3,2.));
          color += glow*sideLight*.085;
          return color;
        }
        vec3 bubbles(vec3 base,vec2 uv,float density,float speed,float seed) {
          vec2 grid = (uv+flow(uv)*.3)*vec2(aspect,1.)*density;
          grid.y -= time*speed;
          vec2 cell=floor(grid), local=fract(grid);
          float random=hash(cell+seed);
          vec2 center=vec2(.26+hash(cell+17.+seed)*.48,.26+hash(cell+33.+seed)*.48);
          center.x += sin(time*1.3+random*20.)*.025;
          float radius=mix(.045,.21,pow(random,2.8));
          vec2 q=(local-center)/radius;
          float r2=dot(q,q);
          if(r2>1. || random<.3) return base;
          float z=sqrt(max(0.,1.-r2));
          vec3 normal=vec3(q,z);
          float rim=pow(1.-z,3.);
          vec2 offset=q*(1.-z)*radius/density*.9/vec2(aspect,1.);
          vec3 refracted=liquidField(uv+offset);
          float spec=pow(max(0.,dot(normal,normalize(vec3(-.45,.64,.63)))),52.);
          float bounce=pow(max(0.,dot(normal,normalize(vec3(.5,-.55,.45)))),70.);
          vec3 bubble=refracted*(1.08-rim*.5)+vec3(1.)*(spec*.75+bounce*.25+rim*.08);
          return mix(base,bubble,1.-smoothstep(.88,1.,r2));
        }
        void main() {
          float depth=surface(vUv.x)-vUv.y;
          float body=smoothstep(-.002,.003,depth);
          if(body<.001 || opacity<.001) discard;
          float meniscus=exp(-max(depth,0.)*55.);
          vec2 lens=vUv+vec2(sin(vUv.x*9.+time)*.018,-.025)*meniscus;
          vec3 color=liquidField(lens);
          color=bubbles(color,lens,9.,.9,3.7);
          color=bubbles(color,lens,23.,1.35,18.2);
          float crest=exp(-abs(depth-.003)*600.);
          float trough=exp(-abs(depth-.014)*160.);
          color*=1.-trough*.28;
          color+=mix(glow,vec3(1.),.72)*crest*.65;
          // A sparse necklace of tiny foam bubbles rides the moving surface.
          float fx=vUv.x*aspect*150.;
          float bead=hash(vec2(floor(fx),8.));
          vec2 foam=vec2((fract(fx)-.5)/150.,depth-.006-bead*.007);
          float foamR=mix(.0015,.0035,bead);
          float froth=(1.-smoothstep(foamR*.5,foamR,length(foam)))*step(.3,bead);
          color=mix(color,mix(glow,vec3(1.),.8),froth*.65);
          gl_FragColor=vec4(color,body*opacity*.985);
          #include <colorspace_fragment>
        }`} />
  </mesh>;
}
