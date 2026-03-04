"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Send,
  BookOpen,
  Network,
  Globe,
  Server,
  Lock,
  User,
  Layers,
  Sparkles,
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

interface GraphNode {
  id: string
  type: "domain" | "ip" | "asn" | "ssl" | "whois" | "campaign"
  label: string
  sublabel?: string
  risk: "high" | "medium" | "low"
  x: number
  y: number
}

interface GraphEdge {
  from: string
  to: string
  label: string
}

interface CampaignData {
  url: string
  campaign_name: string
  threat_actor?: string
  confidence: number
  related_domains: number
  related_ips: number
  nodes: GraphNode[]
  edges: GraphEdge[]
  summary: string
  timeline_events: { date: string; event: string }[]
}

const RISK_COLORS: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
}

const NODE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  domain: Globe,
  ip: Server,
  asn: Layers,
  ssl: Lock,
  whois: User,
  campaign: Network,
}

const NODE_COLORS: Record<string, string> = {
  domain: "bg-blue-500/10 border-blue-500/30",
  ip: "bg-orange-500/10 border-orange-500/30",
  asn: "bg-purple-500/10 border-purple-500/30",
  ssl: "bg-emerald-500/10 border-emerald-500/30",
  whois: "bg-amber-500/10 border-amber-500/30",
  campaign: "bg-destructive/10 border-destructive/30",
}

const NODE_TEXT_COLORS: Record<string, string> = {
  domain: "text-blue-500",
  ip: "text-orange-500",
  asn: "text-purple-500",
  ssl: "text-emerald-500",
  whois: "text-amber-500",
  campaign: "text-destructive",
}

