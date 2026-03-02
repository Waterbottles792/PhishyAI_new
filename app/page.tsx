"use client"

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
import { useAttractors } from "@/hooks/use-attractors"
import CipherFlow from "@/components/cipher-flow"

export default function Home() {
  const { attractorsRef, register, setActive, unregister } = useAttractors()

  return (
    <CipherFlow>
      <div className="noise-overlay pointer-events-none fixed inset-0 z-50" />
      <Navbar />
      <HeroSection register={register} setActive={setActive} unregister={unregister} />
      <StatsSection />
      <FeaturesSection />
      <MarqueeSection />
      <HowItWorksSection />
      <DemoSection />
      <ModelsSection />
      <CTASection register={register} setActive={setActive} unregister={unregister} />
      <Footer />
    </CipherFlow>
  )
}
