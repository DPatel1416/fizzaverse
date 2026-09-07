"use client";
import dynamic from "next/dynamic";
import {
  Component,
  useEffect,
  useState,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import type { Flavor } from "@/data/flavors";
import { CanArt } from "@/components/ui/CanArt";
const World = dynamic(() => import("./scenes/World"), { ssr: false });
export class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
export function CanvasRoot({
  flavor,
  mode = "hero",
  progress,
}: {
  flavor: Flavor;
  mode?: "hero" | "product";
  progress?: RefObject<number>;
}) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2");
    setSupported(Boolean(gl));
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    const observer = new IntersectionObserver(([entry]) =>
      setActive(entry.isIntersecting),
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const fallback = (
    <div className={`scene-fallback fallback-${mode}`}>
      <CanArt flavor={flavor} />
    </div>
  );
  return (
    <div
      ref={ref}
      className={`world-canvas world-${mode}`}
      aria-label={`Interactive ${flavor.name} soda can. Drag to rotate.`}
      role="img"
    >
      {supported === false ? (
        fallback
      ) : (
        <SceneBoundary fallback={fallback}>
          {supported && (
            <World
              flavor={flavor}
              mode={mode}
              active={active}
              progress={progress}
              onReady={() => setReady(true)}
            />
          )}
        </SceneBoundary>
      )}
      {!ready && supported !== false && (
        <div className="fizz-loader">
          <span>FIZZA</span>
          <small>OPENING YOUR FIZZ…</small>
          <i>◌ ◌ ◌</i>
        </div>
      )}
    </div>
  );
}
