import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard - PhishGuard AI",
  description: "Analyze emails for phishing threats with AI-powered detection",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
