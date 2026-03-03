"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Shield, ArrowRight, Sparkles } from "lucide-react"

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="relative py-24 md:py-32 px-4">
      {/* Cyan glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,217,225,0.05)_0%,transparent_60%)]" />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="relative mx-auto max-w-3xl"
      >
        <div className="relative rounded-2xl border border-primary/20 bg-card/50 backdrop-blur-sm p-8 md:p-14 text-center overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(30,217,225,0.06)_0%,transparent_70%)]" />

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20"
            >
              <Shield className="h-8 w-8 text-primary" />
            </motion.div>

            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-balance">
              Ready to Secure Your Inbox?
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto mb-8 text-pretty">
              Start analyzing emails with PhishGuard AI today. Paste any suspicious
              email and get instant classification with full explainability.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#demo"
                className="group flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:scale-105 glow-blue"
              >
                <Sparkles className="h-4 w-4" />
                Try the Demo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-border px-8 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-card hover:scale-105"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
