"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  PerformanceMonitor,
  useTexture,
} from "@react-three/drei";
import { Group, MathUtils, SRGBColorSpace } from "three";
import type { Flavor } from "@/data/flavors";
import { qualityProfiles, detectQuality, type Quality } from "@/lib/quality";
import { CanModel } from "../models/CanModel";
import { FlavorEnvironment } from "../environments/FlavorEnvironment";
import { BubbleSystem } from "../particles/BubbleSystem";
import { useCanDrag } from "../useCanDrag";
import { cinematic } from "../cinematicState";
import { FlavorLight } from "./Atmosphere";
export function Studio() {
  const photographicLight = useTexture("/images/fizz-sunny-picnic.webp");
  photographicLight.colorSpace = SRGBColorSpace;
  return (
    <>
      <ambientLight intensity={.65} />
      <directionalLight position={[4, 7, 5]} intensity={2.8} color="#ffe2c2" />
      <directionalLight position={[-5, 2, -3]} intensity={1.8} color="#ffc1d1" />
      <Environment resolution={128}>
        <mesh position={[0, 0, 9]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[30, 18]} />
          <meshBasicMaterial map={photographicLight} toneMapped={false} />
        </mesh>
        <Lightformer
          position={[-4, 3, 4]}
          scale={[3, 8, 1]}
          intensity={2.8}
          color="#fff8ef"
        />
        <Lightformer
          position={[5, 2, 1]}
          rotation={[0, -Math.PI / 3, 0]}
          scale={[2, 7, 1]}
          intensity={3.6}
        />
        <Lightformer
          position={[0, 6, -2]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[8, 4, 1]}
          intensity={3}
        />
        <Lightformer
          position={[-2.8, 1, 3]}
          rotation={[0, Math.PI / 7, 0]}
          scale={[.35, 5.5, 1]}
          intensity={4}
          color="#d7f3ff"
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
  useFrame(({ clock, pointer, camera }, delta) => {
    const g = group.current;
    if (!g) return;
    const d = Math.min(delta, 0.05),
      p = reduced ? 0 : (progress?.current ?? 0);
    g.visible = mode !== "hero" || !cinematic.ready;
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
    const target = (mode === "hero" ? (mobile ? 1.3 : 1.45) : 1.3) * (1 + Math.sin(Math.min(spin.current, Math.PI)) * .09);
    g.scale.setScalar(MathUtils.damp(g.scale.x, target, 6, d));
    if (mode === "hero" && !cinematic.active) Object.assign(cinematic.source, { x: g.position.x - camera.position.x, y: g.position.y - camera.position.y, rx: g.rotation.x, ry: g.rotation.y, rz: g.rotation.z, scale: g.scale.x });
  });
  return (
    <group ref={group} scale={0.75} {...drag.handlers}>
      <CanModel flavor={flavor} quality={quality} chill reduced={reduced} />
    </group>
  );
}
function CameraRig({ reduced }: { reduced: boolean }) {
  useFrame(({ camera, pointer }, delta) => {
    const d = Math.min(delta, .05);
    camera.position.x = MathUtils.damp(camera.position.x, reduced ? 0 : pointer.x * .12, 2.2, d);
    camera.position.y = MathUtils.damp(camera.position.y, reduced ? 0 : pointer.y * .065, 2.2, d);
  });
  return null;
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
          <CameraRig reduced={reduced} />
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
            centered={mode === "product"}
            motionIntensity={reduced ? 0 : 1}
          />
          <BubbleSystem
            count={qualityProfiles[quality].bubbles * 3}
            reduced={reduced}
            hero={mode === "hero"}
          />
          <FlavorLight flavor={flavor} reduced={reduced} />
        </PerformanceMonitor>
      </Suspense>
    </Canvas>
  );
}
