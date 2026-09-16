"use client";
import { Suspense, useEffect, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Group, MathUtils } from "three";
import type { Flavor } from "@/data/flavors";
import { detectQuality, type Quality } from "@/lib/quality";
import { CanModel } from "../models/CanModel";
import { useCanDrag } from "../useCanDrag";

// One static reflection map, baked once per canvas; no remote environment asset.
export function Studio() {
  return <>
    <ambientLight intensity={1.1} />
    <directionalLight position={[4, 7, 5]} intensity={2.8} color="#fff4e5" />
    <Environment resolution={64} frames={1}>
      <Lightformer position={[-4, 3, 4]} scale={[3, 8, 1]} intensity={3} />
      <Lightformer position={[5, 2, 1]} rotation={[0, -Math.PI / 3, 0]} scale={[2, 7, 1]} intensity={4} />
      <Lightformer position={[0, 6, -2]} rotation={[Math.PI / 2, 0, 0]} scale={[8, 4, 1]} intensity={3} />
    </Environment>
  </>;
}

function HeroCan({ flavor, quality, reduced, onReady }: { flavor: Flavor; quality: Quality; reduced: boolean; onReady?: () => void }) {
  const group = useRef<Group>(null);
  const drag = useCanDrag();
  const invalidate = useThree(s => s.invalidate);
  const viewport = useThree(s => s.viewport);
  const spin = useRef(0);
  const previous = useRef(flavor.id);
  const announced = useRef(false);
  useEffect(() => {
    if (previous.current !== flavor.id) {
      spin.current = reduced ? 0 : Math.PI * 2;
      previous.current = flavor.id;
      invalidate();
    }
  }, [flavor.id, invalidate, reduced]);
  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const d = Math.min(delta, .05);
    drag.settle(d);
    spin.current = MathUtils.damp(spin.current, 0, 7, d);
    const targetX = .08 + drag.state.current.pitch;
    const targetY = -.35 + drag.state.current.yaw + spin.current;
    g.rotation.x = reduced ? targetX : MathUtils.damp(g.rotation.x, targetX, 9, d);
    g.rotation.y = reduced ? targetY : MathUtils.damp(g.rotation.y, targetY, 9, d);
    g.rotation.z = -.18;
    g.scale.setScalar(Math.min(viewport.height * .27, viewport.width * .39, 1.85));
    if (!announced.current) { announced.current = true; onReady?.(); }
    // Render only during a flavor change or drag; an idle can uses no frame loop.
    if (drag.state.current.active || Math.abs(g.rotation.x - targetX) > .0005 || Math.abs(g.rotation.y + .35) > .0005 || spin.current > .0005) invalidate();
  });
  return <group ref={group} rotation={[.08, -.35, -.18]} {...drag.handlers}>
    <CanModel flavor={flavor} quality={quality} reduced condensation />
  </group>;
}

export default function World({ flavor, onReady, active = true }: { flavor: Flavor; mode?: "hero" | "product"; progress?: RefObject<number>; onReady?: () => void; active?: boolean }) {
  const [quality, setQuality] = useState<Quality>("low");
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => { setReduced(mq.matches); setQuality(detectQuality()); };
    const visibility = () => setVisible(!document.hidden);
    change(); visibility();
    mq.addEventListener("change", change);
    window.addEventListener("resize", change);
    document.addEventListener("visibilitychange", visibility);
    return () => { mq.removeEventListener("change", change); window.removeEventListener("resize", change); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  return <Canvas camera={{ position: [0, 0, 8], fov: 40 }} dpr={[1, quality === "low" ? 1 : 1.35]}
    gl={{ alpha: true, antialias: true, powerPreference: "default" }} frameloop={active && visible ? "demand" : "never"} style={{ touchAction: "pan-y" }}>
    <Suspense fallback={null}><Studio /><HeroCan flavor={flavor} quality={quality} reduced={reduced} onReady={onReady} /></Suspense>
  </Canvas>;
}
