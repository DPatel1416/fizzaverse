"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import {
  Leaf,
  Sparkles,
  Smile,
  Droplets,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
const Scene = dynamic(
  () => import("@/three/scenes/SectionScenes").then((m) => m.IngredientsScene),
  { ssr: false },
);
export function IngredientsSection() {
  const [opened, setOpened] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [nudge, setNudge] = useState(0);
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
      <section id="ingredients" className="ingredients-section">
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
          <Scene opened={opened} resetKey={resetKey} nudge={nudge} />
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
        <div
          className="ingredient-interaction"
          role="group"
          aria-label="Explore the ingredient can"
        >
          <span>GRAB THE CAN. GET TO KNOW THE GOOD STUFF.</span>
          <div>
            <button
              aria-label="Rotate ingredient can left"
              onClick={() => setNudge((n) => Math.max(-1.1, n - 0.3))}
            >
              <ChevronLeft size={17} />
            </button>
            <button onClick={() => setOpened((v) => !v)}>
              {opened ? "CLOSE THE CAN" : "POP IT OPEN"}
            </button>
            <button
              aria-label="Rotate ingredient can right"
              onClick={() => setNudge((n) => Math.min(1.1, n + 0.3))}
            >
              <ChevronRight size={17} />
            </button>
            <button
              aria-label="Reset ingredient can view"
              onClick={() => {
                setNudge(0);
                setResetKey((k) => k + 1);
              }}
            >
              <RotateCcw size={16} />
            </button>
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
