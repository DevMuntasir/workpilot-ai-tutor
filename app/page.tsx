import Footer from "@/components/footer";
import SignInForm from "@/components/form";
import Hero from "@/components/hero-section-demo-1";
import BrandScrollVelocitySection from "@/components/home/brand-scroll-section";
import FeaturesSection from "@/components/home/features-section";
import PricingSection from "@/components/home/pricing";
import MacbookScrollDemo from "@/components/macbook-scroll-demo";
import Nav from "@/components/resizable-navbar";
import { BackgroundRipple } from "@/components/ui/background-ripple-effect";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav>
  
      <div className="relative flex min-h-screen w-full flex-col items-start justify-start">
        <BackgroundRipple />
        <div className=" w-full">
            <Hero />
            {/* <SignInForm/> */}
            <BrandScrollVelocitySection />
            <MacbookScrollDemo/>
            <FeaturesSection />
            <PricingSection />
            <Footer />
        </div>
      </div>
      </Nav>
    </main>
  );
}
