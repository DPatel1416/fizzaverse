"use client";
import { ArrowUpRight, Smile } from "lucide-react";
import Link from "next/link";
export function StorySection() {
  return (
    <section id="story" className="story-section">
      <div className="story-photo">
        <img
          src="/images/fizza-picnic.webp"
          alt="Pink FIZZA cans, fresh fruit, and friends sharing a sunny picnic"
          loading="lazy"
          width={1536}
          height={1024}
        />
        <span className="photo-sticker">
          GOOD DAYS
          <br />
          TASTE LIKE THIS.
          <Smile size={36} />
        </span>
      </div>
      <div className="story-copy">
        <span className="eyebrow">04 / A FRESH TAKE ON HAPPY</span>
        <h2>
          WE THOUGHT
          <br />
          SODA COULD
          <br />
          BE{" "}
          <span>
            WAY
            <br />
            MORE FUN.
          </span>
        </h2>
        <p>
          So we made it happen. Bright fruit flavors. The perfect amount of
          bubbles. A can that looks as good as your day is about to feel.
        </p>
        <p>
          FIZZA is our little reminder to take the scenic route, say yes to the
          picnic, and find the good in the everyday.
        </p>
        <Link className="button outline" href="/shop">
          HERE’S TO BRIGHTER DAYS <ArrowUpRight size={18} />
        </Link>
      </div>
    </section>
  );
}
