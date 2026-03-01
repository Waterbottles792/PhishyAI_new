"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Shield, Github, Mail, Heart } from "lucide-react"

export function Footer() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <footer
      ref={ref}
      className="relative border-t border-border bg-card/30 py-16 px-4"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center justify-between gap-8"
        >
          {/* Logo */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-base font-bold text-foreground">
                PhishGuard <span className="text-primary">AI</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs text-center md:text-left">
              AI-Powered Phishing Email Detection System. Built with Python, FastAPI, React, and scikit-learn.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-6">
              <a
                href="#features"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                How It Works
              </a>
              <a
                href="#models"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Models
              </a>
              <a
                href="#demo"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Demo
              </a>
            </div>
          </div>

          {/* Social / Meta */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/30 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="mailto:contact@phishguard.ai"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/30 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              Made with <Heart className="h-2.5 w-2.5 text-destructive" /> for Academic Research
            </p>
          </div>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2"
        >
          <p className="text-[10px] text-muted-foreground">
            PhishGuard AI &mdash; Intelligent Phishing Email Detection System
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">
            Powered by ML &bull; scikit-learn &bull; SHAP &bull; FastAPI
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
