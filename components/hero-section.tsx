"use client"

import { useRef, useEffect, useCallback, useState } from "react"
import { motion, useInView } from "framer-motion"
import { ArrowUpRight, AlertTriangle, Link2, Type, Clock, ShieldAlert } from "lucide-react"

interface HeroSectionProps {
  register?: (id: string, rect: DOMRect) => void
  setActive?: (id: string, active: boolean) => void
  unregister?: (id: string) => void
}

const indicators = [
  { icon: Link2, label: "Suspicious domain", high: true },
  { icon: Type, label: "Brand impersonation", high: true },
  { icon: Clock, label: "Artificial urgency", high: false },
  { icon: ShieldAlert, label: "Credential harvesting", high: true },
]

const featureBars = [
  { name: "url_suspicious", value: 0.97 },
  { name: "urgency_score", value: 0.92 },
  { name: "brand_spoof", value: 0.95 },
]

function AnalysisCard() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const [phase, setPhase] = useState<"idle" | "scanning" | "done">("idle")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isInView || phase !== "idle") return
    const t = setTimeout(() => setPhase("scanning"), 700)
    return () => clearTimeout(t)
  }, [isInView, phase])

  useEffect(() => {
    if (phase !== "scanning") return
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setTimeout(() => setPhase("done"), 200)
          return 100
        }
        return Math.min(100, p + 2.5)
      })
    }, 28)
    return () => clearInterval(interval)
  }, [phase])

  const scanLabel =
    progress < 35 ? "Parsing headers..." : progress < 65 ? "Extracting URLs..." : "Running models..."

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/30"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-destructive/50" />
          <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
          <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
        </div>
        <span className="ml-2 font-mono text-[11px] text-muted-foreground">
          phishguard — analysis
        </span>
        {phase === "done" && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-auto flex items-center gap-1.5 rounded-full bg-destructive/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-destructive"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
            THREAT DETECTED
          </motion.span>
        )}
      </div>

      <div className="p-5">
        {/* Email snippet */}
        <div className="mb-4 rounded-lg border border-border bg-background/40 p-4">
          <div className="mb-2.5 space-y-1">
            <div className="flex gap-2 text-[11px]">
              <span className="w-12 shrink-0 text-muted-foreground/50">From</span>
              <span className="truncate font-mono text-muted-foreground">
                security@paypa1-support.com
              </span>
            </div>
            <div className="flex gap-2 text-[11px]">
              <span className="w-12 shrink-0 text-muted-foreground/50">Subject</span>
              <span className="font-medium text-foreground/80">
                URGENT: Your PayPa1 account has been limited
              </span>
            </div>
          </div>
          <div className="border-t border-border pt-2.5 font-mono text-[11px] leading-relaxed text-muted-foreground/70 line-clamp-2">
            We have detected unusual activity on your account. Click below to
            restore access immediately or face permanent suspension...
          </div>
        </div>

        {/* Scanning phase */}
        {phase === "scanning" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-1">
            <div className="mb-2 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
              <span>{scanLabel}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        )}

        {/* Idle placeholder */}
        {phase === "idle" && (
          <div className="flex h-16 items-center justify-center">
            <span className="font-mono text-[11px] text-muted-foreground/40">
              Awaiting input...
            </span>
          </div>
        )}

        {/* Results */}
        {phase === "done" && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {/* Verdict banner */}
            <div className="mb-3.5 flex items-center gap-3 rounded-lg bg-destructive/10 px-3.5 py-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
              <span className="text-sm font-semibold text-destructive">Phishing · Critical</span>
              <span className="ml-auto font-mono text-sm font-bold text-destructive">96.4%</span>
            </div>

            {/* Indicators */}
            <div className="mb-3.5 space-y-1.5">
              {indicators.map((ind, i) => (
                <motion.div
                  key={ind.label}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.07 }}
                  className="flex items-center gap-2 text-[11px]"
                >
                  <div
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      ind.high ? "bg-destructive" : "bg-amber-500"
                    }`}
                  />
                  <ind.icon className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                  <span className="text-muted-foreground">{ind.label}</span>
                </motion.div>
              ))}
            </div>

            {/* SHAP feature bars */}
            <div className="space-y-2">
              <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">
                SHAP · Top Features
              </p>
              {featureBars.map((f, i) => (
                <motion.div
                  key={f.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                >
                  <div className="mb-0.5 flex justify-between font-mono text-[10px] text-muted-foreground/60">
                    <span>{f.name}</span>
                    <span>{f.value.toFixed(2)}</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${f.value * 100}%` }}
                      transition={{ duration: 0.7, delay: 0.35 + i * 0.08, ease: "easeOut" }}
                      className="h-full rounded-full bg-destructive/60"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export function HeroSection({ register, setActive, unregister }: HeroSectionProps = {}) {
  const btnRef = useRef<HTMLAnchorElement>(null)
  const ATTRACTOR_ID = "hero-cta"

  const updatePosition = useCallback(() => {
    if (btnRef.current && register) {
      register(ATTRACTOR_ID, btnRef.current.getBoundingClientRect())
    }
  }, [register])

  useEffect(() => {
    updatePosition()
    window.addEventListener("scroll", updatePosition)
    window.addEventListener("resize", updatePosition)
    return () => {
      window.removeEventListener("scroll", updatePosition)
      window.removeEventListener("resize", updatePosition)
      unregister?.(ATTRACTOR_ID)
    }
  }, [updatePosition, unregister])

  return (
    <section id="hero" className="relative flex min-h-screen items-center px-6 pt-20">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">

          {/* Left — copy */}
          <div>
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="mb-5 text-5xl font-bold leading-[1.07] tracking-tight text-foreground md:text-6xl xl:text-[68px]"
            >
              Phishing detection
              <br />
              <span className="text-primary">that explains itself.</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mb-9 max-w-[420px] text-base leading-relaxed text-muted-foreground md:text-lg"
            >
              Four ML models run in parallel. SHAP and LIME break down exactly
              which signals flagged your email — no black boxes.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.26 }}
              className="mb-10 flex flex-wrap gap-3"
            >
              <a
                ref={btnRef}
                href="/dashboard"
                onMouseEnter={() => {
                  updatePosition()
                  setActive?.(ATTRACTOR_ID, true)
                }}
                onMouseLeave={() => setActive?.(ATTRACTOR_ID, false)}
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 hover:shadow-[0_0_24px_oklch(0.78_0.18_155/0.35)]"
              >
                Try the Demo
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center rounded-full border border-border px-7 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-border/80 hover:text-foreground"
              >
                Explore Features
              </a>
            </motion.div>

            {/* Trust stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.38 }}
              className="flex items-center gap-8"
            >
              {[
                { value: "98.7%", label: "Accuracy" },
                { value: "4", label: "ML Models" },
                { value: "<200ms", label: "Response" },
              ].map((s, i) => (
                <div key={s.label} className={i !== 0 ? "border-l border-border pl-8" : ""}>
                  <div className="text-lg font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — live analysis card */}
          <div>
            <AnalysisCard />
          </div>
        </div>
      </div>
    </section>
  )
}
