"use client"

import { motion } from "framer-motion"
import {
  ArrowLeft,
  Monitor,
  MousePointer,
  FileCode,
  Download,
  Wifi,
  Eye,
  Shield,
  Brain,
  Zap,
  AlertTriangle,
  CheckCircle,
  Globe,
  Lock,
} from "lucide-react"
import { AIChatbox } from "@/components/dashboard/ai-chatbox"
import { DashboardPageHeader } from "@/components/dashboard/page-header"

const sections = [
  {
    icon: AlertTriangle,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    title: "Why Static Analysis Isn't Enough",
    body: "Downloading the HTML source of a phishing page and scanning it for keywords is static analysis. Attackers have adapted to defeat it. Modern phishing sites use JavaScript to dynamically load malicious content only after verifying that a real human visitor is present — detecting bot-like access and showing an innocent page instead. Static scanners see the clean version. The sandbox sees what a real victim sees.",
  },
  {
    icon: Monitor,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    title: "Headless Browser Execution",
    body: "PhishGuard's sandbox uses a real headless browser (Chromium-based) running in a fully isolated container. The page is loaded exactly as it would be in a regular browser: JavaScript executes, CSS renders, network requests are made, cookies are set. The only difference is that no user is at risk — it's an instrumented virtual environment that records every action the page takes.",
  },
  {
    icon: MousePointer,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    title: "Mouse-Movement Evasion Detection",
    body: "A common evasion technique is to wait for mouse movement or a scroll event before showing the phishing content. Bots don't move mice. The sandbox simulates realistic user behavior: mouse movements along natural Bézier curves, random scroll events, and realistic timing between interactions. This triggers evasive JavaScript and reveals the actual malicious content that bots never see.",
  },
  {
    icon: FileCode,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    title: "DOM Mutation Monitoring",
    body: "The Document Object Model (DOM) is the live structure of a web page. PhishGuard attaches a MutationObserver to the page that records every change made to the DOM after load: elements added, removed, or modified. A sudden appearance of a login form or credential input field after a delay is a strong indicator that the page is serving phishing content conditionally. We count and classify DOM mutations to feed the behavioral classifier.",
  },
  {
    icon: Wifi,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    title: "Network Request Analysis",
    body: "Every network request made by the page is intercepted and logged: the URL, request type (document, XHR, script, image), payload, and response. We look for requests to external domains that don't match the page's own domain (data exfiltration), requests to known malicious infrastructure, and invisible tracking pixels that fingerprint the victim's browser. XHR calls that fire on form submission are particularly suspicious.",
  },
  {
    icon: Download,
    color: "text-destructive",
    bg: "bg-destructive/10",
    title: "Drive-by Download Detection",
    body: "Some phishing pages don't steal credentials — they deliver malware. By triggering an automatic download dialog as soon as the page loads, or disguising a malware executable as a 'required browser update', they trick users into installing keyloggers or ransomware. The sandbox intercepts all download prompts, logs the filename and MIME type, and flags any executable file types (.exe, .msi, .dmg, .apk, .ps1).",
  },
  {
    icon: Brain,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    title: "Behavioral ML Classification",
    body: "All the recorded signals — DOM mutations, network requests, JavaScript execution patterns, redirect chains — are encoded into a feature vector and passed to a Reinforcement Learning-trained behavioral classifier. The model was trained on thousands of sandboxed phishing and clean pages and learned to recognise the characteristic 'fingerprint' of a phishing site from its behavior sequence rather than its content.",
  },
  {
    icon: Globe,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    title: "Redirect Chain Analysis",
    body: "Phishing infrastructure often uses chains of redirects to hide the final malicious URL. A link in a phishing email might go through 3-4 legitimate-looking intermediate pages (URL shorteners, tracking redirectors) before landing on the phishing page. The sandbox follows the full redirect chain and reports the final URL, exposing the true destination regardless of how many hops it takes.",
  },
  {
    icon: Eye,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    title: "Visual Screenshot Analysis",
    body: "The sandbox captures a full-page screenshot at multiple points during page load. A computer vision model analyzes the screenshot to detect: brand impersonation (logo similarity to known legitimate brands), credential input forms, fake security warnings, and urgency language. Visual analysis catches attacks that avoid using suspicious text in HTML source code and instead render everything as images.",
  },
  {
    icon: Lock,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "Isolation & Safety",
    body: "The entire analysis runs in a Docker container with no network access to your local machine, no access to real credentials, and no persistence. The container is destroyed after each analysis. This means even if a page attempts to exploit a browser vulnerability, it cannot escape the sandbox. Your machine is never at risk.",
  },
]

