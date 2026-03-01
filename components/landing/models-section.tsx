"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Trophy, Timer, Target, Gauge } from "lucide-react"

const models = [
  {
    name: "Naive Bayes",
    accuracy: 92.3,
    precision: 91.1,
    recall: 89.7,
    f1: 90.4,
    roc: 95.6,
    time: "0.12s",
    color: "text-chart-5",
    bg: "bg-chart-5",
    border: "border-chart-5/30",
  },
  {
    name: "Logistic Regression",
    accuracy: 94.7,
    precision: 93.8,
    recall: 92.9,
    f1: 93.3,
    roc: 97.1,
    time: "0.45s",
    color: "text-primary",
    bg: "bg-primary",
    border: "border-primary/30",
  },
  {
    name: "Random Forest",
    accuracy: 96.1,
    precision: 95.5,
    recall: 94.8,
    f1: 95.1,
    roc: 98.4,
    time: "2.31s",
    color: "text-success",
    bg: "bg-success",
    border: "border-success/30",
    best: true,
  },
  {
    name: "Gradient Boosting",
    accuracy: 95.8,
    precision: 95.1,
    recall: 94.4,
    f1: 94.7,
    roc: 98.1,
    time: "5.67s",
    color: "text-warning",
    bg: "bg-warning",
    border: "border-warning/30",
  },
]

function MetricBar({ value, max, color, delay }: { value: number; max: number; color: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const percent = (value / max) * 100

  return (
    <div ref={ref} className="relative h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
      <motion.div
        className={`absolute inset-y-0 left-0 rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={isInView ? { width: `${percent}%` } : {}}
        transition={{ duration: 1, delay, ease: "easeOut" }}
      />
    </div>
  )
}

export function ModelsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="models" className="relative py-24 md:py-32 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.65_0.17_160/0.04)_0%,transparent_60%)]" />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-success/30 bg-success/5 px-3 py-1 text-xs font-medium text-success">
            Model Performance
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-foreground text-balance">
            Multi-Model Comparison
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground leading-relaxed text-pretty">
            Four trained ML models compete to deliver the most accurate phishing detection.
            Compare accuracy, precision, recall, and speed.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {models.map((model, i) => (
            <motion.div
              key={model.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
              className={`relative rounded-xl border ${model.border} bg-card/50 backdrop-blur-sm p-5 transition-all duration-300 hover:bg-card/80 ${
                model.best ? "ring-1 ring-success/30" : ""
              }`}
            >
              {model.best && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-success/10 border border-success/30 px-2 py-0.5">
                  <Trophy className="h-3 w-3 text-success" />
                  <span className="text-[10px] font-bold text-success">BEST</span>
                </div>
              )}

              <h3 className={`font-semibold text-sm ${model.color} mb-4`}>
                {model.name}
              </h3>

              <div className="space-y-3">
                {/* Accuracy */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Target className="h-3 w-3" /> Accuracy
                    </span>
                    <span className="text-xs font-mono text-foreground">{model.accuracy}%</span>
                  </div>
                  <MetricBar value={model.accuracy} max={100} color={model.bg} delay={0.3 + i * 0.1} />
                </div>

                {/* Precision */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Gauge className="h-3 w-3" /> Precision
                    </span>
                    <span className="text-xs font-mono text-foreground">{model.precision}%</span>
                  </div>
                  <MetricBar value={model.precision} max={100} color={model.bg} delay={0.4 + i * 0.1} />
                </div>

                {/* F1 Score */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">F1 Score</span>
                    <span className="text-xs font-mono text-foreground">{model.f1}%</span>
                  </div>
                  <MetricBar value={model.f1} max={100} color={model.bg} delay={0.5 + i * 0.1} />
                </div>

                {/* ROC AUC */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">ROC AUC</span>
                    <span className="text-xs font-mono text-foreground">{model.roc}%</span>
                  </div>
                  <MetricBar value={model.roc} max={100} color={model.bg} delay={0.6 + i * 0.1} />
                </div>

                {/* Training Time */}
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Timer className="h-3 w-3" /> Training
                    </span>
                    <span className="text-xs font-mono text-foreground">{model.time}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
