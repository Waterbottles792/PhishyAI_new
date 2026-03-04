"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Globe,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Send,
  CheckCircle,
  XCircle,
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
import {
  severityIcon,
  severityColor,
  threatBadgeClass,
  type RiskIndicator,
} from "@/components/dashboard/result-card"
import { AIChatbox } from "@/components/dashboard/ai-chatbox"
import { DownloadReportButton } from "@/components/dashboard/download-report-button"
import { DashboardPageHeader } from "@/components/dashboard/page-header"

interface LookalikeDomain {
  domain: string
  technique: string
  similarity: number
  dns_resolved: boolean
  risk_level: string
}

interface DomainResult {
  domain: string
  total_variants: number
  resolved_count: number
  high_risk_count: number
  lookalike_domains: LookalikeDomain[]
  risk_indicators: RiskIndicator[]
  ai_explanation?: string | null
  safety_recommendations?: string[] | null
}

const sampleDomains = [
  { label: "Google", domain: "google.com" },
  { label: "PayPal", domain: "paypal.com" },
  { label: "Amazon", domain: "amazon.com" },
  { label: "Microsoft", domain: "microsoft.com" },
]

const techniqueLabels: Record<string, string> = {
  char_swap: "Character Swap",
  homoglyph: "Homoglyph",
  tld_variation: "TLD Variation",
  hyphenation: "Hyphenation",
  double_char: "Double Character",
  missing_char: "Missing Character",
}

export default function DomainMonitorPage() {
  const [domain, setDomain] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DomainResult | null>(null)
  const [error, setError] = useState("")

  async function handleAnalyze() {
    if (!domain.trim()) {
      setError("Please enter a domain to monitor.")
      return
    }
    setError("")
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("http://localhost:8000/api/analyze/domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim() }),
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

  return (
    <div className="min-h-screen bg-background">
      <div className="noise-overlay pointer-events-none fixed inset-0 z-50" />
      <DashboardPageHeader title="Domain Monitor" />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left — Domain Input */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-red-500" />
                  Domain / Brand Monitor
                </CardTitle>
                <CardDescription>
                  Enter your domain to detect typosquatting and lookalike domains that could be used for phishing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Domain</label>
                  <Input
                    placeholder="e.g. google.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    disabled={loading}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAnalyze() }}
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
                  <Button onClick={handleAnalyze} disabled={loading || !domain.trim()} className="flex-1">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {loading ? "Scanning..." : "Monitor Domain"}
                  </Button>
                  {result && (
                    <Button variant="outline" onClick={() => { setResult(null); setDomain(""); setError("") }}>
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Samples</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 sm:grid-cols-2">
                {sampleDomains.map((s) => (
                  <button
                    key={s.domain}
                    onClick={() => { setDomain(s.domain); setResult(null) }}
                    className="rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted"
                  >
                    <div className="mb-1 flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-red-500" />
                      <span className="text-xs font-medium text-foreground">{s.label}</span>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">{s.domain}</p>
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
                      <Loader2 className="mb-3 h-10 w-10 animate-spin text-red-500" />
                      <p className="text-sm text-muted-foreground">Generating and checking lookalike domains...</p>
                      <p className="text-xs text-muted-foreground/60">This may take a moment for DNS resolution</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">{result.total_variants}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Variants Checked</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className={`text-2xl font-bold ${result.resolved_count > 0 ? "text-chart-4" : "text-primary"}`}>
                          {result.resolved_count}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Active Domains</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className={`text-2xl font-bold ${result.high_risk_count > 0 ? "text-destructive" : "text-primary"}`}>
                          {result.high_risk_count}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">High Risk</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Risk Indicators */}
                  {result.risk_indicators.length > 0 && (
                    <Card>
                      <CardContent className="p-4">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Risk Indicators
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
                        <DownloadReportButton analysisType="domain" results={result} />
                      </CardContent>
                    </Card>
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

                  {/* Lookalike Domains Table */}
                  <Card>
                    <CardContent className="p-4">
                      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Lookalike Domains ({result.lookalike_domains.length})
                      </p>
                      <div className="max-h-[400px] overflow-y-auto">
                        <div className="space-y-1.5">
                          {result.lookalike_domains.map((ld, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.02 }}
                              className={`flex items-center gap-3 rounded-lg border p-2.5 ${
                                ld.dns_resolved
                                  ? ld.risk_level === "high"
                                    ? "border-destructive/30 bg-destructive/[0.03]"
                                    : "border-chart-4/30 bg-chart-4/[0.03]"
                                  : "border-border bg-muted/30"
                              }`}
                            >
                              {ld.dns_resolved ? (
                                <CheckCircle className={`h-3.5 w-3.5 shrink-0 ${ld.risk_level === "high" ? "text-destructive" : "text-chart-4"}`} />
                              ) : (
                                <XCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-mono text-xs font-medium text-foreground">{ld.domain}</p>
                                <div className="mt-0.5 flex items-center gap-2">
                                  <span className="text-[10px] text-muted-foreground">
                                    {techniqueLabels[ld.technique] || ld.technique}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {(ld.similarity * 100).toFixed(0)}% similar
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {ld.dns_resolved && (
                                  <Badge variant="outline" className="text-[9px] px-1 py-0 border-chart-4/30 text-chart-4">
                                    Active
                                  </Badge>
                                )}
                                {ld.risk_level === "high" && (
                                  <Badge variant="outline" className="text-[9px] px-1 py-0 border-destructive/30 text-destructive">
                                    High Risk
                                  </Badge>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                        <Globe className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="mb-1 text-lg font-semibold text-foreground">No scan yet</h3>
                      <p className="max-w-sm text-sm text-muted-foreground">
                        Enter a domain on the left to check for typosquatting and lookalike threats.
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
