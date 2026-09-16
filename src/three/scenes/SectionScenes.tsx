"use client";
import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Group, MathUtils } from "three";
import { flavors, getFlavor } from "@/data/flavors";
import { useFlavor } from "@/store/flavorStore";
import { CanModel } from "../models/CanModel";
import { Fruit } from "../environments/FlavorEnvironment";
import { BubbleSystem } from "../particles/BubbleSystem";
import { Studio } from "./World";
import { SceneBoundary } from "../CanvasRoot";
import { CanArt } from "@/components/ui/CanArt";
import { useCanDrag } from "../useCanDrag";
import { cinematic } from "../cinematicState";
import { ChilledAtmosphere, FlavorLight } from "./Atmosphere";
function SceneCanvas({
  children,
  camera = [0, 0, 10],
  demand = false,
}: {
  children: React.ReactNode;
  camera?: [number, number, number];
  demand?: boolean;
}) {
  const [active, setActive] = useState(true);
  const [low, setLow] = useState(false);
  const [visible, setVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const resize = () => setLow(innerWidth < 768);
    const visibility = () => setVisible(!document.hidden);
    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(
      ([e]) => setActive(e.isIntersecting),
      { rootMargin: "100px" },
    );
    if (ref.current) observer.observe(ref.current);
    return () => { observer.disconnect(); window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  return (
    <div className="section-canvas" ref={ref}>
      <SceneBoundary
        fallback={
          <div className="section-fallback">
            <CanArt flavor={flavors[0]} />
          </div>
        }
      >
        <Canvas
          camera={{ position: camera, fov: 40 }}
          dpr={[1, low ? 1 : 1.4]}
          frameloop={active && visible ? (demand ? "demand" : "always") : "never"}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <Studio />
            {children}
          </Suspense>
        </Canvas>
      </SceneBoundary>
    </div>
  );
}
function ExplodedCan({
  opened,
  resetKey,
  nudge,
}: {
  opened: boolean;
  resetKey: number;
  nudge: number;
}) {
  const index = useFlavor((s) => s.index);
  const lid = useRef<Group>(null);
  const ref = useRef<Group>(null);
  const [reduced, setReduced] = useState(false);
  const drag = useCanDrag(resetKey);
  const progress = useRef(1);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion:reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    const scroll = () => {
      const section = document.getElementById("ingredients");
      if (section)
        progress.current = MathUtils.clamp(
          (innerHeight - section.getBoundingClientRect().top) / innerHeight,
          0,
          1,
        );
    };
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("scroll", scroll);
    };
  }, []);
  useFrame(({ clock }, d) => {
    if (!ref.current || !lid.current) return;
    d = Math.min(d, .05);
    ref.current.visible = !cinematic.ready;
    drag.settle(d);
    const target = opened ? (reduced ? 0.65 : progress.current * 0.72) : 0;
    lid.current.position.y = MathUtils.damp(
      lid.current.position.y,
      target,
      3,
      d,
    );
    ref.current.rotation.y = MathUtils.damp(
      ref.current.rotation.y,
      -0.35 +
        drag.state.current.yaw +
        nudge +
        (reduced ? 0 : Math.sin(clock.elapsedTime * 0.3) * 0.06),
      7,
      d,
    );
    ref.current.rotation.x = MathUtils.damp(
      ref.current.rotation.x,
      0.12 + drag.state.current.pitch,
      7,
      d,
    );
    Object.assign(cinematic.destination, { rx: ref.current.rotation.x, ry: ref.current.rotation.y, rz: ref.current.rotation.z, opened, resetKey });
  });
  return (
    <>
    <ChilledAtmosphere flavor={flavors[index]} reduced={reduced} ingredient mobile />
    <group
      ref={ref}
      rotation={[0.1, -0.35, -0.15]}
      scale={1.15}
      {...drag.handlers}
    >
      <CanModel flavor={flavors[index]} lidRef={lid} chill reduced={reduced} />
      <group position={[0.18, 1.65, 0]} scale={opened ? 0.3 : 0}>
        <Fruit flavor={flavors[index]} />
      </group>
      <group position={[-1.4, 0.2, 0.5]} scale={0.7}>
        <Fruit flavor={flavors[index]} index={1} />
      </group>
      <group position={[1.5, -0.4, -0.2]} scale={0.7}>
        <Fruit flavor={flavors[index]} />
      </group>
      <BubbleSystem count={18} reduced={reduced} />
    </group>
    </>
  );
}
export function IngredientsScene({
  opened = true,
  resetKey = 0,
  nudge = 0,
}: {
  opened?: boolean;
  resetKey?: number;
  nudge?: number;
}) {
  return (
    <SceneCanvas camera={[0, 0.5, 8]}>
      <ExplodedCan opened={opened} resetKey={resetKey} nudge={nudge} />
    </SceneCanvas>
  );
}
function Arc() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => { const mq = matchMedia("(prefers-reduced-motion: reduce)"); const update = () => setReduced(mq.matches); update(); mq.addEventListener("change", update); return () => mq.removeEventListener("change", update); }, []);
  const index = useFlavor((s) => s.index);
  const select = useFlavor((s) => s.select);
  const ref = useRef<Group>(null);
  useFrame(({ clock }, d) => {
    d = Math.min(d, .05);
    ref.current?.children.forEach((g, i) => {
      let offset = i - index;
      if (offset > 3) offset -= 6;
      if (offset < -2) offset += 6;
      const x = offset * 1.7,
        z = offset === 0 ? .5 : -Math.abs(offset) * 0.95,
        scale = offset === 0 ? 1.2 : 0.82;
      g.position.x = reduced ? x : MathUtils.damp(g.position.x, x, 5, d);
      g.position.y = reduced ? 0 : (offset === 0 ? Math.sin(clock.elapsedTime * .7) * .065 : 0);
      g.position.z = MathUtils.damp(g.position.z, z, 5, d);
      g.rotation.z = MathUtils.damp(g.rotation.z, offset * -0.09, 5, d);
      g.rotation.y = MathUtils.damp(g.rotation.y, -.35 + offset * -.2, reduced ? 100 : 5, d);
      g.scale.setScalar(MathUtils.damp(g.scale.x, scale, 5, d));
    });
  });
  return (
    <>
    <FlavorLight flavor={flavors[index]} reduced={reduced} />
    <CarouselFruit index={index} reduced={reduced} />
    <group ref={ref}>
      {flavors.map((f, i) => (
        <group
          key={f.id}
          position={[(i - index) * 1.7, 0, -Math.abs(i - index) * 0.85]}
          scale={0.8}
          onClick={() => select(i)}
        >
          <CanModel flavor={f} quality="low" condensation={false} />
        </group>
      ))}
    </group>
    </>
  );
}
function CarouselFruit({ index, reduced }: { index: number; reduced: boolean }) {
  const ref = useRef<Group>(null);
  const entry = useRef(0);
  useEffect(() => { entry.current = reduced ? 0 : 1; }, [index, reduced]);
  useFrame(({ clock }, d) => {
    entry.current = MathUtils.damp(entry.current, 0, 4, Math.min(d, .05));
    ref.current?.children.forEach((g, i) => {
      const side = i ? 1 : -1;
      g.position.set(side * (1.3 + entry.current * .9), (i ? .6 : -1) + (reduced ? 0 : Math.sin(clock.elapsedTime * .6 + i) * .12), .6 - entry.current * 2);
      g.rotation.set(.2, side * (.4 + entry.current), side * .3);
      g.scale.setScalar(.38 * (1 - entry.current * .6));
    });
  });
  return <group ref={ref}>{[0, 1].map(i => <group key={i} scale={.38}><Fruit flavor={flavors[index]} index={i} /></group>)}</group>;
}
export function CarouselScene() {
  return (
    <SceneCanvas camera={[0, 0.15, 9.3]}>
      <Arc />
    </SceneCanvas>
  );
}
function Tray({ selection }: { selection: string[] }) {
  return (
    <group rotation={[0.18, -0.18, 0]} position={[0, -0.3, 0]}>
      <RoundedBox args={[4.9, 0.13, 3.6]} radius={0.05} position={[0, -1, 0]}>
        <meshStandardMaterial color="#c79962" roughness={0.9} />
      </RoundedBox>
      {[-1, 1].map((s) => (
        <group key={s}>
          <RoundedBox
            args={[4.95, 0.8, 0.12]}
            radius={0.03}
            position={[0, -0.61, s * 1.78]}
          >
            <meshStandardMaterial color="#d8aa79" roughness={0.86} />
          </RoundedBox>
          <RoundedBox
            args={[0.12, 0.8, 3.6]}
            radius={0.03}
            position={[s * 2.42, -0.61, 0]}
          >
            <meshStandardMaterial color="#be8b53" roughness={0.86} />
          </RoundedBox>
        </group>
      ))}
      <group
        position={[0, -0.2, -1.8]}
        rotation={[selection.length === 12 ? -0.45 : -1.25, 0, 0]}
      >
        <RoundedBox
          args={[4.85, 0.07, 1.8]}
          radius={0.03}
          position={[0, 0, -0.9]}
        >
          <meshStandardMaterial color="#dcb582" roughness={0.85} />
        </RoundedBox>
      </group>
      {Array.from({ length: 12 }, (_, i) => {
        const x = ((i % 4) - 1.5) * 1.13,
          z = (Math.floor(i / 4) - 1) * 1.1;
        return selection[i] ? (
          <SlotCan key={i} id={selection[i]} x={x} z={z} />
        ) : (
          <mesh
            key={i}
            position={[x, -0.91, z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.36, 0.4, 24]} />
            <meshBasicMaterial color="#a7794e" transparent opacity={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}
function SlotCan({ id, x, z }: { id: string; x: number; z: number }) {
  const ref = useRef<Group>(null);
  const invalidate = useThree(s => s.invalidate);
  const reduced = useRef(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { reduced.current = media.matches; invalidate(); };
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [invalidate]);
  useFrame((_, d) => {
    if (ref.current)
      ref.current.position.y = reduced.current ? .02 : MathUtils.damp(
        ref.current.position.y,
        0.02,
        7,
        d,
      );
    if (ref.current && Math.abs(ref.current.position.y - .02) > .001) invalidate();
  });
  return (
    <group ref={ref} position={[x, 2, z]} scale={0.67}>
      <CanModel flavor={getFlavor(id)} quality="low" condensation={false} />
    </group>
  );
}
export function PackScene({ selection }: { selection: string[] }) {
  return (
    <SceneCanvas camera={[0, 4.7, 7.8]} demand>
      <Tray selection={selection} />
    </SceneCanvas>
  );
}
