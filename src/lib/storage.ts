import type { StateStorage } from "zustand/middleware";
const memory = new Map<string, string>();
// Private browsing and quota failures should not make the storefront unusable.
export const safeStorage: StateStorage = {
  getItem(name) {
    try {
      return typeof window === "undefined"
        ? (memory.get(name) ?? null)
        : (window.localStorage.getItem(name) ?? memory.get(name) ?? null);
    } catch {
      return memory.get(name) ?? null;
    }
  },
  setItem(name, value) {
    memory.set(name, value);
    try {
      if (typeof window !== "undefined")
        window.localStorage.setItem(name, value);
    } catch {}
  },
  removeItem(name) {
    memory.delete(name);
    try {
      if (typeof window !== "undefined") window.localStorage.removeItem(name);
    } catch {}
  },
};
