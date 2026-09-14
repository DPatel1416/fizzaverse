"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { flavors } from "@/data/flavors";
import { useFlavor } from "@/store/flavorStore";
const Scene = dynamic(
  () => import("@/three/scenes/SectionScenes").then((m) => m.CarouselScene),
  { ssr: false },
);
export function FlavorCarousel() {
  const { index, select } = useFlavor();
  const f = flavors[index];
  const start = useRef<number | null>(null);
  const wheelTime = useRef(0);
  return (
    <section
      id="flavors"
      className="flavor-section"
      style={{ background: f.secondaryColor }}
    >
      <div className="section-intro centered">
        <span className="eyebrow">02 / SIX FLAVORS. INFINITE GOOD DAYS.</span>
        <h2>
          FIND YOUR
          <br />
          <span>HAPPY PLACE.</span>
        </h2>
      </div>
      <div
        className="carousel-stage"
        role="region"
        aria-label="Flavor carousel. Use left and right arrow keys to change flavor."
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            select(index + (e.key === "ArrowRight" ? 1 : -1));
          }
        }}
        onPointerDown={(e) => {
          start.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (
            start.current !== null &&
            Math.abs(e.clientX - start.current) > 40
          )
            select(index + (e.clientX < start.current ? 1 : -1));
          start.current = null;
        }}
        onWheel={(e) => {
          if (Math.abs(e.deltaX) > 20 && Date.now() - wheelTime.current > 700) {
            select(index + (e.deltaX > 0 ? 1 : -1));
            wheelTime.current = Date.now();
          }
        }}
      >
        <Scene />
        <button
          className="circle-button prev"
          onClick={() => select(index - 1)}
          aria-label="Previous flavor"
        >
          <ArrowLeft />
        </button>
        <button
          className="circle-button next"
          onClick={() => select(index + 1)}
          aria-label="Next flavor"
        >
          <ArrowRight />
        </button>
      </div>
      <div className="carousel-info" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={f.id}
            initial={{ y: 22, rotateX: -18, clipPath: "inset(100% 0 0 0)" }}
            animate={{ y: 0, rotateX: 0, clipPath: "inset(0% 0 0 0)" }}
            exit={{ y: -18, rotateX: 12, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: .32, ease: [.22, 1, .36, 1] }}
          >
            <span className="eyebrow">0{index + 1} / 06</span>
            <h3>{f.name}</h3>
            <p>{f.tagline}</p>
            <Link className="button ink" href={`/flavors/${f.slug}`}>
              MEET {f.name.toUpperCase()} <ArrowUpRight size={18} />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flavor-dots" aria-label="Select a flavor">
        {flavors.map((flavor, i) => (
          <button
            key={flavor.id}
            aria-label={flavor.name}
            aria-pressed={i === index}
            onClick={() => select(i)}
            style={{ background: flavor.primaryColor }}
          />
        ))}
      </div>
    </section>
  );
}
