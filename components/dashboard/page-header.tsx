"use client"

import { BookOpen } from "lucide-react"

interface DashboardPageHeaderProps {
  title: string
  howItWorksHref?: string
  right?: React.ReactNode
}

export function DashboardPageHeader({ title, howItWorksHref, right }: DashboardPageHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-border bg-background/90 backdrop-blur-xl px-6">
      <span className="text-sm font-medium text-foreground">{title}</span>
      <div className="flex items-center gap-3">
        {right}
        {howItWorksHref && (
          <a
            href={howItWorksHref}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <BookOpen className="h-3.5 w-3.5" />
            How it works
          </a>
        )}
      </div>
    </header>
  )
}
