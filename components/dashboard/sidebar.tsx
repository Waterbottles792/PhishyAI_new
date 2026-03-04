"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { UserButton } from "@clerk/nextjs"
import {
  Mail,
  Link,
  FileText,
  QrCode,
  Globe,
  GraduationCap,
  Radar,
  RefreshCw,
  Network,
  Brain,
  Monitor,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  MessageSquare,
} from "lucide-react"

const navItems = [
  {
    section: "ANALYSIS",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { label: "Email Analysis", icon: Mail, href: "/dashboard/email" },
      { label: "URL Scanner", icon: Link, href: "/dashboard/url" },
      { label: "Header Analysis", icon: FileText, href: "/dashboard/headers" },
      { label: "QR Code Scanner", icon: QrCode, href: "/dashboard/qr" },
      { label: "Domain Monitor", icon: Globe, href: "/dashboard/domain" },
      { label: "Document Scan", icon: FileSearch, href: "/dashboard/document" },
    ],
  },
  {
    section: "INTELLIGENCE",
    items: [
      { label: "Threat Feed", icon: Radar, href: "/dashboard/threats" },
      { label: "Campaign Tracker", icon: Network, href: "/dashboard/campaign" },
      { label: "DGA Detector", icon: Brain, href: "/dashboard/dga" },
      { label: "Browser Sandbox", icon: Monitor, href: "/dashboard/sandbox" },
    ],
  },
  {
    section: "LEARNING",
    items: [
      { label: "Phishing Training", icon: GraduationCap, href: "/dashboard/training" },
      { label: "Active Learning", icon: RefreshCw, href: "/dashboard/feedback" },
    ],
  },
]

export function DashboardSidebar() {
  const [expanded, setExpanded] = useState(false)
  const pathname = usePathname()

  // Persist sidebar state
  useEffect(() => {
    const stored = localStorage.getItem("sidebar-expanded")
    if (stored !== null) setExpanded(stored === "true")
  }, [])

  function toggle() {
    setExpanded((v) => {
      localStorage.setItem("sidebar-expanded", String(!v))
      return !v
    })
  }

  const sidebarW = expanded ? 220 : 60

  return (
    <motion.aside
      animate={{ width: sidebarW }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-background/95 backdrop-blur-xl overflow-hidden"
      style={{ width: sidebarW }}
    >
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center border-b border-border px-3">
        <a href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          {/* Custom logo */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/25">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              {/* Shield with eye — PhishGuard logo */}
              <path
                d="M12 2L3 6.5V13c0 4.5 3.8 8.4 9 9.5 5.2-1.1 9-5 9-9.5V6.5L12 2z"
                fill="currentColor"
                className="text-primary-foreground"
                opacity="0.9"
              />
              <circle cx="12" cy="12" r="2.5" fill="hsl(var(--background))" />
              <path
                d="M7.5 12c0 0 1.5-3 4.5-3s4.5 3 4.5 3-1.5 3-4.5 3-4.5-3-4.5-3z"
                fill="none"
                stroke="hsl(var(--background))"
                strokeWidth="1.2"
              />
            </svg>
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap text-sm font-bold tracking-tight text-foreground"
              >
                PhishGuard
              </motion.span>
            )}
          </AnimatePresence>
        </a>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 scrollbar-hide">
        {navItems.map((group) => (
          <div key={group.section} className="mb-2">
            <AnimatePresence>
              {expanded && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="mb-1 px-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50"
                >
                  {group.section}
                </motion.p>
              )}
            </AnimatePresence>
            {group.items.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <a
                  key={item.href}
                  href={item.href}
                  title={!expanded ? item.label : undefined}
                  className={`group relative flex h-9 items-center gap-2.5 px-3 mx-1.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-lg bg-primary/10"
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                  <Icon className={`relative h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                  <AnimatePresence>
                    {expanded && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative overflow-hidden whitespace-nowrap text-xs font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {/* Tooltip for collapsed */}
                  {!expanded && (
                    <div className="pointer-events-none absolute left-full ml-2 z-50 hidden rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md group-hover:block whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </a>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom — User + Toggle */}
      <div className="shrink-0 border-t border-border p-2 space-y-1">
        <div className={`flex items-center gap-2.5 px-1.5 py-1 ${expanded ? "" : "justify-center"}`}>
          <UserButton />
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap text-xs text-muted-foreground"
              >
                My Account
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={toggle}
          className={`flex h-8 w-full items-center gap-2.5 rounded-lg px-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${expanded ? "" : "justify-center"}`}
        >
          {expanded ? (
            <>
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">Collapse</span>
            </>
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0" />
          )}
        </button>
      </div>
    </motion.aside>
  )
}
