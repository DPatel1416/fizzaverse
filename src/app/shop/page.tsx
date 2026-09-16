import { ShopGrid } from "@/components/shop/ShopGrid";
export const metadata = {
  title: "Shop the fizz",
  description:
    "Six bold fruit flavors, one very good soda. Shop FIZZA 12-packs or build your own variety box.",
};
export default function Shop() {
  return (
    <main id="main" className="shop-page">
      <div className="shop-heading">
        <span className="eyebrow">FIZZA FLAVOR DEPT. / THE COLLECTION</span>
        <h1>
          PICK YOUR
          <br />
          <span>HEAVY HITTER.</span>
        </h1>
        <p>
          Six flavors. Twelve cans. $24 a pack.
          <br />
          Start with a favorite, or mix your own.
        </p>
      </div>
      <ShopGrid />
    </main>
  );
}
