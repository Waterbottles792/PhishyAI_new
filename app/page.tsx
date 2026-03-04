"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { HeroSection } from "@/components/hero-section"
import { StatsSection } from "@/components/stats-section"
import { FeaturesSection } from "@/components/features-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { DemoSection } from "@/components/demo-section"
import { ModelsSection } from "@/components/models-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { useAttractors } from "@/hooks/use-attractors"
import CipherFlow from "@/components/cipher-flow"
import { LandingSidebar } from "@/components/landing-sidebar"
import { MascotBot } from "@/components/mascot-bot"

export default function Home() {
  const { register, setActive, unregister } = useAttractors()
  const [sidebarW, setSidebarW] = useState(60)

  // Sync with sidebar state on mount
  useEffect(() => {
    const stored = localStorage.getItem("landing-sidebar-expanded")
    setSidebarW(stored === "true" ? 220 : 60)
  }, [])

  return (
    <CipherFlow>
      <div className="noise-overlay pointer-events-none fixed inset-0 z-50" />

      {/* Sidebar */}
      <LandingSidebar onWidthChange={setSidebarW} />

      {/* Main content shifted right by sidebar */}
      <motion.div
        animate={{ marginLeft: sidebarW }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <HeroSection register={register} setActive={setActive} unregister={unregister} />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <DemoSection />
        <ModelsSection />
        <CTASection register={register} setActive={setActive} unregister={unregister} />
        <Footer />
      </motion.div>

      {/* Floating mascot bot */}
      <MascotBot />
    </CipherFlow>
  )
}
