"use client"

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
    <footer className="border-t border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
                  <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" fill="currentColor" opacity="0.3" />
                  <path d="M12 2L3 7l9 5 9-5-9-5z" fill="currentColor" />
                  <path d="M12 12v10l9-5V7l-9 5z" fill="currentColor" opacity="0.6" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-foreground">PhishGuard AI</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              AI-powered phishing email detection with multi-model ML and
              real-time explainability.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-secondary-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            {currentYear} PhishGuard AI. Built for academic research.
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by FastAPI, scikit-learn, SHAP & LIME
          </p>
        </div>
      </div>
    </footer>
  )
}
