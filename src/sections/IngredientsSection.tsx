"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useFlavor } from "@/store/flavorStore";
import { flavors } from "@/data/flavors";

export function IngredientsSection() {
  const flavor = flavors[useFlavor(s => s.index)];
  return <section id="ingredients" className="ingredient-ledger">
    <div className="ledger-heading"><span className="eyebrow">01 / READ THE CAN</span><h2>BIG ON FRUIT.<br /><span>SHORT ON MYSTERY.</span></h2><p>Here’s the breakdown for {flavor.name}.<br />Every number is per 355 mL can.</p></div>
    <div className="ledger-facts" aria-live="polite">
      <div><strong>{flavor.nutrition.calories}</strong><span>CALORIES</span></div>
      <div><strong>{flavor.nutrition.sugar}<small>g</small></strong><span>SUGAR</span></div>
      <div><strong>355<small>mL</small></strong><span>FRUIT-FORWARD FIZZ</span></div>
    </div>
    <div className="ledger-bottom"><span>INSIDE {flavor.name.toUpperCase()}</span><p>{flavor.ingredients.join(" · ")}</p><Link href={`/flavors/${flavor.slug}`}>Full flavor notes <ArrowUpRight size={18} /></Link></div>
  </section>;
}
