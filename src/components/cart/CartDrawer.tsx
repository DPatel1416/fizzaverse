"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { useCart, itemPrice, cartTotal } from "@/store/cartStore";
import { getFlavor, money } from "@/data/flavors";
import { CanArt } from "@/components/ui/CanArt";
import { Dialog } from "@/components/ui/Dialog";
export function CartDrawer() {
  const cart = useCart();
  const subtotal = cartTotal(cart.items);
  return (
    <Dialog
      open={cart.open}
      onClose={() => cart.setOpen(false)}
      title="YOUR HAPPY HAUL."
      drawer
    >
      {cart.items.length ? (
        <>
          <p className="shipping-note">
            {subtotal >= 48
              ? "Nice! Your fizz ships free."
              : `${money(48 - subtotal)} away from free shipping.`}
          </p>
          <div className="shipping-track">
            <span
              style={{ width: `${Math.min(100, (subtotal / 48) * 100)}%` }}
            />
          </div>
          <div className="cart-items">
            <AnimatePresence initial={false}>
              {cart.items.map((item) => (
                <motion.article
                  className="cart-item"
                  key={item.key}
                  layout
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 50, opacity: 0 }}
                >
                  <div
                    className="cart-art"
                    style={{
                      background: getFlavor(item.flavorId).secondaryColor,
                    }}
                  >
                    <CanArt flavor={getFlavor(item.flavorId)} />
                  </div>
                  <div className="cart-detail">
                    <h3>
                      {item.selection
                        ? "Your Fizz Box"
                        : getFlavor(item.flavorId).name}
                    </h3>
                    <p>
                      {item.packSize} cans ·{" "}
                      {item.subscription
                        ? "Subscribe & save 15%"
                        : "One-time purchase"}
                    </p>
                    {item.selection && (
                      <small>
                        {Object.entries(
                          item.selection.reduce<Record<string, number>>(
                            (a, id) => ({ ...a, [id]: (a[id] ?? 0) + 1 }),
                            {},
                          ),
                        )
                          .map(([id, n]) => `${n} ${getFlavor(id).name}`)
                          .join(" · ")}
                      </small>
                    )}
                    <div className="cart-item-bottom">
                      <div className="stepper">
                        <button
                          disabled={item.quantity <= 1}
                          aria-label={`Decrease ${getFlavor(item.flavorId).name} quantity`}
                          onClick={() =>
                            cart.update(item.key, item.quantity - 1)
                          }
                        >
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          disabled={item.quantity >= 99}
                          aria-label={`Increase ${getFlavor(item.flavorId).name} quantity`}
                          onClick={() =>
                            cart.update(item.key, item.quantity + 1)
                          }
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <strong>{money(itemPrice(item) * item.quantity)}</strong>
                      <button
                        className="remove-button"
                        aria-label={`Remove ${item.selection ? "Fizz Box" : getFlavor(item.flavorId).name}`}
                        onClick={() => cart.remove(item.key)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
          <div className="cart-summary">
            <div>
              <span>SUBTOTAL</span>
              <strong>{money(subtotal)}</strong>
            </div>
            <p>Shipping calculated at checkout. Prices in USD.</p>
            <Link
              className="button primary full"
              href="/checkout"
              onClick={() => cart.setOpen(false)}
            >
              CHECKOUT <ArrowRight size={20} />
            </Link>
            <button className="text-button" onClick={() => cart.setOpen(false)}>
              Keep the good times rolling
            </button>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <ShoppingBag size={50} strokeWidth={1} />
          <h3>
            A little empty.
            <br />A lot of potential.
          </h3>
          <p>Let’s put some good days in here.</p>
          <Link
            href="/shop"
            className="button primary"
            onClick={() => cart.setOpen(false)}
          >
            FIND YOUR FIZZ <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </Dialog>
  );
}
