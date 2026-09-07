"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeStorage } from "@/lib/storage";
import { flavors, getFlavor, packPrice } from "@/data/flavors";
export interface CartItem {
  key: string;
  flavorId: string;
  packSize: number;
  quantity: number;
  subscription: boolean;
  selection?: string[];
}
export function itemPrice(item: CartItem) {
  return item.selection
    ? 24
    : packPrice(getFlavor(item.flavorId), item.packSize, item.subscription);
}
export function cartTotal(items: CartItem[]) {
  return (
    items.reduce(
      (sum, item) => sum + Math.round(itemPrice(item) * 100) * item.quantity,
      0,
    ) / 100
  );
}
export interface Order {
  id: string;
  date: string;
  total: number;
  items: CartItem[];
}
interface CartState {
  items: CartItem[];
  orders: Order[];
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (
    flavorId: string,
    packSize?: number,
    quantity?: number,
    subscription?: boolean,
  ) => void;
  addBox: (selection: string[]) => boolean;
  update: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  completeDemo: () => Order | null;
}
export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      orders: [],
      open: false,
      setOpen: (open) => set({ open }),
      add: (flavorId, packSize = 12, quantity = 1, subscription = false) => {
        const f = flavors.find((f) => f.id === flavorId);
        if (
          !f ||
          !f.packSizes.includes(packSize) ||
          !Number.isInteger(quantity) ||
          quantity < 1 ||
          quantity > 99
        )
          throw new Error("Invalid product selection");
        const key = `${flavorId}-${packSize}-${subscription}`;
        set((s) => ({
          items: s.items.some((i) => i.key === key)
            ? s.items.map((i) =>
                i.key === key
                  ? { ...i, quantity: Math.min(99, i.quantity + quantity) }
                  : i,
              )
            : [...s.items, { key, flavorId, packSize, quantity, subscription }],
          open: true,
        }));
      },
      addBox: (selection) => {
        if (
          selection.length !== 12 ||
          selection.some((id) => !flavors.some((f) => f.id === id))
        )
          return false;
        const key = `box-${selection.slice().sort().join(",")}`;
        set((s) => ({
          items: s.items.some((i) => i.key === key)
            ? s.items.map((i) =>
                i.key === key
                  ? { ...i, quantity: Math.min(99, i.quantity + 1) }
                  : i,
              )
            : [
                ...s.items,
                {
                  key,
                  flavorId: selection[0],
                  packSize: 12,
                  quantity: 1,
                  subscription: false,
                  selection: [...selection],
                },
              ],
          open: true,
        }));
        return true;
      },
      update: (key, quantity) => {
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99)
          return;
        set((s) => ({
          items: s.items.map((i) => (i.key === key ? { ...i, quantity } : i)),
        }));
      },
      remove: (key) =>
        set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      completeDemo: () => {
        const items = get().items;
        if (!items.length) return null;
        const subtotal = cartTotal(items);
        const order = {
          id: `FZ-${Date.now().toString(36).toUpperCase()}`,
          date: new Date().toISOString(),
          total:
            (Math.round(subtotal * 100) + (subtotal >= 48 ? 0 : 599)) / 100,
          items: items.map((i) => ({ ...i })),
        };
        set((s) => ({ orders: [order, ...s.orders], items: [], open: false }));
        return order;
      },
    }),
    {
      name: "fizza-cart-v1",
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ items: s.items, orders: s.orders }),
    },
  ),
);
