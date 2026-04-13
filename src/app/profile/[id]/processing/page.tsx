'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LENS_CARDS } from '@/types'

interface LensStep {
  lens_type: string
  status: 'waiting' | 'processing' | 'done'
}

export default function ProcessingPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [steps, setSteps] = useState<LensStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [synthStatus, setSynthStatus] = useState<'waiting' | 'processing' | 'done'>('waiting')
  const [connectedPairs, setConnectedPairs] = useState<[number, number][]>([])

  useEffect(() => {
    async function loadAndProcess() {
      const { data: lensInputs } = await supabase
        .from('lens_inputs')
        .select('lens_type, analysis_result')
        .eq('profile_id', id)

      if (!lensInputs) return

      const initialSteps: LensStep[] = lensInputs.map((li) => ({
        lens_type: li.lens_type,
        status: li.analysis_result ? 'done' : 'waiting',
      }))
      setSteps(initialSteps)

      // Process unanalyzed lenses sequentially
      for (let i = 0; i < initialSteps.length; i++) {
        if (initialSteps[i].status === 'done') {
          setConnectedPairs((prev) => [...prev, [i, i]])
          continue
        }

        setCurrentStep(i)
        setSteps((prev) => prev.map((s, idx) => idx === i ? { ...s, status: 'processing' } : s))
        await new Promise((res) => setTimeout(res, 800)) // animation beat

        setSteps((prev) => prev.map((s, idx) => idx === i ? { ...s, status: 'done' } : s))
        setConnectedPairs((prev) => [...prev, [Math.max(0, i - 1), i]])
        await new Promise((res) => setTimeout(res, 400))
      }

      // Synthesis step
      setSynthStatus('processing')
      await new Promise((res) => setTimeout(res, 1200))

      // Generate report
      const res = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: id, report_type: 'full_cosmic' }),
      })

      setSynthStatus('done')
      await new Promise((res) => setTimeout(res, 800))

      if (res.ok) {
        router.push(`/profile/${id}/report/full_cosmic`)
      } else {
        router.push(`/profile/${id}`)
      }
    }

    loadAndProcess()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Canvas constellation animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    let frame = 0
    let raf: number

    const nodes = steps.map((_, i) => {
      const angle = (i / Math.max(steps.length, 1)) * Math.PI * 2
      const r = Math.min(canvas.width, canvas.height) * 0.32
      return {
        x: canvas.width / 2 + Math.cos(angle) * r,
        y: canvas.height / 2 + Math.sin(angle) * r,
      }
    })

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connecting lines
      for (const [a, b] of connectedPairs) {
        if (!nodes[a] || !nodes[b] || a === b) continue
        const pulse = Math.sin(frame * 0.04) * 0.5 + 0.5
        ctx.beginPath()
        ctx.moveTo(nodes[a].x, nodes[a].y)
        ctx.lineTo(nodes[b].x, nodes[b].y)
        ctx.strokeStyle = `rgba(201, 168, 76, ${0.15 + pulse * 0.3})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Draw nodes
      steps.forEach((step, i) => {
        if (!nodes[i]) return
        const isDone = step.status === 'done'
        const isProcessing = step.status === 'processing'
        const pulse = Math.sin(frame * 0.06 + i) * 0.5 + 0.5

        const radius = isDone ? 8 : isProcessing ? 6 + pulse * 4 : 4

        // Glow
        if (isDone || isProcessing) {
          const grd = ctx.createRadialGradient(nodes[i].x, nodes[i].y, 0, nodes[i].x, nodes[i].y, 24)
          grd.addColorStop(0, `rgba(201,168,76,${isDone ? 0.4 : 0.2 + pulse * 0.2})`)
          grd.addColorStop(1, 'rgba(201,168,76,0)')
          ctx.beginPath()
          ctx.arc(nodes[i].x, nodes[i].y, 24, 0, Math.PI * 2)
          ctx.fillStyle = grd
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(nodes[i].x, nodes[i].y, radius, 0, Math.PI * 2)
        ctx.fillStyle = isDone
          ? '#C9A84C'
          : isProcessing
          ? `rgba(201,168,76,${0.5 + pulse * 0.5})`
          : 'rgba(184,196,212,0.3)'
        ctx.fill()
      })

      // Center synthesis star
      if (synthStatus !== 'waiting') {
        const pulse = Math.sin(frame * 0.05) * 0.5 + 0.5
        const cx = canvas.width / 2
        const cy = canvas.height / 2
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40)
        grd.addColorStop(0, `rgba(201,168,76,${synthStatus === 'done' ? 0.8 : 0.3 + pulse * 0.5})`)
        grd.addColorStop(1, 'rgba(201,168,76,0)')
        ctx.beginPath()
        ctx.arc(cx, cy, 40, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()

        ctx.beginPath()
        ctx.arc(cx, cy, synthStatus === 'done' ? 14 : 8 + pulse * 6, 0, Math.PI * 2)
        ctx.fillStyle = '#C9A84C'
        ctx.fill()
      }

      frame++
      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [steps, connectedPairs, synthStatus])

  const doneCount = steps.filter((s) => s.status === 'done').length

  return (
    <div className="relative min-h-screen cosmic-bg flex flex-col items-center justify-center px-6">
      {/* Stars bg */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 80 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.6 + 0.1,
            }}
            animate={{ opacity: [0.1, 0.8, 0.1] }}
            transition={{ duration: 2 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-serif text-4xl text-white mb-3">
            {synthStatus === 'done'
              ? 'Your Cosmic Mirror is ready'
              : synthStatus === 'processing'
              ? 'Connecting the stars...'
              : 'Analyzing your lenses'}
          </h1>
          <p className="text-soft-silver/60">
            {synthStatus === 'done'
              ? 'Opening your Full Cosmic Profile report...'
              : synthStatus === 'processing'
              ? 'Synthesizing all lenses into your unified profile...'
              : `${doneCount} of ${steps.length} lenses analyzed`}
          </p>
        </motion.div>

        {/* Constellation canvas */}
        <div className="relative w-full h-72 mb-8">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        {/* Lens status list */}
        <div className="flex flex-col gap-2 text-left max-w-xs mx-auto">
          <AnimatePresence>
            {steps.map((step, i) => {
              const card = LENS_CARDS.find((c) => c.type === step.lens_type)
              return (
                <motion.div
                  key={step.lens_type}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    step.status === 'done'
                      ? 'bg-celestial-gold'
                      : step.status === 'processing'
                      ? 'bg-celestial-gold/40 animate-pulse'
                      : 'bg-white/10'
                  }`}>
                    {step.status === 'done' && <span className="text-midnight text-[10px] font-bold">✓</span>}
                    {step.status === 'processing' && <span className="w-2 h-2 rounded-full bg-celestial-gold animate-ping" />}
                  </div>
                  <span className={`text-sm ${step.status === 'done' ? 'text-celestial-gold' : step.status === 'processing' ? 'text-white' : 'text-soft-silver/40'}`}>
                    {card?.icon} {card?.name || step.lens_type}
                  </span>
                </motion.div>
              )
            })}

            {steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: synthStatus !== 'waiting' ? 1 : 0.3, x: 0 }}
                transition={{ delay: steps.length * 0.1 + 0.2 }}
                className="flex items-center gap-3 mt-1"
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  synthStatus === 'done'
                    ? 'bg-celestial-gold'
                    : synthStatus === 'processing'
                    ? 'bg-celestial-gold/40 animate-pulse'
                    : 'bg-white/10'
                }`}>
                  {synthStatus === 'done' && <span className="text-midnight text-[10px] font-bold">✓</span>}
                </div>
                <span className={`text-sm font-medium ${synthStatus === 'done' ? 'text-celestial-gold' : synthStatus === 'processing' ? 'text-white' : 'text-soft-silver/30'}`}>
                  ✦ Convergence synthesis
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
