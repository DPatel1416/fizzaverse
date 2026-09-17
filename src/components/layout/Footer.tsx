"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
export function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [info, setInfo] = useState("");
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="newsletter">
          <span className="eyebrow">A LITTLE SOMETHING GOOD.</span>
          <h2>
            GET FIZZA
            <br />
            IN YOUR INBOX.
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              localStorage.setItem("fizza-newsletter-interest", email);
              setMessage(
                "You’re on the demo list! Your interest is saved on this device.",
              );
              setEmail("");
            }}
          >
            <label className="sr-only" htmlFor="newsletter-email">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button aria-label="Join the newsletter">
              <ArrowRight />
            </button>
          </form>
          <p className="form-message" role="status">
            {message || "Fresh flavors. Happy news. The occasional good pun."}
          </p>
        </div>
        <div className="footer-links">
          <div>
            <Link href="/shop">SHOP</Link>
            <Link href="/#flavors">FLAVORS</Link>
            <Link href="/#story">OUR STORY</Link>
            <Link href="/#ingredients">INGREDIENTS</Link>
          </div>
          <div>
            <button onClick={() => setInfo("FAQ")}>FAQ</button>
            <button onClick={() => setInfo("CONTACT")}>CONTACT</button>
            <button onClick={() => setInfo("INSTAGRAM")}>
              INSTAGRAM <ArrowUpRight size={13} />
            </button>
            <button onClick={() => setInfo("TIKTOK")}>
              TIKTOK <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      </div>
      <div className="footer-wordmark" aria-hidden="true">
        FIZZA<span>✳</span>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} FIZZA. BRIGHTER DAYS AHEAD.</span>
        <span>A FICTIONAL SODA BRAND. MADE FOR GOOD VIBES.</span>
        <button onClick={() => setInfo("PRIVACY")}>PRIVACY</button>
      </div>
      <Dialog
        open={!!info}
        onClose={() => setInfo("")}
        title={
          info === "FAQ"
            ? "GOOD QUESTIONS."
            : info === "CONTACT"
              ? "SAY HELLO."
              : info === "PRIVACY"
                ? "YOUR PRIVACY."
                : "FIND US IN YOUR FEED."
        }
      >
        {info === "FAQ" ? (
          <div className="faq">
            <details open>
              <summary>What’s in FIZZA?</summary>
              <p>
                Carbonated water, fruit juice, a little cane sugar, and natural
                flavors. Each flavor has its own ingredients and nutrition on
                its product page.
              </p>
            </details>
            <details>
              <summary>Where do you ship?</summary>
              <p>
                This is a fictional storefront. The checkout demonstrates a US
                shipping flow, with $5.99 shipping and free shipping over $48.
                No products are shipped.
              </p>
            </details>
            <details>
              <summary>How does Subscribe & Save work?</summary>
              <p>
                Choose a recurring delivery on a product page for a 15% demo
                discount. No actual subscription or charge is created.
              </p>
            </details>
          </div>
        ) : info === "PRIVACY" ? (
          <p>
            This demo stores your cart, pack selection, demo orders, and
            newsletter interest locally in this browser. It does not send
            payment information or newsletter signups to a server. Clear browser
            site data to remove these records.
          </p>
        ) : info === "CONTACT" ? (
          <p>
            FIZZA is a fictional brand built for this interactive experience.
            Customer support and real orders are not available.
          </p>
        ) : (
          <p>
            Our fictional FIZZA crew is still dreaming up its first post. There
            are no official social accounts for this demo.
          </p>
        )}
      </Dialog>
    </footer>
  );
}
