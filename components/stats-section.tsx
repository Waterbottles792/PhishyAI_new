"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

const stats = [
  { value: "98.7%", label: "Detection accuracy across models", accent: true },
  { value: "30+", label: "Features extracted per email", accent: false },
  { value: "<200ms", label: "Average response time", accent: false },
  { value: "4", label: "ML models compared in real time", accent: false },
]

function StatItem({
  value,
  label,
  index,
  accent,
}: {
  value: string
  label: string
  index: number
  accent: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col gap-1.5 ${
        index !== 0 ? "md:border-l md:border-white/[0.06] md:pl-10 lg:pl-14" : ""
      }`}
    >
      <span
        className={`text-4xl font-bold tracking-tight md:text-5xl ${
          accent ? "text-primary" : "text-white"
        }`}
      >
        {value}
      </span>
      <span className="text-sm text-white/35">{label}</span>
    </motion.div>
  )
}

export function StatsSection() {
  return (
    <section className="relative py-16 md:py-24" id="stats">
      {/* Top/bottom separator lines */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-0">
          {stats.map((stat, i) => (
            <StatItem
              key={stat.label}
              value={stat.value}
              label={stat.label}
              index={i}
              accent={stat.accent}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
