"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { flavors } from "@/data/flavors";
import { useCart, cartTotal } from "@/store/cartStore";
import { useFlavor } from "@/store/flavorStore";
interface Registry {
  registerTool: (
    tool: {
      name: string;
      description: string;
      inputSchema: object;
      annotations: { readOnlyHint: boolean };
      execute: (input: unknown) => unknown;
    },
    options: { signal: AbortSignal },
  ) => void | Promise<void>;
}
export function WebTools() {
  const pathname = usePathname();
  useEffect(() => {
    const ctx = (document as Document & { modelContext?: Registry })
      .modelContext;
    if (!ctx?.registerTool) return;
    const lifecycle = new AbortController();
    const tools = [
      {
        name: "read_fizza_cart",
        description: "Read the current device-local cart and subtotal in USD.",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true },
        execute: () => ({
          items: useCart.getState().items,
          subtotal: cartTotal(useCart.getState().items),
        }),
      },
      {
        name: "select_fizza_flavor",
        description: "Change the visible flavor world. Does not add to cart.",
        inputSchema: {
          type: "object",
          properties: {
            flavorId: { type: "string", enum: flavors.map((f) => f.id) },
          },
          required: ["flavorId"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false },
        execute: (input: unknown) => {
          if (!input || typeof input !== "object" || !("flavorId" in input))
            throw new Error("flavorId required");
          const index = flavors.findIndex((f) => f.id === input.flavorId);
          if (index < 0) throw new Error("Unknown flavor");
          useFlavor.getState().select(index);
          return { selected: flavors[index].id };
        },
      },
      {
        name: "add_fizza_pack_to_cart",
        description:
          "Add a one-time flavor pack to the device-local demo cart. Does not place an order.",
        inputSchema: {
          type: "object",
          properties: {
            flavorId: { type: "string", enum: flavors.map((f) => f.id) },
            packSize: { type: "integer", enum: [6, 12, 24] },
            quantity: { type: "integer", minimum: 1, maximum: 99 },
          },
          required: ["flavorId", "packSize", "quantity"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false },
        execute: (input: unknown) => {
          if (
            !input ||
            typeof input !== "object" ||
            !("flavorId" in input) ||
            !("packSize" in input) ||
            !("quantity" in input) ||
            typeof input.flavorId !== "string" ||
            typeof input.packSize !== "number" ||
            typeof input.quantity !== "number"
          )
            throw new Error("Invalid product");
          useCart
            .getState()
            .add(input.flavorId, input.packSize, input.quantity);
          return {
            items: useCart.getState().items,
            subtotal: cartTotal(useCart.getState().items),
          };
        },
      },
    ];
    for (const tool of tools) {
      if (tool.name === "select_fizza_flavor" && pathname !== "/") continue;
      try {
        Promise.resolve(
          ctx.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() => {});
      } catch {}
    }
    return () => lifecycle.abort();
  }, [pathname]);
  return null;
}
