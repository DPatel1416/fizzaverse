"use client";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, MoveRight, Smile } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { flavors } from "@/data/flavors";
import { useFlavor } from "@/store/flavorStore";
import { CanvasRoot } from "@/three/CanvasRoot";
import { CanArt } from "@/components/ui/CanArt";
export function HeroSection() {
  const { index, select } = useFlavor();
  const flavor = flavors[index];
  const hero = useRef<HTMLElement>(null);
  const progress = useRef(0);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hero-copy > *", {
          y: 35,
          opacity: 0,
          stagger: 0.11,
          duration: 0.85,
          ease: "power3.out",
        });
        ScrollTrigger.create({
          trigger: hero.current,
          start: "top top",
          end: "+=380",
          pin: true,
          scrub: true,
          onUpdate: (s) => {
            progress.current = s.progress;
          },
        });
        gsap.to(".hero-copy", {
          y: -55,
          opacity: 0.35,
          scrollTrigger: {
            trigger: hero.current,
            start: "top top",
            end: "+=380",
            scrub: 1,
          },
        });
      });
    }, hero);
    return () => ctx.revert();
  }, []);
  return (
    <section
      ref={hero}
      className="hero"
      style={
        {
          "--flavor": flavor.primaryColor,
          "--flavor-light": flavor.secondaryColor,
          "--flavor-bg": flavor.backgroundColor,
          "--accent": flavor.accentColor,
        } as React.CSSProperties
      }
    >
      <div className="hero-sky" />
      <div key={index} className="flavor-wipe" />
      <CanvasRoot flavor={flavor} progress={progress} />
      <div className="hero-vignette" />
      <div className="hero-copy">
        <div className="eyebrow">
          <span className="little-star">✳</span> A LITTLE FIZZ. A LOT OF
          FEEL-GOOD.
        </div>
        <h1>
          SODA,
          <br />
          BUT WAY
          <br />
          MORE FUN<span>.</span>
        </h1>
        <p>Big flavor. Bright energy. Zero boring.</p>
        <div className="hero-actions">
          <Link className="button primary" href="/shop">
            SHOP THE FIZZ <MoveRight size={21} />
          </Link>
          <a className="button outline" href="#flavors">
            EXPLORE FLAVORS <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="hero-footnote">
          <span>REAL FRUIT FLAVOR</span>
          <i /> <span>{flavor.nutrition.calories} CALORIES</span>
          <i />
          <span>100% GOOD VIBES</span>
        </div>
      </div>
      <div className="hero-scribble">
        good fizz.
        <br />
        brighter days.
        <Smile size={39} strokeWidth={1.5} />
      </div>
      <div className="can-hint">
        <span>GIVE IT A SPIN</span>
        <span>↔</span>
      </div>
      <a className="scroll-cue" href="#ingredients">
        <span>SCROLL TO THE GOOD STUFF</span>
        <ArrowDown size={16} />
      </a>
      <div className="flavor-dock">
        <div className="dock-label">
          PICK YOUR
          <br />
          <strong>HAPPY PLACE.</strong>
          <span>↘</span>
        </div>
        <div
          className="dock-options"
          role="group"
          aria-label="Choose your flavor"
        >
          {flavors.map((f, i) => (
            <button
              key={f.id}
              className={`dock-flavor ${i === index ? "selected" : ""}`}
              onClick={() => select(i)}
              aria-pressed={i === index}
            >
              <CanArt flavor={f} />
              <span>
                {f.name.split(" ")[0]}
                <br />
                {f.name.split(" ")[1]}
              </span>
              <i style={{ backgroundColor: f.accentColor }} />
            </button>
          ))}
        </div>
        <a href="#story" className="story-teaser">
          <Smile size={32} strokeWidth={1.25} />
          <span>
            A HAPPIER SODA.
            <br />A BRIGHTER YOU.
          </span>
          <ArrowUpRight size={24} />
        </a>
      </div>
      <span className="hero-number">0{index + 1} / 06</span>
    </section>
  );
}
