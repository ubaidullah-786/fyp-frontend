import { HeroSection } from "@/components/home/hero-section";
import BenefitsSection from "@/components/home/benefits";
import { AuthRedirect } from "@/components/auth/auth-redirect";

export default function HomePage() {
  return (
    <>
      <AuthRedirect />
      <HeroSection />
      <BenefitsSection />
    </>
  );
}

