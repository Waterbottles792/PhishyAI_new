"use client"

import { motion } from "framer-motion"
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  GitBranch,
  Zap,
  CheckCircle,
  BarChart3,
  AlertTriangle,
  FlaskConical,
  TrendingUp,
} from "lucide-react"
import { AIChatbox } from "@/components/dashboard/ai-chatbox"
import { DashboardPageHeader } from "@/components/dashboard/page-header"

const sections = [
  {
    icon: AlertTriangle,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    title: "Why Active Learning?",
    body: "No machine learning model is perfect at launch. Phishing tactics evolve constantly — attackers find new ways to bypass detectors. Active learning is a feedback loop that lets the model continuously improve based on real-world mistakes, rather than staying frozen after training.",
  },
  {
    icon: ThumbsDown,
    color: "text-destructive",
    bg: "bg-destructive/10",
    title: "False Negatives (Missed Threats)",
    body: "A false negative occurs when the model classifies a real phishing URL as safe. This is the most dangerous error. By reporting these, you add confirmed phishing examples to the retraining queue. The model learns to recognise new evasion patterns it hasn't seen before.",
  },
  {
    icon: ThumbsUp,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    title: "False Positives (Over-blocking)",
    body: "A false positive is when a legitimate URL gets flagged as phishing, causing frustration and eroding trust. Reporting these prevents the model from becoming too aggressive. The corrected examples teach the model to distinguish between suspicious-looking but safe domains.",
  },
  {
    icon: BarChart3,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    title: "The Retraining Queue",
    body: "Submitted reports are collected in a queue. When 50 or more verified misclassifications accumulate, the system automatically triggers a new training pipeline. The new model is trained on the original dataset plus all the corrected examples, giving it expanded knowledge.",
  },
  {
    icon: FlaskConical,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    title: "Shadow Deployment",
    body: "When a new model is ready, it isn't deployed immediately. Instead, it's shadow-deployed alongside the active model. Both models process the same incoming requests, but only the active model's decisions are shown to users. This lets engineers compare accuracy, precision, and recall side-by-side in real conditions before promoting the new model.",
  },
  {
    icon: GitBranch,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "Model Versioning",
    body: "Every trained model is versioned with a timestamp, accuracy score, and F1 metric. This creates an audit trail so you can always roll back to a previous version if a new model introduces regressions. Retired models are kept for comparison and analysis.",
  },
  {
    icon: TrendingUp,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    title: "Gradient Boosting Retraining",
    body: "PhishGuard's core models use Gradient Boosting (XGBoost / LightGBM). These tree-based ensembles are fast to retrain incrementally and highly interpretable. Retraining typically completes in minutes rather than hours, enabling rapid response to new phishing campaigns.",
  },
  {
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    title: "Automated Pipeline",
    body: "The retraining pipeline is fully automated: data validation → feature engineering → model training → evaluation → shadow deployment → promotion. Human reviewers are only notified when a model fails evaluation thresholds, ensuring rapid iteration without manual bottlenecks.",
  },
]

const steps = [
  { step: "1", text: "You scan a URL that gets misclassified." },
  { step: "2", text: "You click 'Report' and select False Positive or False Negative." },
  { step: "3", text: "Your report joins the retraining queue with other reports." },
  { step: "4", text: "When 50 reports accumulate, a new training run is triggered." },
  { step: "5", text: "The new model is trained on original data + corrections." },
  { step: "6", text: "Shadow deployment compares the new model to the active one." },
  { step: "7", text: "If the new model scores better, it's promoted to active." },
]

export default function FeedbackHowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="noise-overlay pointer-events-none fixed inset-0 z-50" />
      <DashboardPageHeader title="Active Learning — How it Works" />

      <main className="mx-auto max-w-3xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10">
            <RefreshCw className="h-7 w-7 text-orange-500" />
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground">
            Continuous / Active Learning Loop
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Professional phishing detection systems must adapt to new attacks constantly. This feature turns every misclassification into a learning opportunity — making the model stronger over time.
          </p>
        </motion.div>

        {/* Step-by-step flow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10 rounded-2xl border border-border bg-card/60 p-6"
        >
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">How a report improves the model</h2>
          <div className="space-y-3">
            {steps.map((s, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {s.step}
                </div>
                <p className="mt-0.5 text-sm text-foreground/80">{s.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
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
                  <sec.icon className={`h-4.5 w-4.5 ${sec.color}`} />
                </div>
                <h2 className="text-base font-semibold text-foreground">{sec.title}</h2>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{sec.body}</p>
            </motion.div>
          ))}
        </div>

        {/* Pro tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Pro Tip</span>
          </div>
          <p className="text-sm text-foreground/80">
            Always include notes when reporting a misclassification. Explaining <em>why</em> a URL is safe or malicious provides context that helps reviewers validate the report faster and improves the quality of training data.
          </p>
        </motion.div>
      </main>

      <AIChatbox context={{ feature: "active_learning_explainer" }} />
    </div>
  )
}
