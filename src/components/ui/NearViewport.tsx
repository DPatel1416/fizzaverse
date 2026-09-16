"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** Reserve layout immediately; download expensive children only near the viewport. */
export function NearViewport({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNear(true); observer.disconnect(); }
    }, { rootMargin: "300px" });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <div className="deferred-scene" ref={ref}>{near ? children : fallback}</div>;
}
