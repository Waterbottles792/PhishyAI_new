"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { X, Send, Loader2, Bot } from "lucide-react"

// Section map for navigation commands
const SECTION_MAP: Record<string, string> = {
  dashboard: "#cta",
  "get started": "#cta",
  features: "#features",
  feature: "#features",
  "how it works": "#how-it-works",
  "how does": "#how-it-works",
  models: "#models",
  model: "#models",
  demo: "#demo",
  stats: "#stats",
  statistics: "#stats",
  accuracy: "#stats",
  home: "#hero",
  top: "#hero",
}

function scrollToSection(href: string) {
  if (href === "#hero") { window.scrollTo({ top: 0, behavior: "smooth" }); return }
  const el = document.querySelector(href)
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
}

function detectNavigation(text: string): string | null {
  const lower = text.toLowerCase()
  for (const [key, href] of Object.entries(SECTION_MAP)) {
    if (lower.includes(key)) return href
  }
  return null
}

// The cute mascot SVG face
function MascotFace({ isThinking, isHappy }: { isThinking?: boolean; isHappy?: boolean }) {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      {/* Body */}
      <ellipse cx="26" cy="28" rx="19" ry="18" fill="#00d084" />
      <ellipse cx="26" cy="26" rx="20" ry="20" fill="#00d084" />
      {/* Shine */}
      <ellipse cx="20" cy="16" rx="5" ry="3.5" fill="#ffffff" opacity="0.25" transform="rotate(-20 20 16)" />
      {/* Eyes */}
      {isThinking ? (
        <>
          <ellipse cx="19.5" cy="24" rx="2.2" ry="1.2" fill="#0a2e1f" />
          <ellipse cx="32.5" cy="24" rx="2.2" ry="1.2" fill="#0a2e1f" />
        </>
      ) : (
        <>
          <circle cx="19.5" cy="24" r="2.2" fill="#0a2e1f" />
          <circle cx="32.5" cy="24" r="2.2" fill="#0a2e1f" />
          {/* Eye shine */}
          <circle cx="20.4" cy="23.2" r="0.7" fill="#ffffff" opacity="0.7" />
          <circle cx="33.4" cy="23.2" r="0.7" fill="#ffffff" opacity="0.7" />
        </>
      )}
      {/* Mouth */}
      {isHappy ? (
        <path d="M21 31 Q26 36 31 31" stroke="#0a2e1f" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M21 31.5 Q26 34 31 31.5" stroke="#0a2e1f" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      )}
      {/* Little antenna */}
      <circle cx="26" cy="6" r="3" fill="#00d084" stroke="#00ff9d" strokeWidth="1" />
      <line x1="26" y1="9" x2="26" y2="14" stroke="#00d084" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

interface Message {
  role: "user" | "assistant"
  text: string
}

export function MascotBot() {
  const [open, setOpen] = useState(false)
  // Use top/left CSS for position (not framer x/y) to avoid offset bugs
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [isHappy, setIsHappy] = useState(false)
  const [navigating, setNavigating] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const posRef = useRef({ top: 0, left: 0 })
  const mascotRef = useRef<HTMLDivElement>(null)

  // Initialize position bottom-right corner
  useEffect(() => {
    const init = {
      left: window.innerWidth - 110,
      top: window.innerHeight - 130,
    }
    setPos(init)
    posRef.current = init
  }, [])

  // Random wander — animate via CSS transition on top/left
  const startWander = useCallback(() => {
    if (open) return
    const margin = 80
    const nl = margin + Math.random() * (window.innerWidth - 2 * margin - 70)
    const nt = margin + Math.random() * (window.innerHeight - 2 * margin - 70)
    posRef.current = { left: nl, top: nt }
    setPos({ left: nl, top: nt })
  }, [open])

  useEffect(() => {
    if (open) return
    const id = setInterval(startWander, 5000)
    return () => clearInterval(id)
  }, [open, startWander])

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return
    setInput("")
    setMessages((m) => [...m, { role: "user", text }])
    setLoading(true)

    // Check navigation intent first
    const navTarget = detectNavigation(text)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({
              role: m.role,
              parts: [{ type: "text", text: m.text }],
            })),
            { role: "user", parts: [{ type: "text", text }] },
          ],
          context: {
            mode: "mascot",
            isLandingPage: true,
          },
        }),
      })

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let full = ""

      setMessages((m) => [...m, { role: "assistant", text: "" }])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          // Parse SSE stream
          const lines = chunk.split("\n")
          for (const line of lines) {
            if (line.startsWith("0:")) {
              try {
                const parsed = JSON.parse(line.slice(2))
                if (typeof parsed === "string") {
                  full += parsed
                  setMessages((m) => {
                    const updated = [...m]
                    updated[updated.length - 1] = { role: "assistant", text: full }
                    return updated
                  })
                }
              } catch {}
            }
          }
        }
      }

      setIsHappy(true)
      setTimeout(() => setIsHappy(false), 2000)

      // Navigate after response if intent detected
      if (navTarget) {
        setNavigating(true)
        setTimeout(() => {
          scrollToSection(navTarget)
          setNavigating(false)
        }, 800)
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Oops, I had trouble connecting. Try again?" }])
    } finally {
      setLoading(false)
    }
  }

  if (pos.x === 0 && pos.y === 0) return null

  return (
    <>
      {/* Mascot body */}
      <motion.div
        animate={open ? { x: window.innerWidth - 380, y: window.innerHeight - 520 } : controls}
        initial={pos}
        drag={!open}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          posRef.current = { x: pos.x + info.offset.x, y: pos.y + info.offset.y }
        }}
        className="fixed z-[60] cursor-grab active:cursor-grabbing select-none"
        style={{ touchAction: "none" }}
      >
        <motion.div
          animate={{
            y: [0, -8, 0, -5, 0],
            rotate: [0, 3, 0, -3, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          onClick={() => setOpen((v) => !v)}
          className="relative"
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.92 }}
        >
          {/* Glow ring */}
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-[#00d084] blur-md"
          />
          <MascotFace isHappy={isHappy} isThinking={loading} />

          {/* Speech bubble hint */}
          {!open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#00d084]/30 bg-[#0d0d0f]/90 px-2.5 py-1 text-[10px] font-medium text-[#00d084] backdrop-blur-sm"
            >
              Ask me anything ✨
            </motion.div>
          )}

          {navigating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-amber-500/30 bg-[#0d0d0f]/90 px-2.5 py-1 text-[10px] font-medium text-amber-400"
            >
              Taking you there... 🚀
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 22, stiffness: 320 }}
            className="fixed bottom-6 right-6 z-[59] flex h-[460px] w-[340px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111116]/95 shadow-2xl shadow-black/60 backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  <MascotFace isHappy={isHappy} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">PhishGuard Guide</p>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#00d084] animate-pulse" />
                    <p className="text-[10px] text-white/40">Ask about any section</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-hide">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="text-3xl">👋</div>
                  <div>
                    <p className="text-sm font-medium text-white">Hi! I&apos;m your PhishGuard guide.</p>
                    <p className="mt-1 text-xs text-white/40">
                      Ask me about any section — I&apos;ll even take you there!
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                    {[
                      "Show me the features",
                      "How does it work?",
                      "Where's the demo?",
                      "Take me to dashboard",
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => setInput(q)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="mt-0.5 h-5 w-5 shrink-0">
                      <MascotFace isHappy={isHappy} />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#00d084] text-[#0a1f13] font-medium"
                        : "bg-white/[0.06] text-white/85"
                    }`}
                  >
                    {msg.text || <span className="opacity-50">...</span>}
                  </div>
                </div>
              ))}

              {loading && messages.at(-1)?.role !== "assistant" && (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 shrink-0"><MascotFace isThinking /></div>
                  <div className="rounded-2xl bg-white/[0.06] px-3 py-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-white/40" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  placeholder="Ask about any section..."
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00d084] text-[#0a1f13] transition-all hover:brightness-110 disabled:opacity-40"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
