"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Package } from "lucide-react";
import { useCart, cartTotal, itemPrice, type Order } from "@/store/cartStore";
import { getFlavor, money } from "@/data/flavors";
import { CanArt } from "@/components/ui/CanArt";
export default function Checkout() {
  const cart = useCart();
  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  useEffect(() => setMounted(true), []);
  const subtotal = cartTotal(cart.items);
  if (!mounted)
    return (
      <main id="main" className="checkout-page">
        <h1>GETTING YOUR FIZZ…</h1>
      </main>
    );
  return (
    <main id="main" className="checkout-page">
      {order ? (
        <div className="order-success">
          <span className="success-icon">
            <Check size={40} />
          </span>
          <span className="eyebrow">THAT’S A BOX OF HAPPINESS.</span>
          <h1>
            GOOD DAYS
            <br />
            <span>ARE AHEAD.</span>
          </h1>
          <p>
            Your demo order <strong>{order.id}</strong> is complete.
          </p>
          <p>
            No payment was collected and nothing will be shipped.
            <br />
            You can find this demo order in your FIZZA account corner.
          </p>
          <Link href="/shop" className="button ink">
            KEEP EXPLORING <ArrowRight size={18} />
          </Link>
        </div>
      ) : cart.items.length ? (
        <>
          <Link href="/shop" className="back-link">
            <ArrowLeft size={15} /> BACK TO THE GOOD STUFF
          </Link>
          <h1>
            ALMOST
            <br />
            <span>FIZZ O’CLOCK.</span>
          </h1>
          <div className="checkout-grid">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setOrder(cart.completeDemo());
              }}
            >
              <h2>Let’s make it a good day.</h2>
              <p className="demo-notice">
                Demo checkout · No payment or personal details needed. No
                products will be shipped.
              </p>
              <fieldset>
                <legend>DELIVERY</legend>
                <label className="checkout-choice">
                  <input type="radio" checked readOnly name="shipping" />{" "}
                  <span>
                    Standard demo delivery
                    <br />
                    <small>3–5 business days · United States</small>
                  </span>
                  <strong>{subtotal >= 48 ? "FREE" : money(5.99)}</strong>
                </label>
              </fieldset>
              <fieldset>
                <legend>PAYMENT</legend>
                <div className="demo-payment">
                  <Package size={24} />
                  <span>
                    Demo mode
                    <br />
                    <small>No card required. No charge is made.</small>
                  </span>
                </div>
              </fieldset>
              <label className="checkout-ack">
                <input type="checkbox" required /> I understand this creates a
                demo order only.
              </label>
              <button className="button ink full">
                PLACE DEMO ORDER <ArrowRight size={18} />
              </button>
            </form>
            <aside className="checkout-summary">
              <h2>YOUR HAPPY HAUL</h2>
              {cart.items.map((i) => (
                <div className="checkout-line" key={i.key}>
                  <CanArt flavor={getFlavor(i.flavorId)} />
                  <span>
                    <strong>
                      {i.selection
                        ? "Your Fizz Box"
                        : getFlavor(i.flavorId).name}
                    </strong>
                    <small>
                      {i.packSize} pack × {i.quantity}
                      {i.subscription ? " · Subscription demo" : ""}
                    </small>
                  </span>
                  <strong>{money(itemPrice(i) * i.quantity)}</strong>
                </div>
              ))}
              <div className="checkout-total">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
                <span>Shipping</span>
                <span>{subtotal >= 48 ? "FREE" : money(5.99)}</span>
                <strong>DEMO TOTAL</strong>
                <strong>{money(subtotal + (subtotal >= 48 ? 0 : 5.99))}</strong>
              </div>
              <small>
                USD · Demo pricing. No real tax or payment calculation.
              </small>
            </aside>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <h1>
            YOUR NEXT
            <br />
            GOOD DAY AWAITS.
          </h1>
          <p>Add some fizz before checking out.</p>
          <Link className="button ink" href="/shop">
            EXPLORE THE SHOP <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </main>
  );
}
