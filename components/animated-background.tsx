"use client"

import { useEffect, useRef, useCallback, type MutableRefObject } from "react"
import type { Attractor } from "@/hooks/use-attractors"

interface AnimatedBackgroundProps {
  attractorsRef?: MutableRefObject<Attractor[]>
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  pulseSpeed: number
  pulseOffset: number
}

interface Orb {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  hue: number
  opacity: number
}

export function AnimatedBackground({ attractorsRef }: AnimatedBackgroundProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const animFrameRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const orbsRef = useRef<Orb[]>([])
  const timeRef = useRef(0)

  const initParticles = useCallback((width: number, height: number) => {
    const count = Math.min(Math.floor((width * height) / 12000), 120)
    const particles: Particle[] = []
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.15,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulseOffset: Math.random() * Math.PI * 2,
      })
    }
    particlesRef.current = particles
  }, [])

  const initOrbs = useCallback((width: number, height: number) => {
    const orbs: Orb[] = [
      { x: width * 0.2, y: height * 0.3, radius: 300, vx: 0.15, vy: 0.08, hue: 155, opacity: 0.04 },
      { x: width * 0.8, y: height * 0.6, radius: 250, vx: -0.1, vy: 0.12, hue: 200, opacity: 0.03 },
      { x: width * 0.5, y: height * 0.15, radius: 200, vx: 0.08, vy: -0.06, hue: 155, opacity: 0.035 },
      { x: width * 0.3, y: height * 0.8, radius: 180, vx: -0.12, vy: -0.1, hue: 260, opacity: 0.025 },
      { x: width * 0.7, y: height * 0.2, radius: 220, vx: 0.06, vy: 0.14, hue: 180, opacity: 0.03 },
    ]
    orbsRef.current = orbs
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    let width = 0
    let height = 0

    function resize() {
      width = window.innerWidth
      height = document.documentElement.scrollHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = width * dpr
      canvas!.height = height * dpr
      canvas!.style.width = `${width}px`
      canvas!.style.height = `${height}px`
      ctx!.scale(dpr, dpr)
    }

    resize()
    initParticles(width, height)
    initOrbs(width, height)

    const CONNECTION_DIST = 120
    const MOUSE_RADIUS = 180

    function draw() {
      timeRef.current += 1
      const t = timeRef.current
      ctx!.clearRect(0, 0, width, height)

      const scrollY = window.scrollY
      const viewTop = scrollY
      const viewBottom = scrollY + window.innerHeight

      // Update and draw orbs
      for (const orb of orbsRef.current) {
        orb.x += orb.vx
        orb.y += orb.vy
        if (orb.x < -orb.radius) orb.x = width + orb.radius
        if (orb.x > width + orb.radius) orb.x = -orb.radius
        if (orb.y < -orb.radius) orb.y = height + orb.radius
        if (orb.y > height + orb.radius) orb.y = -orb.radius

        // Only draw if near viewport
        if (orb.y + orb.radius < viewTop - 400 || orb.y - orb.radius > viewBottom + 400) continue

        const pulse = Math.sin(t * 0.008 + orb.hue) * 0.01
        const grad = ctx!.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius)
        grad.addColorStop(0, `hsla(${orb.hue}, 70%, 60%, ${orb.opacity + pulse})`)
        grad.addColorStop(0.5, `hsla(${orb.hue}, 60%, 50%, ${(orb.opacity + pulse) * 0.4})`)
        grad.addColorStop(1, `hsla(${orb.hue}, 50%, 40%, 0)`)
        ctx!.fillStyle = grad
        ctx!.beginPath()
        ctx!.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2)
        ctx!.fill()
      }

      const mx = mouseRef.current.x
      const my = mouseRef.current.y + scrollY
      const particles = particlesRef.current

      // Update particles
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy

        // Wrap around
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        // Mouse interaction — gentle push
        const dx = p.x - mx
        const dy = p.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (1 - dist / MOUSE_RADIUS) * 0.015
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }

        // Attractor interaction — gentle pull toward active attractors
        if (attractorsRef) {
          for (const att of attractorsRef.current) {
            if (!att.active) continue
            const ax = att.x - p.x
            const ay = (att.y + scrollY) - p.y
            const aDist = Math.sqrt(ax * ax + ay * ay)
            const ATTRACTOR_RADIUS = 200
            if (aDist < ATTRACTOR_RADIUS && aDist > 0) {
              const aForce = (1 - aDist / ATTRACTOR_RADIUS) * 0.02
              p.vx += (ax / aDist) * aForce
              p.vy += (ay / aDist) * aForce
            }
          }
        }

        // Dampen velocity
        p.vx *= 0.998
        p.vy *= 0.998
      }

      // Draw connections + particles only near viewport
      const visible = particles.filter(
        (p) => p.y > viewTop - 150 && p.y < viewBottom + 150
      )

      // Connection lines
      ctx!.lineWidth = 0.5
      for (let i = 0; i < visible.length; i++) {
        for (let j = i + 1; j < visible.length; j++) {
          const a = visible[i]
          const b = visible[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.15
            ctx!.strokeStyle = `rgba(120, 230, 180, ${alpha})`
            ctx!.beginPath()
            ctx!.moveTo(a.x, a.y)
            ctx!.lineTo(b.x, b.y)
            ctx!.stroke()
          }
        }
      }

      // Mouse connections
      if (mx > 0) {
        for (const p of visible) {
          const dx = p.x - mx
          const dy = p.y - my
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MOUSE_RADIUS) {
            const alpha = (1 - dist / MOUSE_RADIUS) * 0.25
            ctx!.strokeStyle = `rgba(120, 230, 180, ${alpha})`
            ctx!.lineWidth = 0.8
            ctx!.beginPath()
            ctx!.moveTo(mx, my)
            ctx!.lineTo(p.x, p.y)
            ctx!.stroke()
            ctx!.lineWidth = 0.5
          }
        }
      }

      // Attractor connection lines
      if (attractorsRef) {
        for (const att of attractorsRef.current) {
          if (!att.active) continue
          const attY = att.y + scrollY
          for (const p of visible) {
            const adx = p.x - att.x
            const ady = p.y - attY
            const aDist = Math.sqrt(adx * adx + ady * ady)
            if (aDist < 200) {
              const alpha = (1 - aDist / 200) * 0.3
              ctx!.strokeStyle = `rgba(120, 230, 180, ${alpha})`
              ctx!.lineWidth = 0.8
              ctx!.beginPath()
              ctx!.moveTo(att.x, attY)
              ctx!.lineTo(p.x, p.y)
              ctx!.stroke()
              ctx!.lineWidth = 0.5
            }
          }
        }
      }

      // Draw particles
      for (const p of visible) {
        const pulse = Math.sin(t * p.pulseSpeed + p.pulseOffset) * 0.3 + 0.7
        const alpha = p.opacity * pulse

        // Glow
        const glow = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4)
        glow.addColorStop(0, `rgba(120, 230, 180, ${alpha * 0.4})`)
        glow.addColorStop(1, `rgba(120, 230, 180, 0)`)
        ctx!.fillStyle = glow
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
        ctx!.fill()

        // Core
        ctx!.fillStyle = `rgba(180, 245, 215, ${alpha})`
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx!.fill()
      }

      animFrameRef.current = requestAnimationFrame(draw)
    }

    animFrameRef.current = requestAnimationFrame(draw)

    function handleMouseMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    function handleMouseLeave() {
      mouseRef.current = { x: -1000, y: -1000 }
    }

    function handleResize() {
      resize()
      initParticles(width, height)
      initOrbs(width, height)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseleave", handleMouseLeave)
    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
      window.removeEventListener("resize", handleResize)
    }
  }, [initParticles, initOrbs])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ position: "fixed", top: 0, left: 0 }}
    />
  )
}
