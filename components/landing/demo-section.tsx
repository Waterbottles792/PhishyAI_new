"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { AlertTriangle, CheckCircle, Shield, Send } from "lucide-react"

const sampleEmail = {
  subject: "Urgent: Your Account Has Been Compromised",
  body: `Dear Customer,

We have detected unauthorized access to your account. Your account has been temporarily suspended due to suspicious activity.

To restore access, please verify your identity immediately by clicking the link below:

http://192.168.1.1/verify-account?user=target

Failure to act within 24 hours will result in permanent account termination.

Best regards,
Security Team`,
}

const mockResult = {
  prediction: "phishing",
  confidence: 0.947,
  riskScore: 87,
  threatLevel: "High",
  indicators: [
    { label: "Urgency Language", severity: "high", detail: '"immediately", "within 24 hours", "suspended"' },
    { label: "Suspicious URL", severity: "high", detail: "IP-based URL detected (192.168.1.1)" },
    { label: "Generic Greeting", severity: "medium", detail: '"Dear Customer" instead of a real name' },
    { label: "Threat Language", severity: "high", detail: '"compromised", "suspended", "termination"' },
    { label: "Account Action Required", severity: "medium", detail: 'Requests identity verification' },
  ],
}

function ThreatGauge({ score, animate }: { score: number; animate: boolean }) {
  const radius = 60
  const circumference = Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const getColor = (s: number) => {
    if (s >= 75) return "oklch(0.58 0.22 25)"
    if (s >= 50) return "oklch(0.70 0.18 50)"
    if (s >= 25) return "oklch(0.75 0.16 80)"
    return "oklch(0.65 0.17 160)"
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg width="160" height="90" viewBox="0 0 160 90" className="overflow-visible">
        {/* Background arc */}
        <path
          d="M 10 80 A 60 60 0 0 1 150 80"
          fill="none"
          stroke="oklch(0.30 0.02 260)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Active arc */}
        <motion.path
          d="M 10 80 A 60 60 0 0 1 150 80"
          fill="none"
          stroke={getColor(score)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={animate ? { strokeDashoffset: offset } : { strokeDashoffset: circumference }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center">
        <motion.span
          className="font-mono text-3xl font-bold"
          style={{ color: getColor(score) }}
          initial={{ opacity: 0 }}
          animate={animate ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          {animate ? score : 0}
        </motion.span>
        <span className="text-xs text-muted-foreground">Risk Score</span>
      </div>
    </div>
  )
}

export function DemoSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [analyzing, setAnalyzing] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const handleAnalyze = () => {
    setAnalyzing(true)
    setShowResult(false)
    setTimeout(() => {
      setAnalyzing(false)
      setShowResult(true)
    }, 2000)
  }

  // Auto-trigger on scroll into view
  const [autoTriggered, setAutoTriggered] = useState(false)
  useEffect(() => {
    if (isInView && !autoTriggered) {
      setAutoTriggered(true)
      const timer = setTimeout(handleAnalyze, 800)
      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView])

  return (
    <section id="demo" className="relative py-24 md:py-32 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,oklch(0.58_0.22_25/0.04)_0%,transparent_60%)]" />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-destructive/30 bg-destructive/5 px-3 py-1 text-xs font-medium text-destructive">
            Live Demo
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-foreground text-balance">
            See PhishGuard AI in Action
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground leading-relaxed text-pretty">
            Watch how a suspicious email gets analyzed in real-time with detailed threat
            indicators and explainability breakdown.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Email Input Panel */}
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-warning/60" />
                <div className="h-3 w-3 rounded-full bg-success/60" />
              </div>
              <span className="text-xs text-muted-foreground font-mono">email-analyzer.tsx</span>
            </div>
            <div className="p-5">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Subject
              </label>
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 mb-4">
                <span className="text-sm font-mono text-destructive">{sampleEmail.subject}</span>
              </div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Email Body
              </label>
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-3 min-h-[200px]">
                <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap leading-relaxed">
                  {sampleEmail.body}
                </pre>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60"
              >
                {analyzing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Shield className="h-4 w-4" />
                    </motion.div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Analyze Email
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-warning/60" />
                <div className="h-3 w-3 rounded-full bg-success/60" />
              </div>
              <span className="text-xs text-muted-foreground font-mono">analysis-result.tsx</span>
            </div>

            <div className="p-5">
              {!showResult && !analyzing && (
                <div className="flex flex-col items-center justify-center min-h-[340px] text-muted-foreground">
                  <Shield className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm">Awaiting email analysis...</p>
                </div>
              )}

              {analyzing && (
                <div className="flex flex-col items-center justify-center min-h-[340px]">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Shield className="h-16 w-16 text-primary" />
                  </motion.div>
                  <div className="mt-4 flex items-center gap-2">
                    <motion.div
                      className="h-1.5 w-1.5 rounded-full bg-primary"
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="h-1.5 w-1.5 rounded-full bg-primary"
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                    />
                    <motion.div
                      className="h-1.5 w-1.5 rounded-full bg-primary"
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground font-mono">
                    Extracting features & classifying...
                  </p>
                </div>
              )}

              {showResult && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-5"
                >
                  {/* Verdict */}
                  <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-destructive">PHISHING DETECTED</p>
                      <p className="text-xs text-muted-foreground">
                        Confidence: <span className="font-mono text-foreground">{(mockResult.confidence * 100).toFixed(1)}%</span>
                        {" | "}Threat Level: <span className="font-mono text-destructive">{mockResult.threatLevel}</span>
                      </p>
                    </div>
                  </div>

                  {/* Gauge */}
                  <div className="flex justify-center py-2">
                    <ThreatGauge score={mockResult.riskScore} animate={showResult} />
                  </div>

                  {/* Risk Indicators */}
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Risk Indicators
                    </h4>
                    <div className="space-y-2">
                      {mockResult.indicators.map((ind, i) => (
                        <motion.div
                          key={ind.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + i * 0.15 }}
                          className="flex items-start gap-2 text-xs"
                        >
                          {ind.severity === "high" ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                          )}
                          <div>
                            <span className="font-medium text-foreground">{ind.label}</span>
                            <p className="text-muted-foreground font-mono">{ind.detail}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
