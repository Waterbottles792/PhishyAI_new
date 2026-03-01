"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { Shield, ArrowDown, Zap, Lock, Eye } from "lucide-react"

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true)
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 2000
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])

  return (
    <span ref={ref} className="font-mono text-4xl md:text-5xl font-bold text-foreground">
      {count.toLocaleString()}{suffix}
    </span>
  )
}

function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.62_0.19_250/0.05)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.62_0.19_250/0.05)_1px,transparent_1px)] bg-[size:60px_60px] animate-grid-scroll" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.62_0.19_250/0.08)_0%,transparent_70%)]" />
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-destructive/5 blur-[120px]" />
    </div>
  )
}

function FloatingShield() {
  return (
    <motion.div
      className="relative"
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="relative h-48 w-48 md:h-64 md:w-64">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        {/* Middle ring */}
        <motion.div
          className="absolute inset-4 rounded-full border border-primary/20"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        {/* Inner glow */}
        <div className="absolute inset-8 rounded-full bg-primary/10 backdrop-blur-sm flex items-center justify-center">
          <Shield className="h-20 w-20 md:h-28 md:w-28 text-primary" />
        </div>
        {/* Pulse rings */}
        <div className="absolute inset-0 rounded-full border border-primary/20 animate-pulse-ring" />
        <div className="absolute inset-0 rounded-full border border-primary/10 animate-pulse-ring [animation-delay:1s]" />

        {/* Scan line */}
        <div className="absolute inset-8 rounded-full overflow-hidden">
          <div className="h-1/2 w-full bg-gradient-to-b from-primary/10 to-transparent animate-scan" />
        </div>
      </div>
    </motion.div>
  )
}

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -100])

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4">
      <GridBackground />

      <motion.div style={{ opacity, y }} className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto pt-24">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5"
        >
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">AI-Powered Email Security</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-balance"
        >
          <span className="text-foreground">Detect Phishing</span>
          <br />
          <span className="bg-gradient-to-r from-primary via-primary/80 to-chart-5 bg-clip-text text-transparent">
            Before It Strikes
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-6 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed text-pretty"
        >
          PhishGuard AI uses advanced machine learning models with SHAP/LIME explainability
          to classify emails in real-time. Understand exactly why an email is flagged as
          a threat with transparent AI decisions.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <a
            href="#demo"
            className="group relative rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:scale-105 glow-blue"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Analyze an Email
            </span>
          </a>
          <a
            href="#how-it-works"
            className="rounded-xl border border-border bg-card/50 px-8 py-3.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:bg-card hover:scale-105"
          >
            <span className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              See How It Works
            </span>
          </a>
        </motion.div>

        {/* Floating Shield */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 1, type: "spring" }}
          className="mt-16"
        >
          <FloatingShield />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-8"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          </motion.div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-12 mb-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12"
        >
          {[
            { value: 96, suffix: "%", label: "Detection Rate" },
            { value: 50000, suffix: "+", label: "Emails Analyzed" },
            { value: 4, suffix: "", label: "ML Models" },
            { value: 200, suffix: "ms", label: "Avg Response" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
