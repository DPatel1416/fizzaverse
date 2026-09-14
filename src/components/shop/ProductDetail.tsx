"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  Truck,
  RefreshCw,
  Leaf,
  Star,
} from "lucide-react";
import type { Flavor } from "@/data/flavors";
import { flavors, money, packPrice } from "@/data/flavors";
import { CanvasRoot } from "@/three/CanvasRoot";
import { useCart } from "@/store/cartStore";
import { CanArt } from "@/components/ui/CanArt";
export function ProductDetail({ flavor: f }: { flavor: Flavor }) {
  const [size, setSize] = useState(12);
  const [quantity, setQuantity] = useState(1);
  const [subscription, setSubscription] = useState(false);
  const add = useCart((s) => s.add);
  const [review, setReview] = useState("");
  const [reviews, setReviews] = useState<string[]>([]);
  return (
    <main id="main" className="product-page">
      <div className="product-layout">
        <div
          className="product-world"
          style={{
            background: `radial-gradient(circle at 60% 30%,${f.secondaryColor},${f.backgroundColor})`,
          }}
        >
          <Link href="/shop" className="back-link">
            <ArrowLeft size={15} /> ALL FLAVORS
          </Link>
          <div className="product-world-word" aria-hidden="true">
            {f.fruitType.toUpperCase()}
          </div>
          <CanvasRoot flavor={f} mode="product" />
          <div className="product-swatches">
            {flavors.map((flavor) => (
              <Link
                key={flavor.id}
                href={`/flavors/${flavor.slug}`}
                aria-label={flavor.name}
                aria-current={flavor.id === f.id ? "page" : undefined}
                style={{ background: flavor.primaryColor }}
              />
            ))}
          </div>
        </div>
        <div className="product-content">
          <span className="eyebrow">SPARKLING SODA. BRIGHTER DAYS.</span>
          <h1>
            {f.name.split(" ")[0]}
            <br />
            <span>{f.name.split(" ")[1]}.</span>
          </h1>
          <h2>{f.tagline}</h2>
          <p className="product-description">{f.description}</p>
          <div className="product-price">
            {money(packPrice(f, size, subscription) * quantity)}
            <span>{size} × 355 mL / PACK</span>
          </div>
          <fieldset className="pack-sizes">
            <legend>CHOOSE YOUR PACK</legend>
            {f.packSizes.map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setSize(n)}
                aria-pressed={size === n}
              >
                {n} PACK
              </button>
            ))}
          </fieldset>
          <div className="purchase-type">
            <label>
              <input
                type="radio"
                name="purchase"
                checked={!subscription}
                onChange={() => setSubscription(false)}
              />
              <span>One-time purchase</span>
              <strong>{money(packPrice(f, size))}</strong>
            </label>
            <label>
              <input
                type="radio"
                name="purchase"
                checked={subscription}
                onChange={() => setSubscription(true)}
              />
              <span>
                Subscribe & save <b>15%</b>
              </span>
              <strong>{money(packPrice(f, size, true))}</strong>
            </label>
            {subscription && (
              <p>
                <RefreshCw size={13} /> Every 4 weeks. Demo subscription; no
                recurring charges.
              </p>
            )}
          </div>
          <div className="add-row">
            <div className="stepper">
              <button
                disabled={quantity === 1}
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => q - 1)}
              >
                <Minus size={16} />
              </button>
              <span>{quantity}</span>
              <button
                disabled={quantity === 99}
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              className="button ink"
              onClick={() => add(f.id, size, quantity, subscription)}
            >
              ADD TO CART <ArrowRight size={19} />
            </button>
          </div>
          <div className="product-perks">
            <span>
              <Truck size={16} /> FREE SHIPPING $48+
            </span>
            <span>
              <Leaf size={16} /> REAL FRUIT FLAVOR
            </span>
          </div>
          <div className="product-accordions">
            <details>
              <summary>Nutrition facts</summary>
              <div className="nutrition-table">
                <p>Per 1 can (355 mL)</p>
                {[
                  ["Calories", f.nutrition.calories],
                  ["Total carbohydrate", `${f.nutrition.carbs} g`],
                  ["Total sugars", `${f.nutrition.sugar} g`],
                  ["Sodium", `${f.nutrition.sodium} mg`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <span>{k}</span>
                    <strong>{v}</strong>
                  </div>
                ))}
              </div>
            </details>
            <details>
              <summary>All the good ingredients</summary>
              <p>{f.ingredients.join(", ")}.</p>
            </details>
            <details>
              <summary>Shipping & subscriptions</summary>
              <p>
                Demo shipping is $5.99, or free on orders of $48 or more.
                Subscription selections show a 15% discount with delivery every
                4 weeks. FIZZA is fictional; no charge, shipment, or real
                subscription is created.
              </p>
            </details>
          </div>
        </div>
      </div>
      <section className="reviews-section">
        <div>
          <span className="eyebrow">LET’S HEAR THE FIZZBACK.</span>
          <h2>
            GOOD SIPS.
            <br />
            GOOD WORDS.
          </h2>
          <p>
            {reviews.length
              ? `${reviews.length} demo ${reviews.length === 1 ? "review" : "reviews"}`
              : "Be the first to share a little fizzback."}
          </p>
        </div>
        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (review.trim()) {
                setReviews((v) => [...v, review.trim()]);
                setReview("");
              }
            }}
          >
            <label htmlFor="review">Your review</label>
            <textarea
              id="review"
              required
              maxLength={500}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What made you smile?"
            />
            <button className="button ink">
              SHARE DEMO REVIEW <ArrowRight size={17} />
            </button>
            <small>
              Reviews in this demo stay on this page until you leave.
            </small>
          </form>
          <div aria-live="polite">
            {reviews.map((text, i) => (
              <blockquote key={i}>
                {text}
                <cite>— FIZZA fan · Demo review</cite>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
      <section className="related-section">
        <h2>MORE GOOD THINGS.</h2>
        <div>
          {flavors
            .filter((flavor) => flavor.id !== f.id)
            .slice(0, 3)
            .map((flavor) => (
              <Link
                key={flavor.id}
                href={`/flavors/${flavor.slug}`}
                style={{ background: flavor.secondaryColor }}
              >
                <CanArt flavor={flavor} />
                <h3>{flavor.name}</h3>
                <ArrowRight size={20} />
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
}
