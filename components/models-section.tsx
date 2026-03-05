"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Check } from "lucide-react"

const models = [
  {
    name: "Naive Bayes",
    tag: "Baseline",
    description: "Probabilistic classifier. Fast training, strong text classification baseline.",
    metrics: { accuracy: 92.3, precision: 91.0, f1: 91.5, roc: 95.2 },
    highlights: ["Sub-millisecond inference", "Small memory footprint", "Great for initial filtering"],
    accent: "oklch(0.70 0.12 200)",
  },
  {
    name: "Random Forest",
    tag: "Recommended",
    description: "Ensemble decision trees. Best overall balance of speed and accuracy.",
    metrics: { accuracy: 97.1, precision: 96.8, f1: 96.9, roc: 99.1 },
    highlights: ["Feature importance built-in", "Handles mixed feature types", "Robust to outliers"],
    featured: true,
    accent: "oklch(0.78 0.18 155)",
  },
  {
    name: "Logistic Regression",
    tag: "Interpretable",
    description: "Linear model with probability outputs. Most transparent decision boundary.",
    metrics: { accuracy: 94.8, precision: 94.2, f1: 94.4, roc: 97.5 },
    highlights: ["Coefficient interpretability", "Fast convergence", "LIME-compatible"],
    accent: "oklch(0.75 0.16 80)",
  },
  {
    name: "LSTM / BERT",
    tag: "Deep Learning",
    description: "Sequence model for contextual understanding of email text patterns.",
    metrics: { accuracy: 98.7, precision: 98.5, f1: 98.6, roc: 99.5 },
    highlights: ["Contextual embeddings", "Transfer learning capable", "Highest raw accuracy"],
    accent: "oklch(0.65 0.10 280)",
  },
]

function MetricBar({
  label,
  value,
  delay,
  accent,
}: {
  label: string
  value: number
  delay: number
  accent: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <div ref={ref}>
      <div className="mb-1 flex justify-between">
        <span className="text-xs text-white/35">{label}</span>
        <span className="font-mono text-xs text-white/60">{value}%</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${value}%` } : {}}
          transition={{ duration: 1, delay, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: accent }}
        />
      </div>
    </div>
  )
}

function ModelCard({
  model,
  index,
}: {
  model: (typeof models)[0]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.55,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`group relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
        model.featured
          ? "border-primary/30 bg-primary/[0.04] hover:border-primary/45"
          : "border-white/[0.06] bg-white/[0.025] hover:border-white/[0.12] hover:bg-white/[0.04]"
      }`}
    >
      {/* Top accent line on hover (and always for featured) */}
      <div
        className={`absolute inset-x-0 top-0 h-px transition-opacity duration-300 ${
          model.featured ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        style={{
          background: `linear-gradient(90deg, transparent, ${model.accent}70, transparent)`,
        }}
      />

      {model.featured && (
        <div
          className="absolute -top-3 left-5 rounded-full px-3 py-0.5 text-xs font-semibold"
          style={{
            background: "oklch(0.78 0.18 155)",
            color: "oklch(0.07 0.005 260)",
          }}
        >
          Best Overall
        </div>
      )}

      <div className="mb-4">
        <span
          className="mb-1.5 inline-block rounded-md border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider"
          style={{ color: model.accent }}
        >
          {model.tag}
        </span>
        <h3 className="mt-2 text-xl font-bold text-white">{model.name}</h3>
        <p className="mt-1 text-sm leading-relaxed text-white/40">
          {model.description}
        </p>
      </div>

      {/* Metrics */}
      <div className="mb-5 space-y-3">
        <MetricBar
          label="Accuracy"
          value={model.metrics.accuracy}
          delay={index * 0.1}
          accent={model.accent}
        />
        <MetricBar
          label="Precision"
          value={model.metrics.precision}
          delay={index * 0.1 + 0.1}
          accent={model.accent}
        />
        <MetricBar
          label="F1 Score"
          value={model.metrics.f1}
          delay={index * 0.1 + 0.2}
          accent={model.accent}
        />
        <MetricBar
          label="ROC AUC"
          value={model.metrics.roc}
          delay={index * 0.1 + 0.3}
          accent={model.accent}
        />
      </div>

      {/* Highlights */}
      <div className="mt-auto space-y-2">
        {model.highlights.map((h) => (
          <div key={h} className="flex items-center gap-2 text-sm text-white/40">
            <Check
              className="h-3.5 w-3.5 flex-shrink-0"
              style={{ color: model.accent }}
            />
            {h}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export function ModelsSection() {
  const headingRef = useRef<HTMLDivElement>(null)
  const isHeadingInView = useInView(headingRef, { once: true, margin: "-100px" })

  return (
    <section id="models" className="relative py-24 md:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeadingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 font-mono text-sm font-medium uppercase tracking-widest text-primary">
            Model Zoo
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
            Four models,{" "}
            <span className="text-white/40">one verdict</span>
          </h2>
          <p className="mx-auto max-w-lg text-lg leading-relaxed text-white/40">
            Each model brings different strengths. Compare them side by side with
            real performance metrics from training.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {models.map((m, i) => (
            <ModelCard key={m.name} model={m} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
