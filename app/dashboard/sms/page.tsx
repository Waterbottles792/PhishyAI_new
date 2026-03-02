"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageSquare,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AnalysisStatus } from "@/components/analysis-status"
import {
  severityIcon,
  severityColor,
  threatBadgeClass,
  type RiskIndicator,
} from "@/components/dashboard/result-card"
import { AIChatbox } from "@/components/dashboard/ai-chatbox"
import { DownloadReportButton } from "@/components/dashboard/download-report-button"

interface SMSResult {
  message: string
  is_suspicious: boolean
  risk_score: number
  threat_level: string
  risk_indicators: RiskIndicator[]
  extracted_urls: string[]
  linguistic_features: Record<string, any>
  ai_explanation?: string | null
  safety_recommendations?: string[] | null
}

const sampleMessages = [
  {
    label: "Bank Scam",
    suspicious: true,
    text: "ALERT: Your bank account has been locked due to suspicious activity. Verify your identity immediately at http://secure-bank-verify.xyz/login or your account will be permanently closed within 24 hours.",
  },
  {
    label: "Delivery Scam",
    suspicious: true,
    text: "USPS: Your package could not be delivered. Please update your delivery address at http://bit.ly/3xPkg to reschedule. Tracking #US9284710.",
  },
  {
    label: "Legit OTP",
    suspicious: false,
    text: "Your verification code is 847291. This code expires in 10 minutes. If you did not request this code, please ignore this message.",
  },
  {
    label: "Prize Scam",
    suspicious: true,
    text: "Congratulations! You've been selected as this month's lucky winner of $5,000! Claim your prize now: http://192.168.1.50/claim-prize. Reply YES to confirm.",
  },
]

