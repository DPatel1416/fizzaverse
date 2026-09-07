"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  RoundedBox,
  PerformanceMonitor,
} from "@react-three/drei";
import { Group, MathUtils } from "three";
import type { Flavor } from "@/data/flavors";
import { qualityProfiles, detectQuality, type Quality } from "@/lib/quality";
import { CanModel } from "../models/CanModel";
import { FlavorEnvironment } from "../environments/FlavorEnvironment";
import { BubbleSystem } from "../particles/BubbleSystem";
import { useCanDrag } from "../useCanDrag";
export function Studio() {
  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[-4, 7, 5]} intensity={3} color="#fff1da" />
      <directionalLight position={[5, 2, -3]} intensity={2.8} color="#ffd3cf" />
      <Environment resolution={128}>
        <Lightformer
          position={[-4, 3, 4]}
          scale={[3, 8, 1]}
          intensity={4}
          color="#fff8ef"
        />
        <Lightformer
          position={[5, 2, 1]}
          rotation={[0, -Math.PI / 3, 0]}
          scale={[2, 7, 1]}
          intensity={5}
        />
        <Lightformer
          position={[0, 6, -2]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[8, 4, 1]}
          intensity={3}
        />
        <Lightformer
          position={[0, -4, 3]}
          scale={[5, 2, 1]}
          intensity={1.5}
          color="#ffa9aa"
        />
      </Environment>
    </>
  );
}
function HeroCan({
  flavor,
  quality,
  reduced,
  mode,
  progress,
  mobile,
}: {
  flavor: Flavor;
  quality: Quality;
  reduced: boolean;
  mode: string;
  progress?: React.RefObject<number>;
  mobile: boolean;
}) {
  const group = useRef<Group>(null);
  const drag = useCanDrag();
  const previous = useRef(flavor.id);
  const spin = useRef(0);
  useEffect(() => {
    if (previous.current !== flavor.id) {
      spin.current = reduced ? 0 : Math.PI * 2;
      drag.state.current.yaw = 0;
      drag.state.current.pitch = 0;
      previous.current = flavor.id;
    }
  }, [flavor, reduced]);
  useFrame(({ clock, pointer }, delta) => {
    const g = group.current;
    if (!g) return;
    const d = Math.min(delta, 0.05),
      p = progress?.current ?? 0;
    spin.current = MathUtils.damp(spin.current, 0, 5, d);
    drag.settle(d);
    const t = reduced ? 0 : clock.elapsedTime;
    g.position.set(
      mode === "hero" ? (mobile ? 0.62 : 1.75) : 0,
      Math.sin(t * 0.7) * 0.08 +
        p * 0.2 +
        (mobile && mode === "hero" ? -0.25 : 0),
      0,
    );
    g.rotation.x = MathUtils.damp(
      g.rotation.x,
      0.1 +
        drag.state.current.pitch +
        (reduced ? 0 : pointer.y * 0.045) +
        p * 0.15,
      3,
      d,
    );
    g.rotation.y = MathUtils.damp(
      g.rotation.y,
      -0.35 +
        (reduced ? 0 : Math.sin(t * 0.22) * 0.15 + pointer.x * 0.08) +
        drag.state.current.yaw +
        spin.current +
        p * 0.28,
      5,
      d,
    );
    g.rotation.z = MathUtils.damp(
      g.rotation.z,
      mode === "hero" ? -0.25 + p * 0.08 : -0.12,
      3,
      d,
    );
    const target = mode === "hero" ? (mobile ? 1.3 : 1.45) : 1.3;
    g.scale.setScalar(MathUtils.damp(g.scale.x, target, 6, d));
  });
  return (
    <group ref={group} scale={0.75} {...drag.handlers}>
      <CanModel flavor={flavor} quality={quality} />
    </group>
  );
}
function Architecture({ flavor }: { flavor: Flavor }) {
  return (
    <group>
      <mesh position={[3, -0.1, -4]} rotation={[0, 0.3, 0.1]}>
        <torusGeometry args={[4.3, 0.55, 24, 96]} />
        <meshStandardMaterial color={flavor.secondaryColor} roughness={0.38} />
      </mesh>
      <mesh
        position={[-3.6, 0.9, -5]}
        rotation={[0, 0.5, -0.4]}
        scale={[1, 1.5, 1]}
      >
        <torusGeometry args={[3.5, 0.95, 24, 96]} />
        <meshStandardMaterial color={flavor.primaryColor} roughness={0.38} />
      </mesh>
      <mesh
        position={[6, -0.5, -2]}
        rotation={[0.1, -0.3, -0.1]}
        scale={[1, 1.4, 1]}
      >
        <torusGeometry args={[3.5, 0.4, 20, 96]} />
        <meshStandardMaterial color="#ffcf93" roughness={0.4} />
      </mesh>
      <mesh position={[0, -6, -3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color={flavor.backgroundColor} roughness={0.48} />
      </mesh>
      <RoundedBox
        args={[0.45, 0.5, 0.45]}
        radius={0.08}
        position={[3.3, 0.4, 1.3]}
        rotation={[0.5, 0.6, 0.3]}
      >
        <meshPhysicalMaterial
          color="#fff1ef"
          roughness={0.05}
          transparent
          opacity={0.35}
          metalness={0.2}
          clearcoat={1}
        />
      </RoundedBox>
      <RoundedBox
        args={[0.4, 0.4, 0.4]}
        radius={0.07}
        position={[-0.6, -0.3, 0.6]}
        rotation={[0.8, 0.3, 0.5]}
      >
        <meshPhysicalMaterial
          color="#fff"
          roughness={0.08}
          transparent
          opacity={0.35}
          metalness={0.2}
          clearcoat={1}
        />
      </RoundedBox>
    </group>
  );
}
export default function World({
  flavor,
  mode = "hero",
  progress,
  onReady,
  active = true,
}: {
  flavor: Flavor;
  mode?: "hero" | "product";
  active?: boolean;
  progress?: React.RefObject<number>;
  onReady?: () => void;
}) {
  const [quality, setQuality] = useState<Quality>("medium");
  const [mobile, setMobile] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    setQuality(detectQuality());
    setMobile(innerWidth < 768);
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const change = () => setReduced(mq.matches);
    const resize = () => {
      setQuality(detectQuality());
      setMobile(innerWidth < 768);
    };
    window.addEventListener("resize", resize);
    mq.addEventListener("change", change);
    const v = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", v);
    return () => {
      mq.removeEventListener("change", change);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", v);
    };
  }, []);
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 40 }}
      dpr={[1, qualityProfiles[quality].dpr]}
      gl={{
        alpha: true,
        antialias: quality !== "low",
        powerPreference: "high-performance",
      }}
      frameloop={visible && active ? "always" : "never"}
      onCreated={() => onReady?.()}
      style={{ touchAction: "pan-y" }}
    >
      <Suspense fallback={null}>
        <PerformanceMonitor onDecline={() => setQuality("low")}>
          <Studio />
          <HeroCan
            flavor={flavor}
            quality={quality}
            reduced={reduced}
            mode={mode}
            progress={progress}
            mobile={mobile}
          />
          <FlavorEnvironment
            flavor={flavor}
            quality={quality}
            compact={mobile}
            motionIntensity={reduced ? 0 : 1}
          />
          <BubbleSystem
            count={qualityProfiles[quality].bubbles}
            reduced={reduced}
          />
          {mode === "hero" && <Architecture flavor={flavor} />}
        </PerformanceMonitor>
      </Suspense>
    </Canvas>
  );
}
