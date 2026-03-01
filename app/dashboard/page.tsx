"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Send,
  Loader2,
  ArrowLeft,
  AlertTriangle,
  Clock,
  Mail,
  Info,
  BarChart3,
  History,
  Trash2,
  GitCompareArrows,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface RiskIndicator {
  indicator: string
  detail: string
  severity: "low" | "medium" | "high" | "critical"
}

interface FeatureImportance {
  feature: string
  value: number
  impact: number
  shap_value: number
  direction: string
}

interface AnalysisResult {
  prediction: string
  confidence: number
  threat_level: string
  risk_score: number
  model_used: string
  risk_indicators: RiskIndicator[]
  feature_importance: FeatureImportance[]
  top_phishing_indicators: (string | FeatureImportance)[]
  top_legitimate_indicators: (string | FeatureImportance)[]
  features_extracted: Record<string, number>
  highlighted_words: Array<{ word: string; type: string; position: number }>
}

interface HistoryItem {
  id: number
  timestamp: string
  subject: string
  body_preview: string
  prediction: string
  confidence: number
  threat_level: string
  risk_score: number
  model_used: string
}

const MODELS = [
  { value: "random_forest", label: "Random Forest", tag: "Recommended" },
  { value: "gradient_boosting", label: "Gradient Boosting", tag: "Accurate" },
  { value: "logistic_regression", label: "Logistic Regression", tag: "Fast" },
  { value: "naive_bayes", label: "Naive Bayes", tag: "Baseline" },
]

const severityIcon: Record<string, typeof AlertTriangle> = {
  high: AlertTriangle,
  critical: ShieldAlert,
  medium: Clock,
  low: Info,
}

const severityColor: Record<string, string> = {
  critical: "text-destructive",
  high: "text-destructive",
  medium: "text-chart-4",
  low: "text-primary",
}

const threatBadgeClass: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  low: "bg-primary/10 text-primary border-primary/20",
}

