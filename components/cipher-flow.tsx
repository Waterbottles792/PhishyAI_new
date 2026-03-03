"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

/* ─── Config ────────────────────────────────────────────────── */
const PARTICLE_COUNT = 140
const TRAIL_LENGTH = 22
const HEX_SPACING = 42
const DOT_BASE = 1.0
const DOT_GLOW = 3.0
const ALPHA_BASE = 0.06
const ALPHA_GLOW = 0.45
const MOUSE_R = 240
const PULSE_GAP = 5500
const SCAN_SPEED = 0.35

/* ─── Scroll-reactive color stops (hue per section) ─────────── */
const SECTION_COLORS = [
  { at: 0.00, hue: 155 }, // Hero – emerald green
  { at: 0.18, hue: 85 },  // Features – lime (#91ed12)
  { at: 0.42, hue: 165 }, // How it Works – teal (#1ce3b2)
  { at: 0.70, hue: 182 }, // Models – cyan (#1ed9e1)
  { at: 1.00, hue: 182 }, // End – stay cyan
]

function lerpHue(progress: number): number {
  let i = 0
  while (i < SECTION_COLORS.length - 1 && SECTION_COLORS[i + 1].at <= progress) i++
  const a = SECTION_COLORS[i]
  const b = SECTION_COLORS[Math.min(i + 1, SECTION_COLORS.length - 1)]
  if (a.at === b.at) return a.hue
  const t = (progress - a.at) / (b.at - a.at)
  let diff = b.hue - a.hue
  if (diff > 180) diff -= 360
  if (diff < -180) diff += 360
  return ((a.hue + diff * t) % 360 + 360) % 360
}

/* ─── Types ─────────────────────────────────────────────────── */
interface Particle {
  x: number
  y: number
  trail: Float64Array
  trailIdx: number
  speed: number
  hueOffset: number
  alpha: number
}

interface Orb {
  cx: number
  cy: number
  r: number
  hueOffset: number
  alpha: number
  px: number
  py: number
  sx: number
  sy: number
}

interface Pulse {
  x: number
  y: number
  r: number
  born: number
}

/* ─── Noise (layered sines — no deps) ───────────────────────── */
function noise(x: number, y: number, t: number): number {
  return (
    Math.sin(x * 0.005 + t * 0.32) * Math.cos(y * 0.004 + t * 0.24) +
    Math.sin(y * 0.008 + x * 0.003 + t * 0.16) * 0.6 +
    Math.cos(x * 0.002 - y * 0.006 + t * 0.11) * 0.4
  )
}

function flowAngle(x: number, y: number, t: number): number {
  const nx = noise(x, y, t)
  const ny = noise(x + 173, y + 291, t + 47)
  return Math.atan2(ny, nx)
}

