"use client";
import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { flavors } from "@/data/flavors";
import { useFlavor } from "@/store/flavorStore";
import { CanArt } from "@/components/ui/CanArt";

export function FlavorCarousel() {
  const { index, select } = useFlavor();
  const start = useRef<number | null>(null);
  const flavor = flavors[index];
  return <section id="flavors" className="flavor-catalog">
    <div className="catalog-heading"><div><span className="eyebrow">02 / THE FLAVOR FIELD GUIDE</span><h2>FOLLOW YOUR<br /><span>TASTE BUDS.</span></h2></div><p>From citrus snap to cola spice.<br />Meet your usual. Find your wildcard.</p></div>
    <div className="catalog-lineup" role="group" aria-label="Select a flavor">
      {flavors.map((f, i) => <button key={f.id} onClick={() => select(i)} aria-pressed={index === i} style={{ "--swatch": f.primaryColor, "--tint": f.secondaryColor } as React.CSSProperties}>
        <span className="catalog-index">0{i + 1}<ArrowUpRight size={17} /></span><CanArt flavor={f} /><strong>{f.name}</strong><span className="catalog-note">{f.shortName}</span>
      </button>)}
    </div>
    <div className="tasting-note" style={{ "--tint": flavor.secondaryColor } as React.CSSProperties} role="region" aria-label="Flavor tasting notes. Use left and right arrow keys to change flavor." tabIndex={0}
      onKeyDown={e => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); select(index + (e.key === "ArrowRight" ? 1 : -1)); } }}
      onPointerDown={e => { start.current = e.clientX; }} onPointerUp={e => { if (start.current !== null && Math.abs(e.clientX - start.current) > 45) select(index + (e.clientX < start.current ? 1 : -1)); start.current = null; }} onPointerCancel={() => { start.current = null; }}>
      <span className="tasting-label">TASTING NOTES<br /><b>0{index + 1} / 06</b></span>
      <div aria-live="polite"><h3>{flavor.name}</h3><p>{flavor.description}</p></div>
      <Link className="button ink" href={`/flavors/${flavor.slug}`}>MEET YOUR NEXT SIP <ArrowUpRight size={18} /></Link>
      <div className="tasting-arrows"><button aria-label="Previous flavor" onClick={() => select(index - 1)}><ArrowLeft size={20} /></button><button aria-label="Next flavor" onClick={() => select(index + 1)}><ArrowRight size={20} /></button></div>
    </div>
  </section>;
}
