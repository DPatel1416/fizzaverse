"use client";
import { useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
export function FindUsSection() {
  const [postal, setPostal] = useState("");
  const [result, setResult] = useState("");
  return (
    <section id="find-us" className="find-section">
      <span className="eyebrow">05 / TAKE IT TO GO</span>
      <h2>
        FIND YOUR <span>FIZZ.</span>
      </h2>
      <p>Your next cold can, a little closer.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setResult(
            `You searched ${postal.toUpperCase()}. This is a demo locator; retailer availability is not live.`,
          );
        }}
      >
        <MapPin size={20} />
        <label className="sr-only" htmlFor="postal">
          ZIP or postal code
        </label>
        <input
          id="postal"
          required
          minLength={3}
          maxLength={10}
          value={postal}
          onChange={(e) => setPostal(e.target.value)}
          placeholder="Enter ZIP or postal code"
        />
        <button aria-label="Find FIZZA near me">
          <ArrowRight />
        </button>
      </form>
      <p role="status" className="locator-status">
        {result || "Your neighborhood’s new favorite (coming soon)."}
      </p>
      <div className="retailers">
        {["Whole Foods", "Target", "Costco", "Walmart"].map((r, i) => (
          <div key={r}>
            <span className={`retailer retailer-${i}`}>{r}</span>
            <small>ILLUSTRATIVE RETAILER</small>
          </div>
        ))}
      </div>
    </section>
  );
}