function ResultCard({ result, compact = false }: { result: AnalysisResult; compact?: boolean }) {
  const isPhishing = result.prediction === "phishing"

  return (
    <div className="flex flex-col gap-4">
      {/* Verdict */}
      <div className={`rounded-xl border p-4 ${isPhishing ? "border-destructive/30 bg-destructive/[0.03]" : "border-primary/30 bg-primary/[0.03]"}`}>
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {isPhishing ? (
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
              <p className={`text-xl font-bold capitalize ${isPhishing ? "text-destructive" : "text-primary"}`}>
                {result.prediction}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Confidence</p>
            <p className="text-xl font-bold text-foreground">
              {(result.confidence * 100).toFixed(1)}%
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={threatBadgeClass[result.threat_level] || ""}>
            <AlertTriangle className="mr-1 h-3 w-3" />
            Threat: {result.threat_level.charAt(0).toUpperCase() + result.threat_level.slice(1)}
          </Badge>
          <Badge variant="secondary">
            <BarChart3 className="mr-1 h-3 w-3" />
            Risk: {result.risk_score}
          </Badge>
          <Badge variant="outline">
            {result.model_used.replace(/_/g, " ")}
          </Badge>
        </div>
      </div>

      {/* Risk Indicators */}
      {result.risk_indicators.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Risk Indicators ({result.risk_indicators.length})
          </p>
          <div className="space-y-2">
            {result.risk_indicators.slice(0, compact ? 4 : undefined).map((ind, i) => {
              const Icon = severityIcon[ind.severity] || Info
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
                    {!compact && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{ind.detail}</p>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Feature Importance (SHAP) */}
      {result.feature_importance.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Top Features (SHAP)
          </p>
          <div className="space-y-2">
            {result.feature_importance.slice(0, compact ? 5 : 10).map((feat, i) => {
              const maxImpact = Math.max(
                ...result.feature_importance.slice(0, compact ? 5 : 10).map((f) => Math.abs(f.impact))
              )
              const barWidth = maxImpact > 0 ? (Math.abs(feat.impact) / maxImpact) * 100 : 0
              return (
                <motion.div
                  key={feat.feature}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-muted-foreground">{feat.feature}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] text-foreground">
                        {typeof feat.value === "number" ? feat.value.toFixed(2) : String(feat.value)}
                      </span>
                      <span className={`text-[9px] font-bold ${feat.direction === "phishing" ? "text-destructive" : "text-primary"}`}>
                        {feat.direction === "phishing" ? "+" : "-"}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.6, delay: 0.1 + i * 0.04, ease: "easeOut" }}
                      className={`h-full rounded-full ${feat.direction === "phishing" ? "bg-destructive" : "bg-primary"}`}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Phishing / Legitimate signals */}
      {!compact && (
        <div className="grid gap-3 sm:grid-cols-2">
          {result.top_phishing_indicators?.length > 0 && (
            <div className="rounded-lg border border-border p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-destructive">
                <ShieldAlert className="h-3.5 w-3.5" />
                Phishing Signals
              </p>
              <ul className="space-y-1">
                {result.top_phishing_indicators.map((ind, i) => {
                  const label = typeof ind === "string" ? ind : typeof ind === "object" && ind !== null ? `${ind.feature} (${typeof ind.value === "number" ? ind.value.toFixed(2) : ind.value})` : String(ind)
                  return (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-destructive" />
                      {label}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
          {result.top_legitimate_indicators?.length > 0 && (
            <div className="rounded-lg border border-border p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                Legitimacy Signals
              </p>
              <ul className="space-y-1">
                {result.top_legitimate_indicators.map((ind, i) => {
                  const label = typeof ind === "string" ? ind : typeof ind === "object" && ind !== null ? `${ind.feature} (${typeof ind.value === "number" ? ind.value.toFixed(2) : ind.value})` : String(ind)
                  return (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      {label}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Extracted Features */}
      {!compact && result.features_extracted && Object.keys(result.features_extracted).length > 0 && (
        <details className="group">
          <summary className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
            <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
            All Extracted Features ({Object.keys(result.features_extracted).length})
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3">
            {Object.entries(result.features_extracted).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between border-b border-border/50 py-1">
                <span className="truncate font-mono text-[10px] text-muted-foreground">{key}</span>
                <span className="ml-2 shrink-0 font-mono text-[10px] font-medium text-foreground">
                  {typeof val === "number" ? (val % 1 === 0 ? val : val.toFixed(3)) : String(val)}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [model, setModel] = useState("random_forest")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState("")
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("analyze")

  // Compare state
  const [compareLoading, setCompareLoading] = useState(false)
  const [compareResults, setCompareResults] = useState<AnalysisResult[]>([])
  const [compareError, setCompareError] = useState("")

  async function handleAnalyze() {
    if (!body.trim()) {
      setError("Please enter the email body to analyze.")
      return
    }
    setError("")
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          body: body.trim(),
          model_name: model,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Server error: ${res.status}`)
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

  async function handleCompare() {
    if (!body.trim()) {
      setCompareError("Please enter the email body to compare.")
      return
    }
    setCompareError("")
    setCompareLoading(true)
    setCompareResults([])

    try {
      const results = await Promise.all(
        MODELS.map(async (m) => {
          const res = await fetch("http://localhost:8000/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subject: subject.trim(),
              body: body.trim(),
              model_name: m.value,
            }),
          })
          if (!res.ok) throw new Error(`${m.label} failed: ${res.status}`)
          return res.json()
        })
      )
      setCompareResults(results)
    } catch (err) {
      setCompareError(
        err instanceof Error
          ? err.message
          : "Failed to connect. Make sure the backend is running on port 8000."
      )
    } finally {
      setCompareLoading(false)
    }
  }

  async function loadHistory() {
    setHistoryLoading(true)
    try {
      const res = await fetch("http://localhost:8000/api/history?limit=20")
      if (!res.ok) throw new Error("Failed to load history")
      const data = await res.json()
      setHistory(Array.isArray(data) ? data : data.results ?? [])
    } catch {
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  async function deleteHistory(id: number) {
    try {
      await fetch(`http://localhost:8000/api/history/${id}`, { method: "DELETE" })
      setHistory((h) => h.filter((item) => item.id !== id))
    } catch {}
  }

  function loadFromHistory(item: HistoryItem) {
    setSubject(item.subject)
    setBody(item.body_preview)
    setActiveTab("analyze")
  }

  function handleReset() {
    setSubject("")
    setBody("")
    setResult(null)
    setError("")
    setCompareResults([])
    setCompareError("")
  }

  function fillSample(s: string, b: string) {
    setSubject(s)
    setBody(b)
    setResult(null)
    setCompareResults([])
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="noise-overlay pointer-events-none fixed inset-0 z-50" />

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2">
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
            <span className="hidden text-sm text-muted-foreground sm:block">Dashboard</span>
          </div>

          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODELS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  <span>{m.label}</span>
                  <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
                    {m.tag}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v)
            if (v === "history") loadHistory()
          }}
        >
          <TabsList className="mb-6">
            <TabsTrigger value="analyze" className="gap-1.5">
              <Shield className="h-4 w-4" />
              Analyze
            </TabsTrigger>
            <TabsTrigger value="compare" className="gap-1.5">
              <GitCompareArrows className="h-4 w-4" />
              Compare Models
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* ========== ANALYZE TAB ========== */}
          <TabsContent value="analyze">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left — Email Input */}
              <div className="flex flex-col gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" />
                      Email Input
                    </CardTitle>
                    <CardDescription>
                      Paste the email you want to analyze for phishing threats
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Subject</label>
                      <Input
                        placeholder="e.g. URGENT: Your account has been compromised"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email Body</label>
                      <Textarea
                        placeholder="Paste the full email body here..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        disabled={loading}
                        className="min-h-[240px] font-mono text-sm"
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
                      <Button onClick={handleAnalyze} disabled={loading || !body.trim()} className="flex-1">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        {loading ? "Analyzing..." : "Analyze Email"}
                      </Button>
                      {(result || subject || body) && (
                        <Button variant="outline" onClick={handleReset} disabled={loading}>
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
                      onClick={() =>
                        fillSample(
                          "URGENT: Your PayPa1 Account Has Been Limited",
                          "Dear Valued Customer,\n\nWe have detected unusual activity on your account. Your access has been temporarily limited until you verify your identity.\n\nClick the link below to restore your account immediately:\nhttps://paypa1-secure.billing-verify.com/restore\n\nFailure to act within 24 hours will result in permanent account suspension.\n\nPayPa1 Security Team"
                        )
                      }
                      className="rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted"
                    >
                      <div className="mb-1 flex items-center gap-1.5">
                        <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
                        <span className="text-xs font-medium text-destructive">Phishing</span>
                      </div>
                      <p className="text-xs text-muted-foreground">PayPal account suspension scam</p>
                    </button>

                    <button
                      onClick={() =>
                        fillSample(
                          "Your order #12345 has been shipped!",
                          "Hi there,\n\nGreat news! Your order #12345 has been shipped and is on its way.\n\nTracking Number: 1Z999AA10123456784\nEstimated Delivery: March 5-7, 2026\n\nYou can track your package at https://www.ups.com/track\n\nThank you for shopping with us!\n\nBest regards,\nCustomer Service Team"
                        )
                      }
                      className="rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted"
                    >
                      <div className="mb-1 flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-medium text-primary">Legitimate</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Normal shipping confirmation</p>
                    </button>

                    <button
                      onClick={() =>
                        fillSample(
                          "Congratulations! You've Won $1,000,000!",
                          "CONGRATULATIONS!!!\n\nYou have been SELECTED as the winner of our $1,000,000 GRAND PRIZE lottery!\n\nTo claim your prize, click here immediately:\nhttp://192.168.1.100/claim-prize?id=winner\n\nYou must respond within 48 hours or your prize will be FORFEITED!\n\nSend your full name, address, and bank details to claim.\n\nLottery Commission International"
                        )
                      }
                      className="rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted"
                    >
                      <div className="mb-1 flex items-center gap-1.5">
                        <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
                        <span className="text-xs font-medium text-destructive">Phishing</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Lottery scam with IP-based URL</p>
                    </button>

                    <button
                      onClick={() =>
                        fillSample(
                          "Team standup notes - March 2",
                          "Hi team,\n\nHere are the notes from today's standup:\n\n- API integration is on track for deployment next week\n- Frontend review scheduled for Wednesday\n- Please update your Jira tickets before EOD\n\nLet me know if you have any questions.\n\nBest,\nSarah\nEngineering Manager"
                        )
                      }
                      className="rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted"
                    >
                      <div className="mb-1 flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-medium text-primary">Legitimate</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Internal work email</p>
                    </button>
                  </CardContent>
                </Card>
              </div>

              {/* Right — Results Panel */}
              <div>
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-20">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="mb-4 h-10 w-10 rounded-full border-2 border-primary border-t-transparent"
                          />
                          <p className="font-mono text-sm text-primary">Analyzing email...</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Running {MODELS.find((m) => m.value === model)?.label}
                          </p>
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
                        <CardHeader>
                          <CardTitle className="text-sm">Analysis Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResultCard result={result} />
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                            <Shield className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="mb-1 text-lg font-semibold text-foreground">No analysis yet</h3>
                          <p className="max-w-sm text-sm text-muted-foreground">
                            Enter an email on the left and click &ldquo;Analyze Email&rdquo; to see results, or try a quick sample.
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </TabsContent>

          {/* ========== COMPARE TAB ========== */}
          <TabsContent value="compare">
            <div className="space-y-6">
              {/* Input area */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitCompareArrows className="h-5 w-5 text-primary" />
                    Compare All Models
                  </CardTitle>
                  <CardDescription>
                    Run the same email through all 4 models and compare predictions, confidence, and feature importance side by side
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Subject</label>
                      <Input
                        placeholder="Email subject..."
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        disabled={compareLoading}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email Body</label>
                      <Textarea
                        placeholder="Paste the email body here..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        disabled={compareLoading}
                        className="min-h-[120px] font-mono text-sm"
                      />
                    </div>
                  </div>

                  {compareError && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                    >
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {compareError}
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <Button onClick={handleCompare} disabled={compareLoading || !body.trim()}>
                      {compareLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitCompareArrows className="h-4 w-4" />}
                      {compareLoading ? "Comparing..." : "Compare All Models"}
                    </Button>
                    {compareResults.length > 0 && (
                      <Button variant="outline" onClick={() => { setCompareResults([]); setCompareError("") }}>
                        Clear Results
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Loading */}
              {compareLoading && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {MODELS.map((m) => (
                    <Card key={m.value}>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="mb-3 h-6 w-6 animate-spin text-primary" />
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Comparison Summary */}
              {compareResults.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  {/* Summary table */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Comparison Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="pb-3 pr-4 text-left text-xs font-medium text-muted-foreground">Model</th>
                              <th className="pb-3 px-4 text-left text-xs font-medium text-muted-foreground">Verdict</th>
                              <th className="pb-3 px-4 text-left text-xs font-medium text-muted-foreground">Confidence</th>
                              <th className="pb-3 px-4 text-left text-xs font-medium text-muted-foreground">Threat Level</th>
                              <th className="pb-3 px-4 text-left text-xs font-medium text-muted-foreground">Risk Score</th>
                              <th className="pb-3 pl-4 text-left text-xs font-medium text-muted-foreground">Indicators</th>
                            </tr>
                          </thead>
                          <tbody>
                            {compareResults.map((r, i) => {
                              const rIsPhishing = r.prediction === "phishing"
                              return (
                                <motion.tr
                                  key={r.model_used}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.1 }}
                                  className="border-b border-border/50 last:border-0"
                                >
                                  <td className="py-3 pr-4">
                                    <div>
                                      <p className="font-medium text-foreground">{r.model_used.replace(/_/g, " ")}</p>
                                      <p className="text-[10px] text-muted-foreground">
                                        {MODELS.find((m) => m.value === r.model_used)?.tag}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <Badge variant={rIsPhishing ? "destructive" : "default"} className="capitalize">
                                      {rIsPhishing ? (
                                        <ShieldAlert className="mr-1 h-3 w-3" />
                                      ) : (
                                        <ShieldCheck className="mr-1 h-3 w-3" />
                                      )}
                                      {r.prediction}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                      <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                                        <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: `${r.confidence * 100}%` }}
                                          transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                                          className={`h-full rounded-full ${rIsPhishing ? "bg-destructive" : "bg-primary"}`}
                                        />
                                      </div>
                                      <span className="font-mono text-xs font-medium">
                                        {(r.confidence * 100).toFixed(1)}%
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <Badge variant="outline" className={threatBadgeClass[r.threat_level] || ""}>
                                      {r.threat_level}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4 font-mono text-xs font-medium">{r.risk_score}</td>
                                  <td className="py-3 pl-4 text-xs text-muted-foreground">{r.risk_indicators.length}</td>
                                </motion.tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Agreement indicator */}
                      {(() => {
                        const predictions = compareResults.map((r) => r.prediction)
                        const allAgree = predictions.every((p) => p === predictions[0])
                        const avgConfidence =
                          compareResults.reduce((s, r) => s + r.confidence, 0) / compareResults.length
                        return (
                          <div className={`mt-4 flex items-center gap-2 rounded-lg border p-3 ${allAgree ? "border-primary/20 bg-primary/5" : "border-chart-4/20 bg-chart-4/5"}`}>
                            {allAgree ? (
                              <ShieldCheck className="h-4 w-4 text-primary" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-chart-4" />
                            )}
                            <p className="text-xs text-foreground">
                              {allAgree ? (
                                <>
                                  All models agree: <strong className="capitalize">{predictions[0]}</strong> with
                                  average confidence of <strong>{(avgConfidence * 100).toFixed(1)}%</strong>
                                </>
                              ) : (
                                <>
                                  Models <strong>disagree</strong> on this email. Review individual results below for details.
                                </>
                              )}
                            </p>
                          </div>
                        )
                      })()}
                    </CardContent>
                  </Card>

                  {/* Per-model detailed results */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    {compareResults.map((r, i) => (
                      <motion.div
                        key={r.model_used}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between text-sm">
                              <span className="capitalize">{r.model_used.replace(/_/g, " ")}</span>
                              <Badge variant="secondary" className="text-[10px]">
                                {MODELS.find((m) => m.value === r.model_used)?.tag}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ResultCard result={r} compact />
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Empty state */}
              {!compareLoading && compareResults.length === 0 && !compareError && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                      <GitCompareArrows className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="mb-1 text-lg font-semibold text-foreground">Compare models</h3>
                    <p className="max-w-md text-sm text-muted-foreground">
                      Enter an email above and click &ldquo;Compare All Models&rdquo; to run it through all 4 ML models
                      simultaneously and see how their predictions differ.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* ========== HISTORY TAB ========== */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Analysis History
                </CardTitle>
                <CardDescription>Previous email analyses stored in the database</CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <History className="mb-3 h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      No analysis history yet. Analyze some emails to see them here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/30"
                      >
                        <button
                          onClick={() => loadFromHistory(item)}
                          className="flex flex-1 items-start gap-3 text-left"
                        >
                          {item.prediction === "phishing" ? (
                            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                          ) : (
                            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {item.subject || "(No subject)"}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.body_preview}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <Badge
                                variant={item.prediction === "phishing" ? "destructive" : "default"}
                                className="text-[10px]"
                              >
                                {item.prediction}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">
                                {(item.confidence * 100).toFixed(1)}% confidence
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(item.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => deleteHistory(item.id)}
                          className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
