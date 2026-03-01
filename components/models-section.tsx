"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Check } from "lucide-react"

const models = [
  {
    name: "Naive Bayes",
    tag: "Baseline",
    description: "Probabilistic classifier. Fast training, strong text classification baseline.",
    metrics: {
      accuracy: 92.3,
      precision: 91.0,
      f1: 91.5,
      roc: 95.2,
    },
    highlights: ["Sub-millisecond inference", "Small memory footprint", "Great for initial filtering"],
  },
  {
    name: "Random Forest",
    tag: "Recommended",
    description: "Ensemble decision trees. Best overall balance of speed and accuracy.",
    metrics: {
      accuracy: 97.1,
      precision: 96.8,
      f1: 96.9,
      roc: 99.1,
    },
    highlights: ["Feature importance built-in", "Handles mixed feature types", "Robust to outliers"],
    featured: true,
  },
  {
    name: "Logistic Regression",
    tag: "Interpretable",
    description: "Linear model with probability outputs. Most transparent decision boundary.",
    metrics: {
      accuracy: 94.8,
      precision: 94.2,
      f1: 94.4,
      roc: 97.5,
    },
    highlights: ["Coefficient interpretability", "Fast convergence", "LIME-compatible"],
  },
  {
    name: "LSTM / BERT",
    tag: "Deep Learning",
    description: "Sequence model for contextual understanding of email text patterns.",
    metrics: {
      accuracy: 98.7,
      precision: 98.5,
      f1: 98.6,
      roc: 99.5,
    },
    highlights: ["Contextual embeddings", "Transfer learning capable", "Highest raw accuracy"],
  },
]

function MetricBar({ label, value, delay }: { label: string; value: number; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <div ref={ref}>
      <div className="mb-1 flex justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="font-mono text-xs text-foreground">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${value}%` } : {}}
          transition={{ duration: 1, delay, ease: "easeOut" }}
          className="h-full rounded-full bg-primary"
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
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`group relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
        model.featured
          ? "border-primary/40 bg-primary/[0.04]"
          : "border-border bg-card/50 hover:border-primary/20 hover:bg-card"
      }`}
    >
      {model.featured && (
        <div className="absolute -top-3 left-5 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
          Best Overall
        </div>
      )}

      <div className="mb-4">
        <span className="mb-1 inline-block rounded bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {model.tag}
        </span>
        <h3 className="mt-2 text-xl font-bold text-foreground">{model.name}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {model.description}
        </p>
      </div>

      {/* Metrics */}
      <div className="mb-5 space-y-3">
        <MetricBar label="Accuracy" value={model.metrics.accuracy} delay={index * 0.1} />
        <MetricBar label="Precision" value={model.metrics.precision} delay={index * 0.1 + 0.1} />
        <MetricBar label="F1 Score" value={model.metrics.f1} delay={index * 0.1 + 0.2} />
        <MetricBar label="ROC AUC" value={model.metrics.roc} delay={index * 0.1 + 0.3} />
      </div>

      {/* Highlights */}
      <div className="mt-auto space-y-2">
        {model.highlights.map((h) => (
          <div key={h} className="flex items-center gap-2 text-sm text-secondary-foreground">
            <Check className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
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
    <section id="models" className="relative border-t border-border py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeadingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Model Zoo
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Four models, one verdict
          </h2>
          <p className="mx-auto max-w-lg text-lg leading-relaxed text-muted-foreground">
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
