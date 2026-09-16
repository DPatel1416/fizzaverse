# FIZZA — Fruit with volume

A fictional soda storefront built with Next.js 16.3.4, React 19, TypeScript, React Three Fiber, and Zustand. The static export is in `out/`.

## Develop and validate

- `npm run dev` — local preview at http://localhost:3000
- `npm run typecheck` — TypeScript validation
- `npm test` — eight catalog, pricing, pack, cart, and demo-checkout tests
- `npm run build` — production static export

## Design and rendering

The Flavor Dept. design uses a contained liquid-world hero, numbered flavor selectors, a nutrition ledger, a six-flavor field guide, and a 12-can mix builder. Flavor selection updates the hero, ingredient facts, and tasting notes together. Shop, product, cart, search, account, locator, and demo checkout remain available.

The hero renders can artwork in the initial HTML and keeps it visible until the live scene has rendered. Its single WebGL canvas loads near the viewport. Flavor changes and dragging request frames only until the can settles; hidden tabs and offscreen scenes pause. The ingredients and flavor catalog require no WebGL. The pack scene mounts within 300px of the viewport and stops requesting frames once cans settle. Native page scrolling has no JavaScript animation loop.

Can labels are shared by flavor and resolution: 1024px on desktop and 512px for low-quality/pack models, instead of a separate 2048px label per can. Low-detail labels clear the body facets to avoid depth interference. Droplets use opacity instead of a scene transmission pass. Studio reflections are baked once at 64px. Reduced-motion preferences disable flavor spins and pack-placement motion. WebGL failures retain artwork and functional product controls.

## Project map

- `src/data/flavors.ts` — catalog, nutrition, ingredients, and pricing
- `src/sections/` — homepage
- `src/three/scenes/World.tsx` — demand-rendered hero and product can
- `src/three/scenes/SectionScenes.tsx` — pack scene and retained legacy scene exports
- `src/components/ui/NearViewport.tsx` — deferred scene mounting
- `src/store/` — device-local cart, flavor, and pack state

Legacy cinematic modules remain in source for reference but are not imported by the homepage. Generated WebP artwork is local; no external font or model download is required.

## Demo boundaries

FIZZA is fictional. Checkout stores a local demo order and never charges a card or ships a product. Accounts and orders are device-local. Subscription choices demonstrate pricing. Reviews last for the current product visit. Newsletter interest is saved locally, not emailed. Retailers are illustrative, not verified stockists. Real commerce requires authoritative server pricing, inventory, authentication, payments, and fulfillment.

Performance improvements reduce scene count, texture memory, and idle GPU work. Load time and frame rate remain device- and network-dependent; no universal speed score is claimed.
