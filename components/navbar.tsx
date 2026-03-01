"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ArrowUpRight } from "lucide-react"
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
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
                <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" fill="currentColor" opacity="0.3" />
                <path d="M12 2L3 7l9 5 9-5-9-5z" fill="currentColor" />
                <path d="M12 12v10l9-5V7l-9 5z" fill="currentColor" opacity="0.6" />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              PhishGuard
            </span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <SignedIn>
              <a
                href="/dashboard"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </a>
            </SignedIn>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <SignedOut>
              <a
                href="/sign-in"
                className="group flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
              >
                Sign In
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </SignedOut>
            <SignedIn>
              <a
                href="/dashboard"
                className="group flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
              >
                Dashboard
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <UserButton />
            </SignedIn>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-[64px] z-40 border-b border-border bg-background/95 backdrop-blur-xl p-6 md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-lg text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
              <SignedIn>
                <a
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="text-lg text-muted-foreground transition-colors hover:text-foreground"
                >
                  Dashboard
                </a>
              </SignedIn>
              <SignedOut>
                <a
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
                >
                  Sign In
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </SignedOut>
              <SignedIn>
                <div className="mt-2 flex items-center justify-center">
                  <UserButton />
                </div>
              </SignedIn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
