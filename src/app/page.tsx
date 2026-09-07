import { HeroSection } from "@/sections/HeroSection";
import { IngredientsSection } from "@/sections/IngredientsSection";
import { FlavorCarousel } from "@/sections/FlavorCarousel";
import { BuildPackSection } from "@/sections/BuildPackSection";
import { StorySection } from "@/sections/StorySection";
import { FindUsSection } from "@/sections/FindUsSection";
export default function Home() {
  return (
    <main id="main">
      <HeroSection />
      <IngredientsSection />
      <FlavorCarousel />
      <BuildPackSection />
      <StorySection />
      <FindUsSection />
    </main>
  );
}
