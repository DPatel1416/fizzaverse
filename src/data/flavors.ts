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
    shortName: "Berry bright.",
    tagline: "A little sweet. A little zing. A whole lot of sunshine.",
    description:
      "Sun-ripened strawberry meets a bright squeeze of lemon. Sweet, tart, and ridiculously refreshing. Your new glass-half-full kind of soda.",
    price: 24,
    primaryColor: "#e94071",
    secondaryColor: "#ffb3c9",
    accentColor: "#f5f34c",
    backgroundColor: "#ef839b",
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
    shortName: "Dream in orange.",
    tagline: "Your favorite golden-hour daydream, in a can.",
    description:
      "Juicy orange and a soft swirl of vanilla. All the nostalgia of a creamsicle, with a crisp, bubbly finish.",
    price: 24,
    primaryColor: "#f58129",
    secondaryColor: "#ffd6a2",
    accentColor: "#f7f19c",
    backgroundColor: "#f7af6d",
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
    shortName: "Cherry on top.",
    tagline: "A familiar favorite with a wild cherry twist.",
    description:
      "Deep cherry flavor meets classic cola spice. Rich, bright, and made for the moments you wish would last a little longer.",
    price: 24,
    primaryColor: "#a71d38",
    secondaryColor: "#f698a5",
    accentColor: "#f7dc73",
    backgroundColor: "#cf6778",
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
    shortName: "Summer on repeat.",
    tagline: "Big slice-of-summer energy. No seeds required.",
    description:
      "Fresh watermelon flavor with an impossibly crisp finish. Like the first bite on the hottest day, only bubblier.",
    price: 24,
    primaryColor: "#ed617a",
    secondaryColor: "#b5db99",
    accentColor: "#d6ee78",
    backgroundColor: "#f5a1ae",
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
    shortName: "Good mood, bottled.",
    tagline: "A juicy little purple pick-me-up.",
    description:
      "Bold grape flavor, delicate bubbles, and a wonderfully nostalgic finish. Bring a little purple to your everyday.",
    price: 24,
    primaryColor: "#8040b1",
    secondaryColor: "#d9b7ec",
    accentColor: "#dcef82",
    backgroundColor: "#b493cd",
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
    shortName: "Squeeze the day.",
    tagline: "A bright little spark for whatever comes next.",
    description:
      "Zesty lime with a clean, sparkling finish. A little tart, a little tropical, and a whole lot of refreshment.",
    price: 24,
    primaryColor: "#5aaa47",
    secondaryColor: "#d4e89c",
    accentColor: "#f1f55c",
    backgroundColor: "#aacf81",
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
