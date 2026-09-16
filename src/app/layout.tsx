import type { Metadata } from "next";
import { Shell } from "@/components/layout/Shell";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "FIZZA — Fruit with volume.", template: "%s | FIZZA" },
  description:
    "Sweet. Sharp. Loud. Explore six fruit-forward FIZZA sodas, find your flavor, and mix your own 12-can collection.",
  metadataBase: new URL("https://fizzaverse-soda.mythkikiop.chatgpt.site"),
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
