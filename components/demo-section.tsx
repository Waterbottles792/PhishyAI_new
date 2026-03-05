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
    { icon: Link2,        label: "Suspicious URL domain",          severity: "high" },
    { icon: Type,         label: "Misspelled brand name",          severity: "high" },
    { icon: Clock,        label: "Artificial urgency (24 hours)",  severity: "medium" },
    { icon: AlertTriangle,label: "Threat of account loss",         severity: "high" },
    { icon: ShieldAlert,  label: "Credential harvesting attempt",  severity: "high" },
  ],
  features: [
    { name: "urgency_score",        value: 0.92 },
    { name: "url_suspicious",       value: 0.97 },
    { name: "brand_impersonation",  value: 0.95 },
    { name: "grammar_score",        value: 0.34 },
    { name: "threat_language",      value: 0.88 },
  ],
}

/* Shared window chrome */
function WindowBar({
  dotColor,
  title,
  badge,
}: {
  dotColor: string
  title: string
  badge?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-3">
      <div className="flex gap-1.5">
        <div className={`h-3 w-3 rounded-full ${dotColor}`} />
        <div className="h-3 w-3 rounded-full bg-white/[0.06]" />
        <div className="h-3 w-3 rounded-full bg-white/[0.06]" />
      </div>
      <span className="ml-2 font-mono text-xs text-white/25">{title}</span>
      {badge && <div className="ml-auto">{badge}</div>}
    </div>
  )
}

export function DemoSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [phase, setPhase] = useState<"idle" | "scanning" | "done">("idle")
  const [scanProgress, setScanProgress] = useState(0)

  useEffect(() => {
    if (isInView && phase === "idle") {
      const timer = setTimeout(() => setPhase("scanning"), 700)
      return () => clearTimeout(timer)
    }
  }, [isInView, phase])

  useEffect(() => {
    if (phase !== "scanning") return
    const interval = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 100) { clearInterval(interval); setPhase("done"); return 100 }
        return p + 2
      })
    }, 38)
    return () => clearInterval(interval)
  }, [phase])

  const headingRef = useRef<HTMLDivElement>(null)
  const isHeadingInView = useInView(headingRef, { once: true, margin: "-100px" })

  return (
    <section id="demo" className="relative py-24 md:py-32">
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
            Live Preview
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
            See it in <span className="text-white/40">action</span>
          </h2>
          <p className="mx-auto max-w-lg text-lg leading-relaxed text-white/40">
            Watch a phishing email get analyzed in real time with full
            explainability breakdown.
          </p>
        </motion.div>

        <div ref={ref} className="grid gap-5 lg:grid-cols-2">
          {/* ── Email input panel ─────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]"
          >
            {/* Top glow */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

            <WindowBar dotColor="bg-red-500/60" title="email-input.eml" />

            <div className="p-5">
              <div className="mb-3 space-y-1.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium text-white/25">From:</span>
                  <span className="font-mono text-xs text-white/50">{sampleEmail.from}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium text-white/25">Subject:</span>
                  <span className="text-sm font-semibold text-white/80">{sampleEmail.subject}</span>
                </div>
              </div>
              <div className="h-px bg-white/[0.06]" />
              <pre className="mt-3 whitespace-pre-wrap font-mono text-xs leading-relaxed text-white/35">
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
                  className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                      className="mx-auto mb-3 h-8 w-8 rounded-full border-2 border-primary border-t-transparent"
                    />
                    <p className="font-mono text-sm text-primary">
                      Analyzing… {scanProgress}%
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Results panel ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            <WindowBar
              dotColor="bg-primary/70"
              title="analysis-results"
              badge={
                phase === "done" ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-red-400 border border-red-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                    THREAT DETECTED
                  </span>
                ) : null
              }
            />

            <div className="p-5">
              <AnimatePresence mode="wait">
                {phase !== "done" ? (
                  <motion.div
                    key="waiting"
                    exit={{ opacity: 0 }}
                    className="flex h-[300px] items-center justify-center"
                  >
                    <p className="text-sm text-white/20">
                      {phase === "idle" ? "Waiting for analysis…" : "Processing…"}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Verdict row */}
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/25">Verdict</p>
                        <p className="text-2xl font-bold text-red-400">
                          {analysisResults.verdict}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/25">Confidence</p>
                        <p className="text-2xl font-bold text-white">
                          {analysisResults.confidence}%
                        </p>
                      </div>
                    </div>

                    {/* Threat badge */}
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5"
                    >
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <span className="text-sm font-semibold text-red-400">
                        Threat Level: {analysisResults.threat}
                      </span>
                    </motion.div>

                    {/* Risk indicators */}
                    <div className="mb-5">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/20">
                        Risk Indicators
                      </p>
                      <div className="space-y-2">
                        {analysisResults.indicators.map((ind, i) => (
                          <motion.div
                            key={ind.label}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.28 + i * 0.08 }}
                            className="flex items-center gap-2.5 text-sm"
                          >
                            <div
                              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                ind.severity === "high" ? "bg-red-400" : "bg-amber-400"
                              }`}
                            />
                            <ind.icon
                              className={`h-3.5 w-3.5 ${
                                ind.severity === "high"
                                  ? "text-red-400/60"
                                  : "text-amber-400/60"
                              }`}
                            />
                            <span className="text-white/40">{ind.label}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* SHAP feature bars */}
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/20">
                        Top Features (SHAP)
                      </p>
                      <div className="space-y-2">
                        {analysisResults.features.map((feat, i) => (
                          <motion.div
                            key={feat.name}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.45 + i * 0.08 }}
                          >
                            <div className="mb-1 flex justify-between">
                              <span className="font-mono text-xs text-white/30">
                                {feat.name}
                              </span>
                              <span className="font-mono text-xs text-white/50">
                                {feat.value.toFixed(2)}
                              </span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${feat.value * 100}%` }}
                                transition={{
                                  duration: 0.8,
                                  delay: 0.55 + i * 0.08,
                                  ease: "easeOut",
                                }}
                                className={`h-full rounded-full ${
                                  feat.value > 0.8
                                    ? "bg-red-500"
                                    : feat.value > 0.5
                                      ? "bg-amber-500"
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

        {/* CTA to live dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-10 text-center"
        >
          <a
            href="/dashboard/email"
            className="group inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/[0.06] px-7 py-3 text-sm font-medium text-primary transition-all hover:border-primary/50 hover:bg-primary/[0.1] hover:shadow-[0_0_20px_oklch(0.78_0.18_155/0.15)]"
          >
            <CheckCircle className="h-4 w-4" />
            Try with your own email
          </a>
        </motion.div>
      </div>
    </section>
  )
}
