"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Shield, Brain, Eye, FileSearch, BarChart3, Network } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Real-time Classification",
    description:
      "Paste any email and get instant phishing vs legitimate classification with a confidence score from 0 to 100%.",
    glow: "oklch(0.62 0.22 25)",
  },
  {
    icon: Brain,
    title: "Multi-Model Comparison",
    description:
      "Compare results across Naive Bayes, Random Forest, Logistic Regression, and LSTM/BERT models simultaneously.",
    glow: "oklch(0.78 0.18 155)",
  },
  {
    icon: Eye,
    title: "SHAP/LIME Explainability",
    description:
      "Understand exactly which features triggered a phishing alert with visual breakdowns of model decisions.",
    glow: "oklch(0.70 0.12 200)",
  },
  {
    icon: FileSearch,
    title: "30+ Feature Extraction",
    description:
      "URL analysis, urgency keywords, grammar scoring, sender reputation, HTML structure, and more in every scan.",
    glow: "oklch(0.78 0.18 155)",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Dataset insights, threat distribution charts, timeline trends, and top feature triggers at a glance.",
    glow: "oklch(0.75 0.16 80)",
  },
  {
    icon: Network,
    title: "Threat Level System",
    description:
      "Four-tier classification: Low, Medium, High, and Critical — with highlighted risk indicators in the email body.",
    glow: "oklch(0.65 0.10 280)",
  },
]

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.55,
        delay: index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025] p-8 transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.04]"
      style={
        {
          "--glow": feature.glow,
        } as React.CSSProperties
      }
    >
      {/* Corner glow on hover */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px at 0% 0%, ${feature.glow}15, transparent 50%)`,
        }}
      />

      {/* Top border glow on hover */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${feature.glow}60, transparent)`,
        }}
      />

      {/* Icon */}
      <div
        className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.04] transition-all duration-300 group-hover:border-white/[0.12] group-hover:bg-white/[0.07]"
        style={{
          boxShadow: `0 0 0 0 ${feature.glow}`,
        }}
      >
        <feature.icon
          className="h-5 w-5 transition-colors duration-300"
          style={{ color: feature.glow }}
        />
      </div>

      {/* Number */}
      <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-white/20">
        {String(index + 1).padStart(2, "0")}
      </div>

      <h3 className="mb-2.5 text-base font-semibold text-white">
        {feature.title}
      </h3>
      <p className="text-sm leading-relaxed text-white/40">
        {feature.description}
      </p>
    </motion.div>
  )
}

export function FeaturesSection() {
  const headingRef = useRef<HTMLDivElement>(null)
  const isHeadingInView = useInView(headingRef, { once: true, margin: "-100px" })

  return (
    <section id="features" className="relative py-24 md:py-32">
      {/* Section separator line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 24 }}
          animate={isHeadingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 max-w-xl"
        >
          <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
            Capabilities
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl text-balance">
            Everything you need to{" "}
            <span className="text-white/50">fight phishing</span>
          </h2>
          <p className="text-base leading-relaxed text-white/40">
            An end-to-end detection pipeline built on research-grade ML with
            full transparency into every decision.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
