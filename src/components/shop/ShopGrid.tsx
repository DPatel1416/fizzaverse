"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { flavors, money } from "@/data/flavors";
import { CanArt } from "@/components/ui/CanArt";
import { useCart } from "@/store/cartStore";
export function ShopGrid() {
  const [filter, setFilter] = useState("all");
  const add = useCart((s) => s.add);
  const list = flavors.filter(
    (f) =>
      filter === "all" ||
      (filter === "citrus"
        ? ["strawberry", "orange", "lime"].includes(f.fruitType)
        : ["cherry", "grape", "watermelon"].includes(f.fruitType)),
  );
  return (
    <>
      <div className="shop-filters" role="group" aria-label="Filter flavors">
        {[
          ["all", "ALL THE GOOD STUFF"],
          ["citrus", "BRIGHT & CITRUSY"],
          ["fruity", "SWEET & FRUITY"],
        ].map(([id, label]) => (
          <button
            key={id}
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
        <span>{list.length} FLAVORS TO LOVE</span>
      </div>
      <div className="shop-grid">
        {list.map((f, i) => (
          <article
            key={f.id}
            className="product-card"
            style={
              {
                "--card-color": f.secondaryColor,
                "--card-primary": f.primaryColor,
              } as React.CSSProperties
            }
          >
            <Link
              className="product-card-art"
              href={`/flavors/${f.slug}`}
              aria-label={`Explore ${f.name}`}
            >
              <span className="card-counter">0{flavors.indexOf(f) + 1}</span>
              <span className="card-tag">
                {i === 0 ? "A LITTLE SUNSHINE" : "FEEL-GOOD FIZZ"}
              </span>
              <div className="card-circle" />
              <CanArt flavor={f} />
              <span className="card-arrow">
                <ArrowUpRight />
              </span>
            </Link>
            <div className="product-card-info">
              <Link href={`/flavors/${f.slug}`}>
                <h2>{f.name}</h2>
                <p>{f.shortName}</p>
              </Link>
              <div>
                <span>
                  12 PACK <strong>{money(f.price)}</strong>
                </span>
                <button
                  aria-label={`Add ${f.name} 12 pack to cart`}
                  onClick={() => add(f.id)}
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="shop-box-cta">
        <div>
          <span className="eyebrow">WHY PICK JUST ONE?</span>
          <h2>
            YOUR VERY OWN
            <br />
            BOX OF HAPPY.
          </h2>
          <p>Mix and match 12 cans. Make it a good one.</p>
        </div>
        <Link href="/#build-pack" className="button ink">
          BUILD YOUR FIZZ BOX <ArrowUpRight size={18} />
        </Link>
      </div>
    </>
  );
}
