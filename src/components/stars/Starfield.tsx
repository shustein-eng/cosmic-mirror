'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  radius: number
  opacity: number
  twinkleSpeed: number
  twinkleOffset: number
}

interface ConstellationNode {
  x: number
  y: number
  connections: number[]
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animFrameId: number
    let stars: Star[] = []
    let constellation: ConstellationNode[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars()
      initConstellation()
    }

    const initStars = () => {
      const count = Math.floor((canvas.width * canvas.height) / 3000)
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
      }))
    }

    const initConstellation = () => {
      // Sparse constellation overlay — 12 nodes
      const count = 12
      constellation = Array.from({ length: count }, (_, i) => ({
        x: (canvas.width * (0.1 + (i % 4) * 0.27)) + (Math.random() - 0.5) * 80,
        y: (canvas.height * (0.15 + Math.floor(i / 4) * 0.35)) + (Math.random() - 0.5) * 60,
        connections: [] as number[],
      }))
      // Connect nearby nodes
      for (let i = 0; i < constellation.length; i++) {
        for (let j = i + 1; j < constellation.length; j++) {
          const dx = constellation[i].x - constellation[j].x
          const dy = constellation[i].y - constellation[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 250 && Math.random() > 0.5) {
            constellation[i].connections.push(j)
          }
        }
      }
    }

    let t = 0
    const animate = () => {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw stars
      for (const star of stars) {
        const twinkle = Math.sin(t * star.twinkleSpeed * 60 + star.twinkleOffset)
        const opacity = star.opacity * (0.6 + 0.4 * twinkle)

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
        ctx.fill()
      }

      // Draw constellation lines
      for (const node of constellation) {
        for (const connIdx of node.connections) {
          const target = constellation[connIdx]
          const pulse = Math.sin(t * 0.008 + node.x * 0.01) * 0.5 + 0.5
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(target.x, target.y)
          ctx.strokeStyle = `rgba(201, 168, 76, ${0.05 + pulse * 0.08})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }

      // Draw constellation nodes
      for (const node of constellation) {
        const pulse = Math.sin(t * 0.01 + node.y * 0.01) * 0.5 + 0.5
        ctx.beginPath()
        ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201, 168, 76, ${0.3 + pulse * 0.5})`
        ctx.fill()

        // Outer glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 8)
        gradient.addColorStop(0, `rgba(201, 168, 76, ${0.15 + pulse * 0.15})`)
        gradient.addColorStop(1, 'rgba(201, 168, 76, 0)')
        ctx.beginPath()
        ctx.arc(node.x, node.y, 8, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      }

      t++
      animFrameId = requestAnimationFrame(animate)
    }

    resize()
    animate()

    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
