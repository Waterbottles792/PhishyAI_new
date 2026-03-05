"use client"

import { useRef, useEffect, useCallback } from "react"
import { motion, useInView } from "framer-motion"
import { ArrowUpRight, Zap } from "lucide-react"

interface CTASectionProps {
  register?: (id: string, rect: DOMRect) => void
  setActive?: (id: string, active: boolean) => void
  unregister?: (id: string) => void
}

export function CTASection({
  register,
  setActive,
  unregister,
}: CTASectionProps = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLAnchorElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const ATTRACTOR_ID = "cta-btn"

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
    <section className="relative py-24 md:py-36">
      {/* Separator */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div
          className="h-[500px] w-[800px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.78 0.18 155 / 0.12) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="relative z-10 mx-auto max-w-3xl px-6 text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.07] px-3.5 py-1.5"
        >
          <Zap className="h-3 w-3 text-primary" />
          <span className="font-mono text-xs font-medium text-primary">
            Free to try — no credit card required
          </span>
        </motion.div>

        <h2 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl text-balance">
          Ready to stop
          <br />
          <span className="text-primary">phishing threats?</span>
        </h2>
        <p className="mx-auto mb-10 max-w-lg text-lg leading-relaxed text-white/40">
          Deploy PhishGuard AI and get real-time email classification with
          explainability that security teams actually trust.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            ref={btnRef}
            href="/dashboard"
            onMouseEnter={() => {
              updatePosition()
              setActive?.(ATTRACTOR_ID, true)
            }}
            onMouseLeave={() => setActive?.(ATTRACTOR_ID, false)}
            className="group flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 hover:shadow-[0_0_35px_oklch(0.78_0.18_155/0.35)]"
          >
            Start Analyzing
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-white/[0.08] px-8 py-3.5 text-sm font-medium text-white/50 transition-all hover:border-white/[0.15] hover:text-white"
          >
            View on GitHub
          </a>
        </div>
      </motion.div>
    </section>
  )
}