const detectionCapabilities = [
  { label: "Mouse-evasion JS", desc: "Scripts that delay execution until real user interaction" },
  { label: "Credential forms", desc: "Hidden or dynamically injected login forms" },
  { label: "Drive-by downloads", desc: "Automatic malware download prompts" },
  { label: "Data exfiltration", desc: "XHR calls sending data to attacker servers" },
  { label: "Redirect chains", desc: "Multi-hop redirects hiding the final URL" },
  { label: "DOM cloaking", desc: "Content only visible under certain conditions" },
  { label: "Brand impersonation", desc: "Visual mimicry of legitimate websites" },
  { label: "Browser fingerprinting", desc: "Scripts that identify victims for targeted attacks" },
]

export default function SandboxHowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="noise-overlay pointer-events-none fixed inset-0 z-50" />
      <DashboardPageHeader title="Browser Sandbox — How it Works" />

      <main className="mx-auto max-w-3xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10">
            <Monitor className="h-7 w-7 text-cyan-500" />
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground">
            Active Browser Sandbox Analysis
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Instead of just reading a page&apos;s HTML source, PhishGuard opens every URL in an isolated, instrumented headless browser. Every JavaScript execution, network request, and DOM change is recorded and analyzed by a behavioral ML model — catching evasive attacks that static scanners completely miss.
          </p>
        </motion.div>

        {/* Detection capabilities grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-10 rounded-2xl border border-border bg-card/60 p-6"
        >
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            What the Sandbox Detects
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {detectionCapabilities.map((c, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/30 p-2.5">
                <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-500" />
                <div>
                  <p className="text-xs font-semibold text-foreground">{c.label}</p>
                  <p className="text-[11px] text-muted-foreground">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Analysis pipeline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-10 rounded-2xl border border-border bg-card/60 p-6"
        >
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Sandbox Execution Pipeline
          </h2>
          <div className="space-y-2">
            {[
              { n: "1", label: "URL submitted", desc: "URL is queued for sandbox execution" },
              { n: "2", label: "Container launched", desc: "Isolated Docker container with Chromium starts" },
              { n: "3", label: "Page loaded", desc: "Browser navigates to URL, full rendering begins" },
              { n: "4", label: "JS executed", desc: "All JavaScript runs; synthetic mouse/scroll events fired" },
              { n: "5", label: "Network captured", desc: "All HTTP requests intercepted and logged" },
              { n: "6", label: "DOM mutations recorded", desc: "Every structural change to the page tracked" },
              { n: "7", label: "Screenshot taken", desc: "Full-page screenshot captured for visual analysis" },
              { n: "8", label: "ML classification", desc: "Behavioral feature vector fed to trained classifier" },
              { n: "9", label: "Report generated", desc: "Verdict, risk score, and timeline returned" },
              { n: "10", label: "Container destroyed", desc: "All sandbox data wiped; no persistence" },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                  {step.n}
                </div>
                <div className="flex-1 border-b border-border/50 pb-2">
                  <span className="text-xs font-semibold text-foreground">{step.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground">— {step.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-5">
          {sections.map((sec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="rounded-xl border border-border bg-card/60 p-5"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${sec.bg}`}>
                  <sec.icon className={`h-4 w-4 ${sec.color}`} />
                </div>
                <h2 className="text-base font-semibold text-foreground">{sec.title}</h2>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{sec.body}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-500">Performance Note</span>
          </div>
          <p className="text-sm text-foreground/80">
            Sandbox analysis takes 3-8 seconds per URL because a full browser must launch, execute, and be torn down. This is intentionally slower than static analysis but provides dramatically deeper insight. Use it for URLs that static analysis marks as 'suspicious but uncertain', or for any URL where the stakes are high.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Best Practice</span>
          </div>
          <p className="text-sm text-foreground/80">
            Run sandbox analysis on URLs that received low-to-medium risk scores from the URL Scanner but still feel suspicious. Attackers design pages to look clean to automated scanners — the sandbox is your second line of defence that sees through these evasion techniques.
          </p>
        </motion.div>
      </main>

      <AIChatbox context={{ feature: "sandbox_explainer" }} />
    </div>
  )
}
