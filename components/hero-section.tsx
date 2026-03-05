"use client"

import { useRef, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  ArrowUpRight,
  Zap,
  LayoutDashboard,
} from "lucide-react"
import dynamic from "next/dynamic"
import { SignedIn, SignedOut } from "@clerk/nextjs"

/* ─── Lazy-load the Three.js canvas (client only) ─────────────────── */
const NeuralCanvas = dynamic(() => import("./neural-canvas"), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
})

/* ─── Hero Section Props ───────────────────────────────────────────── */
interface HeroSectionProps {
  register?: (id: string, rect: DOMRect) => void
  setActive?: (id: string, active: boolean) => void
  unregister?: (id: string) => void
}

/* ─── Hero Section ─────────────────────────────────────────────────── */
export function HeroSection({
  register,
  setActive,
  unregister,
}: HeroSectionProps = {}) {
  const btnRef = useRef<HTMLAnchorElement>(null)
  const ATTRACTOR_ID = "hero-cta"

  const updatePosition = useCallback(() => {
    if (btnRef.current && register) {
      register(ATTRACTOR_ID, btnRef.current.getBoundingClientRect())
    }
  }, [register])

  useEffect(() => {
    updatePosition()
    window.addEventListener("scroll", updatePosition)
    window.addEventListener("resize", updatePosition)
    return () => {
      window.removeEventListener("scroll", updatePosition)
      window.removeEventListener("resize", updatePosition)
      unregister?.(ATTRACTOR_ID)
    }
  }, [updatePosition, unregister])

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center px-6 pt-16"
    >
      {/* Radial glow accent behind hero right */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/4 h-[700px] w-[700px] -translate-y-1/4 translate-x-1/3 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(0.78 0.18 155 / 0.07) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto w-full max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* ── LEFT: Copy ─────────────────────────────────────────── */}
          <div>
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="mb-5 text-5xl font-bold leading-[1.06] tracking-tight text-white md:text-6xl xl:text-[68px]"
            >
              Phishing detection
              <br />
              <span className="text-primary">that explains itself.</span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-4 max-w-[440px] text-base leading-relaxed text-white/50 md:text-lg"
            >
              AI-powered phishing analysis with explainable machine learning
              models. Four models run in parallel — SHAP and LIME break down
              exactly which signals flagged your email.
            </motion.p>

            {/* CTA group */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.28 }}
              className="mb-10 flex flex-wrap gap-3"
            >
              {/* Primary CTA */}
              <a
                ref={btnRef}
                href="/dashboard/email"
                onMouseEnter={() => {
                  updatePosition()
                  setActive?.(ATTRACTOR_ID, true)
                }}
                onMouseLeave={() => setActive?.(ATTRACTOR_ID, false)}
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 hover:shadow-[0_0_28px_oklch(0.78_0.18_155/0.38)]"
              >
                <Zap className="h-3.5 w-3.5" />
                Try Demo
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>

              {/* Dashboard CTA (signed in) */}
              <SignedIn>
                <a
                  href="/dashboard"
                  className="group inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/[0.06] px-7 py-3 text-sm font-medium text-primary transition-all hover:border-primary/50 hover:bg-primary/[0.1]"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </a>
              </SignedIn>

              {/* Sign In CTA (signed out) */}
              <SignedOut>
                <a
                  href="/sign-in"
                  className="group inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/[0.06] px-7 py-3 text-sm font-medium text-primary transition-all hover:border-primary/50 hover:bg-primary/[0.1]"
                >
                  Sign in with Google
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </SignedOut>

              {/* Features CTA */}
              <a
                href="#features"
                className="inline-flex items-center rounded-full border border-white/[0.08] px-7 py-3 text-sm font-medium text-white/40 transition-colors hover:border-white/20 hover:text-white/70"
              >
                Explore Features
              </a>
            </motion.div>

            {/* Trust stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center gap-8"
            >
              {[
                { value: "98.7%", label: "Accuracy" },
                { value: "4", label: "ML Models" },
                { value: "<200ms", label: "Response" },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className={
                    i !== 0 ? "border-l border-white/[0.07] pl-8" : ""
                  }
                >
                  <div className="text-lg font-bold text-white">{s.value}</div>
                  <div className="text-xs text-white/30">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT: 3D Neural Network + Analysis Card ────────────── */}
          <div className="relative h-[560px] lg:h-[620px]">
            {/* Neural network canvas — fills the right column */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.1 }}
              className="absolute inset-0"
            >
              <NeuralCanvas />
            </motion.div>

            {/* Gradient vignette on left edge so it blends into left column */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-32"
              style={{
                background:
                  "linear-gradient(to right, var(--color-background), transparent)",
              }}
            />

          </div>
        </div>
      </div>
    </section>
  )
}