function generateMockCampaign(url: string): CampaignData {
  const domain = url.replace(/^https?:\/\//, "").split("/")[0] ?? url

  const nodes: GraphNode[] = [
    { id: "c0", type: "campaign", label: "Operation FishHook", sublabel: "Threat Actor: TA505", risk: "high", x: 350, y: 180 },
    { id: "d1", type: "domain", label: domain, sublabel: "Primary phishing domain", risk: "high", x: 350, y: 300 },
    { id: "d2", type: "domain", label: domain.replace(".", "-secure."), sublabel: "Sister domain", risk: "high", x: 150, y: 380 },
    { id: "d3", type: "domain", label: "cdn-" + domain, sublabel: "Resource loader", risk: "medium", x: 550, y: 380 },
    { id: "ip1", type: "ip", label: "185.220.101.47", sublabel: "Hosting IP", risk: "high", x: 220, y: 500 },
    { id: "ip2", type: "ip", label: "91.108.4.12", sublabel: "C2 Server", risk: "high", x: 480, y: 500 },
    { id: "asn1", type: "asn", label: "AS202425", sublabel: "IP Volume Inc — known bulletproof", risk: "high", x: 120, y: 600 },
    { id: "ssl1", type: "ssl", label: "Let's Encrypt", sublabel: "SSL Issuer — auto-provisioned", risk: "medium", x: 580, y: 280 },
    { id: "w1", type: "whois", label: "NameCheap Inc", sublabel: "Registrar — privacy protected", risk: "medium", x: 350, y: 460 },
  ]

  const edges: GraphEdge[] = [
    { from: "d1", to: "c0", label: "part of" },
    { from: "d2", to: "c0", label: "part of" },
    { from: "d3", to: "c0", label: "part of" },
    { from: "d1", to: "ip1", label: "resolves to" },
    { from: "d3", to: "ip2", label: "resolves to" },
    { from: "ip1", to: "asn1", label: "in ASN" },
    { from: "ip2", to: "asn1", label: "in ASN" },
    { from: "d1", to: "ssl1", label: "cert issuer" },
    { from: "d1", to: "w1", label: "registered via" },
    { from: "d2", to: "w1", label: "registered via" },
  ]

  return {
    url,
    campaign_name: "Operation FishHook",
    threat_actor: "TA505",
    confidence: 87,
    related_domains: 14,
    related_ips: 6,
    nodes,
    edges,
    summary: `The domain "${domain}" is part of a coordinated phishing campaign (Operation FishHook) attributed to threat actor TA505. The campaign uses bulletproof hosting (AS202425) and Let's Encrypt certificates for legitimacy. Multiple domains share the same registrar and IP range, indicating centralized infrastructure management.`,
    timeline_events: [
      { date: "2026-02-18", event: "First domain registered via NameCheap" },
      { date: "2026-02-20", event: "SSL certificate provisioned (Let's Encrypt)" },
      { date: "2026-02-22", event: "First phishing email wave sent" },
      { date: "2026-03-01", event: "Sister domains spun up" },
      { date: "2026-03-03", event: "Flagged by PhishGuard threat feed" },
    ],
  }
}

// Simple SVG network graph
function NetworkGraph({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  const [hovered, setHovered] = useState<string | null>(null)

  const getNode = (id: string) => nodes.find((n) => n.id === id)

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border bg-muted/10">
      <svg viewBox="0 0 700 680" className="w-full" style={{ minHeight: 340 }}>
        {/* Edges */}
        {edges.map((edge, i) => {
          const from = getNode(edge.from)
          const to = getNode(edge.to)
          if (!from || !to) return null
          const mx = (from.x + to.x) / 2
          const my = (from.y + to.y) / 2
          return (
            <g key={i}>
              <line
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke="rgba(255,255,255,0.08)" strokeWidth={1.5}
                strokeDasharray="4 4"
              />
              <text x={mx} y={my - 4} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize={8}>
                {edge.label}
              </text>
            </g>
          )
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const isHovered = hovered === node.id
          const color = RISK_COLORS[node.risk]
          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              {isHovered && (
                <circle r={28} fill={color} opacity={0.15} />
              )}
              <circle
                r={18}
                fill={`${color}22`}
                stroke={color}
                strokeWidth={isHovered ? 2 : 1}
              />
              <text textAnchor="middle" dominantBaseline="central" fontSize={10} fill={color}>
                {node.type === "domain" ? "D" :
                 node.type === "ip" ? "IP" :
                 node.type === "asn" ? "AS" :
                 node.type === "ssl" ? "S" :
                 node.type === "whois" ? "W" : "C"}
              </text>
              <text
                y={28}
                textAnchor="middle"
                fill="rgba(255,255,255,0.7)"
                fontSize={9}
                className="select-none"
              >
                {node.label.length > 18 ? node.label.slice(0, 16) + "…" : node.label}
              </text>
              {isHovered && node.sublabel && (
                <text y={40} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={8}>
                  {node.sublabel.length > 24 ? node.sublabel.slice(0, 22) + "…" : node.sublabel}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
        {[
          { type: "campaign", label: "Campaign" },
          { type: "domain", label: "Domain" },
          { type: "ip", label: "IP" },
          { type: "asn", label: "ASN" },
          { type: "ssl", label: "SSL Cert" },
          { type: "whois", label: "Registrar" },
        ].map((l) => {
          const Icon = NODE_ICONS[l.type]
          return (
            <div key={l.type} className={`flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] ${NODE_COLORS[l.type]} ${NODE_TEXT_COLORS[l.type]}`}>
              <Icon className="h-2.5 w-2.5" />
              {l.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function CampaignTrackingPage() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CampaignData | null>(null)
  const [error, setError] = useState("")

  async function handleAnalyze() {
    if (!url.trim()) {
      setError("Please enter a URL or domain.")
      return
    }
    setError("")
    setLoading(true)
    setResult(null)
    await new Promise((r) => setTimeout(r, 1800))
    setResult(generateMockCampaign(url.trim()))
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="noise-overlay pointer-events-none fixed inset-0 z-50" />
      <DashboardPageHeader title="Campaign Tracker" howItWorksHref="/dashboard/campaign/how-it-works" />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="mb-1.5 text-2xl font-bold tracking-tight text-foreground">
            Graph-Based Campaign Tracking
          </h1>
          <p className="text-sm text-muted-foreground">
            Map out relationships between malicious actors, IPs, ASNs, WHOIS data, and SSL certificates to expose coordinated phishing campaigns.
          </p>
        </motion.div>

        {/* Input */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <Input
                placeholder="https://paypa1-secure.billing-verify.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                onKeyDown={(e) => { if (e.key === "Enter") handleAnalyze() }}
                className="flex-1"
              />
              <Button onClick={handleAnalyze} disabled={loading || !url.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {loading ? "Mapping..." : "Map Campaign"}
              </Button>
              {result && (
                <Button variant="outline" onClick={() => { setResult(null); setUrl("") }}>Clear</Button>
              )}
            </div>
            {error && (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/20" />
                    <Network className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Building knowledge graph...</p>
                  <p className="text-xs text-muted-foreground">Correlating IPs, ASNs, WHOIS records, and SSL certificates</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Campaign header */}
              <div className="grid gap-4 sm:grid-cols-4">
                {[
                  { label: "Campaign", value: result.campaign_name, icon: Network, color: "text-destructive" },
                  { label: "Threat Actor", value: result.threat_actor ?? "Unknown", icon: User, color: "text-orange-500" },
                  { label: "Related Domains", value: result.related_domains, icon: Globe, color: "text-blue-500" },
                  { label: "Confidence", value: `${result.confidence}%`, icon: Sparkles, color: "text-violet-500" },
                ].map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="pt-4">
                      <stat.icon className={`mb-1.5 h-4 w-4 ${stat.color}`} />
                      <p className="text-lg font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Network Graph */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Network className="h-4 w-4 text-blue-500" />
                    Attack Infrastructure Graph
                  </CardTitle>
                  <CardDescription>
                    Hover over nodes to see details. Nodes represent domains, IPs, ASNs, SSL issuers, and registrars.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NetworkGraph nodes={result.nodes} edges={result.edges} />
                </CardContent>
              </Card>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Node list */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Infrastructure Entities ({result.nodes.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5">
                    {result.nodes.map((node, i) => {
                      const Icon = NODE_ICONS[node.type]
                      return (
                        <motion.div
                          key={node.id}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-2.5"
                        >
                          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${NODE_COLORS[node.type]}`}>
                            <Icon className={`h-3.5 w-3.5 ${NODE_TEXT_COLORS[node.type]}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-mono text-[11px] font-medium text-foreground">{node.label}</p>
                            {node.sublabel && <p className="text-[10px] text-muted-foreground">{node.sublabel}</p>}
                          </div>
                          <Badge
                            variant="outline"
                            className={`shrink-0 px-1.5 py-0 text-[9px] ${
                              node.risk === "high" ? "border-destructive/40 text-destructive" :
                              node.risk === "medium" ? "border-amber-500/40 text-amber-500" :
                              "border-primary/40 text-primary"
                            }`}
                          >
                            {node.risk}
                          </Badge>
                        </motion.div>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* Timeline + Summary */}
                <div className="flex flex-col gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Campaign Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {result.timeline_events.map((ev, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                            {i < result.timeline_events.length - 1 && (
                              <div className="mt-1 h-6 w-px bg-border" />
                            )}
                          </div>
                          <div>
                            <p className="font-mono text-[10px] text-muted-foreground">{ev.date}</p>
                            <p className="text-xs text-foreground">{ev.event}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.03] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-violet-500" />
                      <p className="text-xs font-medium uppercase tracking-wider text-violet-500">Campaign Intelligence</p>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90">{result.summary}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                    <Network className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mb-1 text-lg font-semibold text-foreground">No campaign mapped</h3>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Enter a suspicious URL to map out the attack infrastructure and discover related threat actors.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AIChatbox context={result ? { feature: "campaign_tracking", campaign: result.campaign_name } : { feature: "campaign_tracking" }} />
    </div>
  )
}
