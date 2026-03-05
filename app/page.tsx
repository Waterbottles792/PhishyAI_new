"use client"

import { HeroSection } from "@/components/hero-section"
import { StatsSection } from "@/components/stats-section"
import { FeaturesSection } from "@/components/features-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { DemoSection } from "@/components/demo-section"
import { ModelsSection } from "@/components/models-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { useAttractors } from "@/hooks/use-attractors"
import CipherFlow from "@/components/cipher-flow"
import { MascotBot } from "@/components/mascot-bot"

export default function Home() {
  const { register, setActive, unregister } = useAttractors()

  return (
    <CipherFlow>
      {/* Film-grain noise texture */}
      <div className="noise-overlay pointer-events-none fixed inset-0 z-50" />

      {/* Sticky glassmorphic top navbar */}
      <Navbar />

      {/* Page content */}
      <HeroSection
        register={register}
        setActive={setActive}
        unregister={unregister}
      />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <DemoSection />
      <ModelsSection />
      <CTASection
        register={register}
        setActive={setActive}
        unregister={unregister}
      />
      <Footer />

      {/* Floating mascot AI bot */}
      <MascotBot />
    </CipherFlow>
  )
}