/* ─── Component ─────────────────────────────────────────────── */
export default function CipherFlow({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  const cvs = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({ x: -9999, y: -9999 })
  const raf = useRef(0)
  const tick = useRef(0)
  const parts = useRef<Particle[]>([])
  const orbs = useRef<Orb[]>([])
  const pulses = useRef<Pulse[]>([])
  const lastPulse = useRef(0)
  const dims = useRef({ w: 0, h: 0 })
  const scanY = useRef(0)

  useEffect(() => {
    const c = cvs.current
    if (!c) return
    const ctx = c.getContext("2d", { alpha: true })
    if (!ctx) return

    /* ── Resize ─────────────────────────────────────────────── */
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = window.innerWidth
      const h = window.innerHeight
      c!.width = w * dpr
      c!.height = h * dpr
      c!.style.width = `${w}px`
      c!.style.height = `${h}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      dims.current = { w, h }
      initParticles(w, h)
      initOrbs(w, h)
    }

    /* ── Init helpers ───────────────────────────────────────── */
    function spawn(w: number, h: number): Particle {
      const x = Math.random() * w
      const y = Math.random() * h
      const trail = new Float64Array(TRAIL_LENGTH * 2)
      for (let i = 0; i < TRAIL_LENGTH; i++) {
        trail[i * 2] = x
        trail[i * 2 + 1] = y
      }
      return {
        x,
        y,
        trail,
        trailIdx: 0,
        speed: 0.35 + Math.random() * 0.75,
        hueOffset: (Math.random() - 0.5) * 40,
        alpha: 0.15 + Math.random() * 0.25,
      }
    }

    function initParticles(w: number, h: number) {
      parts.current = Array.from({ length: PARTICLE_COUNT }, () => spawn(w, h))
    }

    function initOrbs(w: number, h: number) {
      orbs.current = [
        { cx: w * 0.2, cy: h * 0.3, r: 400, hueOffset: 0, alpha: 0.045, px: 0, py: 1.2, sx: 0.15, sy: 0.1 },
        { cx: w * 0.8, cy: h * 0.55, r: 350, hueOffset: 35, alpha: 0.04, px: 2.4, py: 0, sx: 0.1, sy: 0.13 },
        { cx: w * 0.5, cy: h * 0.85, r: 320, hueOffset: -25, alpha: 0.035, px: 4.0, py: 3.1, sx: 0.08, sy: 0.09 },
      ]
    }

    resize()
    window.addEventListener("resize", resize)

    /* ── Mouse tracking ─────────────────────────────────────── */
    function onMove(e: MouseEvent) {
      mouse.current = { x: e.clientX, y: e.clientY }
    }
    function onLeave() {
      mouse.current = { x: -9999, y: -9999 }
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseleave", onLeave)

    /* ── Draw loop ──────────────────────────────────────────── */
    function draw() {
      tick.current++
      const t = tick.current * 0.008
      const { w, h } = dims.current
      const mx = mouse.current.x
      const my = mouse.current.y

      // Scroll-reactive hue
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const scrollProgress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0
      const hue = lerpHue(scrollProgress)

      ctx!.clearRect(0, 0, w, h)

      /* ─ Layer 1: Ambient orbs ─────────────────────────────── */
      for (const o of orbs.current) {
        const ox = o.cx + Math.sin(t * o.sx + o.px) * w * 0.12
        const oy = o.cy + Math.cos(t * o.sy + o.py) * h * 0.1
        const pulse = Math.sin(t * 0.4 + o.px) * 0.008
        const a = o.alpha + pulse
        const orbHue = ((hue + o.hueOffset) % 360 + 360) % 360

        const g = ctx!.createRadialGradient(ox, oy, 0, ox, oy, o.r)
        g.addColorStop(0, `hsla(${orbHue}, 85%, 55%, ${a})`)
        g.addColorStop(0.4, `hsla(${orbHue}, 80%, 50%, ${a * 0.45})`)
        g.addColorStop(1, `hsla(${orbHue}, 70%, 45%, 0)`)
        ctx!.fillStyle = g
        ctx!.beginPath()
        ctx!.arc(ox, oy, o.r, 0, Math.PI * 2)
        ctx!.fill()
      }

      /* ─ Layer 2: Hexagonal dot grid ───────────────────────── */
      const rowH = HEX_SPACING * 0.866
      const cols = Math.ceil(w / HEX_SPACING) + 2
      const rows = Math.ceil(h / rowH) + 2
      for (let r = 0; r < rows; r++) {
        const offset = r % 2 === 0 ? 0 : HEX_SPACING * 0.5
        const dy = r * rowH
        for (let c = 0; c < cols; c++) {
          const dx = c * HEX_SPACING + offset

          // Mouse proximity
          const ddx = dx - mx
          const ddy = dy - my
          const dist = Math.sqrt(ddx * ddx + ddy * ddy)
          const inf = Math.max(0, 1 - dist / MOUSE_R)
          const ease = inf * inf * (3 - 2 * inf) // smoothstep

          const size = DOT_BASE + (DOT_GLOW - DOT_BASE) * ease
          const alpha = ALPHA_BASE + (ALPHA_GLOW - ALPHA_BASE) * ease

          if (alpha < 0.015) continue

          ctx!.fillStyle = `hsla(${hue}, 80%, 72%, ${alpha})`
          ctx!.beginPath()
          ctx!.arc(dx, dy, size, 0, Math.PI * 2)
          ctx!.fill()
        }
      }

      /* ─ Layer 3: Mouse cursor glow ────────────────────────── */
      if (mx > 0 && my > 0) {
        const mg = ctx!.createRadialGradient(mx, my, 0, mx, my, MOUSE_R * 0.6)
        mg.addColorStop(0, `hsla(${hue}, 85%, 62%, 0.06)`)
        mg.addColorStop(0.5, `hsla(${hue}, 80%, 52%, 0.025)`)
        mg.addColorStop(1, `hsla(${hue}, 70%, 40%, 0)`)
        ctx!.fillStyle = mg
        ctx!.beginPath()
        ctx!.arc(mx, my, MOUSE_R * 0.6, 0, Math.PI * 2)
        ctx!.fill()
      }

      /* ─ Layer 4: Flowing particles + trails ───────────────── */
      for (const p of parts.current) {
        const angle = flowAngle(p.x, p.y, t)

        // Mouse deflection
        const pmx = p.x - mx
        const pmy = p.y - my
        const pDist = Math.sqrt(pmx * pmx + pmy * pmy)
        let fx = 0, fy = 0
        if (pDist < MOUSE_R && pDist > 1) {
          const force = (1 - pDist / MOUSE_R) * 0.6
          fx = (pmx / pDist) * force
          fy = (pmy / pDist) * force
        }

        p.x += Math.cos(angle) * p.speed + fx
        p.y += Math.sin(angle) * p.speed + fy

        // Store in ring buffer
        p.trail[p.trailIdx * 2] = p.x
        p.trail[p.trailIdx * 2 + 1] = p.y
        p.trailIdx = (p.trailIdx + 1) % TRAIL_LENGTH

        // Respawn off-screen particles
        if (p.x < -80 || p.x > w + 80 || p.y < -80 || p.y > h + 80) {
          const edge = Math.random()
          if (edge < 0.25) { p.x = -10; p.y = Math.random() * h }
          else if (edge < 0.5) { p.x = w + 10; p.y = Math.random() * h }
          else if (edge < 0.75) { p.x = Math.random() * w; p.y = -10 }
          else { p.x = Math.random() * w; p.y = h + 10 }
          for (let i = 0; i < TRAIL_LENGTH; i++) {
            p.trail[i * 2] = p.x
            p.trail[i * 2 + 1] = p.y
          }
          p.trailIdx = 0
        }

        // Compute hue from scroll position + particle offset
        const particleHue = ((hue + p.hueOffset) % 360 + 360) % 360

        // Draw trail (fading segments, oldest first)
        for (let i = 1; i < TRAIL_LENGTH; i++) {
          const ci = (p.trailIdx + i) % TRAIL_LENGTH
          const pi2 = (p.trailIdx + i - 1) % TRAIL_LENGTH
          const progress = i / TRAIL_LENGTH
          const segA = p.alpha * progress * progress * 0.55
          if (segA < 0.005) continue

          ctx!.strokeStyle = `hsla(${particleHue}, 85%, 65%, ${segA})`
          ctx!.lineWidth = 0.4 + progress * 1.4
          ctx!.lineCap = "round"
          ctx!.beginPath()
          ctx!.moveTo(p.trail[pi2 * 2], p.trail[pi2 * 2 + 1])
          ctx!.lineTo(p.trail[ci * 2], p.trail[ci * 2 + 1])
          ctx!.stroke()
        }

        // Particle head glow
        const headIdx = (p.trailIdx + TRAIL_LENGTH - 1) % TRAIL_LENGTH
        const hx = p.trail[headIdx * 2]
        const hy = p.trail[headIdx * 2 + 1]
        const glow = ctx!.createRadialGradient(hx, hy, 0, hx, hy, 5)
        glow.addColorStop(0, `hsla(${particleHue}, 92%, 75%, ${p.alpha * 0.85})`)
        glow.addColorStop(1, `hsla(${particleHue}, 85%, 60%, 0)`)
        ctx!.fillStyle = glow
        ctx!.beginPath()
        ctx!.arc(hx, hy, 5, 0, Math.PI * 2)
        ctx!.fill()
      }

      /* ─ Layer 5: Radar pulse ──────────────────────────────── */
      const now = performance.now()
      if (now - lastPulse.current > PULSE_GAP) {
        lastPulse.current = now
        pulses.current.push({ x: w * 0.5, y: h * 0.5, r: 0, born: now })
      }

      pulses.current = pulses.current.filter((p) => {
        const age = now - p.born
        if (age > 3000) return false
        const progress = age / 3000
        p.r = progress * Math.max(w, h) * 0.55
        const a = (1 - progress) * (1 - progress) * 0.12

        ctx!.strokeStyle = `hsla(${hue}, 85%, 60%, ${a})`
        ctx!.lineWidth = 1.8 * (1 - progress)
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.stroke()
        return true
      })

      /* ─ Layer 6: Scan sweep ───────────────────────────────── */
      scanY.current = (scanY.current + SCAN_SPEED) % (h + 120)
      const sy = scanY.current - 60
      const sg = ctx!.createLinearGradient(0, sy, 0, sy + 60)
      sg.addColorStop(0, `hsla(${hue}, 85%, 60%, 0)`)
      sg.addColorStop(0.4, `hsla(${hue}, 85%, 60%, 0.022)`)
      sg.addColorStop(0.5, `hsla(${hue}, 85%, 60%, 0.032)`)
      sg.addColorStop(0.6, `hsla(${hue}, 85%, 60%, 0.022)`)
      sg.addColorStop(1, `hsla(${hue}, 85%, 60%, 0)`)
      ctx!.fillStyle = sg
      ctx!.fillRect(0, sy, w, 60)

      raf.current = requestAnimationFrame(draw)
    }

    raf.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf.current)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseleave", onLeave)
    }
  }, [])

  return (
    <div className={cn("relative min-h-screen w-full bg-background", className)}>
      <canvas ref={cvs} className="fixed inset-0 z-0" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
