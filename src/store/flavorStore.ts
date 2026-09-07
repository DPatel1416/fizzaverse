"use client";
import { create } from "zustand";
export const useFlavor = create<{
  index: number;
  select: (index: number) => void;
}>((set) => ({ index: 0, select: (index) => set({ index: (index + 6) % 6 }) }));
