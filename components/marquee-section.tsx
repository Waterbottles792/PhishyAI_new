"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

const capabilities = [
  "URL domain analysis",
  "Urgency keyword scoring",
  "Grammar quality assessment",
  "Brand impersonation detection",
  "Header anomaly inspection",
  "HTML structure analysis",
  "Sender reputation check",
  "Sentiment analysis",
  "Link-to-text ratio",
  "Attachment type scoring",
  "Time-pressure language",
  "Credential request detection",
]

export function MarqueeSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative overflow-hidden border-t border-border py-16">
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-6 px-6 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Extraction Capabilities
          </p>
        </div>
        <div className="relative">
          {/* Gradient masks */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-background to-transparent" />
          
          <div className="flex animate-marquee">
            {[...capabilities, ...capabilities].map((cap, i) => (
              <div
                key={`${cap}-${i}`}
                className="flex flex-shrink-0 items-center gap-3 px-4"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="whitespace-nowrap text-sm text-secondary-foreground">
                  {cap}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
