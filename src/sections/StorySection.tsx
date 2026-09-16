import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
export function StorySection() {
  return <section id="story" className="story-section field-story">
    <div className="story-photo"><img src="/images/fizza-picnic.webp" alt="FIZZA cans on ice, fresh fruit, and friends sharing a picnic" loading="lazy" decoding="async" width={1536} height={1024} /><span className="photo-caption">FIELD NOTES / BEST SHARED, ICE COLD.</span></div>
    <div className="story-copy"><span className="eyebrow">04 / OFF THE CLOCK. OPEN A CAN.</span><h2>LESS SCROLL.<br /><span>MORE SIP.</span></h2><p>Take the long lunch. Bring the extra chair. Open the flavor you’ve never tried.</p><p>FIZZA is fruit juice, cane sugar, and a little carbonation for the unplanned part of your day. Six flavors. No wrong place to start.</p><Link className="button ink" href="/#build-pack">BRING A BOX TO THE TABLE <ArrowUpRight size={18} /></Link><span className="story-signoff">With fizz, FIZZA.</span></div>
  </section>;
}
