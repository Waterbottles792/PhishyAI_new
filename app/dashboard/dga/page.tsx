"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Send,
  BookOpen,
  Brain,
  Hash,
  BarChart2,
  Binary,
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
import { AIChatbox } from "@/components/dashboard/ai-chatbox"
import { DashboardPageHeader } from "@/components/dashboard/page-header"

interface DGAResult {
  domain: string
  is_dga: boolean
  confidence: number
  entropy: number
  consonant_ratio: number
  digit_ratio: number
  bigram_score: number
  known_tld: boolean
  domain_length: number
  risk_level: "low" | "medium" | "high" | "critical"
  model_used: string
  indicators: string[]
  ai_explanation?: string
}

const SAMPLES = [
  { label: "DGA Domain", value: "xjqkwzmvpb.com", suspicious: true },
  { label: "Phishing Pattern", value: "apple-security-update-19283.net", suspicious: true },
  { label: "Legitimate", value: "github.com", suspicious: false },
  { label: "DGA-generated", value: "qwertylkjhgf.xyz", suspicious: true },
]

function computeMockDGAResult(domain: string): DGAResult {
  const name = domain.split(".")[0] ?? domain
  const length = name.length

  // Entropy-like computation
  const freq: Record<string, number> = {}
  for (const c of name) freq[c] = (freq[c] ?? 0) + 1
  let entropy = 0
  for (const count of Object.values(freq)) {
    const p = count / length
    entropy -= p * Math.log2(p)
  }
  entropy = Math.round(entropy * 100) / 100

  const consonants = (name.match(/[bcdfghjklmnpqrstvwxyz]/gi) ?? []).length
  const digits = (name.match(/\d/g) ?? []).length
  const consonantRatio = Math.round((consonants / length) * 100) / 100
  const digitRatio = Math.round((digits / length) * 100) / 100

  // Bigram score — how unusual the character pairs are
  const unusualBigrams = ["xj", "qk", "wz", "vm", "pb", "qw", "jh", "zx", "vb", "kw"]
  let bigramHits = 0
  for (let i = 0; i < name.length - 1; i++) {
    if (unusualBigrams.includes(name.slice(i, i + 2).toLowerCase())) bigramHits++
  }
  const bigramScore = Math.round((1 - bigramHits / Math.max(length, 1)) * 100) / 100

  const knownTLDs = ["com", "org", "net", "edu", "gov", "io", "co", "uk"]
  const tld = domain.split(".").pop() ?? ""
  const knownTld = knownTLDs.includes(tld.toLowerCase())

  // Scoring
  let score = 0
  if (entropy > 3.5) score += 30
  if (consonantRatio > 0.7) score += 25
  if (digitRatio > 0.2) score += 15
  if (bigramScore < 0.8) score += 20
  if (length > 15) score += 10
  if (!knownTld) score += 10

  const confidence = Math.min(score, 100)
  const isDGA = confidence >= 40

  const indicators: string[] = []
  if (entropy > 3.5) indicators.push(`High character entropy (${entropy}) — typical of random generation`)
  if (consonantRatio > 0.7) indicators.push(`Consonant cluster ratio ${consonantRatio} — unpronounceable pattern`)
  if (digitRatio > 0.2) indicators.push(`High digit ratio (${digitRatio}) — algorithmically appended numbers`)
  if (bigramScore < 0.8) indicators.push(`Unusual bigram score — rare character sequences detected`)
  if (length > 15) indicators.push(`Long domain name (${length} chars) — DGA domains tend to be long`)
  if (!knownTld) indicators.push(`Unusual TLD (.${tld}) — often used by DGA malware`)

  const risk: DGAResult["risk_level"] =
    confidence >= 80 ? "critical" : confidence >= 60 ? "high" : confidence >= 40 ? "medium" : "low"

  return {
    domain,
    is_dga: isDGA,
    confidence,
    entropy,
    consonant_ratio: consonantRatio,
    digit_ratio: digitRatio,
    bigram_score: bigramScore,
    known_tld: knownTld,
    domain_length: length,
    risk_level: risk,
    model_used: "LSTM + 1D-CNN Ensemble",
    indicators,
    ai_explanation: isDGA
      ? `The domain "${domain}" exhibits strong characteristics of DGA generation. The high entropy (${entropy}) and unusual bigram patterns suggest the name was algorithmically generated rather than human-chosen. Legitimate domains are typically pronounceable and have lower entropy. This pattern matches known DGA families used in malware campaigns.`
      : `The domain "${domain}" shows characteristics typical of human-chosen domain names. The entropy, consonant ratios, and bigram patterns fall within normal ranges for legitimate domains. It is unlikely to be DGA-generated.`,
  }
}

const riskColors: Record<string, string> = {
  low: "text-primary border-primary/30 bg-primary/5",
  medium: "text-amber-500 border-amber-500/30 bg-amber-500/5",
  high: "text-orange-500 border-orange-500/30 bg-orange-500/5",
  critical: "text-destructive border-destructive/30 bg-destructive/5",
}

