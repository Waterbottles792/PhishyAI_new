import { useRef, useCallback } from "react"

export interface Attractor {
  id: string
  x: number
  y: number
  active: boolean
}

export function useAttractors() {
  const attractorsRef = useRef<Attractor[]>([])

  const register = useCallback((id: string, rect: DOMRect) => {
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const existing = attractorsRef.current.find((a) => a.id === id)
    if (existing) {
      existing.x = x
      existing.y = y
    } else {
      attractorsRef.current.push({ id, x, y, active: false })
    }
  }, [])

  const setActive = useCallback((id: string, active: boolean) => {
    const attractor = attractorsRef.current.find((a) => a.id === id)
    if (attractor) attractor.active = active
  }, [])

  const unregister = useCallback((id: string) => {
    attractorsRef.current = attractorsRef.current.filter((a) => a.id !== id)
  }, [])

  return { attractorsRef, register, setActive, unregister }
}
