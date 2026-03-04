"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Radar,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DashboardPageHeader } from "@/components/dashboard/page-header"

interface ThreatEntry {
  url: string
  source: string
  timestamp: string
  domain: string
}

interface ThreatStats {
  total_threats: number
  sources: string[]
  top_domains: { domain: string; count: number }[]
  last_updated: string
}

interface ThreatFeedData {
  threats: ThreatEntry[]
  stats: ThreatStats
  trend_summary?: string | null
}

export default function ThreatFeedPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ThreatFeedData | null>(null)
  const [error, setError] = useState("")

  async function fetchFeed() {
    setError("")
    setLoading(true)

    try {
      const res = await fetch("http://localhost:8000/api/threat-feed?limit=100")
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || `Server error: ${res.status}`)
      setData(json)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect. Make sure the backend is running on port 8000."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeed()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="noise-overlay pointer-events-none fixed inset-0 z-50" />
      <DashboardPageHeader title="Threat Intelligence" />

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </motion.div>
        )}

        {/* Loading */}
        {loading && !data && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Loader2 className="mb-3 h-10 w-10 animate-spin text-rose-500" />
              <p className="text-sm text-muted-foreground">Fetching threat intelligence feeds...</p>
            </CardContent>
          </Card>
        )}

        {data && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Bar */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{data.stats.total_threats}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Threats</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{data.stats.sources.length}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Active Sources</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{data.stats.top_domains.length}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Unique Domains</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{data.threats.length}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Displayed</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column — Trend Summary + Top Domains */}
              <div className="space-y-4">
                {/* Trend Summary */}
                {data.trend_summary && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-violet-500/20 bg-violet-500/[0.03] p-4"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10">
                        <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wider text-violet-600 dark:text-violet-400">
                        AI Trend Summary
                      </p>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90">{data.trend_summary}</p>
                  </motion.div>
                )}

                {/* Top Targeted Domains */}
                {data.stats.top_domains.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Top Targeted Domains</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {data.stats.top_domains.map((d, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Globe className="h-3 w-3 text-muted-foreground" />
                              <span className="max-w-[150px] truncate font-mono text-[10px] text-foreground">{d.domain}</span>
                            </div>
                            <Badge variant="outline" className="text-[10px]">{d.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Sources */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {data.stats.sources.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                    {data.stats.last_updated && (
                      <p className="mt-2 text-[10px] text-muted-foreground">
                        Last updated: {new Date(data.stats.last_updated).toLocaleString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column — Threat List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Radar className="h-4 w-4 text-rose-500" />
                      Live Phishing Threats ({data.threats.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[600px] space-y-1.5 overflow-y-auto">
                      {data.threats.map((threat, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: Math.min(i * 0.01, 0.5) }}
                          className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-2.5"
                        >
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-mono text-[11px] text-foreground">{threat.url}</p>
                            <div className="mt-0.5 flex items-center gap-2">
                              <Badge variant="outline" className="text-[9px] px-1 py-0">{threat.source}</Badge>
                              {threat.domain && (
                                <span className="truncate text-[10px] text-muted-foreground">{threat.domain}</span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {data.threats.length === 0 && (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                          No threats found. Try refreshing the feed.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
