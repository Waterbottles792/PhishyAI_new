"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Link,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Send,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

interface URLResult {
  url: string
  is_suspicious: boolean
  risk_score: number
  threat_level: string
  risk_indicators: RiskIndicator[]
  url_features: Record<string, any>
  ai_explanation?: string | null
  safety_recommendations?: string[] | null
}

export default function URLAnalysisPage() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<URLResult | null>(null)
  const [error, setError] = useState("")

  async function handleScan() {
    if (!url.trim()) {
      setError("Please enter a URL to scan.")
      return
    }
    setError("")
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("http://localhost:8000/api/analyze/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
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
        model_used: "url_analyzer",
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
            <span className="hidden text-sm text-muted-foreground sm:block">URL Scanner</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left — URL Input */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5 text-blue-500" />
                  URL Scanner
                </CardTitle>
                <CardDescription>
                  Enter a URL to check if it&apos;s suspicious or potentially a phishing link
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">URL</label>
                  <Input
                    placeholder="e.g. https://paypa1-secure.billing-verify.com/restore"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={loading}
                    onKeyDown={(e) => { if (e.key === "Enter") handleScan() }}
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
                  <Button onClick={handleScan} disabled={loading || !url.trim()} className="flex-1">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {loading ? "Scanning..." : "Scan URL"}
                  </Button>
                  {result && (
                    <Button variant="outline" onClick={() => { setResult(null); setUrl(""); setError("") }}>
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
                <button
                  onClick={() => { setUrl("https://paypa1-secure.billing-verify.com/restore"); setResult(null) }}
                  className="rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted"
                >
                  <div className="mb-1 flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
                    <span className="text-xs font-medium text-destructive">Suspicious</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Fake PayPal domain</p>
                </button>
                <button
                  onClick={() => { setUrl("http://192.168.1.100/claim-prize?id=winner"); setResult(null) }}
                  className="rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted"
                >
                  <div className="mb-1 flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
                    <span className="text-xs font-medium text-destructive">Suspicious</span>
                  </div>
                  <p className="text-xs text-muted-foreground">IP-based URL</p>
                </button>
                <button
                  onClick={() => { setUrl("https://www.google.com"); setResult(null) }}
                  className="rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted"
                >
                  <div className="mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">Safe</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Legitimate domain</p>
                </button>
                <button
                  onClick={() => { setUrl("https://bit.ly/3xYz123"); setResult(null) }}
                  className="rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted"
                >
                  <div className="mb-1 flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
                    <span className="text-xs font-medium text-destructive">Suspicious</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Shortened URL</p>
                </button>
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
                      <AnalysisStatus isLoading={true} result={null} modelName="URL Analyzer" />
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
                      <AnalysisStatus isLoading={false} result={analysisStatusResult} modelName="URL Analyzer" />
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
                          <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/30 p-2">
                            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <p className="truncate font-mono text-xs text-muted-foreground">{result.url}</p>
                          </div>
                          <DownloadReportButton analysisType="url" results={result} />
                        </div>

                        {/* Risk Score Bar */}
                        <div>
                          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Risk Score</p>
                          <div className="rounded-lg border border-border bg-muted/30 p-3">
                            <div className="mb-1.5 flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Threat level</span>
                              <span className={`text-sm font-bold ${
                                result.risk_score >= 70 ? "text-destructive" :
                                result.risk_score >= 40 ? "text-chart-4" :
                                "text-primary"
                              }`}>
                                {result.risk_score}%
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${result.risk_score}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={`h-full rounded-full ${
                                  result.risk_score >= 70 ? "bg-destructive" :
                                  result.risk_score >= 40 ? "bg-chart-4" :
                                  "bg-primary"
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* URL Features Table */}
                        {result.url_features && Object.keys(result.url_features).length > 0 && (
                          <div>
                            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              URL Features
                            </p>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                              {Object.entries(result.url_features).map(([key, val]) => (
                                <div key={key} className="flex items-center justify-between border-b border-border/50 py-1.5">
                                  <span className="font-mono text-[10px] text-muted-foreground">{key}</span>
                                  <span className="ml-2 shrink-0 font-mono text-[10px] font-medium text-foreground">
                                    {typeof val === "boolean" ? (val ? "Yes" : "No") : String(val)}
                                  </span>
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
                        <Link className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="mb-1 text-lg font-semibold text-foreground">No scan yet</h3>
                      <p className="max-w-sm text-sm text-muted-foreground">
                        Enter a URL on the left and click &ldquo;Scan URL&rdquo; to check if it&apos;s suspicious.
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
