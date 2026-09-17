"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
const CanJourney = dynamic(() => import("@/three/scenes/CanJourney"), { ssr: false });
import { ArrowDown, ArrowUpRight, MoveRight, Smile } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { flavors } from "@/data/flavors";
import { useFlavor } from "@/store/flavorStore";
import { CanvasRoot } from "@/three/CanvasRoot";
import { CanArt } from "@/components/ui/CanArt";
import { cinematic } from "@/three/cinematicState";
export function HeroSection() {
  const { index, select } = useFlavor();
  const flavor = flavors[index];
  const hero = useRef<HTMLElement>(null);
  const plate = useRef<HTMLImageElement>(null);
  const progress = useRef(0);
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    let disposed = false;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const section = document.getElementById("ingredients");
        const navigation = document.querySelector(".navigation");
        const backdrop = document.querySelector(".launch-backdrop");
        const ticker = document.querySelector(".ticker");
        if (!section || !hero.current || !backdrop || !navigation) return;
        const copy = hero.current.querySelectorAll(".hero-copy,.flavor-dock,.hero-scribble,.hero-number,.scroll-cue");
        const intro = section.querySelector(".section-intro");
        const details = section.querySelectorAll(".ingredient-note,.ingredients-bottom");
        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: hero.current, start: "top top",
            end: () => "+=" + (hero.current!.offsetHeight + (document.querySelector<HTMLElement>(".ticker")?.offsetHeight ?? 70) - 72),
            pin: true, pinSpacing: false, scrub: true, invalidateOnRefresh: true,
            onRefresh: self => { cinematic.launchEnd = self.end; cinematic.progress = self.progress; },
            onUpdate: self => {
              cinematic.progress = self.progress;
              cinematic.launchEnd = self.end;
              const arrive = gsap.utils.clamp(0, 1, (self.progress - .55) / .27);
              const eased = arrive * arrive * (3 - 2 * arrive);
              cinematic.sectionShift = -Math.max(0, self.end - self.scroll()) * eased;
              gsap.set(section, { y: cinematic.sectionShift });
              cinematic.to.y = cinematic.targetTop + cinematic.targetHeight / 2 - self.scroll() + cinematic.sectionShift
                + .5 * cinematic.targetHeight / (2 * Math.tan(Math.PI / 9) * 8);
            },
          },
        });
        timeline.to(copy, { autoAlpha: 0, filter: "blur(12px)", duration: .17 }, .015)
          .to(plate.current, { scale: 1.16, xPercent: -2, duration: .35 }, 0)
          .to(navigation, { autoAlpha: 0, filter: "blur(7px)", duration: .13 }, .035)
          .to(hero.current.querySelector(".world-hero"), { autoAlpha: 0, duration: .18 }, .1)
          .to(ticker, { autoAlpha: 0, duration: .12 }, .1)
          .to(hero.current.querySelectorAll(".hero-sky,.hero-vignette"), { autoAlpha: 0, duration: .05 }, .37)
          .fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: .06 }, .37)
          .fromTo(section, { autoAlpha: 0 }, { autoAlpha: 1, duration: .12 }, .65)
          .fromTo(intro, { opacity: 0, y: 50, filter: "blur(9px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: .19 }, .73)
          .fromTo(details, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .14 }, .84)
          .to(navigation, { autoAlpha: 1, filter: "blur(0px)", duration: .12 }, .88)
          .set(ticker, { autoAlpha: 1 }, 1)
          .set(backdrop, { autoAlpha: 0 }, 1);
        timeline.fromTo(section, { "--atmosphere-opacity": 0 }, { "--atmosphere-opacity": 1, duration: .12 }, .85);
        return () => {
          cinematic.progress = 0;
          cinematic.sectionShift = 0;
        };
      });
      mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const element = hero.current;
        if (!element || !plate.current) return;
        const x = gsap.quickTo(plate.current, "x", { duration: 1.4, ease: "power3.out" });
        const y = gsap.quickTo(plate.current, "y", { duration: 1.4, ease: "power3.out" });
        const move = (event: PointerEvent) => {
          if (cinematic.progress > .1) return;
          x((event.clientX / innerWidth - .5) * -18);
          y((event.clientY / innerHeight - .5) * -12);
        };
        const leave = () => { x(0); y(0); };
        element.addEventListener("pointermove", move, { passive: true });
        element.addEventListener("pointerleave", leave);
        return () => {
          element.removeEventListener("pointermove", move);
          element.removeEventListener("pointerleave", leave);
        };
      });
    }, hero);
    // A direct section URL can be restored before the pin is measured.
    // Reconcile it once fonts have established the final document geometry.
    void document.fonts.ready.then(() => {
      if (disposed) return;
      ScrollTrigger.refresh();
      if (location.hash === "#ingredients") {
        const section = document.getElementById("ingredients");
        if (section) window.scrollTo({ top: section.getBoundingClientRect().top + scrollY - cinematic.sectionShift - 72, behavior: "instant" });
      }
    });
    return () => { disposed = true; ctx.revert(); };
  }, []);
  return (
    <>
    <div className="launch-backdrop" aria-hidden="true" style={{ "--flavor": flavor.primaryColor, "--flavor-light": flavor.secondaryColor, "--flavor-bg": flavor.backgroundColor } as React.CSSProperties} />
    <div className="can-journey-mount"><CanJourney /></div>
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
      <div className="hero-sky"><img ref={plate} className="cinematic-plate" src="/images/cinematic-world-v2.webp" alt="" width={1672} height={941} fetchPriority="high" /></div>
      <div key={index} className="flavor-wipe" />
      <CanvasRoot flavor={flavor} progress={progress} />
      <div className="hero-vignette" />
      <div className="hero-copy">
        <div className="eyebrow">
          <span className="little-star">✳</span> A LITTLE FIZZ. A LOT OF
          FEEL-GOOD.
        </div>
        <h1>
          <span className="hero-headline-line">SODA,</span>
          <span className="hero-headline-line">BUT WAY</span>
          <span className="hero-headline-line">MORE FUN<span>.</span></span>
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
    </>
  );
}
