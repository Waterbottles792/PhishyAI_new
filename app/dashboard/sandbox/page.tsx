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
  Monitor,
  Globe,
  FileCode,
  MousePointer,
  Download,
  Wifi,
  Eye,
  Clock,
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
import { AIChatbox } from "@/components/dashboard/ai-chatbox"
import { DashboardPageHeader } from "@/components/dashboard/page-header"

interface NetworkRequest {
  url: string
  type: "document" | "xhr" | "script" | "image" | "other"
  suspicious: boolean
  size: string
}

interface BehaviorEvent {
  time: string
  event: string
  type: "warning" | "info" | "critical"
}

interface SandboxResult {
  url: string
  verdict: "malicious" | "suspicious" | "clean"
  risk_score: number
  execution_time: string
  final_url: string
  redirects: number
  js_executed: boolean
  download_attempted: boolean
  mouse_evasion: boolean
  credential_form_detected: boolean
  screenshot_description: string
  network_requests: NetworkRequest[]
  behavior_events: BehaviorEvent[]
  dom_mutations: number
  ai_explanation: string
}

function generateMockSandboxResult(url: string): SandboxResult {
  const isPhishing = url.includes("secure") || url.includes("verify") || url.includes("login") || url.includes("paypal") || url.includes("apple") || url.includes("amazon") || url.includes("192.") || url.includes("xyz") || url.includes("bit.ly")

  const verdict: SandboxResult["verdict"] = isPhishing ? "malicious" : "clean"
  const riskScore = isPhishing ? 82 : 8

  const networkRequests: NetworkRequest[] = isPhishing
    ? [
        { url: url, type: "document", suspicious: false, size: "4.2 KB" },
        { url: "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js", type: "script", suspicious: false, size: "89 KB" },
        { url: `https://track.${url.split("/")[2] ?? "example.com"}/pixel.gif?uid=abc123&ref=login`, type: "image", suspicious: true, size: "43 B" },
        { url: `https://${url.split("/")[2] ?? "example.com"}/steal.php`, type: "xhr", suspicious: true, size: "128 B" },
        { url: "https://fonts.googleapis.com/css2?family=Roboto", type: "other", suspicious: false, size: "2.1 KB" },
      ]
    : [
        { url: url, type: "document", suspicious: false, size: "34 KB" },
        { url: "https://www.google.com/recaptcha/api.js", type: "script", suspicious: false, size: "12 KB" },
        { url: "https://fonts.googleapis.com/css2?family=Inter", type: "other", suspicious: false, size: "3.2 KB" },
      ]

  const behaviorEvents: BehaviorEvent[] = isPhishing
    ? [
        { time: "0.0s", event: "Page loaded — credential input form detected", type: "critical" },
        { time: "0.3s", event: "JavaScript waiting for mouse movement (evasion technique)", type: "warning" },
        { time: "0.8s", event: "Tracking pixel fired — session ID exfiltrated", type: "critical" },
        { time: "1.2s", event: "Form submit handler overwrites action to external XHR endpoint", type: "critical" },
        { time: "1.5s", event: "Deceptive redirect chain initiated (2 hops)", type: "warning" },
        { time: "2.1s", event: "Download prompt triggered for 'security-update.exe'", type: "critical" },
      ]
    : [
        { time: "0.0s", event: "Page loaded — standard navigation", type: "info" },
        { time: "0.4s", event: "Analytics loaded (Google Analytics)", type: "info" },
        { time: "1.0s", event: "No credential harvesting detected", type: "info" },
      ]

  return {
    url,
    verdict,
    risk_score: riskScore,
    execution_time: "4.2s",
    final_url: isPhishing ? `https://phish-collector.evil.net/submit?src=${encodeURIComponent(url)}` : url,
    redirects: isPhishing ? 2 : 0,
    js_executed: true,
    download_attempted: isPhishing,
    mouse_evasion: isPhishing,
    credential_form_detected: isPhishing,
    screenshot_description: isPhishing
      ? "Page renders a convincing PayPal login form with a blurred background. The URL bar shows the phishing domain. A 'Security Verification' overlay appears after 1.2s demanding credentials."
      : "Standard web page with normal navigation, no deceptive elements detected. Layout and branding match the expected legitimate website.",
    network_requests: networkRequests,
    behavior_events: behaviorEvents,
    dom_mutations: isPhishing ? 47 : 12,
    ai_explanation: isPhishing
      ? `The sandbox analysis reveals highly malicious behavior. The site uses mouse-movement evasion to delay payload delivery until a real user is detected. A credential harvesting form mimics the target brand's login page. An XHR endpoint exfiltrates entered credentials to an external server. The page also attempts to trigger a malware download disguised as a security update. This is a sophisticated phishing attack.`
      : `The sandbox analysis found no malicious behavior. The page loaded standard resources, made no suspicious network requests, and contained no credential harvesting forms or evasive JavaScript techniques. The site behaves consistently with a legitimate website.`,
  }
}

