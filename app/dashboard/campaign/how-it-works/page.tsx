"use client"

import { motion } from "framer-motion"
import {
  ArrowLeft,
  Network,
  Globe,
  Server,
  Layers,
  Lock,
  User,
  GitBranch,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Map,
} from "lucide-react"
import { AIChatbox } from "@/components/dashboard/ai-chatbox"
import { DashboardPageHeader } from "@/components/dashboard/page-header"

const sections = [
  {
    icon: AlertTriangle,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    title: "Beyond Individual URLs — Tracking Threat Actors",
    body: "Traditional security tools treat each phishing URL in isolation. But sophisticated attackers operate campaigns — coordinated infrastructure shared across many phishing sites. A single threat actor might register 50 domains, host them on the same 3 IP addresses, all under the same Autonomous System Number (ASN), all using the same SSL certificate issuer. By mapping these relationships, we can attribute attacks to specific actors and proactively block their entire infrastructure.",
  },
  {
    icon: Globe,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    title: "Domain Nodes",
    body: "Each phishing domain is a node in the knowledge graph. We identify 'sister domains' — domains registered around the same time, with similar naming patterns, targeting the same brands. For example, if we see paypal-secure-verify.com, we look for paypal-verify-secure.com, paypal-secure-login.com, etc. These are almost certainly part of the same campaign and registered by the same actor.",
  },
  {
    icon: Server,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    title: "IP Address Correlation",
    body: "We resolve each domain to its IP address(es) and look for shared hosting. If five different phishing domains all resolve to the same IP, that IP becomes a high-confidence indicator of compromise (IOC). We can then block all traffic to that IP, taking down the entire campaign infrastructure in one action rather than chasing individual domains.",
  },
  {
    icon: Layers,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    title: "Autonomous System Numbers (ASNs)",
    body: "An ASN is a block of IP addresses managed by a single organization (e.g., a hosting provider). Attackers repeatedly use specific hosting providers known for lax abuse policies — called 'bulletproof hosters'. By linking IPs to their ASNs, we identify these providers and can apply reputation scoring. A domain hosted in AS202425 (known bulletproof hoster) is inherently more suspicious than one hosted in AS15169 (Google).",
  },
  {
    icon: Lock,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    title: "SSL Certificate Analysis",
    body: "SSL certificates contain metadata: who issued them, when, and sometimes organizational details. Attackers commonly use free, auto-provisioned certificates (Let's Encrypt, ZeroSSL) to add the green padlock and appear legitimate. By clustering domains that share certificate issuers and certificate serial number patterns, we find campaign groupings. Notably, legitimate organizations use paid certificates from known CAs like DigiCert or Comodo.",
  },
  {
    icon: User,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    title: "WHOIS Registration Data",
    body: "WHOIS records reveal who registered a domain, when, and through which registrar. While many attackers use privacy protection services, patterns still emerge: bulk registrations on the same day, the same registrar, the same name server configuration. Even anonymized WHOIS data reveals temporal clustering — all 20 domains in a campaign registered within a 2-hour window is a strong signal.",
  },
  {
    icon: Network,
    color: "text-destructive",
    bg: "bg-destructive/10",
    title: "Graph Neural Networks (GNNs)",
    body: "The knowledge graph of nodes (domains, IPs, ASNs, certs, registrars) and edges (relationships between them) is processed by a Graph Neural Network. GNNs learn node representations that incorporate information from neighboring nodes — a domain's 'suspiciousness' score is influenced by the scores of connected IPs, ASNs, and certificate issuers. This means a newly registered domain with zero phishing history can still be flagged if its infrastructure overlaps with known malicious actors.",
  },
  {
    icon: Map,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    title: "Visual Network Mapping",
    body: "The interactive node-graph visualization lets you explore the full attack infrastructure at a glance. Red nodes indicate high-risk entities, amber indicates medium risk, and green indicates low risk. Hovering over a node reveals its metadata. Edges show the type of relationship (DNS resolution, certificate, registrar). This visualization is invaluable for threat analysts who need to brief teams or law enforcement on the scope of an attack.",
  },
  {
    icon: GitBranch,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    title: "Campaign Attribution",
    body: "By analyzing the full infrastructure graph, PhishGuard can attribute attacks to known threat actor groups (e.g., TA505, Lazarus Group, FIN7). Attribution is based on infrastructure reuse patterns, targeting preferences, and TTPs (Tactics, Techniques, and Procedures). This intelligence helps organizations understand whether they're a random target or specifically chosen, informing their incident response priorities.",
  },
]

const nodeTypes = [
  { type: "Campaign", color: "text-destructive", bg: "bg-destructive/10", desc: "The overarching attack campaign grouping all related infrastructure" },
  { type: "Domain", color: "text-blue-500", bg: "bg-blue-500/10", desc: "Phishing domains registered as part of the campaign" },
  { type: "IP Address", color: "text-orange-500", bg: "bg-orange-500/10", desc: "Hosting servers that the phishing domains resolve to" },
  { type: "ASN", color: "text-purple-500", bg: "bg-purple-500/10", desc: "Autonomous System Numbers — hosting provider networks" },
  { type: "SSL Certificate", color: "text-emerald-500", bg: "bg-emerald-500/10", desc: "Certificate authorities and specific cert patterns" },
  { type: "Registrar (WHOIS)", color: "text-amber-500", bg: "bg-amber-500/10", desc: "Domain registrar and registration metadata" },
]

export default function CampaignHowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="noise-overlay pointer-events-none fixed inset-0 z-50" />
      <DashboardPageHeader title="Campaign Tracker — How it Works" />

      <main className="mx-auto max-w-3xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
            <Network className="h-7 w-7 text-blue-500" />
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground">
            Graph-Based Campaign Tracking
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Advanced threat intelligence doesn&apos;t just analyze individual URLs — it maps the entire attack infrastructure. By connecting domains, IPs, ASNs, SSL certificates, and WHOIS data into a knowledge graph, PhishGuard exposes the coordinated campaigns behind phishing attacks.
          </p>
        </motion.div>

        {/* Node type legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-10 rounded-2xl border border-border bg-card/60 p-6"
        >
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Graph Node Types</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {nodeTypes.map((n, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${n.bg}`}>
                  <span className={`text-xs font-bold ${n.color}`}>
                    {n.type === "IP Address" ? "IP" : n.type === "ASN" ? "AS" : n.type[0]}
                  </span>
                </div>
                <div>
                  <p className={`text-xs font-semibold ${n.color}`}>{n.type}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{n.desc}</p>
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
          className="mt-8 rounded-xl border border-violet-500/20 bg-violet-500/[0.03] p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <span className="text-sm font-semibold text-violet-500">Intelligence Multiplier</span>
          </div>
          <p className="text-sm text-foreground/80">
            A single analyzed URL can reveal an entire campaign's infrastructure. Once you identify that 20 domains share the same ASN, you can proactively block all future domains registered to that ASN — stopping attacks that haven't even launched yet.
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
            <span className="text-sm font-semibold text-primary">How to use Campaign Tracking</span>
          </div>
          <p className="text-sm text-foreground/80">
            Start with any suspicious URL from your email analysis or URL scanner. Paste it into the Campaign Tracker to map the full infrastructure. Review the network graph to identify shared nodes (IPs, ASNs) that indicate a coordinated attack. Share the graph with your security team as visual evidence for incident response.
          </p>
        </motion.div>
      </main>

      <AIChatbox context={{ feature: "campaign_explainer" }} />
    </div>
  )
}
