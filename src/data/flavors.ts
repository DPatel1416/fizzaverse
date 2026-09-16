export type FruitType =
  "strawberry" | "orange" | "cherry" | "watermelon" | "grape" | "lime";
export interface Flavor {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  price: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  canTexture: string;
  fruitType: FruitType;
  ingredients: string[];
  nutrition: { calories: number; sugar: number; sodium: number; carbs: number };
  packSizes: readonly number[];
}
export const flavors: Flavor[] = [
  {
    id: "strawberry-lemon",
    slug: "strawberry-lemon",
    name: "Strawberry Lemon",
    shortName: "Sweet berry. Lemon snap.",
    tagline: "Sweet strawberry. Sharp lemon. A crisp finish.",
    description:
      "Strawberry opens sweet. Lemon cuts through. A bright, tart finish keeps the next sip as good as the first.",
    price: 24,
    primaryColor: "#e94071",
    secondaryColor: "#ffb3c9",
    accentColor: "#f5f34c",
    backgroundColor: "#ef839b",
    canTexture: "/labels/strawberry-lemon.svg",
    fruitType: "strawberry",
    ingredients: [
      "Carbonated water",
      "Strawberry juice",
      "Lemon juice",
      "Cane sugar",
      "Natural fruit flavors",
      "Citric acid",
    ],
    nutrition: { calories: 35, sugar: 7, sodium: 15, carbs: 9 },
    packSizes: [6, 12, 24],
  },
  {
    id: "orange-cream",
    slug: "orange-cream",
    name: "Orange Cream",
    shortName: "Citrus meets vanilla.",
    tagline: "Juicy orange. Soft vanilla. Creamsicle nostalgia.",
    description:
      "Juicy orange and a soft swirl of vanilla. All the nostalgia of a creamsicle, with a crisp, bubbly finish.",
    price: 24,
    primaryColor: "#f58129",
    secondaryColor: "#ffd6a2",
    accentColor: "#f7f19c",
    backgroundColor: "#f7af6d",
    canTexture: "/labels/orange-cream.svg",
    fruitType: "orange",
    ingredients: [
      "Carbonated water",
      "Orange juice",
      "Cane sugar",
      "Natural vanilla flavor",
      "Citric acid",
    ],
    nutrition: { calories: 40, sugar: 8, sodium: 10, carbs: 10 },
    packSizes: [6, 12, 24],
  },
  {
    id: "cherry-cola",
    slug: "cherry-cola",
    name: "Cherry Cola",
    shortName: "Dark cherry. Cola spice.",
    tagline: "Deep cherry. Classic cola spice. A bold finish.",
    description:
      "Dark cherry leads, with familiar cola spice underneath. Rich and rounded, with a bright cherry finish.",
    price: 24,
    primaryColor: "#a71d38",
    secondaryColor: "#f698a5",
    accentColor: "#f7dc73",
    backgroundColor: "#cf6778",
    canTexture: "/labels/cherry-cola.svg",
    fruitType: "cherry",
    ingredients: [
      "Carbonated water",
      "Cherry juice",
      "Cane sugar",
      "Natural cola flavor",
      "Citric acid",
    ],
    nutrition: { calories: 40, sugar: 8, sodium: 15, carbs: 10 },
    packSizes: [6, 12, 24],
  },
  {
    id: "watermelon-rush",
    slug: "watermelon-rush",
    name: "Watermelon Rush",
    shortName: "Fresh melon. Clean finish.",
    tagline: "Watermelon up front. Crisp bubbles all the way through.",
    description:
      "Fresh watermelon flavor with an impossibly crisp finish. Like the first bite on the hottest day, only bubblier.",
    price: 24,
    primaryColor: "#ed617a",
    secondaryColor: "#b5db99",
    accentColor: "#d6ee78",
    backgroundColor: "#f5a1ae",
    canTexture: "/labels/watermelon-rush.svg",
    fruitType: "watermelon",
    ingredients: [
      "Carbonated water",
      "Watermelon juice",
      "Cane sugar",
      "Natural fruit flavors",
      "Citric acid",
    ],
    nutrition: { calories: 35, sugar: 7, sodium: 10, carbs: 9 },
    packSizes: [6, 12, 24],
  },
  {
    id: "grape-glow",
    slug: "grape-glow",
    name: "Grape Glow",
    shortName: "Full grape. Fine bubbles.",
    tagline: "Bold grape. Delicate bubbles. An old-school favorite.",
    description:
      "Full, juicy grape flavor with a mellow sweetness and fine carbonation. The soda-fountain classic, with a lighter finish.",
    price: 24,
    primaryColor: "#8040b1",
    secondaryColor: "#d9b7ec",
    accentColor: "#dcef82",
    backgroundColor: "#b493cd",
    canTexture: "/labels/grape-glow.svg",
    fruitType: "grape",
    ingredients: [
      "Carbonated water",
      "Grape juice",
      "Cane sugar",
      "Natural fruit flavors",
      "Citric acid",
    ],
    nutrition: { calories: 40, sugar: 8, sodium: 10, carbs: 10 },
    packSizes: [6, 12, 24],
  },
  {
    id: "lime-spark",
    slug: "lime-spark",
    name: "Lime Spark",
    shortName: "Zesty lime. Sharp sparkle.",
    tagline: "Zesty lime. A tart edge. Clean, sharp sparkle.",
    description:
      "Zesty lime with a clean, sparkling finish. A little tart, a little tropical, and a whole lot of refreshment.",
    price: 24,
    primaryColor: "#5aaa47",
    secondaryColor: "#d4e89c",
    accentColor: "#f1f55c",
    backgroundColor: "#aacf81",
    canTexture: "/labels/lime-spark.svg",
    fruitType: "lime",
    ingredients: [
      "Carbonated water",
      "Lime juice",
      "Cane sugar",
      "Natural fruit flavors",
      "Citric acid",
    ],
    nutrition: { calories: 30, sugar: 6, sodium: 10, carbs: 8 },
    packSizes: [6, 12, 24],
  },
];
export const getFlavor = (id: string) =>
  flavors.find((f) => f.id === id) ?? flavors[0];
export const packPrice = (f: Flavor, size: number, subscription = false) =>
  Math.round(((f.price * size) / 12) * (subscription ? 0.85 : 1) * 100) / 100;
export const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value,
  );
