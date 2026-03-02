"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  QrCode,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Upload,
  ExternalLink,
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

interface QRResult {
  decoded_data: string
  data_type: string
  is_suspicious: boolean
  risk_score: number
  threat_level: string
  risk_indicators: RiskIndicator[]
  url_features?: Record<string, any> | null
  ai_explanation?: string | null
  safety_recommendations?: string[] | null
}

export default function QRAnalysisPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<QRResult | null>(null)
  const [error, setError] = useState("")
  const [dragOver, setDragOver] = useState(false)

  async function handleFileUpload(file: File) {
    setError("")
    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("http://localhost:8000/api/analyze/qr", {
        method: "POST",
        body: formData,
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
        model_used: "qr_analyzer",
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
            <span className="hidden text-sm text-muted-foreground sm:block">QR Scanner</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left — QR Upload */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-pink-500" />
                  QR Code Scanner
                </CardTitle>
                <CardDescription>
                  Upload a QR code image to decode and analyze the embedded URL or data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragOver(false)
                    const file = e.dataTransfer.files[0]
                    if (file) handleFileUpload(file)
                  }}
                  className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-colors ${
                    dragOver
                      ? "border-pink-500 bg-pink-500/5"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mb-2 h-10 w-10 animate-spin text-pink-500" />
                      <p className="text-sm text-muted-foreground">Scanning QR code...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
                      <p className="mb-1 text-sm font-medium text-foreground">
                        Drop a QR code image here or click to upload
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, GIF, BMP, WebP (max 10 MB)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file)
                          e.target.value = ""
                        }}
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                    </>
                  )}
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

                {result && (
                  <Button variant="outline" onClick={() => { setResult(null); setError("") }} className="w-full">
                    Clear Results
                  </Button>
                )}
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
                      <AnalysisStatus isLoading={true} result={null} modelName="QR Analyzer" />
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
                      <AnalysisStatus isLoading={false} result={analysisStatusResult} modelName="QR Analyzer" />
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
                          <DownloadReportButton analysisType="qr" results={result} />
                        </div>

                        {/* Decoded Data */}
                        <div>
                          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Decoded QR Data
                          </p>
                          <div className="rounded-lg border border-border bg-muted/30 p-3">
                            <div className="mb-1 flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px]">{result.data_type}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {result.data_type === "url" && <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                              <p className="break-all font-mono text-xs text-foreground">{result.decoded_data}</p>
                            </div>
                          </div>
                        </div>

                        {/* URL Features */}
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
                        <QrCode className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="mb-1 text-lg font-semibold text-foreground">No scan yet</h3>
                      <p className="max-w-sm text-sm text-muted-foreground">
                        Upload a QR code image on the left to decode and analyze it.
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