const VERDICT_STYLES = {
  malicious: { bg: "border-destructive/30 bg-destructive/[0.03]", text: "text-destructive", icon: ShieldAlert },
  suspicious: { bg: "border-amber-500/30 bg-amber-500/[0.03]", text: "text-amber-500", icon: ShieldAlert },
  clean: { bg: "border-primary/30 bg-primary/[0.03]", text: "text-primary", icon: ShieldCheck },
}

const EVENT_STYLES = {
  critical: "border-destructive/30 bg-destructive/5",
  warning: "border-amber-500/30 bg-amber-500/5",
  info: "border-border bg-muted/30",
}

const EVENT_ICON_STYLES = {
  critical: "text-destructive",
  warning: "text-amber-500",
  info: "text-muted-foreground",
}

function ScreenshotPreview({ url }: { url: string }) {
  const [imgState, setImgState] = useState<"loading" | "loaded" | "error">("loading")
  const screenshotUrl = `https://s0.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=1200&h=800`

  return (
    <div className="mb-3 overflow-hidden rounded-lg border border-border bg-muted/30">
      {imgState === "loading" && (
        <div className="flex aspect-video items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Capturing screenshot...</p>
          </div>
        </div>
      )}
      {imgState === "error" && (
        <div className="flex aspect-video items-center justify-center">
          <div className="text-center">
            <Monitor className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">Screenshot unavailable</p>
            <p className="text-[11px] text-muted-foreground/60">Site may be blocking screenshot services</p>
          </div>
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={screenshotUrl}
        alt={`Screenshot of ${url}`}
        className={`w-full transition-opacity duration-300 ${imgState === "loaded" ? "opacity-100" : "hidden"}`}
        onLoad={() => setImgState("loaded")}
        onError={() => setImgState("error")}
      />
    </div>
  )
}

export default function SandboxPage() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<SandboxResult | null>(null)
  const [error, setError] = useState("")

  async function handleAnalyze() {
    if (!url.trim()) {
      setError("Please enter a URL to analyze.")
      return
    }
    setError("")
    setLoading(true)
    setResult(null)
    setProgress(0)

    // Simulate progressive loading
    const steps = [10, 25, 45, 60, 75, 88, 95, 100]
    for (const step of steps) {
      await new Promise((r) => setTimeout(r, 300))
      setProgress(step)
    }

    setResult(generateMockSandboxResult(url.trim()))
    setLoading(false)
  }

  const STEPS = [
    "Launching headless browser...",
    "Loading URL in isolated sandbox...",
    "Executing JavaScript...",
    "Monitoring network requests...",
    "Analyzing DOM mutations...",
    "Checking for evasion techniques...",
    "Running behavioral ML classifier...",
    "Generating report...",
  ]
  const stepIndex = Math.floor((progress / 100) * STEPS.length)

  return (
    <div className="min-h-screen bg-background">
      <div className="noise-overlay pointer-events-none fixed inset-0 z-50" />
      <DashboardPageHeader title="Browser Sandbox" howItWorksHref="/dashboard/sandbox/how-it-works" />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="mb-1.5 text-2xl font-bold tracking-tight text-foreground">
            Active Browser Sandbox
          </h1>
          <p className="text-sm text-muted-foreground">
            Opens URLs in an isolated headless browser and uses behavioral ML to detect evasive JavaScript, credential harvesting, and malware downloads.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Monitor className="h-4 w-4 text-cyan-500" />
                  Sandbox Analysis
                </CardTitle>
                <CardDescription>
                  Enter a URL to open in an isolated browser. The page&apos;s behavior is recorded and analyzed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">URL to sandbox</label>
                  <Input
                    placeholder="https://suspicious-site.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
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
                  <Button onClick={handleAnalyze} disabled={loading || !url.trim()} className="flex-1">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {loading ? "Sandboxing..." : "Open in Sandbox"}
                  </Button>
                  {result && (
                    <Button variant="outline" onClick={() => { setResult(null); setUrl("") }}>Clear</Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* What we detect */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">What the Sandbox Detects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { icon: MousePointer, label: "Mouse-evasion JavaScript", desc: "Scripts that wait for real user interaction before executing malicious code" },
                  { icon: FileCode, label: "Credential harvesting forms", desc: "Hidden or deceptive forms that capture login credentials" },
                  { icon: Download, label: "Drive-by download attempts", desc: "Automatic file download prompts disguised as security updates" },
                  { icon: Wifi, label: "Data exfiltration XHR calls", desc: "Background network requests sending data to attacker servers" },
                  { icon: Globe, label: "Redirect chains", desc: "Multi-hop redirects to conceal the final malicious destination" },
                  { icon: Eye, label: "DOM cloaking", desc: "Content that only appears under specific conditions to evade static analysis" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-2.5">
                    <item.icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-500" />
                    <div>
                      <p className="text-xs font-medium text-foreground">{item.label}</p>
                      <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
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
                    <CardContent className="flex flex-col items-center justify-center py-12 gap-5">
                      <div className="relative flex h-16 w-16 items-center justify-center">
                        <div className="absolute inset-0 animate-ping rounded-full bg-cyan-500/20" />
                        <Monitor className="h-8 w-8 text-cyan-500" />
                      </div>
                      <div className="w-full max-w-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">
                            {STEPS[Math.min(stepIndex, STEPS.length - 1)]}
                          </p>
                          <span className="text-xs text-muted-foreground">{progress}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <motion.div
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          />
                        </div>
                        <div className="space-y-1">
                          {STEPS.slice(0, stepIndex).map((s, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <CheckCircle className="h-3 w-3 text-primary" />
                              <span className="text-[11px] text-muted-foreground">{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
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
                      <div className={`rounded-xl border p-4 ${VERDICT_STYLES[result.verdict].bg}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {(() => {
                              const Icon = VERDICT_STYLES[result.verdict].icon
                              return (
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                  result.verdict === "malicious" ? "bg-destructive/10" :
                                  result.verdict === "suspicious" ? "bg-amber-500/10" :
                                  "bg-primary/10"
                                }`}>
                                  <Icon className={`h-5 w-5 ${VERDICT_STYLES[result.verdict].text}`} />
                                </div>
                              )
                            })()}
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Verdict</p>
                              <p className={`text-xl font-bold capitalize ${VERDICT_STYLES[result.verdict].text}`}>
                                {result.verdict}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Risk Score</p>
                            <p className="text-xl font-bold text-foreground">{result.risk_score}/100</p>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {[
                            { label: "Redirects", value: result.redirects, danger: result.redirects > 0 },
                            { label: "DL Attempt", value: result.download_attempted ? "Yes" : "No", danger: result.download_attempted },
                            { label: "Mouse Evasion", value: result.mouse_evasion ? "Yes" : "No", danger: result.mouse_evasion },
                            { label: "Cred Form", value: result.credential_form_detected ? "Yes" : "No", danger: result.credential_form_detected },
                          ].map((s) => (
                            <div key={s.label} className="rounded-lg bg-muted/30 p-2 text-center">
                              <p className={`text-sm font-bold ${s.danger ? "text-destructive" : "text-primary"}`}>{s.value}</p>
                              <p className="text-[10px] text-muted-foreground">{s.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Behavior timeline */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-cyan-500" />
                        Behavioral Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1.5">
                      {result.behavior_events.map((ev, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`flex items-start gap-2.5 rounded-lg border p-2.5 ${EVENT_STYLES[ev.type]}`}
                        >
                          {ev.type === "critical" ? (
                            <XCircle className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${EVENT_ICON_STYLES[ev.type]}`} />
                          ) : ev.type === "warning" ? (
                            <AlertTriangle className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${EVENT_ICON_STYLES[ev.type]}`} />
                          ) : (
                            <CheckCircle className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${EVENT_ICON_STYLES[ev.type]}`} />
                          )}
                          <div>
                            <span className="mr-2 font-mono text-[10px] text-muted-foreground">{ev.time}</span>
                            <span className="text-xs text-foreground">{ev.event}</span>
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Network requests */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Wifi className="h-4 w-4 text-blue-500" />
                        Network Requests ({result.network_requests.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1.5">
                      {result.network_requests.map((req, i) => (
                        <div key={i} className={`flex items-center gap-2.5 rounded-lg border p-2 ${req.suspicious ? "border-destructive/20 bg-destructive/5" : "border-border bg-muted/30"}`}>
                          <Badge variant="outline" className={`shrink-0 px-1.5 py-0 text-[9px] font-mono uppercase ${req.suspicious ? "border-destructive/40 text-destructive" : "text-muted-foreground"}`}>
                            {req.type}
                          </Badge>
                          <p className="min-w-0 flex-1 truncate font-mono text-[10px] text-foreground">{req.url}</p>
                          <span className="shrink-0 text-[10px] text-muted-foreground">{req.size}</span>
                          {req.suspicious && <AlertTriangle className="h-3 w-3 shrink-0 text-destructive" />}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Screenshot description */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Eye className="h-4 w-4 text-purple-500" />
                        Visual Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScreenshotPreview url={result.url} />
                      <p className="text-sm leading-relaxed text-foreground/80">{result.screenshot_description}</p>
                    </CardContent>
                  </Card>

                  {/* AI Explanation */}
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
                        AI Behavioral Analysis
                      </p>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90">{result.ai_explanation}</p>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                        <Monitor className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="mb-1 text-lg font-semibold text-foreground">No sandbox run yet</h3>
                      <p className="max-w-sm text-sm text-muted-foreground">
                        Enter a URL to open it in an isolated headless browser and analyze its behavior.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <AIChatbox context={result ? { feature: "browser_sandbox", verdict: result.verdict } : { feature: "browser_sandbox" }} />
    </div>
  )
}
