export type Quality = "high" | "medium" | "low";
export const qualityProfiles = {
  high: {
    dpr: 1.75,
    bubbles: 55,
    droplets: 240,
    segments: 96,
    transmission: 0.7,
  },
  medium: {
    dpr: 1.35,
    bubbles: 35,
    droplets: 160,
    segments: 64,
    transmission: 0.35,
  },
  low: { dpr: 1, bubbles: 12, droplets: 70, segments: 40, transmission: 0 },
};
export function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
export function detectQuality(): Quality {
  if (typeof window === "undefined") return "medium";
  if (window.innerWidth < 768 || navigator.hardwareConcurrency < 4)
    return "low";
  return window.devicePixelRatio > 2 ? "medium" : "high";
}
