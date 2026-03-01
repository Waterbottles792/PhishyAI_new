"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import {
  Link2,
  AlertTriangle,
  Type,
  FileCode,
  Hash,
  Globe,
  MessageSquare,
  AtSign,
} from "lucide-react"

const featureCategories = [
  {
    title: "Text & Linguistic",
    icon: Type,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    features: [
      "Urgency score",
      "Threat score",
      "Reward score",
      "Grammar errors",
      "Capitalization ratio",
      "Sentiment analysis",
    ],
  },
  {
    title: "URL Analysis",
    icon: Link2,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    features: [
      "IP-based URLs",
      "Shortened URLs",
      "Suspicious TLDs",
      "Domain mismatch",
      "@ in URL",
      "Subdomain count",
    ],
  },
  {
    title: "Structural",
    icon: FileCode,
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
    features: [
      "HTML detection",
      "Form elements",
      "Hidden text",
      "Attachment mentions",
      "Link-text ratio",
      "Generic greeting",
    ],
  },
  {
    title: "Header Signals",
    icon: Globe,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
    features: [
      "SPF validation",
      "DKIM check",
      "Reply-to mismatch",
      "Sender domain",
      "X-Mailer header",
      "Routing analysis",
    ],
  },
]

export function FeaturesDetailSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="relative py-24 md:py-32 px-4">
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-warning/30 bg-warning/5 px-3 py-1 text-xs font-medium text-warning">
            Feature Extraction
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-foreground text-balance">
            30+ Signals Per Email
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground leading-relaxed text-pretty">
            Our feature extraction engine analyzes every email across linguistic, URL,
            structural, and header dimensions to build a comprehensive threat profile.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureCategories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
              className={`rounded-xl border ${cat.border} bg-card/50 backdrop-blur-sm p-5`}
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${cat.bg} mb-3`}>
                <cat.icon className={`h-5 w-5 ${cat.color}`} />
              </div>
              <h3 className={`font-semibold text-sm ${cat.color} mb-3`}>{cat.title}</h3>
              <ul className="space-y-2">
                {cat.features.map((f, j) => (
                  <motion.li
                    key={f}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.4 + i * 0.1 + j * 0.05 }}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <div className={`h-1 w-1 rounded-full ${cat.bg.replace("/10", "/50")}`} />
                    <span className="font-mono">{f}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Decorative counters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { icon: Hash, label: "Features Extracted", value: "30+", color: "text-primary" },
            { icon: AlertTriangle, label: "Threat Categories", value: "4", color: "text-destructive" },
            { icon: MessageSquare, label: "Keyword Lists", value: "3", color: "text-warning" },
            { icon: AtSign, label: "URL Patterns", value: "9", color: "text-success" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center rounded-lg border border-border bg-card/30 p-4"
            >
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <span className={`font-mono text-2xl font-bold ${stat.color}`}>{stat.value}</span>
              <span className="text-xs text-muted-foreground mt-1">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