export default function SMSAnalysisPage() {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SMSResult | null>(null)
  const [error, setError] = useState("")

  async function handleAnalyze() {
    if (!message.trim()) {
      setError("Please enter an SMS message to analyze.")
      return
    }
    setError("")
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("http://localhost:8000/api/analyze/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || `Server error: ${res.status}`)
      setResult(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect. Make sure the backend is running on port 8000."
      )
    } finally {
      setLoading(false)
    }
  }

  const analysisStatusResult = result
    ? {
        prediction: result.is_suspicious ? "suspicious" : "safe",
        confidence: result.risk_score / 100,
        threat_level: result.threat_level,
        risk_score: result.risk_score,
        model_used: "sms_analyzer",
      }
    : null

  return (
    <div className="min-h-screen bg-background">
      <div className="noise-overlay pointer-events-none fixed inset-0 z-50" />

      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
                  <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" fill="currentColor" opacity="0.3" />
                  <path d="M12 2L3 7l9 5 9-5-9-5z" fill="currentColor" />
                  <path d="M12 12v10l9-5V7l-9 5z" fill="currentColor" opacity="0.6" />
                </svg>
              </div>
              <span className="text-lg font-semibold tracking-tight text-foreground">PhishGuard</span>
            </a>
            <div className="hidden h-6 w-px bg-border sm:block" />
            <span className="hidden text-sm text-muted-foreground sm:block">SMS Scanner</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left — SMS Input */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-cyan-500" />
                  SMS / Smishing Scanner
                </CardTitle>
                <CardDescription>
                  Paste an SMS message to check for smishing (SMS phishing) indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">SMS Message</label>
                  <textarea
                    placeholder="Paste the SMS message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={loading}
                    rows={5}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <Button onClick={handleAnalyze} disabled={loading || !message.trim()} className="flex-1">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {loading ? "Analyzing..." : "Analyze SMS"}
                  </Button>
                  {result && (
                    <Button variant="outline" onClick={() => { setResult(null); setMessage(""); setError("") }}>
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick samples */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Samples</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 sm:grid-cols-2">
                {sampleMessages.map((sample) => (
                  <button
                    key={sample.label}
                    onClick={() => { setMessage(sample.text); setResult(null) }}
                    className="rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted"
                  >
                    <div className="mb-1 flex items-center gap-1.5">
                      {sample.suspicious ? (
                        <>
                          <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
                          <span className="text-xs font-medium text-destructive">Suspicious</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-medium text-primary">Safe</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{sample.label}</p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right — Results */}
          <div>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <AnalysisStatus isLoading={true} result={null} modelName="SMS Analyzer" />
                    </CardContent>
                  </Card>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card>
                    <CardContent className="pt-2">
                      <AnalysisStatus isLoading={false} result={analysisStatusResult} modelName="SMS Analyzer" />
                      <div className="mt-2 space-y-4 border-t border-border pt-4">
                        {/* Verdict */}
                        <div className={`rounded-xl border p-4 ${result.is_suspicious ? "border-destructive/30 bg-destructive/[0.03]" : "border-primary/30 bg-primary/[0.03]"}`}>
                          <div className="mb-3 flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              {result.is_suspicious ? (
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                                  <ShieldAlert className="h-5 w-5 text-destructive" />
                                </div>
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                  <ShieldCheck className="h-5 w-5 text-primary" />
                                </div>
                              )}
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Verdict</p>
                                <p className={`text-xl font-bold ${result.is_suspicious ? "text-destructive" : "text-primary"}`}>
                                  {result.is_suspicious ? "Suspicious" : "Safe"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Risk Score</p>
                              <p className="text-xl font-bold text-foreground">{result.risk_score}/100</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={threatBadgeClass[result.threat_level] || ""}>
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              Threat: {result.threat_level.charAt(0).toUpperCase() + result.threat_level.slice(1)}
                            </Badge>
                          </div>
                          <DownloadReportButton analysisType="sms" results={result} />
                        </div>

                        {/* Extracted URLs */}
                        {result.extracted_urls.length > 0 && (
                          <div>
                            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              Extracted URLs ({result.extracted_urls.length})
                            </p>
                            <div className="space-y-1.5">
                              {result.extracted_urls.map((url, i) => (
                                <div key={i} className="rounded-lg border border-border bg-muted/30 p-2">
                                  <p className="break-all font-mono text-xs text-foreground">{url}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* AI Explanation */}
                        {result.ai_explanation && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="rounded-xl border border-violet-500/20 bg-violet-500/[0.03] p-4"
                          >
                            <div className="mb-2 flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10">
                                <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                              </div>
                              <p className="text-xs font-medium uppercase tracking-wider text-violet-600 dark:text-violet-400">
                                AI Explanation
                              </p>
                            </div>
                            <p className="text-sm leading-relaxed text-foreground/90">{result.ai_explanation}</p>
                          </motion.div>
                        )}

                        {/* Safety Recommendations */}
                        {result.safety_recommendations && result.safety_recommendations.length > 0 && (
                          <div>
                            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                              Safety Recommendations
                            </p>
                            <div className="space-y-1.5">
                              {result.safety_recommendations.map((rec, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: 8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.15 + i * 0.05 }}
                                  className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/30 p-2.5"
                                >
                                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                    {i + 1}
                                  </span>
                                  <p className="text-xs text-foreground/80">{rec}</p>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Risk Indicators */}
                        {result.risk_indicators.length > 0 && (
                          <div>
                            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              Risk Indicators ({result.risk_indicators.length})
                            </p>
                            <div className="space-y-2">
                              {result.risk_indicators.map((ind, i) => {
                                const Icon = severityIcon[ind.severity] || AlertTriangle
                                return (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/30 p-2.5"
                                  >
                                    <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${severityColor[ind.severity]}`} />
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <p className="text-xs font-medium text-foreground">{ind.indicator}</p>
                                        <Badge variant="outline" className={`text-[9px] px-1 py-0 ${threatBadgeClass[ind.severity] || ""}`}>
                                          {ind.severity}
                                        </Badge>
                                      </div>
                                      <p className="mt-0.5 text-[11px] text-muted-foreground">{ind.detail}</p>
                                    </div>
                                  </motion.div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                        <MessageSquare className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="mb-1 text-lg font-semibold text-foreground">No scan yet</h3>
                      <p className="max-w-sm text-sm text-muted-foreground">
                        Enter an SMS message on the left and click &ldquo;Analyze SMS&rdquo; to check for smishing.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <AIChatbox context={result} />
    </div>
  )
}
