"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ArrowUpRight, Shield } from "lucide-react"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Models", href: "#models" },
  { label: "Demo", href: "#demo" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-black/60 backdrop-blur-2xl border-b border-white/[0.07] shadow-lg shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-2.5 group"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25 transition-shadow group-hover:shadow-primary/40">
              <Shield className="h-4 w-4 text-primary-foreground" />
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-xl ring-1 ring-primary/40 group-hover:ring-primary/70 transition-all" />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-white">
              PhishGuard<span className="text-primary"> AI</span>
            </span>
          </a>

          {/* Center nav links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative rounded-full px-4 py-1.5 text-sm text-white/55 transition-colors hover:text-white group"
              >
                <span className="relative z-10">{link.label}</span>
                <span className="absolute inset-0 rounded-full bg-white/0 transition-colors group-hover:bg-white/[0.05]" />
              </a>
            ))}
            <SignedIn>
              <a
                href="/dashboard"
                className="relative rounded-full px-4 py-1.5 text-sm text-white/55 transition-colors hover:text-white group"
              >
                <span className="relative z-10">Dashboard</span>
                <span className="absolute inset-0 rounded-full bg-white/0 transition-colors group-hover:bg-white/[0.05]" />
              </a>
            </SignedIn>
          </div>

          {/* Right actions */}
          <div className="hidden items-center gap-2.5 md:flex">
            <SignedOut>
              <a
                href="/sign-in"
                className="text-sm text-white/55 transition-colors hover:text-white px-3 py-1.5"
              >
                Sign in
              </a>
              <a
                href="/sign-in"
                className="group inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 hover:shadow-lg hover:shadow-primary/25"
              >
                Get Started
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </SignedOut>
            <SignedIn>
              <a
                href="/dashboard"
                className="group inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 hover:shadow-lg hover:shadow-primary/25"
              >
                Dashboard
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <UserButton />
            </SignedIn>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition-colors hover:border-white/20 hover:text-white md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-x-0 top-[57px] z-40 border-b border-white/[0.06] bg-black/90 backdrop-blur-2xl p-5 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              <SignedIn>
                <a
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white"
                >
                  Dashboard
                </a>
              </SignedIn>

              <div className="mt-3 flex flex-col gap-2 border-t border-white/[0.06] pt-4">
                <SignedOut>
                  <a
                    href="/sign-in"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                  >
                    Get Started <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </SignedOut>
                <SignedIn>
                  <div className="flex items-center justify-center">
                    <UserButton />
                  </div>
                </SignedIn>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
