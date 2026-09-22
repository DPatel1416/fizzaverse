"use client";
import Link from "next/link";
import {
  Search,
  UserRound,
  ShoppingBag,
  Menu,
  ArrowUpRight,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Lenis from "lenis";
import { MotionConfig } from "framer-motion";
import { useCart } from "@/store/cartStore";
import { flavors, money } from "@/data/flavors";
import { CanArt } from "@/components/ui/CanArt";
import { Dialog } from "@/components/ui/Dialog";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Footer } from "./Footer";
const links = [
  ["SHOP", "/shop"],
  ["FLAVORS", "/#flavors"],
  ["OUR STORY", "/#story"],
  ["INGREDIENTS", "/#ingredients"],
  ["FIND US", "/#find-us"],
];
export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const cart = useCart();
  const [panel, setPanel] = useState<"search" | "account" | "menu" | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    let lenis: Lenis | undefined;
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      lenis = new Lenis({
        autoRaf: true,
        anchors: false,
        duration: 1.05,
        prevent: (node) => Boolean(node.closest("dialog")),
      });
    }
    // Own same-page anchors before Next's Link handler performs its native
    // jump. Otherwise Lenis can calculate a second target from stale scroll.
    const onAnchor = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      let top = 0;
      for (let node: HTMLElement | null = target; node; node = node.offsetParent as HTMLElement | null) top += node.offsetTop;
      setPanel(null);
      history.pushState(null, "", url.hash);
      if (lenis) lenis.scrollTo(Math.max(0, top - 72), { force: true });
      else window.scrollTo({ top: Math.max(0, top - 72), behavior: "instant" });
    };
    window.addEventListener("click", onAnchor, true);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("click", onAnchor, true);
      lenis?.destroy();
    };
  }, []);
  useEffect(() => {
    setPanel(null);
  }, [pathname]);
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header
        className={`navigation ${pathname !== "/" ? "dark-nav" : ""} ${scrolled ? "scrolled" : ""}`}
      >
        <Link className="wordmark" href="/" aria-label="FIZZA home">
          FIZZA<span>™</span>
        </Link>
        <nav aria-label="Main navigation">
          {links.map(([label, href]) => (
            <Link key={label} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="nav-tools">
          <button
            aria-label="Search flavors"
            onClick={() => setPanel("search")}
          >
            <Search />
          </button>
          <button aria-label="Your account" onClick={() => setPanel("account")}>
            <UserRound />
          </button>
          <button aria-label="Open cart" onClick={() => cart.setOpen(true)}>
            <ShoppingBag />
            <span
              className="cart-count"
              key={mounted ? cart.items.reduce((s, i) => s + i.quantity, 0) : 0}
            >
              {mounted ? cart.items.reduce((s, i) => s + i.quantity, 0) : 0}
            </span>
          </button>
          <button
            className="mobile-toggle"
            aria-label="Open menu"
            onClick={() => setPanel("menu")}
          >
            <Menu />
          </button>
        </div>
      </header>
      {children}
      <Footer includeLocator={pathname === "/"} />
      <CartDrawer />
      <Dialog
        open={panel === "search"}
        onClose={() => setPanel(null)}
        title="FIND YOUR FLAVOR."
      >
        <label className="field-label" htmlFor="flavor-search">
          Search the good stuff
        </label>
        <input
          id="flavor-search"
          className="text-input"
          placeholder="Try strawberry, citrus, or grape…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="search-results">
          {flavors
            .filter((f) =>
              `${f.name} ${f.description}`
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
            .map((f) => (
              <Link
                href={`/flavors/${f.slug}`}
                key={f.id}
                onClick={() => setPanel(null)}
              >
                <CanArt flavor={f} />
                <span>
                  <strong>{f.name}</strong>
                  <small>{f.shortName}</small>
                </span>
                <ArrowUpRight size={20} />
              </Link>
            ))}
          {!flavors.some((f) =>
            `${f.name} ${f.description}`
              .toLowerCase()
              .includes(query.toLowerCase()),
          ) && <p>No fizz found. Try another flavor.</p>}
        </div>
      </Dialog>
      <Dialog
        open={panel === "account"}
        onClose={() => setPanel(null)}
        title="YOUR FIZZA CORNER."
      >
        <p className="muted">
          Your demo orders are saved on this device. FIZZA is a fictional brand;
          no account or payment is required.
        </p>
        {cart.orders.length ? (
          <div className="order-list">
            {cart.orders.map((o) => (
              <article key={o.id}>
                <strong>{o.id}</strong>
                <p>
                  {new Date(o.date).toLocaleDateString()} · {money(o.total)} ·
                  Demo order
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>
              Your next good day
              <br />
              starts with a can.
            </h3>
            <p>No orders here yet.</p>
            <Link
              href="/shop"
              className="button primary"
              onClick={() => setPanel(null)}
            >
              EXPLORE THE SHOP
            </Link>
          </div>
        )}
      </Dialog>
      <Dialog
        open={panel === "menu"}
        onClose={() => setPanel(null)}
        title="GOOD DAYS AHEAD."
      >
        <nav className="mobile-menu">
          {links.map(([label, href]) => (
            <Link key={label} href={href} onClick={() => setPanel(null)}>
              {label}
              <ArrowUpRight />
            </Link>
          ))}
          <button onClick={() => setPanel("account")}>
            YOUR ACCOUNT <UserRound />
          </button>
        </nav>
      </Dialog>
    </MotionConfig>
  );
}
