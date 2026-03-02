"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Shield, ShieldAlert, ShieldCheck, Loader2, Scan, Fingerprint } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface AnalysisStatusProps {
  isLoading: boolean
  result: {
    prediction: string
    confidence: number
    threat_level: string
    risk_score: number
    model_used: string
  } | null
  modelName?: string
}

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        delay: i * 0.2,
        type: "spring",
        duration: 1.2,
        bounce: 0.15,
      },
      opacity: { delay: i * 0.2, duration: 0.3 },
    },
  }),
}

const steps = [
  { label: "Extracting features", icon: Fingerprint },
  { label: "Running ML model", icon: Scan },
  { label: "Generating explanation", icon: Shield },
]

export function AnalysisStatus({ isLoading, result, modelName }: AnalysisStatusProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0)
      return
    }
    setShowResult(false)
    setCurrentStep(0)

    const t1 = setTimeout(() => setCurrentStep(1), 1200)
    const t2 = setTimeout(() => setCurrentStep(2), 2800)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [isLoading])

  useEffect(() => {
    if (result && !isLoading) {
      const timer = setTimeout(() => setShowResult(true), 200)
      return () => clearTimeout(timer)
    }
    setShowResult(false)
  }, [result, isLoading])

  if (!isLoading && !result) return null

  const isPhishing = result?.prediction === "phishing" || result?.prediction === "suspicious"
  const confidence = result?.confidence ?? 0
  const threatLevel = result?.threat_level ?? "low"

  const accentColor = isPhishing
    ? "text-destructive"
    : "text-primary"

  const glowColor = isPhishing
    ? "rgba(239, 68, 68, 0.15)"
    : "rgba(120, 230, 180, 0.15)"

  return (
    <div className="flex flex-col items-center justify-center py-6">
      {/* Icon area */}
      <div className="relative flex h-[100px] w-[100px] items-center justify-center">
        {/* Glow backdrop */}
        <motion.div
          animate={{
            opacity: showResult ? [0.6, 0.8, 0.6] : [0.3, 0.5, 0.3],
            scale: showResult ? 1.1 : 1,
          }}
          className="absolute inset-0 rounded-full blur-2xl"
          style={{
            backgroundColor: showResult ? glowColor : "rgba(120, 230, 180, 0.08)",
          }}
          transition={{
            opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 0.6 },
          }}
        />

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6, rotate: 90 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 flex items-center justify-center"
            >
              {/* Spinning ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute h-[88px] w-[88px] rounded-full"
                style={{
                  border: "2px solid transparent",
                  borderLeftColor: "oklch(0.78 0.18 155)",
                  borderTopColor: "oklch(0.78 0.18 155 / 0.2)",
                }}
              />
              {/* Reverse ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="absolute h-[76px] w-[76px] rounded-full"
                style={{
                  border: "1px solid transparent",
                  borderRightColor: "oklch(0.78 0.18 155 / 0.4)",
                  borderBottomColor: "oklch(0.78 0.18 155 / 0.1)",
                }}
              />
              {/* Center icon */}
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Scan className="h-6 w-6 text-primary" />
                </motion.div>
              </div>
            </motion.div>
          ) : showResult ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10"
            >
              {/* Animated check/alert circle */}
              <motion.svg
                animate="visible"
                initial="hidden"
                viewBox="0 0 100 100"
                width={88}
                height={88}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <title>Analysis Status</title>
                <motion.circle
                  custom={0}
                  cx="50"
                  cy="50"
                  r="44"
                  stroke={isPhishing ? "oklch(0.62 0.22 25)" : "oklch(0.78 0.18 155)"}
                  style={{
                    strokeWidth: 1.5,
                    strokeLinecap: "round",
                    fill: "transparent",
                  }}
                  variants={draw as any}
                />
              </motion.svg>
              <div className={cn(
                "relative z-10 flex h-14 w-14 items-center justify-center rounded-full border bg-card",
                isPhishing ? "border-destructive/40" : "border-primary/40"
              )}>
                {isPhishing ? (
                  <ShieldAlert className="h-7 w-7 text-destructive" />
                ) : (
                  <ShieldCheck className="h-7 w-7 text-primary" />
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Status text */}
      <div className="mt-4 text-center">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading-text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-3"
            >
              <p className="text-sm font-semibold text-foreground">Scanning Email</p>
              {modelName && (
                <p className="text-xs text-muted-foreground">
                  Model: {modelName.replace(/_/g, " ")}
                </p>
              )}
              {/* Step indicators */}
              <div className="flex flex-col items-center gap-1.5 pt-1">
                {steps.map((step, i) => {
                  const StepIcon = step.icon
                  const isActive = i === currentStep
                  const isDone = i < currentStep
                  return (
                    <motion.div
                      key={step.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{
                        opacity: isDone ? 0.5 : isActive ? 1 : 0.3,
                        x: 0,
                      }}
                      transition={{ delay: i * 0.15, duration: 0.4 }}
                      className={cn(
                        "flex items-center gap-2 text-xs transition-colors",
                        isActive ? "text-primary" : isDone ? "text-muted-foreground" : "text-muted-foreground/50"
                      )}
                    >
                      {isDone ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        </motion.div>
                      ) : isActive ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      ) : (
                        <StepIcon className="h-3.5 w-3.5" />
                      )}
                      <span>{step.label}</span>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          ) : showResult && result ? (
            <motion.div
              key="result-text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-2"
            >
              <p className={cn("text-lg font-bold capitalize", accentColor)}>
                {result.prediction}
              </p>
              <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                <span>
                  Confidence:{" "}
                  <span className="font-semibold text-foreground">
                    {(confidence * 100).toFixed(1)}%
                  </span>
                </span>
                <span className="text-border">|</span>
                <span>
                  Threat:{" "}
                  <span className={cn(
                    "font-semibold capitalize",
                    threatLevel === "critical" || threatLevel === "high"
                      ? "text-destructive"
                      : threatLevel === "medium"
                        ? "text-chart-4"
                        : "text-primary"
                  )}>
                    {threatLevel}
                  </span>
                </span>
                <span className="text-border">|</span>
                <span>
                  Risk:{" "}
                  <span className="font-semibold text-foreground">{result.risk_score}</span>
                </span>
              </div>
              {/* Confidence bar */}
              <div className="mx-auto mt-2 w-48">
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence * 100}%` }}
                    transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      "h-full rounded-full",
                      isPhishing ? "bg-destructive" : "bg-primary"
                    )}
                  />
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}
