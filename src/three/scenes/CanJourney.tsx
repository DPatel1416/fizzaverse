"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Group, MathUtils } from "three";
import { useFlavor } from "@/store/flavorStore";
import { flavors } from "@/data/flavors";
import { detectQuality, type Quality } from "@/lib/quality";
import { CanModel } from "../models/CanModel";
import { Fruit } from "../environments/FlavorEnvironment";
import { cinematic } from "../cinematicState";
import { Studio } from "./World";
import { SceneBoundary } from "../CanvasRoot";
import { useCanDrag } from "../useCanDrag";
import { IngredientBurst } from "./IngredientBurst";
import { SodaFill } from "./SodaFill";

const smooth = (p: number, a: number, b: number) => MathUtils.smoothstep(p, a, b);
const unitHeight = 2 * Math.tan(Math.PI / 9) * 10;

function PersistentCan({ quality, onReady }: { quality: Quality; onReady: () => void }) {
  const index = useFlavor(s => s.index);
  const ref = useRef<Group>(null);
  const lid = useRef<Group>(null);
  const lidFruit = useRef<Group>(null);
  const drag = useCanDrag();
  const reset = useRef(0);
  const spin = useRef(0);
  const previous = useRef(index);
  const mistIntensity = useRef(1);
  useEffect(() => { cinematic.ready = true; onReady(); return () => { cinematic.ready = false; }; }, [onReady]);
  useEffect(() => { if (previous.current !== index) { spin.current = Math.PI * 2; previous.current = index; } }, [index]);
  useFrame(({ size, clock, pointer }, delta) => {
    const g = ref.current;
    if (!g || !lid.current) return;
    const p = cinematic.progress, d = Math.min(delta, .05), unit = unitHeight / size.height;
    const { from, to, destination } = cinematic;
    if (reset.current !== destination.resetKey) {
      Object.assign(drag.state.current, { yaw: 0, pitch: 0, velocity: 0 });
      reset.current = destination.resetKey;
    }
    drag.settle(d);
    spin.current = MathUtils.damp(spin.current, 0, 5, d);
    const center = smooth(p, 0, .18);
    let x = MathUtils.lerp((from.x - size.width / 2) * unit, 0, center);
    let y = MathUtils.lerp((size.height / 2 - from.y) * unit, 0, center);
    let z = 0, scale = from.scale;
    if (p >= .18 && p < .34) {
      const q = (p - .18) / .16;
      z = 8.96 * q * q * q;
    } else if (p >= .34 && p < .43) {
      z = 8.96;
    } else if (p >= .43 && p < .5) {
      z = MathUtils.lerp(8.96, 15, smooth(p, .43, .5));
    } else if (p >= .5) {
      const back = smooth(p, .5, .9);
      z = MathUtils.lerp(-7, 0, back);
      scale = MathUtils.lerp(to.scale * .65, to.scale, back);
      x = (to.x - size.width / 2) * unit * back;
      y = (size.height / 2 - to.y) * unit * back;
    }
    const live = p < .12 || p > .94;
    mistIntensity.current = 1 - smooth(p, .1, .25) + smooth(p, .8, 1);
    g.visible = z < 10;
    const idle = Math.sin(clock.elapsedTime * .7) * .055 * (1 - center);
    g.position.set(x, y + idle, z);
    g.scale.setScalar(scale);
    const returned = smooth(p, .56, .92);
    g.rotation.set(
      MathUtils.lerp(.1, destination.rx, returned) + (live ? drag.state.current.pitch + pointer.y * .025 : 0),
      MathUtils.lerp(-.35 + smooth(p, .18, .34) * .85, destination.ry, returned) + (live ? drag.state.current.yaw + spin.current : 0),
      MathUtils.lerp(-.25 * (1 - center), destination.rz, returned),
    );
    lid.current.position.y = MathUtils.damp(lid.current.position.y, smooth(p, .87, 1) * (destination.opened ? .72 : 0), 9, d);
    lidFruit.current?.scale.setScalar(smooth(p, .88, 1) * (destination.opened ? .3 : 0));
  });
  return <>
    <SodaFill flavor={flavors[index]} />
    <group ref={ref} {...drag.handlers}>
      <CanModel flavor={flavors[index]} quality={quality} lidRef={lid} chill mistIntensity={mistIntensity} />
      <group ref={lidFruit} position={[.18, 1.65, 0]} scale={0}><Fruit flavor={flavors[index]} /></group>
    </group>
    <IngredientBurst flavor={flavors[index]} mobile={quality === "low"} />
  </>;
}

