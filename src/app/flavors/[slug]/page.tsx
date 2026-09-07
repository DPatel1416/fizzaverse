import { notFound } from "next/navigation";
import { flavors } from "@/data/flavors";
import { ProductDetail } from "@/components/shop/ProductDetail";
export function generateStaticParams() {
  return flavors.map((f) => ({ slug: f.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const f = flavors.find((f) => f.slug === slug);
  return f ? { title: f.name, description: f.description } : {};
}
export default async function Product({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const f = flavors.find((f) => f.slug === slug);
  if (!f) notFound();
  return <ProductDetail flavor={f} />;
}
