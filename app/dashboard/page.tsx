"use client"

import { motion } from "framer-motion"
import {
  Mail, Link, FileText, ArrowUpRight,
  QrCode, Globe, GraduationCap, Radar,
  RefreshCw, Network, Brain, Monitor,
} from "lucide-react"
import CipherFlow from "@/components/cipher-flow"

const modes = [
  {
    title: "Email Analysis",
    description: "Analyze email content for phishing indicators using ML models with explainability",
    icon: Mail,
    href: "/dashboard/email",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    title: "URL Scanner",
    description: "Check if a URL is suspicious by analyzing domain, structure, and threat signals",
    icon: Link,
    href: "/dashboard/url",
    color: "from-blue-500/20 to-blue-500/5",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    title: "Header Analysis",
    description: "Analyze raw email headers to verify SPF, DKIM, DMARC authentication and routing hops",
    icon: FileText,
    href: "/dashboard/headers",
    color: "from-amber-500/20 to-amber-500/5",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    title: "QR Code Scanner",
    description: "Scan QR code images to decode and analyze embedded URLs for phishing threats",
    icon: QrCode,
    href: "/dashboard/qr",
    color: "from-pink-500/20 to-pink-500/5",
    iconBg: "bg-pink-500/10",
    iconColor: "text-pink-500",
  },
  {
    title: "Domain Monitor",
    description: "Detect typosquatting and lookalike domains that could be used to impersonate your brand",
    icon: Globe,
    href: "/dashboard/domain",
    color: "from-red-500/20 to-red-500/5",
    iconBg: "bg-red-500/10",
    iconColor: "text-red-500",
  },
  {
    title: "Threat Intelligence",
    description: "Live feed of active phishing threats from public threat databases with AI trend analysis",
    icon: Radar,
    href: "/dashboard/threats",
    color: "from-rose-500/20 to-rose-500/5",
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-500",
  },
  {
    title: "Phishing Training",
    description: "Test your phishing detection skills with AI-generated challenges and get real-time coaching",
    icon: GraduationCap,
    href: "/dashboard/training",
    color: "from-teal-500/20 to-teal-500/5",
    iconBg: "bg-teal-500/10",
    iconColor: "text-teal-500",
  },
  {
    title: "Active Learning",
    description: "Report false positives and negatives to retrain models. Shadow-deploy new versions automatically",
    icon: RefreshCw,
    href: "/dashboard/feedback",
    color: "from-orange-500/20 to-orange-500/5",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-500",
  },
  {
    title: "Campaign Tracker",
    description: "Map attack infrastructure — domains, IPs, ASNs, SSL certs, and registrars — into a visual knowledge graph",
    icon: Network,
    href: "/dashboard/campaign",
    color: "from-cyan-500/20 to-cyan-500/5",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-500",
  },
  {
    title: "DGA Detector",
    description: "Detect algorithmically generated domains using LSTM + 1D CNN on character entropy, bigrams, and n-grams",
    icon: Brain,
    href: "/dashboard/dga",
    color: "from-purple-500/20 to-purple-500/5",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
  {
    title: "Browser Sandbox",
    description: "Open URLs in an isolated headless browser to detect evasive JavaScript, credential forms, and drive-by downloads",
    icon: Monitor,
    href: "/dashboard/sandbox",
    color: "from-violet-500/20 to-violet-500/5",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-500",
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function DashboardHub() {
  return (
    <CipherFlow>
      <div className="noise-overlay pointer-events-none fixed inset-0 z-50" />

      {/* Minimal top bar for hub */}
      <header className="sticky top-0 z-30 flex h-12 items-center border-b border-border/50 bg-background/60 backdrop-blur-xl px-6">
        <span className="text-sm font-medium text-foreground">Dashboard</span>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Choose an analysis mode
          </h1>
          <p className="mx-auto max-w-lg text-muted-foreground">
            Select a tool to scan emails, URLs, documents, QR codes, and more.
          </p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {modes.map((mode) => {
            const Icon = mode.icon
            return (
              <motion.a
                key={mode.title}
                href={mode.href}
                variants={item}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 transition-colors hover:border-muted-foreground/30 hover:bg-card/90"
              >
                {/* Gradient background */}
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 transition-opacity group-hover:opacity-100`} />

                <div className="relative z-10">
                  <div className="mb-4 flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${mode.iconBg}`}>
                      <Icon className={`h-6 w-6 ${mode.iconColor}`} />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </div>
                  <h2 className="mb-2 text-lg font-semibold text-foreground">{mode.title}</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{mode.description}</p>
                </div>
              </motion.a>
            )
          })}
        </motion.div>
      </main>
    </CipherFlow>
  )
}
