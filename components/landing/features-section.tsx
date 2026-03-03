"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import {
  Shield,
  Brain,
  BarChart3,
  Layers,
  FileSearch,
  Zap,
  LineChart,
  Upload,
} from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Real-Time Classification",
    description:
      "Instantly classify emails as phishing or legitimate with confidence scores and threat levels from Low to Critical.",
    color: "text-primary",
    glow: "bg-primary/10",
    border: "border-primary/20 hover:border-primary/40",
  },
  {
    icon: Brain,
    title: "Multi-Model Comparison",
    description:
      "Compare predictions across Naive Bayes, Random Forest, Logistic Regression, and Gradient Boosting models side-by-side.",
    color: "text-chart-5",
    glow: "bg-chart-5/10",
    border: "border-chart-5/20 hover:border-chart-5/40",
  },
  {
    icon: BarChart3,
    title: "SHAP/LIME Explainability",
    description:
      "Transparent AI decisions. See exactly which features triggered the alert with interactive importance charts.",
    color: "text-success",
    glow: "bg-success/10",
    border: "border-success/20 hover:border-success/40",
  },
  {
    icon: FileSearch,
    title: "Feature Extraction",
    description:
      "30+ features extracted including URL analysis, urgency detection, grammar scoring, and structural patterns.",
    color: "text-warning",
    glow: "bg-warning/10",
    border: "border-warning/20 hover:border-warning/40",
  },
  {
    icon: LineChart,
    title: "Analytics Dashboard",
    description:
      "Track threat trends, view distribution charts, and monitor the most common phishing indicators over time.",
    color: "text-primary",
    glow: "bg-primary/10",
    border: "border-primary/20 hover:border-primary/40",
  },
  {
    icon: Upload,
    title: "Batch Analysis",
    description:
      "Upload CSV files with multiple emails for bulk analysis. Get aggregated results with summary statistics.",
    color: "text-chart-5",
    glow: "bg-chart-5/10",
    border: "border-chart-5/20 hover:border-chart-5/40",
  },
  {
    icon: Layers,
    title: "Risk Indicators",
    description:
      "Highlighted risk indicators show urgency language, suspicious URLs, generic greetings, and domain mismatches.",
    color: "text-destructive",
    glow: "bg-destructive/10",
    border: "border-destructive/20 hover:border-destructive/40",
  },
  {
    icon: Zap,
    title: "Highlighted Email View",
    description:
      "See flagged words and phrases highlighted directly in the email body, color-coded by threat severity.",
    color: "text-success",
    glow: "bg-success/10",
    border: "border-success/20 hover:border-success/40",
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
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
      className={`group relative rounded-xl border ${feature.border} bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-card/80`}
    >
      <div
        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${feature.glow}`}
      >
        <feature.icon className={`h-6 w-6 ${feature.color}`} />
      </div>
      <h3 className="mb-2 text-base font-semibold text-foreground">
        {feature.title}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {feature.description}
      </p>
    </motion.div>
  )
}

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="features" className="relative py-24 md:py-32 px-4">
      {/* Vibrant lime glow overlay */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(145,237,18,0.07),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_30%_60%,rgba(145,237,18,0.03),transparent_60%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-[#91ed12]/30 bg-[#91ed12]/5 px-3 py-1 text-xs font-medium text-[#91ed12]">
            Core Capabilities
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-foreground text-balance">
            Everything You Need to Stay Protected
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground leading-relaxed text-pretty">
            PhishGuard AI combines multiple machine learning models with advanced
            feature extraction to provide comprehensive email threat analysis.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
