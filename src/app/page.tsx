import { HeroSection } from "@/components/HeroSection";
import { LetterShowcase } from "@/components/LetterShowcase";
import { FeaturesSection } from "@/components/FeaturesSection";
import { CapsuleTypesSection } from "@/components/CapsuleTypesSection";
import { ComparisonSection } from "@/components/ComparisonSection";
import { FooterSection } from "@/components/FooterSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <LetterShowcase />
      <FeaturesSection />
      <CapsuleTypesSection />
      <ComparisonSection />
      <FooterSection />
    </>
  );
}
