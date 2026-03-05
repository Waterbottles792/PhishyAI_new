"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Mail, Cpu, FileText, CheckCircle } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Mail,
    title: "Submit Email",
    description:
      "Paste an email subject and body, or upload a .eml file directly. The system accepts any format and parses headers, body, and metadata automatically.",
    color: "oklch(0.78 0.18 155)",
  },
  {
    number: "02",
    icon: Cpu,
    title: "Feature Extraction",
    description:
      "30+ signals are extracted: URL patterns, urgency keywords, grammar quality, sender reputation, HTML structure, and more. Each becomes a numerical feature for the model.",
    color: "oklch(0.70 0.12 200)",
  },
  {
    number: "03",
    icon: FileText,
    title: "Multi-Model Analysis",
    description:
      "Four trained models run in parallel: Naive Bayes, Random Forest, Logistic Regression, and an optional deep learning model. Each returns a classification and confidence score.",
    color: "oklch(0.75 0.16 80)",
  },
  {
    number: "04",
    icon: CheckCircle,
    title: "Explainable Results",
    description:
      "SHAP and LIME break down exactly which features drove the decision. Risk indicators are highlighted directly in the email body with a clear threat level rating.",
    color: "oklch(0.78 0.18 155)",
  },
]

function StepCard({
  step,
  index,
}: {
  step: (typeof steps)[0]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative flex gap-6"
    >
      {/* Timeline column */}
      <div className="flex flex-col items-center">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] transition-all duration-300 group-hover:border-white/[0.14] group-hover:bg-white/[0.06]"
          style={{ color: step.color }}
        >
          <step.icon className="h-5 w-5" />
        </div>
        {index < steps.length - 1 && (
          <div className="mt-2 w-px flex-1 bg-gradient-to-b from-white/[0.08] to-transparent" />
        )}
      </div>

      {/* Content */}
      <div className="pb-12">
        <span
          className="mb-1 block font-mono text-xs font-semibold"
          style={{ color: step.color }}
        >
          {step.number}
        </span>
        <h3 className="mb-2 text-xl font-semibold text-white">{step.title}</h3>
        <p className="max-w-md text-sm leading-relaxed text-white/40">
          {step.description}
        </p>
      </div>
    </motion.div>
  )
}

export function HowItWorksSection() {
  const headingRef = useRef<HTMLDivElement>(null)
  const isHeadingInView = useInView(headingRef, { once: true, margin: "-100px" })

  return (
    <section id="how-it-works" className="relative py-24 md:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Left — sticky heading */}
          <motion.div
            ref={headingRef}
            initial={{ opacity: 0, y: 30 }}
            animate={isHeadingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-32 lg:self-start"
          >
            <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
              Process
            </p>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl text-balance">
              How it{" "}
              <span className="text-white/40">works</span>
            </h2>
            <p className="max-w-md text-lg leading-relaxed text-white/40">
              From raw email to explained verdict in under 200ms. Four steps,
              zero guesswork.
            </p>

            {/* Decorative mini-card */}
            <div className="mt-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="mb-1 font-mono text-[10px] text-white/20 uppercase tracking-widest">
                Average pipeline
              </div>
              <div className="text-3xl font-bold text-primary">&lt;200ms</div>
              <div className="mt-1 text-xs text-white/30">
                end-to-end · parse → extract → classify → explain
              </div>
            </div>
          </motion.div>

          {/* Right — steps */}
          <div className="flex flex-col">
            {steps.map((step, i) => (
              <StepCard key={step.number} step={step} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
