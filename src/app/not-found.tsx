import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="not-found">
      <span className="eyebrow">404 / A LITTLE FLAT.</span>
      <h1>
        THIS FIZZ
        <br />
        FIZZLED OUT.
      </h1>
      <p>Let’s get you back to the good stuff.</p>
      <Link href="/" className="button ink">
        BACK TO FIZZA →
      </Link>
    </main>
  );
}
