"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { AlertTriangle, CheckCircle, Link2, Type, Clock, ShieldAlert } from "lucide-react"

const sampleEmail = {
  subject: "URGENT: Your PayPa1 Account Has Been Limited",
  from: "security@paypa1-support.com",
  body: `Dear Valued Customer,

We have detected unusual activity on your account. Your access has been temporarily limited until you verify your identity.

Click the link below to restore your account immediately:
https://paypa1-secure.billing-verify.com/restore

Failure to act within 24 hours will result in permanent account suspension.

PayPa1 Security Team`,
}

const analysisResults = {
  verdict: "Phishing",
  confidence: 96.4,
  threat: "Critical",
  indicators: [
    { icon: Link2, label: "Suspicious URL domain", severity: "high" },
    { icon: Type, label: "Misspelled brand name", severity: "high" },
    { icon: Clock, label: "Artificial urgency (24 hours)", severity: "medium" },
    { icon: AlertTriangle, label: "Threat of account loss", severity: "high" },
    { icon: ShieldAlert, label: "Credential harvesting attempt", severity: "high" },
  ],
  features: [
    { name: "urgency_score", value: 0.92 },
    { name: "url_suspicious", value: 0.97 },
    { name: "brand_impersonation", value: 0.95 },
    { name: "grammar_score", value: 0.34 },
    { name: "threat_language", value: 0.88 },
  ],
}

export function DemoSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [phase, setPhase] = useState<"idle" | "scanning" | "done">("idle")
  const [scanProgress, setScanProgress] = useState(0)

  useEffect(() => {
    if (isInView && phase === "idle") {
      const timer = setTimeout(() => setPhase("scanning"), 800)
      return () => clearTimeout(timer)
    }
  }, [isInView, phase])

  useEffect(() => {
    if (phase === "scanning") {
      const interval = setInterval(() => {
        setScanProgress((p) => {
          if (p >= 100) {
            clearInterval(interval)
            setPhase("done")
            return 100
          }
          return p + 2
        })
      }, 40)
      return () => clearInterval(interval)
    }
  }, [phase])

  const headingRef = useRef<HTMLDivElement>(null)
  const isHeadingInView = useInView(headingRef, { once: true, margin: "-100px" })

  return (
    <section id="demo" className="relative border-t border-border py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeadingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Live Preview
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            See it in action
          </h2>
          <p className="mx-auto max-w-lg text-lg leading-relaxed text-muted-foreground">
            Watch a phishing email get analyzed in real time with full
            explainability breakdown.
          </p>
        </motion.div>

        <div ref={ref} className="grid gap-6 lg:grid-cols-2">
          {/* Email panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card"
          >
            {/* Email header bar */}
            <div className="flex items-center gap-2 border-b border-border px-5 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />
              </div>
              <span className="ml-2 font-mono text-xs text-muted-foreground">
                email-input.eml
              </span>
            </div>

            <div className="p-5">
              <div className="mb-3 space-y-1.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium text-muted-foreground">From:</span>
                  <span className="font-mono text-xs text-foreground">{sampleEmail.from}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Subject:</span>
                  <span className="text-sm font-semibold text-foreground">
                    {sampleEmail.subject}
                  </span>
                </div>
              </div>
              <div className="h-px bg-border" />
              <pre className="mt-3 whitespace-pre-wrap font-mono text-xs leading-relaxed text-secondary-foreground">
                {sampleEmail.body}
              </pre>
            </div>

            {/* Scan overlay */}
            <AnimatePresence>
              {phase === "scanning" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="mx-auto mb-3 h-8 w-8 rounded-full border-2 border-primary border-t-transparent"
                    />
                    <p className="font-mono text-sm text-primary">
                      Analyzing... {scanProgress}%
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Results panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card"
          >
            <div className="flex items-center gap-2 border-b border-border px-5 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-primary/60" />
                <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />
              </div>
              <span className="ml-2 font-mono text-xs text-muted-foreground">
                analysis-results
              </span>
            </div>

            <div className="p-5">
              <AnimatePresence mode="wait">
                {phase !== "done" ? (
                  <motion.div
                    key="waiting"
                    exit={{ opacity: 0 }}
                    className="flex h-[300px] items-center justify-center"
                  >
                    <p className="text-sm text-muted-foreground">
                      {phase === "idle" ? "Waiting for analysis..." : "Processing..."}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Verdict */}
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Verdict</p>
                        <p className="text-2xl font-bold text-destructive">
                          {analysisResults.verdict}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Confidence</p>
                        <p className="text-2xl font-bold text-foreground">
                          {analysisResults.confidence}%
                        </p>
                      </div>
                    </div>

                    {/* Threat badge */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mb-5 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-2.5"
                    >
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span className="text-sm font-semibold text-destructive">
                        Threat Level: {analysisResults.threat}
                      </span>
                    </motion.div>

                    {/* Risk indicators */}
                    <div className="mb-5">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Risk Indicators
                      </p>
                      <div className="space-y-2">
                        {analysisResults.indicators.map((ind, i) => (
                          <motion.div
                            key={ind.label}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="flex items-center gap-2.5 text-sm"
                          >
                            <ind.icon className={`h-3.5 w-3.5 ${
                              ind.severity === "high"
                                ? "text-destructive"
                                : "text-chart-4"
                            }`} />
                            <span className="text-secondary-foreground">{ind.label}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Feature bars */}
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Top Features (SHAP)
                      </p>
                      <div className="space-y-2">
                        {analysisResults.features.map((feat, i) => (
                          <motion.div
                            key={feat.name}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                          >
                            <div className="mb-1 flex justify-between">
                              <span className="font-mono text-xs text-muted-foreground">
                                {feat.name}
                              </span>
                              <span className="font-mono text-xs text-foreground">
                                {feat.value.toFixed(2)}
                              </span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${feat.value * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.6 + i * 0.1, ease: "easeOut" }}
                                className={`h-full rounded-full ${
                                  feat.value > 0.8
                                    ? "bg-destructive"
                                    : feat.value > 0.5
                                      ? "bg-chart-4"
                                      : "bg-primary"
                                }`}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
