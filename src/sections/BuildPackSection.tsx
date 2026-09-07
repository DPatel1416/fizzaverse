"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Minus, Plus, ArrowRight, Shuffle } from "lucide-react";
import { usePack } from "@/store/packStore";
import { useCart } from "@/store/cartStore";
import { flavors, getFlavor } from "@/data/flavors";
const Scene = dynamic(
  () => import("@/three/scenes/SectionScenes").then((m) => m.PackScene),
  { ssr: false },
);
export function BuildPackSection() {
  const pack = usePack();
  const addBox = useCart((s) => s.addBox);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const selection = mounted ? pack.selection : [];
  return (
    <section id="build-pack" className="build-section">
      <div className="build-visual">
        <span className="eyebrow">03 / YOUR BOX. YOUR RULES.</span>
        <h2>
          BUILD YOUR
          <br />
          OWN <span>FIZZ BOX.</span>
        </h2>
        <Scene selection={selection} />
        <div className="box-stamp">
          PACKED WITH
          <br />
          <strong>GOOD DAYS.</strong> ☺
        </div>
      </div>
      <div className="pack-controls">
        <span className="eyebrow">A LITTLE OF THIS. A LOT TO LOVE.</span>
        <h3>
          Mix it. Match it.
          <br />
          Make it yours.
        </h3>
        <p>
          Pick 12 cans of whatever makes you happy.
          <br />
          All your favorites. One very good box.
        </p>
        <div className="pack-progress">
          <strong aria-live="polite">
            {selection.length} / 12 CANS PICKED
          </strong>
          <button onClick={pack.reset} disabled={!selection.length}>
            Reset
          </button>
          <div>
            <span style={{ width: `${(selection.length / 12) * 100}%` }} />
          </div>
        </div>
        <div className="pack-flavors">
          {flavors.map((f) => {
            const count = selection.filter((id) => id === f.id).length;
            return (
              <div key={f.id}>
                <i style={{ background: f.primaryColor }} />
                <span>{f.name}</span>
                <div className="stepper">
                  <button
                    aria-label={`Remove ${f.name} from box`}
                    disabled={!count}
                    onClick={() => pack.remove(selection.lastIndexOf(f.id))}
                  >
                    <Minus size={14} />
                  </button>
                  <span>{count}</span>
                  <button
                    aria-label={`Add ${f.name} to box`}
                    disabled={selection.length >= 12}
                    onClick={() => pack.add(f.id)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <button className="text-button surprise" onClick={pack.surprise}>
          <Shuffle size={15} /> Can’t choose? Two of everything.
        </button>
        <button
          className="button ink full"
          disabled={selection.length !== 12}
          onClick={() => {
            if (addBox(selection)) pack.reset();
          }}
        >
          ADD BOX TO CART — $24 <ArrowRight size={19} />
        </button>
        <p className="pack-caption">12 × 355 mL · Made for mixing things up.</p>
        <div className="sr-only" aria-live="polite">
          {selection.map((id) => getFlavor(id).name).join(", ")}
        </div>
      </div>
    </section>
  );
}
