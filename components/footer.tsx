"use client"

import { Shield } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const links = {
    Product: [
      { label: "Features", href: "#features" },
      { label: "How it Works", href: "#how-it-works" },
      { label: "Models", href: "#models" },
      { label: "Demo", href: "#demo" },
    ],
    Resources: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Dataset Sources", href: "#" },
      { label: "Research Paper", href: "#" },
    ],
    Project: [
      { label: "GitHub", href: "#" },
      { label: "Contributing", href: "#" },
      { label: "License", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  }

  return (
    <footer className="relative border-t border-white/[0.06] bg-black/30">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold text-white">
                PhishGuard <span className="text-primary">AI</span>
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-white/35">
              AI-powered phishing email detection with multi-model ML and
              real-time explainability.
            </p>

            {/* Status indicator */}
            <div className="mt-5 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-white/30">All systems operational</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/20">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-white/35 transition-colors hover:text-white"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.05] pt-8 sm:flex-row">
          <p className="text-xs text-white/20">
            © {currentYear} PhishGuard AI. Built for academic research.
          </p>
          <p className="text-xs text-white/20">
            Powered by FastAPI · scikit-learn · SHAP · LIME
          </p>
        </div>
      </div>
    </footer>
  )
}