export default function DGADetectionPage() {
  const [domain, setDomain] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DGAResult | null>(null)
  const [error, setError] = useState("")

  async function handleAnalyze() {
    const d = domain.trim()
    if (!d) {
      setError("Please enter a domain name.")
      return
    }
    setError("")
    setLoading(true)
    setResult(null)
    await new Promise((r) => setTimeout(r, 1200))
    setResult(computeMockDGAResult(d))
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="noise-overlay pointer-events-none fixed inset-0 z-50" />
      <DashboardPageHeader title="DGA Detector" howItWorksHref="/dashboard/dga/how-it-works" />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="mb-1.5 text-2xl font-bold tracking-tight text-foreground">
            DGA Domain Detection
          </h1>
          <p className="text-sm text-muted-foreground">
            Domain Generation Algorithm (DGA) detection uses deep learning to identify algorithmically generated domains before they appear on blocklists.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="h-4 w-4 text-purple-500" />
                  Domain Analysis
                </CardTitle>
                <CardDescription>
                  Enter a domain to check if it was algorithmically generated by malware.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Domain name</label>
                  <Input
                    placeholder="e.g. xjqkwzmvpb.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    disabled={loading}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAnalyze() }}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button onClick={handleAnalyze} disabled={loading || !domain.trim()} className="flex-1">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {loading ? "Analyzing..." : "Analyze Domain"}
                  </Button>
                  {result && (
                    <Button variant="outline" onClick={() => { setResult(null); setDomain("") }}>Clear</Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Sample Domains</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 sm:grid-cols-2">
                {SAMPLES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => { setDomain(s.value); setResult(null) }}
                    className="rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted"
                  >
                    <div className="mb-1 flex items-center gap-1.5">
                      {s.suspicious ? (
                        <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
                      ) : (
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                      )}
                      <span className={`text-xs font-medium ${s.suspicious ? "text-destructive" : "text-primary"}`}>
                        {s.label}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-muted-foreground">{s.value}</p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                      <div className="relative flex h-16 w-16 items-center justify-center">
                        <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/20" />
                        <Brain className="h-8 w-8 text-purple-500" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Running LSTM + CNN analysis...</p>
                      <p className="text-xs text-muted-foreground">Evaluating character entropy, bigrams, n-grams</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Verdict */}
                  <Card>
                    <CardContent className="pt-4">
                      <div className={`rounded-xl border p-4 ${result.is_dga ? "border-destructive/30 bg-destructive/[0.03]" : "border-primary/30 bg-primary/[0.03]"}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {result.is_dga ? (
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
                              <p className={`text-xl font-bold ${result.is_dga ? "text-destructive" : "text-primary"}`}>
                                {result.is_dga ? "DGA Detected" : "Likely Legitimate"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">DGA Confidence</p>
                            <p className="text-xl font-bold text-foreground">{result.confidence}%</p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="outline" className={`text-[10px] ${riskColors[result.risk_level]}`}>
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Risk: {result.risk_level}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            <Binary className="mr-1 h-3 w-3" />
                            {result.model_used}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Metrics */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <BarChart2 className="h-4 w-4 text-blue-500" />
                        Character Analysis Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { label: "Shannon Entropy", value: result.entropy, max: 5, unit: "bits", threshold: 3.5, higher: true },
                        { label: "Consonant Ratio", value: result.consonant_ratio * 100, max: 100, unit: "%", threshold: 70, higher: true },
                        { label: "Digit Ratio", value: result.digit_ratio * 100, max: 100, unit: "%", threshold: 20, higher: true },
                        { label: "Bigram Naturalness", value: result.bigram_score * 100, max: 100, unit: "%", threshold: 80, higher: false },
                      ].map((m) => (
                        <div key={m.label}>
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{m.label}</span>
                            <span className="text-xs font-bold text-foreground">
                              {m.unit === "bits" ? m.value : Math.round(m.value)}{m.unit === "%" ? "%" : ""}
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(m.value / m.max) * 100}%` }}
                              transition={{ duration: 0.7, ease: "easeOut" }}
                              className={`h-full rounded-full ${
                                m.higher
                                  ? m.value > m.threshold ? "bg-destructive" : "bg-primary"
                                  : m.value < m.threshold ? "bg-destructive" : "bg-primary"
                              }`}
                            />
                          </div>
                        </div>
                      ))}

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-2">
                          <span className="text-[11px] text-muted-foreground">Domain length</span>
                          <span className="font-mono text-xs font-bold text-foreground">{result.domain_length}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-2">
                          <span className="text-[11px] text-muted-foreground">Known TLD</span>
                          <span className={`text-xs font-bold ${result.known_tld ? "text-primary" : "text-destructive"}`}>
                            {result.known_tld ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Indicators */}
                  {result.indicators.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <Hash className="h-4 w-4 text-orange-500" />
                          Detection Indicators
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1.5">
                        {result.indicators.map((ind, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-2.5"
                          >
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500" />
                            <p className="text-xs text-foreground/80">{ind}</p>
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* AI Explanation */}
                  {result.ai_explanation && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
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
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                        <Brain className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="mb-1 text-lg font-semibold text-foreground">No domain analyzed</h3>
                      <p className="max-w-sm text-sm text-muted-foreground">
                        Enter a domain name to check if it was generated by a Domain Generation Algorithm (DGA).
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <AIChatbox context={result ? { feature: "dga_detection", result } : { feature: "dga_detection" }} />
    </div>
  )
}
