import test from "node:test";
import assert from "node:assert/strict";
import { flavors, packPrice } from "../src/data/flavors";
import { useCart, cartTotal } from "../src/store/cartStore";
import { usePack } from "../src/store/packStore";
test("all six products have unique routes and complete flavor data", () => {
  assert.equal(new Set(flavors.map((f) => f.slug)).size, 6);
  for (const f of flavors) {
    assert.deepEqual(f.packSizes, [6, 12, 24]);
    assert.ok(f.ingredients.length > 3);
    assert.ok(f.description);
  }
});
test("pack prices scale and subscription applies exactly 15%", () => {
  assert.equal(packPrice(flavors[0], 6), 12);
  assert.equal(packPrice(flavors[0], 24), 48);
  assert.equal(packPrice(flavors[0], 12, true), 20.4);
});
test("duplicate products merge; subscription and pack size stay separate", () => {
  useCart.setState({ items: [] });
  const s = useCart.getState();
  s.add(flavors[0].id, 12, 2);
  s.add(flavors[0].id, 12, 1);
  s.add(flavors[0].id, 6, 1);
  s.add(flavors[0].id, 12, 1, true);
  const items = useCart.getState().items;
  assert.equal(items.length, 3);
  assert.equal(items[0].quantity, 3);
  assert.equal(cartTotal(items), 104.4);
});
test("cart rejects invalid input and caps quantities", () => {
  useCart.setState({ items: [] });
  const s = useCart.getState();
  assert.throws(() => s.add("missing"));
  assert.throws(() => s.add(flavors[0].id, 7));
  assert.throws(() => s.add(flavors[0].id, 12, -1));
  s.add(flavors[0].id, 12, 99);
  s.add(flavors[0].id, 12, 1);
  assert.equal(useCart.getState().items[0].quantity, 99);
  s.update(useCart.getState().items[0].key, 0);
  assert.equal(useCart.getState().items[0].quantity, 99);
});
test("custom pack cannot exceed 12 and can remove a specific slot", () => {
  usePack.getState().reset();
  for (let i = 0; i < 15; i++) usePack.getState().add(flavors[i % 6].id);
  assert.equal(usePack.getState().selection.length, 12);
  usePack.getState().remove(0);
  assert.equal(usePack.getState().selection.length, 11);
  assert.equal(usePack.getState().selection[0], flavors[1].id);
  usePack.getState().add("missing");
  assert.equal(usePack.getState().selection.length, 11);
});
test("box requires exactly 12 valid cans and merges equivalent mixes", () => {
  useCart.setState({ items: [] });
  const s = useCart.getState();
  assert.equal(s.addBox([flavors[0].id]), false);
  const mix = flavors.flatMap((f) => [f.id, f.id]);
  assert.equal(s.addBox(mix), true);
  assert.equal(s.addBox([...mix].reverse()), true);
  assert.equal(useCart.getState().items.length, 1);
  assert.equal(useCart.getState().items[0].quantity, 2);
  assert.equal(cartTotal(useCart.getState().items), 48);
});
test("demo checkout preserves order details and clears the cart", () => {
  useCart.setState({ items: [], orders: [] });
  useCart.getState().add(flavors[0].id, 12);
  const order = useCart.getState().completeDemo();
  assert.ok(order);
  assert.equal(order.total, 29.99);
  assert.equal(order.items[0].packSize, 12);
  assert.equal(useCart.getState().items.length, 0);
  assert.equal(useCart.getState().orders.length, 1);
  assert.equal(useCart.getState().completeDemo(), null);
});
test("free demo shipping begins at $48", () => {
  useCart.setState({ items: [], orders: [] });
  useCart.getState().add(flavors[0].id, 24);
  assert.equal(useCart.getState().completeDemo()?.total, 48);
});
