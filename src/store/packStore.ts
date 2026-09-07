"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeStorage } from "@/lib/storage";
import { flavors } from "@/data/flavors";
export const usePack = create<{
  selection: string[];
  add: (id: string) => void;
  remove: (index: number) => void;
  reset: () => void;
  surprise: () => void;
}>()(
  persist(
    (set) => ({
      selection: [],
      add: (id) =>
        set((s) =>
          s.selection.length < 12 && flavors.some((f) => f.id === id)
            ? { selection: [...s.selection, id] }
            : {},
        ),
      remove: (index) =>
        set((s) => ({ selection: s.selection.filter((_, i) => i !== index) })),
      reset: () => set({ selection: [] }),
      surprise: () => set({ selection: flavors.flatMap((f) => [f.id, f.id]) }),
    }),
    { name: "fizza-pack-v1", storage: createJSONStorage(() => safeStorage) },
  ),
);
