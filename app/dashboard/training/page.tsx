"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  GraduationCap,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  CheckCircle,
  XCircle,
  RotateCcw,
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
import {
  severityIcon,
  severityColor,
  threatBadgeClass,
} from "@/components/dashboard/result-card"

interface QuizEmail {
  quiz_id: string
  email_subject: string
  email_body: string
  email_sender: string
  difficulty: string
}

interface QuizResult {
  correct: boolean
  actual_answer: string
  explanation: string
  indicators: { indicator: string; detail: string; severity: string }[]
  difficulty: string
}

export default function TrainingPage() {
  const [difficulty, setDifficulty] = useState("medium")
  const [generating, setGenerating] = useState(false)
  const [checking, setChecking] = useState(false)
  const [email, setEmail] = useState<QuizEmail | null>(null)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [error, setError] = useState("")
  const [score, setScore] = useState({ correct: 0, total: 0 })

  async function handleGenerate() {
    setError("")
    setGenerating(true)
    setEmail(null)
    setResult(null)

    try {
      const res = await fetch("http://localhost:8000/api/training/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || `Server error: ${res.status}`)
      setEmail(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect. Make sure the backend is running on port 8000."
      )
    } finally {
      setGenerating(false)
    }
  }

  async function handleAnswer(answer: string) {
    if (!email) return
    setChecking(true)
    setError("")

    try {
      const res = await fetch("http://localhost:8000/api/training/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quiz_id: email.quiz_id, user_answer: answer }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || `Server error: ${res.status}`)
      setResult(data)
      setScore((prev) => ({
        correct: prev.correct + (data.correct ? 1 : 0),
        total: prev.total + 1,
      }))
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to check answer."
      )
    } finally {
      setChecking(false)
    }
  }

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
            <span className="hidden text-sm text-muted-foreground sm:block">Training Mode</span>
          </div>
          {score.total > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Score: {score.correct}/{score.total} ({Math.round((score.correct / score.total) * 100)}%)
              </Badge>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Title */}
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10">
              <GraduationCap className="h-7 w-7 text-teal-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Phishing Training Mode</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Test your ability to spot phishing emails. AI generates realistic emails for you to evaluate.
            </p>
          </div>

          {/* Difficulty Selector & Generate */}
          {!email && !generating && (
            <Card>
              <CardContent className="p-6">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Select Difficulty
                </p>
                <div className="mb-4 grid grid-cols-3 gap-3">
                  {["easy", "medium", "hard"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`rounded-lg border p-3 text-center transition-all ${
                        difficulty === d
                          ? "border-teal-500 bg-teal-500/10 text-teal-600"
                          : "border-border bg-card text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <p className="text-sm font-medium capitalize">{d}</p>
                      <p className="text-[10px]">
                        {d === "easy" ? "Obvious clues" : d === "medium" ? "Subtle flags" : "Very convincing"}
                      </p>
                    </button>
                  ))}
                </div>
                <Button onClick={handleGenerate} className="w-full" size="lg">
                  <Sparkles className="h-4 w-4" />
                  Generate Email Challenge
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Loading */}
          {generating && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="mb-3 h-10 w-10 animate-spin text-teal-500" />
                <p className="text-sm text-muted-foreground">Generating {difficulty} challenge...</p>
              </CardContent>
            </Card>
          )}

          {/* Error */}
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

          {/* Email Display */}
          {email && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] capitalize">{email.difficulty}</Badge>
                    {!result && <Badge variant="secondary" className="text-[10px]">Is this phishing?</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Email card */}
                  <div className="rounded-lg border border-border bg-muted/20 p-4">
                    <div className="mb-3 space-y-1 border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">From:</span>
                        <span className="text-xs text-foreground">{email.email_sender}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Subject:</span>
                        <span className="text-xs font-medium text-foreground">{email.email_subject}</span>
                      </div>
                    </div>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                      {email.email_body}
                    </div>
                  </div>

                  {/* Answer Buttons */}
                  {!result && (
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => handleAnswer("phishing")}
                        disabled={checking}
                        variant="outline"
                        className="border-destructive/30 text-destructive hover:bg-destructive/10"
                        size="lg"
                      >
                        {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
                        Phishing
                      </Button>
                      <Button
                        onClick={() => handleAnswer("legitimate")}
                        disabled={checking}
                        variant="outline"
                        className="border-primary/30 text-primary hover:bg-primary/10"
                        size="lg"
                      >
                        {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                        Legitimate
                      </Button>
                    </div>
                  )}

                  {/* Result Feedback */}
                  <AnimatePresence>
                    {result && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        {/* Correct/Incorrect Banner */}
                        <div className={`rounded-xl border p-4 ${
                          result.correct
                            ? "border-primary/30 bg-primary/[0.03]"
                            : "border-destructive/30 bg-destructive/[0.03]"
                        }`}>
                          <div className="flex items-center gap-3">
                            {result.correct ? (
                              <CheckCircle className="h-8 w-8 text-primary" />
                            ) : (
                              <XCircle className="h-8 w-8 text-destructive" />
                            )}
                            <div>
                              <p className={`text-lg font-bold ${result.correct ? "text-primary" : "text-destructive"}`}>
                                {result.correct ? "Correct!" : "Incorrect"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                This email was <span className="font-medium text-foreground">{result.actual_answer}</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Explanation */}
                        <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.03] p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                            <p className="text-xs font-medium uppercase tracking-wider text-violet-600 dark:text-violet-400">
                              Explanation
                            </p>
                          </div>
                          <p className="text-sm leading-relaxed text-foreground/90">{result.explanation}</p>
                        </div>

                        {/* Indicators */}
                        {result.indicators.length > 0 && (
                          <div>
                            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              Key Indicators
                            </p>
                            <div className="space-y-2">
                              {result.indicators.map((ind, i) => {
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

                        {/* Next Button */}
                        <Button onClick={handleGenerate} className="w-full" size="lg">
                          <RotateCcw className="h-4 w-4" />
                          Next Challenge
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
