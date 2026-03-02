"use client"

import { motion } from "framer-motion"
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Info,
  BarChart3,
  ChevronDown,
  Sparkles,
  Tag,
  Image as ImageIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface RiskIndicator {
  indicator: string
  detail: string
  severity: "low" | "medium" | "high" | "critical"
}

export interface FeatureImportance {
  feature: string
  value: number
  impact: number
  shap_value: number
  direction: string
}

export interface AnalysisResult {
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
  ai_explanation?: string | null
  safety_recommendations?: string[] | null
  email_category?: string | null
  category_confidence?: number | null
  anomaly_score?: number | null
  ocr_text?: string | null
}

export interface HistoryItem {
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

export const MODELS = [
  { value: "random_forest", label: "Random Forest", tag: "Recommended" },
  { value: "gradient_boosting", label: "Gradient Boosting", tag: "Accurate" },
  { value: "logistic_regression", label: "Logistic Regression", tag: "Fast" },
  { value: "naive_bayes", label: "Naive Bayes", tag: "Baseline" },
]

export const severityIcon: Record<string, typeof AlertTriangle> = {
  high: AlertTriangle,
  critical: ShieldAlert,
  medium: Clock,
  low: Info,
}

export const severityColor: Record<string, string> = {
  critical: "text-destructive",
  high: "text-destructive",
  medium: "text-chart-4",
  low: "text-primary",
}

export const threatBadgeClass: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  low: "bg-primary/10 text-primary border-primary/20",
}

export function ResultCard({ result, compact = false }: { result: AnalysisResult; compact?: boolean }) {
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
          {result.email_category && (
            <Badge variant="outline" className="bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400">
              <Tag className="mr-1 h-3 w-3" />
              {result.email_category.replace(/_/g, " ")}
              {result.category_confidence != null && (
                <span className="ml-1 opacity-70">{(result.category_confidence * 100).toFixed(0)}%</span>
              )}
            </Badge>
          )}
        </div>
      </div>

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

      {/* Anomaly Score */}
      {result.anomaly_score != null && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Anomaly Score
          </p>
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">How unusual is this email?</span>
              <span className={`text-sm font-bold ${
                result.anomaly_score >= 70 ? "text-destructive" :
                result.anomaly_score >= 40 ? "text-chart-4" :
                "text-primary"
              }`}>
                {result.anomaly_score.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.anomaly_score}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  result.anomaly_score >= 70 ? "bg-destructive" :
                  result.anomaly_score >= 40 ? "bg-chart-4" :
                  "bg-primary"
                }`}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              {result.anomaly_score >= 70
                ? "Highly unusual compared to training data"
                : result.anomaly_score >= 40
                  ? "Moderately unusual patterns detected"
                  : "Within normal patterns"}
            </p>
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

      {/* OCR Text */}
      {!compact && result.ocr_text && (
        <details className="group">
          <summary className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
            <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
            <ImageIcon className="h-3.5 w-3.5" />
            OCR Extracted Text
          </summary>
          <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3 font-mono text-xs text-foreground/80">
            {result.ocr_text}
          </pre>
        </details>
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