function documentTop(element: HTMLElement) {
  let top = 0, current: HTMLElement | null = element;
  while (current) { top += current.offsetTop; current = current.offsetParent as HTMLElement | null; }
  return top;
}

export default function CanJourney() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);
  const [quality, setQuality] = useState<Quality>("medium");
  const [eventSource, setEventSource] = useState<HTMLElement>();
  const readyCallback = useRef(() => setReady(true)).current;
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const check = () => { setEnabled(!media.matches); setQuality(detectQuality()); };
    check();
    setEventSource(document.getElementById("main") ?? undefined);
    media.addEventListener("change", check);
    return () => { media.removeEventListener("change", check); cinematic.active = false; cinematic.ready = false; };
  }, []);
  useEffect(() => {
    if (!enabled) { cinematic.ready = false; cinematic.active = false; return; }
    const hero = document.querySelector<HTMLElement>(".hero");
    const source = document.querySelector<HTMLElement>(".world-hero");
    const target = document.querySelector<HTMLElement>(".ingredients-stage");
    if (!hero || !source || !target) return;
    let end = Infinity;
    const update = () => {
      cinematic.scroll = scrollY;
      cinematic.to.y = cinematic.targetTop + cinematic.targetHeight / 2 - scrollY + cinematic.sectionShift
        + .5 * cinematic.targetHeight / (2 * Math.tan(Math.PI / 9) * 8);
      const show = scrollY < end && !document.hidden;
      cinematic.active = show;
      setActive(previous => previous === show ? previous : show);
    };
    const measure = () => {
      const s = source.getBoundingClientRect(), t = target.getBoundingClientRect();
      const mobile = innerWidth < 768;
      const sourceUnit = s.height / unitHeight;
      cinematic.from = {
        x: s.left + s.width / 2 + (mobile ? .62 : 1.75) * sourceUnit,
        y: source.offsetTop + s.height / 2 + (mobile ? .25 * sourceUnit + 28 : 0),
        scale: (mobile ? 1.3 : 1.45) * s.height / innerHeight,
      };
      cinematic.targetTop = documentTop(target);
      cinematic.targetHeight = t.height;
      cinematic.to.x = t.left + t.width / 2;
      cinematic.to.scale = 1.15 * t.height / innerHeight * 10 / 8 * (mobile ? .82 : 1);
      end = cinematic.targetTop + t.height + 180;
      setQuality(detectQuality());
      update();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(hero); observer.observe(target); observer.observe(source);
    measure();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", measure);
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); window.removeEventListener("scroll", update); window.removeEventListener("resize", measure); document.removeEventListener("visibilitychange", update); };
  }, [enabled]);
  if (!enabled) return null;
  return <div className="can-journey" style={{ visibility: active && ready ? "visible" : "hidden" }} aria-hidden="true">
    <SceneBoundary fallback={null}>
      <Canvas camera={{ position: [0, 0, 10], fov: 40, near: .06, far: 80 }} dpr={[1, quality === "high" ? 1.5 : 1]}
        eventSource={eventSource} eventPrefix="client" gl={{ alpha: true, antialias: quality !== "low" }}
        frameloop={active ? "always" : "never"}>
        <Suspense fallback={null}><Studio /><PersistentCan quality={quality} onReady={readyCallback} /></Suspense>
      </Canvas>
    </SceneBoundary>
  </div>;
}
