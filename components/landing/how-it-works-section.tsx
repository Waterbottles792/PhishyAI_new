"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Mail, Cpu, Search, ShieldCheck } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: Mail,
    title: "Paste or Upload Email",
    description:
      "Enter the email subject and body text, or upload an .eml file directly. Our parser handles all standard email formats.",
    color: "text-primary",
    bg: "bg-primary/10",
    borderColor: "border-primary/30",
    line: "from-primary/50 to-primary/0",
  },
  {
    step: "02",
    icon: Cpu,
    title: "Feature Extraction",
    description:
      "30+ features are extracted: URL patterns, urgency keywords, grammar quality, structural elements, and header analysis.",
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    borderColor: "border-chart-5/30",
    line: "from-chart-5/50 to-chart-5/0",
  },
  {
    step: "03",
    icon: Search,
    title: "ML Classification",
    description:
      "Multiple trained models analyze the features simultaneously. Compare results across Naive Bayes, Random Forest, and more.",
    color: "text-warning",
    bg: "bg-warning/10",
    borderColor: "border-warning/30",
    line: "from-warning/50 to-warning/0",
  },
  {
    step: "04",
    icon: ShieldCheck,
    title: "Results & Explainability",
    description:
      "Get a clear verdict with confidence score, threat level, SHAP feature importance, and highlighted risk indicators in the email.",
    color: "text-success",
    bg: "bg-success/10",
    borderColor: "border-success/30",
    line: "from-success/50 to-success/0",
  },
]

export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section
      id="how-it-works"
      className="relative py-24 md:py-32 px-4"
    >
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.62_0.19_250/0.04)_0%,transparent_60%)]" />

      <div className="relative mx-auto max-w-5xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            How It Works
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-foreground text-balance">
            From Email to Verdict in Milliseconds
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground leading-relaxed text-pretty">
            A transparent pipeline that shows you exactly how threats are detected and
            classified at every stage.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical line connector (desktop) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-primary/20 via-warning/20 to-success/20" />

          <div className="flex flex-col gap-16 md:gap-24">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0
              return (
                <StepCard key={step.step} step={step} index={index} isEven={isEven} />
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function StepCard({
  step,
  index,
  isEven,
}: {
  step: (typeof steps)[0]
  index: number
  isEven: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isEven ? -60 : 60 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`relative flex flex-col md:flex-row items-center gap-8 ${
        isEven ? "md:flex-row" : "md:flex-row-reverse"
      }`}
    >
      {/* Content */}
      <div className={`flex-1 ${isEven ? "md:text-right" : "md:text-left"}`}>
        <div
          className={`inline-flex items-center gap-2 mb-3 ${
            isEven ? "md:flex-row-reverse" : ""
          }`}
        >
          <span className={`font-mono text-xs font-bold ${step.color}`}>
            {step.step}
          </span>
          <div className={`h-px w-8 ${step.bg}`} />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
          {step.description}
        </p>
      </div>

      {/* Center icon */}
      <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center">
        <div
          className={`absolute inset-0 rounded-full ${step.bg} border ${step.borderColor}`}
        />
        <step.icon className={`relative h-7 w-7 ${step.color}`} />
      </div>

      {/* Spacer for layout balance */}
      <div className="hidden md:block flex-1" />
    </motion.div>
  )
}
