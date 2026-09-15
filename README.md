# FIZZA

A complete local-first demo storefront for a fictional soda brand, built with Next.js 16.3.4, React 19, strict TypeScript, Tailwind CSS, React Three Fiber / Three.js, Drei, GSAP ScrollTrigger, Lenis, Framer Motion, and Zustand.

## Run

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. `npm run build` creates a static export in `out/`, ready for a static host. The checked-in assets work offline; no GLB, remote font, or environment-map download is required.

## Experience

- Six flavor worlds, original front-facing can artwork, procedural can bodies, lids, pull tabs, rims, instanced condensation, photographic fruit at multiple scene depths, and iridescent bubbles.
- A pinned hero with one persistent can: center, accelerate through the lens, burst ingredients outward, fill the frame with soda, and settle into a scene colored for the selected drink. The timeline reverses with scroll and adds no empty pin spacing. Bubble-lens flavor changes, damped drag interaction, responsive compositions, and reduced-motion support remain available.
- The ingredient can opens as it settles and retains quiet drag interaction, without instructional labels or control buttons.
- A 3D six-can carousel with pointer, horizontal wheel, and keyboard controls.
- A 12-slot procedural cardboard tray with animated placement and validated variety packs.
- Shop filters, six statically generated product routes, pack sizes, subscription pricing, nutrition and ingredients, product reviews, search, centered account dialog, mobile navigation, persistent cart, and demo checkout.
- Native modal focus management, Escape dismissal, visible focus indicators, semantic content outside WebGL, and artwork fallbacks for renderer errors.

## Project map

`src/data/flavors.ts` is the flavor catalog and pricing source. `src/three/models/CanModel.tsx` is the reusable can asset boundary; replace its meshes with a GLB without changing the storefront. `src/three/materials/label.ts` generates replaceable canvas label textures. `scripts/generate-art.ts` generates standalone SVG product art. `src/lib/quality.ts` owns rendering profiles. Cart and pack state live in `src/store/`.

The scene combines a generated cinematic environment plate, camera-facing photographic fruit cutouts, and live 3D cans, ice, ribbons, and particles. Fruit uses one alpha atlas across all flavors; it is photographic artwork positioned in 3D, not a scanned or freely rotatable fruit model. Studio light panels and the environment plate create reflections, while shared microdroplet maps and instanced water beads create the chilled can finish. Ice uses small refraction buffers, with a simpler mobile material for secondary cubes. The scroll handoff reuses the can model and preserves its open/closed state. Offscreen scenes pause, rendering resolution adapts, and reduced-motion preferences disable the traveling can and large sweeps. The story photograph is an original generated asset, served as a compressed WebP. The source PNG is retained for future art direction.

## Validation

```sh
npm run typecheck
npm test
npm run build
```

The tests cover catalog integrity, subscription/pack prices, merging cart lines, invalid inputs, quantity bounds, the 12-can constraint, custom-box merging, shipping thresholds, and demo order completion. Browser review covers desktop/mobile compositions, centered dialogs, product selections, persistence after reload, pack building, checkout, and ingredients-can controls and dragging.

## Demo boundaries

FIZZA is fictional. Checkout creates a local demo order only; it never charges a card or ships a product. Account history is device-local, not authenticated. Subscription choices demonstrate pricing only. Reviews last for the current product visit. Newsletter interest is stored locally, not emailed. Retailers are explicitly illustrative, not verified stockists. Real commerce requires server-authoritative prices, inventory, tax/shipping services, authentication, payment processing and webhooks, an email provider, and a real store-locator source.

The site registers a small WebMCP surface when supported: read the cart, select a homepage flavor, and add a pack to the demo cart. These share the same validated actions as the visible interface.

Rendering quality adapts to device size and measured performance. A 60 FPS result is hardware-dependent; no universal frame-rate guarantee is made.
