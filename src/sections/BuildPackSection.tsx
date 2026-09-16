"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Minus, Plus, ArrowRight, Shuffle } from "lucide-react";
import { usePack } from "@/store/packStore";
import { useCart } from "@/store/cartStore";
import { flavors, getFlavor } from "@/data/flavors";
import { NearViewport } from "@/components/ui/NearViewport";
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
        <span className="eyebrow">03 / THE MIX TAPE</span>
        <h2>
          ALL YOUR
          <br />
          <span>HEAVY HITTERS.</span>
        </h2>
        <NearViewport><Scene selection={selection} /></NearViewport>
        <div className="box-stamp">
          THE 12-CAN COLLECTION
          <br />
          <strong>COMPILED BY YOU.</strong>
        </div>
      </div>
      <div className="pack-controls">
        <span className="eyebrow">SIX FLAVORS. TWELVE OPEN SLOTS.</span>
        <h3>
          Your taste.
          <br />
          Your tracklist.
        </h3>
        <p>
          Put your favorites on repeat, or try all six.
          <br />
          Fill your box with any 12 cans for $24.
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
