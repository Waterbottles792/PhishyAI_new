"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  BookOpen,
  BarChart3,
  GitBranch,
  Zap,
  Info,
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

const MOCK_MODEL_VERSIONS = [
  { version: "v3.2.1", accuracy: 97.4, f1: 0.971, date: "2026-03-01", status: "active" },
  { version: "v3.2.0", accuracy: 96.9, f1: 0.965, date: "2026-02-15", status: "shadow" },
  { version: "v3.1.8", accuracy: 95.2, f1: 0.948, date: "2026-01-20", status: "retired" },
]

const MOCK_QUEUE = [
  { id: "fb-001", type: "false_positive", url: "https://secure-login.paypal-support.com", reportedAt: "2 min ago", status: "queued" },
  { id: "fb-002", type: "false_negative", url: "https://google.com/accounts/signin", reportedAt: "14 min ago", status: "processing" },
  { id: "fb-003", type: "false_positive", url: "https://amazon.co.uk/dp/B09X2", reportedAt: "1 hr ago", status: "incorporated" },
  { id: "fb-004", type: "false_negative", url: "http://icloud-id-verify.xyz", reportedAt: "3 hr ago", status: "incorporated" },
]

type FeedbackType = "false_positive" | "false_negative" | null

export default function FeedbackPage() {
  const [url, setUrl] = useState("")
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null)
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit() {
    if (!url.trim() || !feedbackType) {
      setError("Please enter a URL and select a feedback type.")
      return
    }
    setError("")
    setSubmitting(true)
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500))
    setSubmitting(false)
    setSubmitted(true)
  }

  function reset() {
    setUrl("")
    setFeedbackType(null)
    setNotes("")
    setSubmitted(false)
    setError("")
  }

  const retrainingProgress = 67

  return (
    <div className="min-h-screen bg-background">
      <div className="noise-overlay pointer-events-none fixed inset-0 z-50" />
      <DashboardPageHeader title="Active Learning" howItWorksHref="/dashboard/feedback/how-it-works" />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <h1 className="mb-1.5 text-2xl font-bold tracking-tight text-foreground">
            Continuous Active Learning
          </h1>
          <p className="text-sm text-muted-foreground">
            Report misclassifications to improve model accuracy. When enough feedback accumulates, a new model version is automatically trained and shadow-deployed.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left — Feedback Form */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <RefreshCw className="h-4 w-4 text-orange-500" />
                  Report a Misclassification
                </CardTitle>
                <CardDescription>
                  Did the model get it wrong? Tell us so we can fix it.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-3 py-8 text-center"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        <CheckCircle className="h-7 w-7 text-primary" />
                      </div>
                      <p className="font-semibold text-foreground">Feedback received!</p>
                      <p className="text-sm text-muted-foreground">
                        Your report has been added to the retraining queue. Thank you for helping improve the model.
                      </p>
                      <Button variant="outline" size="sm" onClick={reset} className="mt-2">
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                        Submit another
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">URL that was misclassified</label>
                        <Input
                          placeholder="https://example.com"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          disabled={submitting}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-medium text-muted-foreground">Feedback type</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setFeedbackType("false_positive")}
                            className={`flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all ${
                              feedbackType === "false_positive"
                                ? "border-orange-500/50 bg-orange-500/10"
                                : "border-border bg-muted/30 hover:bg-muted/60"
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <ThumbsUp className="h-4 w-4 text-orange-500" />
                              <span className="text-xs font-semibold text-foreground">False Positive</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">Model flagged a safe URL as phishing</p>
                          </button>
                          <button
                            onClick={() => setFeedbackType("false_negative")}
                            className={`flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all ${
                              feedbackType === "false_negative"
                                ? "border-destructive/50 bg-destructive/10"
                                : "border-border bg-muted/30 hover:bg-muted/60"
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <ThumbsDown className="h-4 w-4 text-destructive" />
                              <span className="text-xs font-semibold text-foreground">False Negative</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">Model missed a real phishing URL</p>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Notes (optional)</label>
                        <textarea
                          placeholder="Add any context that might help..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          disabled={submitting}
                          rows={3}
                          className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          {error}
                        </div>
                      )}

                      <Button
                        onClick={handleSubmit}
                        disabled={submitting || !url.trim() || !feedbackType}
                        className="w-full"
                      >
                        {submitting ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                        ) : (
                          <>Submit Feedback</>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Model Comparison */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <GitBranch className="h-4 w-4 text-violet-500" />
                  Model Versions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {MOCK_MODEL_VERSIONS.map((v) => (
                  <div key={v.version} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-foreground">{v.version}</span>
                        <Badge
                          variant="outline"
                          className={`px-1.5 py-0 text-[10px] ${
                            v.status === "active" ? "border-primary/40 text-primary bg-primary/5" :
                            v.status === "shadow" ? "border-violet-500/40 text-violet-500 bg-violet-500/5" :
                            "border-muted-foreground/30 text-muted-foreground"
                          }`}
                        >
                          {v.status}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{v.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-foreground">{v.accuracy}%</p>
                      <p className="text-[10px] text-muted-foreground">F1: {v.f1}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right — Queue & Retraining Status */}
          <div className="flex flex-col gap-6">
            {/* Retraining Progress */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Retraining Pipeline
                </CardTitle>
                <CardDescription>
                  A new model is triggered when 50+ feedback reports accumulate.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Queue progress</span>
                    <span className="text-sm font-bold text-foreground">34 / 50</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${retrainingProgress}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    16 more reports needed to trigger auto-retraining
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Reports (24h)", value: "12", icon: ThumbsUp, color: "text-primary" },
                    { label: "FP Reports", value: "7", icon: ThumbsUp, color: "text-orange-500" },
                    { label: "FN Reports", value: "5", icon: ThumbsDown, color: "text-destructive" },
                    { label: "Incorporated", value: "22", icon: CheckCircle, color: "text-primary" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-border bg-muted/30 p-3">
                      <stat.icon className={`mb-1.5 h-4 w-4 ${stat.color}`} />
                      <p className="text-lg font-bold text-foreground">{stat.value}</p>
                      <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.03] p-3">
                  <div className="mb-1.5 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                    <span className="text-xs font-medium text-violet-500">Shadow Deployment Active</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Model v3.2.0 is currently shadow-deployed, processing 10% of traffic for comparison. It shows a 0.5% accuracy improvement over the active model.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Feedback Queue */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  Recent Feedback Queue
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {MOCK_QUEUE.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3"
                  >
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      entry.type === "false_positive" ? "bg-orange-500/10" : "bg-destructive/10"
                    }`}>
                      {entry.type === "false_positive" ? (
                        <ThumbsUp className="h-3.5 w-3.5 text-orange-500" />
                      ) : (
                        <ThumbsDown className="h-3.5 w-3.5 text-destructive" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-[11px] text-foreground">{entry.url}</p>
                      <p className="text-[10px] text-muted-foreground">{entry.reportedAt}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 px-1.5 py-0 text-[10px] ${
                        entry.status === "queued" ? "border-amber-500/40 text-amber-500" :
                        entry.status === "processing" ? "border-blue-500/40 text-blue-500" :
                        "border-primary/40 text-primary"
                      }`}
                    >
                      {entry.status}
                    </Badge>
                  </motion.div>
                ))}
                <div className="flex items-center gap-1.5 rounded-lg bg-muted/30 px-3 py-2">
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-[11px] text-muted-foreground">
                    Feedback is reviewed and incorporated into the next training cycle.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <AIChatbox context={{ feature: "active_learning", retrainingProgress }} />
    </div>
  )
}
