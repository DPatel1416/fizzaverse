"use client";
import { useMemo, useRef, type RefObject } from "react";
import { Billboard, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { SRGBColorSpace, ShaderMaterial, Vector4, type Texture } from "three";
import type { FruitType } from "@/data/flavors";

export const FRUIT_ATLAS = "/images/fruit-atlas.webp";

export function fruitCell(type: FruitType, variation = 0) {
  if (type === "strawberry") return [0, 1, 8, 7][variation % 4];
  return { orange: 2, cherry: 3, watermelon: 4, grape: 5, lime: 6 }[type];
}

// Photographic cutouts live at real scene depths. Camera-facing planes keep
// baked macro detail intact while the enclosing fruit groups float and roll.
export function PhotographicFruit({ type, variation = 0, defocus }: {
  type: FruitType; variation?: number; defocus?: RefObject<number>;
}) {
  const atlas = useTexture(FRUIT_ATLAS);
  const cell = fruitCell(type, variation);
  atlas.colorSpace = SRGBColorSpace;
  return <Billboard lockZ>
    <mesh>
      <planeGeometry args={[1.8, 1.8]} />
      <DefocusedMaterial atlas={atlas} cell={cell} amount={defocus} />
    </mesh>
  </Billboard>;
}

function DefocusedMaterial({ atlas, cell, amount }: { atlas: Texture; cell: number; amount?: RefObject<number> }) {
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({
    atlas: { value: atlas }, blur: { value: 0 },
    region: { value: new Vector4((cell % 3) / 3 + .001, (2 - Math.floor(cell / 3)) / 3 + .001, 1 / 3 - .002, 1 / 3 - .002) },
  }), [atlas, cell]);
  useFrame(() => { if (material.current) material.current.uniforms.blur.value = amount?.current ?? 0; });
  return <shaderMaterial ref={material} uniforms={uniforms} transparent depthWrite={false}
    vertexShader={`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
    fragmentShader={`
      uniform sampler2D atlas; uniform vec4 region; uniform float blur; varying vec2 vUv;
      vec4 sampleFruit(vec2 offset){
        vec2 uv=clamp(region.xy+vUv*region.zw+offset,region.xy,region.xy+region.zw);
        vec4 c=texture2D(atlas,uv); c.rgb*=c.a; return c;
      }
      void main(){
        vec4 c;
        if(blur < .01) { c=sampleFruit(vec2(0.)); }
        else {
          float b=blur*.009;
          c=sampleFruit(vec2(0.))*.28;
          c+=sampleFruit(vec2(b,b))*.18; c+=sampleFruit(vec2(-b,b))*.18;
          c+=sampleFruit(vec2(b,-b))*.18; c+=sampleFruit(vec2(-b,-b))*.18;
        }
        if(c.a<.005) discard;
        gl_FragColor=vec4(c.rgb/max(c.a,.001),c.a);
        #include <colorspace_fragment>
      }`} />;
}
