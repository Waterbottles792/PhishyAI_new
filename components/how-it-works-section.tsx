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
  },
  {
    number: "02",
    icon: Cpu,
    title: "Feature Extraction",
    description:
      "30+ signals are extracted: URL patterns, urgency keywords, grammar quality, sender reputation, HTML structure, and more. Each becomes a numerical feature for the model.",
  },
  {
    number: "03",
    icon: FileText,
    title: "Multi-Model Analysis",
    description:
      "Four trained models run in parallel: Naive Bayes, Random Forest, Logistic Regression, and an optional deep learning model. Each returns a classification and confidence score.",
  },
  {
    number: "04",
    icon: CheckCircle,
    title: "Explainable Results",
    description:
      "SHAP and LIME break down exactly which features drove the decision. Risk indicators are highlighted directly in the email body with a clear threat level rating.",
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
        delay: index * 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative flex gap-6"
    >
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-background text-primary transition-colors group-hover:border-primary group-hover:bg-primary/10">
          <step.icon className="h-5 w-5" />
        </div>
        {index < steps.length - 1 && (
          <div className="mt-2 w-px flex-1 bg-gradient-to-b from-border to-transparent" />
        )}
      </div>

      {/* Content */}
      <div className="pb-12">
        <span className="mb-1 block font-mono text-xs text-primary">{step.number}</span>
        <h3 className="mb-2 text-xl font-semibold text-foreground">{step.title}</h3>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{step.description}</p>
      </div>
    </motion.div>
  )
}

export function HowItWorksSection() {
  const headingRef = useRef<HTMLDivElement>(null)
  const isHeadingInView = useInView(headingRef, { once: true, margin: "-100px" })

  return (
    <section id="how-it-works" className="relative border-t border-border py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Left - heading */}
          <motion.div
            ref={headingRef}
            initial={{ opacity: 0, y: 30 }}
            animate={isHeadingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-32 lg:self-start"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              Process
            </p>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-5xl text-balance">
              How it works
            </h2>
            <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
              From raw email to explained verdict in under 200ms. Four steps,
              zero guesswork.
            </p>
          </motion.div>

          {/* Right - steps */}
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
