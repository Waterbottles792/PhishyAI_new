"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { ArrowUpRight } from "lucide-react"

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="relative border-t border-border py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/[0.05] blur-[100px]" />
      </div>

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="relative z-10 mx-auto max-w-3xl px-6 text-center"
      >
        <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl text-balance">
          Ready to stop phishing threats?
        </h2>
        <p className="mx-auto mb-10 max-w-lg text-lg leading-relaxed text-muted-foreground">
          Deploy PhishGuard AI and get real-time email classification with
          explainability that security teams actually trust.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="/dashboard"
            className="group flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 hover:shadow-[0_0_30px_oklch(0.78_0.18_155/0.3)]"
          >
            Start Analyzing
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-border px-8 py-3.5 text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary"
          >
            View on GitHub
          </a>
        </div>
      </motion.div>
    </section>
  )
}
