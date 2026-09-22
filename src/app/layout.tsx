import type { Metadata } from "next";
import { Shell } from "@/components/layout/Shell";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "FIZZA — Soda, but way more fun.", template: "%s | FIZZA" },
  description:
    "Big flavor. Bright energy. Zero boring. Explore six delicious FIZZA sodas and build your own box of good days.",
  metadataBase: new URL(
    process.env.SITE_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000"),
  ),
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
