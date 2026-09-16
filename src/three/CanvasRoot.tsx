"use client";
import dynamic from "next/dynamic";
import { Component, useEffect, useState, useRef, useCallback, type ReactNode, type RefObject } from "react";
import type { Flavor } from "@/data/flavors";
import { CanArt } from "@/components/ui/CanArt";
const World = dynamic(() => import("./scenes/World"), { ssr: false });
export class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
export function CanvasRoot({ flavor, mode = "hero", progress }: { flavor: Flavor; mode?: "hero" | "product"; progress?: RefObject<number> }) {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const onReady = useCallback(() => setReady(true), []);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      setActive(entry.isIntersecting);
      if (entry.isIntersecting) timer = setTimeout(() => setEnabled(true), 150);
      else clearTimeout(timer);
    }, { rootMargin: "100px" });
    if (ref.current) observer.observe(ref.current);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, []);
  const fallback = <div className={`scene-fallback fallback-${mode}`}><CanArt flavor={flavor} /></div>;
  return <div ref={ref} className={`world-canvas world-${mode}`} aria-label={`${flavor.name} soda can. Drag to rotate when loaded.`} role="img">
    {!ready && fallback}
    {enabled && <SceneBoundary fallback={fallback}><World flavor={flavor} mode={mode} active={active} progress={progress} onReady={onReady} /></SceneBoundary>}
  </div>;
}
