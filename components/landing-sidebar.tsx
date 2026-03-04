"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import {
  Home,
  Sparkles,
  Layers,
  Cpu,
  Play,
  BarChart3,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Shield,
  Github,
  Zap,
} from "lucide-react"

const navItems = [
  { label: "Home", icon: Home, href: "#hero" },
  { label: "Features", icon: Sparkles, href: "#features" },
  { label: "How It Works", icon: Layers, href: "#how-it-works" },
  { label: "ML Models", icon: Cpu, href: "#models" },
  { label: "Demo", icon: Play, href: "#demo" },
  { label: "Stats", icon: BarChart3, href: "#stats" },
]

function scrollToSection(href: string) {
  if (href === "#hero") {
    window.scrollTo({ top: 0, behavior: "smooth" })
    return
  }
  const el = document.querySelector(href)
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
}

export function LandingSidebar({ onWidthChange }: { onWidthChange?: (w: number) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [active, setActive] = useState("#hero")

  useEffect(() => {
    const stored = localStorage.getItem("landing-sidebar-expanded")
    const isExp = stored === "true"
    setExpanded(isExp)
    onWidthChange?.(isExp ? 220 : 60)
  }, [onWidthChange])

  function toggle() {
    setExpanded((v) => {
      const next = !v
      localStorage.setItem("landing-sidebar-expanded", String(next))
      onWidthChange?.(next ? 220 : 60)
      return next
    })
  }

  // Track active section on scroll
  useEffect(() => {
    const sectionIds = ["#hero", "#features", "#how-it-works", "#models", "#demo", "#stats"]
    function onScroll() {
      if (window.scrollY < 100) { setActive("#hero"); return }
      for (const id of [...sectionIds].reverse()) {
        if (id === "#hero") continue
        const el = document.querySelector(id)
        if (el && el.getBoundingClientRect().top <= 120) {
          setActive(id)
          return
        }
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const W = expanded ? 220 : 60

  return (
    <motion.aside
      animate={{ width: W }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-white/[0.06] bg-[#0d0d0f]/95 backdrop-blur-2xl overflow-hidden"
    >
      {/* Brand */}
      <div className="flex h-14 shrink-0 items-center border-b border-white/[0.06] px-3 gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#00d084] shadow-lg shadow-[#00d084]/20">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L3 6.5V13c0 4.5 3.8 8.4 9 9.5 5.2-1.1 9-5 9-9.5V6.5L12 2z"
              fill="#0d0d0f"
              opacity="0.95"
            />
            <circle cx="12" cy="12" r="2.2" fill="#00d084" />
            <path
              d="M7.5 12c0 0 1.5-2.8 4.5-2.8s4.5 2.8 4.5 2.8-1.5 2.8-4.5 2.8-4.5-2.8-4.5-2.8z"
              fill="none"
              stroke="#00d084"
              strokeWidth="1.3"
            />
          </svg>
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <p className="whitespace-nowrap text-sm font-bold text-white">PhishGuard</p>
              <p className="whitespace-nowrap text-[10px] text-white/40">AI Security Platform</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-hide">
        <AnimatePresence>
          {expanded && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-widest text-white/25"
            >
              Navigation
            </motion.p>
          )}
        </AnimatePresence>

        {navItems.map((item) => {
          const isActive = active === item.href
          const Icon = item.icon
          return (
            <button
              key={item.href}
              title={!expanded ? item.label : undefined}
              onClick={() => { scrollToSection(item.href); setActive(item.href) }}
              className={`group relative flex h-9 w-full items-center gap-2.5 px-3 mx-1.5 rounded-lg text-sm transition-all ${
                isActive
                  ? "text-[#00d084]"
                  : "text-white/40 hover:text-white/80"
              }`}
              style={{ width: `calc(100% - 12px)` }}
            >
              {isActive && (
                <motion.div
                  layoutId="landing-active-pill"
                  className="absolute inset-0 rounded-lg bg-[#00d084]/10 border border-[#00d084]/20"
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              <Icon className="relative h-4 w-4 shrink-0" />
              <AnimatePresence>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="relative overflow-hidden whitespace-nowrap text-xs font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {/* Tooltip */}
              {!expanded && (
                <div className="pointer-events-none absolute left-full ml-2 z-50 hidden rounded-md border border-white/10 bg-[#1a1a1f] px-2 py-1 text-xs text-white shadow-xl group-hover:block whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </button>
          )
        })}

        {/* Divider */}
        <div className="my-3 mx-3 border-t border-white/[0.06]" />

        <AnimatePresence>
          {expanded && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-widest text-white/25"
            >
              Quick Access
            </motion.p>
          )}
        </AnimatePresence>

        {/* Dashboard CTA */}
        <SignedIn>
          <a
            href="/dashboard"
            className="group relative flex h-9 w-full items-center gap-2.5 px-3 mx-1.5 rounded-lg text-white/40 hover:text-[#00d084] transition-all"
            style={{ width: `calc(100% - 12px)` }}
            title={!expanded ? "Dashboard" : undefined}
          >
            <Shield className="relative h-4 w-4 shrink-0" />
            <AnimatePresence>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="relative overflow-hidden whitespace-nowrap text-xs font-medium"
                >
                  Dashboard
                </motion.span>
              )}
            </AnimatePresence>
            {!expanded && (
              <div className="pointer-events-none absolute left-full ml-2 z-50 hidden rounded-md border border-white/10 bg-[#1a1a1f] px-2 py-1 text-xs text-white shadow-xl group-hover:block">
                Dashboard
              </div>
            )}
          </a>
        </SignedIn>

        <SignedOut>
          <a
            href="/sign-in"
            className="group relative flex h-9 w-full items-center gap-2.5 px-3 mx-1.5 rounded-lg text-white/40 hover:text-[#00d084] transition-all"
            style={{ width: `calc(100% - 12px)` }}
            title={!expanded ? "Sign In" : undefined}
          >
            <Zap className="relative h-4 w-4 shrink-0" />
            <AnimatePresence>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="relative overflow-hidden whitespace-nowrap text-xs font-medium"
                >
                  Get Started
                </motion.span>
              )}
            </AnimatePresence>
          </a>
        </SignedOut>
      </nav>

      {/* Bottom */}
      <div className="shrink-0 border-t border-white/[0.06] p-2 space-y-1">
        <SignedIn>
          <div className={`flex items-center gap-2.5 px-1.5 py-1 ${expanded ? "" : "justify-center"}`}>
            <UserButton />
            <AnimatePresence>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap text-xs text-white/40"
                >
                  My Account
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </SignedIn>

        <button
          onClick={toggle}
          className={`flex h-8 w-full items-center gap-2.5 rounded-lg px-1.5 text-xs text-white/30 transition-colors hover:bg-white/5 hover:text-white/60 ${expanded ? "" : "justify-center"}`}
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
