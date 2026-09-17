"use client";
import dynamic from "next/dynamic";
import { useFlavor } from "@/store/flavorStore";
import { flavors } from "@/data/flavors";
import {
  Leaf,
  Sparkles,
  Smile,
  Droplets,
} from "lucide-react";
const Scene = dynamic(
  () => import("@/three/scenes/SectionScenes").then((m) => m.IngredientsScene),
  { ssr: false },
);
export function IngredientsSection() {
  const flavor = flavors[useFlavor(s => s.index)];
  return (
    <>
      <div
        className="ticker"
        aria-label="Real fruit flavor. Feel-good fizz. Brighter days ahead."
      >
        <div aria-hidden="true">
          REAL FRUIT FLAVOR <span>✳</span> FEEL-GOOD FIZZ <span>✳</span>{" "}
          BRIGHTER DAYS AHEAD <span>✳</span> REAL FRUIT FLAVOR <span>✳</span>{" "}
          FEEL-GOOD FIZZ <span>✳</span>
        </div>
      </div>
      <section id="ingredients" className="ingredients-section" style={{ "--flavor": flavor.primaryColor, "--flavor-light": flavor.secondaryColor, "--flavor-bg": flavor.backgroundColor, "--accent": flavor.accentColor } as React.CSSProperties}>
        <div className="section-intro">
          <span className="eyebrow">01 / ONLY THE GOOD STUFF</span>
          <h2>
            WHAT’S IN
            <br />
            THE CAN<span>?</span>
          </h2>
          <p>
            Real fruit flavor. A little sweetness.
            <br />
            And a whole lot of possibility.
          </p>
        </div>
        <div className="ingredients-stage">
          <div className="ingredient-note note-one">
            <Leaf />
            <h3>
              REAL FRUIT
              <br />
              FLAVOR
            </h3>
            <p>Sunshine you can taste.</p>
          </div>
          <div className="ingredient-note note-two">
            <Droplets />
            <h3>
              BUBBLY
              <br />
              REFRESHMENT
            </h3>
            <p>A crisp little pick-me-up.</p>
          </div>
          <Scene />
          <div className="ingredient-note note-three">
            <Sparkles />
            <h3>
              BRIGHT
              <br />
              INGREDIENTS
            </h3>
            <p>Every little sip counts.</p>
          </div>
          <div className="ingredient-note note-four">
            <Smile />
            <h3>
              FEEL-GOOD
              <br />
              FIZZ
            </h3>
            <p>Made for your kind of day.</p>
          </div>
        </div>
        <div className="ingredients-bottom">
          GOOD STUFF. BIG FLAVOR. <span>ZERO BORING ENERGY.</span>
          <small>
            *35 calories per Strawberry Lemon can. Other flavors contain 30–40
            calories.
          </small>
        </div>
      </section>
    </>
  );
}
