"use client"

import { useRef, useMemo, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

/* ─── Config ───────────────────────────────────────────────────────── */
const NODE_COUNT = 58
const SPHERE_R = 3.6
const CONNECT_DIST = 1.72

/* ─── Fibonacci sphere distribution (uniform coverage) ─────────────── */
function fibonacciSphere(n: number, r: number): [number, number, number][] {
  const pts: [number, number, number][] = []
  const golden = (1 + Math.sqrt(5)) / 2
  for (let i = 0; i < n; i++) {
    const theta = (2 * Math.PI * i) / golden
    const phi = Math.acos(1 - (2 * (i + 0.5)) / n)
    pts.push([
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    ])
  }
  return pts
}

/* ─── The 3D Neural Network Scene ──────────────────────────────────── */
function NeuralNetwork({
  mouseRef,
}: {
  mouseRef: React.MutableRefObject<[number, number]>
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const meshRef = useRef<THREE.InstancedMesh>(null!)

  /* Node positions */
  const positions = useMemo(() => fibonacciSphere(NODE_COUNT, SPHERE_R), [])

  /* Pre-allocated reusable objects to avoid GC pressure */
  const pos3 = useMemo(
    () => positions.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    [positions]
  )
  const quat = useMemo(() => new THREE.Quaternion(), [])
  const scaleV = useMemo(() => new THREE.Vector3(1, 1, 1), [])
  const mat4 = useMemo(() => new THREE.Matrix4(), [])

  /* Per-node pulse offsets */
  const pulseOffsets = useMemo(
    () => positions.map(() => Math.random() * Math.PI * 2),
    [positions]
  )

  /* Build line-segments geometry for connections */
  const lineGeo = useMemo(() => {
    const verts: number[] = []
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const [x1, y1, z1] = positions[i]
        const [x2, y2, z2] = positions[j]
        const d = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2)
        if (d < CONNECT_DIST) verts.push(x1, y1, z1, x2, y2, z2)
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3))
    return geo
  }, [positions])

  /* Initialise instanced mesh positions */
  useEffect(() => {
    if (!meshRef.current) return
    positions.forEach(([x, y, z], i) => {
      mat4.setPosition(x, y, z)
      meshRef.current.setMatrixAt(i, mat4)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [positions, mat4])

  /* Animation loop */
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    const [mx, my] = mouseRef.current

    /* Auto-rotation + mouse parallax */
    groupRef.current.rotation.y = t * 0.065 + mx * 0.45
    groupRef.current.rotation.x = Math.sin(t * 0.022) * 0.12 + my * 0.18

    /* Pulse each node */
    if (meshRef.current) {
      positions.forEach(([, , ,], i) => {
        const s = 0.8 + Math.sin(t * 1.6 + pulseOffsets[i]) * 0.2
        scaleV.set(s, s, s)
        mat4.compose(pos3[i], quat, scaleV)
        meshRef.current.setMatrixAt(i, mat4)
      })
      meshRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group ref={groupRef}>
      {/* Outer wireframe sphere — subtle cage */}
      <mesh>
        <sphereGeometry args={[SPHERE_R * 1.04, 18, 18]} />
        <meshBasicMaterial
          color="#00d084"
          transparent
          opacity={0.025}
          wireframe
        />
      </mesh>

      {/* Connection line-segments */}
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color="#00c896" transparent opacity={0.18} />
      </lineSegments>

      {/* Instanced nodes */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, NODE_COUNT]}>
        <sphereGeometry args={[0.065, 8, 8]} />
        <meshBasicMaterial color="#00ff8c" transparent opacity={0.92} />
      </instancedMesh>

      {/* Central ambient core */}
      <mesh>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshBasicMaterial color="#00ff8c" transparent opacity={0.12} />
      </mesh>

      {/* Second inner ring (ring geometry for depth) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[SPHERE_R * 0.62, 0.012, 6, 64]} />
        <meshBasicMaterial color="#00d084" transparent opacity={0.1} />
      </mesh>
    </group>
  )
}

/* ─── Exported Canvas Wrapper ───────────────────────────────────────── */
export default function NeuralCanvas() {
  const mouseRef = useRef<[number, number]>([0, 0])

  return (
    <div
      className="w-full h-full"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        mouseRef.current = [
          ((e.clientX - r.left) / r.width) * 2 - 1,
          -(((e.clientY - r.top) / r.height) * 2 - 1),
        ]
      }}
      onMouseLeave={() => {
        mouseRef.current = [0, 0]
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 9.5], fov: 44 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        dpr={[1, 2]}
      >
        <NeuralNetwork mouseRef={mouseRef} />
      </Canvas>
    </div>
  )
}
