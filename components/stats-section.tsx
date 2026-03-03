"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

const stats = [
  { value: "98.7%", label: "Detection accuracy across models" },
  { value: "30+", label: "Features extracted per email" },
  { value: "<200ms", label: "Average response time" },
  { value: "4", label: "ML models compared in real time" },
]

function StatItem({ value, label, index }: { value: string; label: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col gap-1.5 ${index !== 0 ? "md:border-l md:border-border md:pl-10 lg:pl-14" : ""}`}
    >
      <span className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
        {value}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </motion.div>
  )
}

export function StatsSection() {
  return (
    <section className="relative border-y border-border py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-0">
          {stats.map((stat, i) => (
            <StatItem key={stat.label} value={stat.value} label={stat.label} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
