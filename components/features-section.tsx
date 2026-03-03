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
  },
  {
    icon: Brain,
    title: "Multi-Model Comparison",
    description:
      "Compare results across Naive Bayes, Random Forest, Logistic Regression, and LSTM/BERT models simultaneously.",
  },
  {
    icon: Eye,
    title: "SHAP/LIME Explainability",
    description:
      "Understand exactly which features triggered a phishing alert with visual breakdowns of model decisions.",
  },
  {
    icon: FileSearch,
    title: "30+ Feature Extraction",
    description:
      "URL analysis, urgency keywords, grammar scoring, sender reputation, and header inspection in every scan.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Dataset insights, threat distribution charts, timeline trends, and top feature triggers at a glance.",
  },
  {
    icon: Network,
    title: "Threat Level System",
    description:
      "Four-tier classification: Low, Medium, High, and Critical, with highlighted risk indicators in the email body.",
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
        duration: 0.5,
        delay: index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative rounded-2xl border border-border bg-card/40 p-8 transition-colors duration-300 hover:border-primary/25 hover:bg-card"
    >
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
        <feature.icon className="h-5 w-5" />
      </div>
      <h3 className="mb-2.5 text-base font-semibold text-foreground">{feature.title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
    </motion.div>
  )
}

export function FeaturesSection() {
  const headingRef = useRef<HTMLDivElement>(null)
  const isHeadingInView = useInView(headingRef, { once: true, margin: "-100px" })

  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 24 }}
          animate={isHeadingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 max-w-xl"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            Capabilities
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-5xl text-balance">
            Everything you need to fight phishing
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
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
