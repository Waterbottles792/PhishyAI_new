import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { StatsSection } from "@/components/stats-section"
import { FeaturesSection } from "@/components/features-section"
import { MarqueeSection } from "@/components/marquee-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { DemoSection } from "@/components/demo-section"
import { ModelsSection } from "@/components/models-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <div className="noise-overlay pointer-events-none fixed inset-0 z-50" />
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <MarqueeSection />
      <HowItWorksSection />
      <DemoSection />
      <ModelsSection />
      <CTASection />
      <Footer />
    </main>
  )
}
