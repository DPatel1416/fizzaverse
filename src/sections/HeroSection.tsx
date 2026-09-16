"use client";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, MoveRight } from "lucide-react";
import { flavors } from "@/data/flavors";
import { useFlavor } from "@/store/flavorStore";
import { CanvasRoot } from "@/three/CanvasRoot";

export function HeroSection() {
  const { index, select } = useFlavor();
  const flavor = flavors[index];
  return (
    <section className="flavor-editorial" style={{ "--flavor": flavor.primaryColor, "--flavor-light": flavor.secondaryColor, "--accent": flavor.accentColor } as React.CSSProperties}>
      <div className="editorial-copy">
        <div className="edition-label"><span>FIZZA FLAVOR DEPT.</span><span>VOL. 01 — THE ORIGINAL SIX</span></div>
        <h1>FRUIT<br />WITH<br /><span>VOLUME.</span></h1>
        <p>Sweet. Sharp. Loud. Six fruit-forward sodas<br className="desktop-break" /> made for the first sip, and the next one.</p>
        <div className="editorial-actions">
          <Link className="button ink" href="/shop">FIND YOUR FLAVOR <MoveRight size={20} /></Link>
          <a className="editorial-text-link" href="#build-pack">Mix a 12-pack <ArrowUpRight size={17} /></a>
        </div>
        <a className="editorial-scroll" href="#ingredients"><ArrowDown size={16} /> THE DETAILS ARE IN THE CAN</a>
      </div>
      <div className="editorial-world">
        <img className="editorial-plate" src="/images/cinematic-world-v2.webp" alt="" width={1672} height={941} fetchPriority="high" />
        <div className="world-wash" />
        <div className="world-caption"><span>ON THE TURNTABLE</span><span>355 mL / SERVE COLD</span></div>
        <span className="world-index" aria-hidden="true">0{index + 1}</span>
        <CanvasRoot flavor={flavor} />
        <div className="flavor-ticket" aria-live="polite"><span>FLAVOR NO. 0{index + 1}</span><strong>{flavor.name}</strong><p>{flavor.tagline}</p></div>
      </div>
      <div className="flavor-selector">
        <div className="selector-heading"><span>THE LINEUP</span><strong>Six ways to turn it up.</strong></div>
        <div className="selector-options" role="group" aria-label="Choose your flavor">
          {flavors.map((f, i) => <button key={f.id} aria-pressed={i === index} onClick={() => select(i)} style={{ "--swatch": f.primaryColor } as React.CSSProperties}>
            <span className="selector-number">0{i + 1}</span><span>{f.name}</span><i aria-hidden="true" />
          </button>)}
        </div>
      </div>
    </section>
  );
}
