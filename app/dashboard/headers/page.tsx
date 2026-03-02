"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Send,
  CheckCircle,
  XCircle,
  MinusCircle,
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

interface HeaderResult {
  is_suspicious: boolean
  risk_score: number
  threat_level: string
  risk_indicators: RiskIndicator[]
  from_address: string
  reply_to: string
  return_path: string
  sender_ip: string
  authentication_results: Record<string, string>
  received_hops: any[]
  reply_to_mismatch: boolean
  ai_explanation?: string | null
  safety_recommendations?: string[] | null
}

const sampleHeaders = `Delivered-To: user@gmail.com
Received: by 2002:a17:906:1234:0:0:0:0 with SMTP id a1csp1234567;
        Mon, 3 Mar 2026 10:15:30 -0800 (PST)
Received: from mail-suspicious.example.xyz (mail-suspicious.example.xyz. [203.0.113.50])
        by mx.google.com with ESMTPS id abc123;
        Mon, 03 Mar 2026 10:15:29 -0800 (PST)
Received-SPF: fail (google.com: domain of noreply@paypal.com does not designate 203.0.113.50 as permitted sender)
Authentication-Results: mx.google.com;
       dkim=fail header.i=@paypal.com;
       spf=fail smtp.mailfrom=noreply@paypal.com;
       dmarc=fail header.from=paypal.com
From: PayPal Security <noreply@paypal.com>
Reply-To: support@paypal-secure-verify.xyz
To: user@gmail.com
Subject: Urgent: Your account has been limited
Date: Mon, 3 Mar 2026 18:15:00 +0000
Message-ID: <fake-msg-id@suspicious-server.xyz>
MIME-Version: 1.0
Content-Type: text/html; charset="UTF-8"`

function AuthBadge({ status }: { status: string }) {
  if (status === "pass") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
        <CheckCircle className="h-3 w-3" /> Pass
      </span>
    )
  }
  if (status === "fail" || status === "hardfail") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
        <XCircle className="h-3 w-3" /> Fail
      </span>
    )
  }
  if (status === "softfail") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-chart-4/10 px-2 py-0.5 text-[10px] font-medium text-chart-4">
        <MinusCircle className="h-3 w-3" /> Softfail
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
      <MinusCircle className="h-3 w-3" /> {status || "None"}
    </span>
  )
}

export default function HeaderAnalysisPage() {
  const [headers, setHeaders] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<HeaderResult | null>(null)
  const [error, setError] = useState("")

  async function handleAnalyze() {
    if (!headers.trim()) {
      setError("Please paste email headers to analyze.")
      return
    }
    setError("")
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("http://localhost:8000/api/analyze/headers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_headers: headers.trim() }),
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
        model_used: "header_analyzer",
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
            <span className="hidden text-sm text-muted-foreground sm:block">Header Analysis</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left — Header Input */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-500" />
                  Email Header Analysis
                </CardTitle>
                <CardDescription>
                  Paste raw email headers to check SPF, DKIM, DMARC authentication and routing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Raw Email Headers</label>
                  <textarea
                    placeholder="Paste raw email headers here..."
                    value={headers}
                    onChange={(e) => setHeaders(e.target.value)}
                    disabled={loading}
                    rows={12}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
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
                  <Button onClick={handleAnalyze} disabled={loading || !headers.trim()} className="flex-1">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {loading ? "Analyzing..." : "Analyze Headers"}
                  </Button>
                  <Button variant="outline" onClick={() => { setHeaders(sampleHeaders); setResult(null) }}>
                    Load Sample
                  </Button>
                  {result && (
                    <Button variant="outline" onClick={() => { setResult(null); setHeaders(""); setError("") }}>
                      Clear
                    </Button>
                  )}
                </div>
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
                      <AnalysisStatus isLoading={true} result={null} modelName="Header Analyzer" />
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
                      <AnalysisStatus isLoading={false} result={analysisStatusResult} modelName="Header Analyzer" />
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
                          <Badge variant="outline" className={threatBadgeClass[result.threat_level] || ""}>
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Threat: {result.threat_level.charAt(0).toUpperCase() + result.threat_level.slice(1)}
                          </Badge>
                          <DownloadReportButton analysisType="headers" results={result} />
                        </div>

                        {/* Authentication Results */}
                        <div>
                          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Authentication Results
                          </p>
                          <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-foreground">SPF</span>
                              <AuthBadge status={result.authentication_results.spf} />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-foreground">DKIM</span>
                              <AuthBadge status={result.authentication_results.dkim} />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-foreground">DMARC</span>
                              <AuthBadge status={result.authentication_results.dmarc} />
                            </div>
                          </div>
                        </div>

                        {/* Parsed Fields */}
                        <div>
                          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Parsed Header Fields
                          </p>
                          <div className="space-y-1.5">
                            {[
                              { label: "From", value: result.from_address },
                              { label: "Reply-To", value: result.reply_to },
                              { label: "Return-Path", value: result.return_path },
                              { label: "Sender IP", value: result.sender_ip },
                              { label: "Routing Hops", value: String(result.received_hops.length) },
                            ].filter(f => f.value).map((field) => (
                              <div key={field.label} className="flex items-center justify-between border-b border-border/50 py-1.5">
                                <span className="text-xs text-muted-foreground">{field.label}</span>
                                <span className="ml-2 max-w-[200px] truncate font-mono text-[10px] font-medium text-foreground">
                                  {field.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Routing Hops */}
                        {result.received_hops.length > 0 && (
                          <div>
                            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              Routing Hops ({result.received_hops.length})
                            </p>
                            <div className="space-y-1.5">
                              {result.received_hops.map((hop: any, i: number) => (
                                <div key={i} className="rounded-lg border border-border bg-muted/30 p-2">
                                  <div className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/10 text-[10px] font-bold text-amber-500">
                                      {hop.hop}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      {hop.from && <span className="font-mono text-[10px] text-foreground">from {hop.from} </span>}
                                      {hop.by && <span className="font-mono text-[10px] text-muted-foreground">by {hop.by}</span>}
                                      {hop.ip && <span className="ml-1 font-mono text-[10px] text-muted-foreground">[{hop.ip}]</span>}
                                    </div>
                                  </div>
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
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="mb-1 text-lg font-semibold text-foreground">No analysis yet</h3>
                      <p className="max-w-sm text-sm text-muted-foreground">
                        Paste raw email headers on the left to analyze authentication and routing.
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
