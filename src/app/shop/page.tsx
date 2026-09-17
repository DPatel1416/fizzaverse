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
        <span className="eyebrow">SIP SOMETHING HAPPY.</span>
        <h1>
          ALL FIZZ.
          <br />
          <span>NO BORING.</span>
        </h1>
        <p>
          Your new favorite flavor is in here.
          <br />
          Probably more than one.
        </p>
      </div>
      <ShopGrid />
    </main>
  );
}
