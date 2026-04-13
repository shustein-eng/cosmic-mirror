'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// Ambient sound system using Web Audio API — no external dependency needed
export function useSoundSystem() {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const [enabled, setEnabled] = useState(false)
  const oscillatorsRef = useRef<OscillatorNode[]>([])

  const stop = useCallback(() => {
    oscillatorsRef.current.forEach((osc) => { try { osc.stop() } catch {} })
    oscillatorsRef.current = []
    gainRef.current?.gain.setTargetAtTime(0, audioCtxRef.current?.currentTime ?? 0, 0.5)
  }, [])

  const start = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') ctx.resume()

      const masterGain = ctx.createGain()
      masterGain.gain.setValueAtTime(0, ctx.currentTime)
      masterGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 2)
      masterGain.connect(ctx.destination)
      gainRef.current = masterGain

      // Create gentle, celestial drone — layered sine waves
      const frequencies = [55, 82.5, 110, 165, 220] // low A + harmonics
      oscillatorsRef.current = frequencies.map((freq, i) => {
        const osc = ctx.createOscillator()
        const oscGain = ctx.createGain()
        osc.type = i === 0 ? 'sine' : 'sine'
        osc.frequency.setValueAtTime(freq, ctx.currentTime)
        // Subtle frequency drift for an ethereal effect
        osc.frequency.linearRampToValueAtTime(freq * 1.002, ctx.currentTime + 8)
        osc.frequency.linearRampToValueAtTime(freq, ctx.currentTime + 16)
        oscGain.gain.setValueAtTime(1 / (i + 1) * 0.4, ctx.currentTime)
        osc.connect(oscGain)
        oscGain.connect(masterGain)
        osc.start()
        return osc
      })
    } catch (err) {
      console.warn('Sound system unavailable:', err)
    }
  }, [])

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      if (prev) { stop() } else { start() }
      return !prev
    })
  }, [start, stop])

  // Play a soft chime effect for transitions
  const playChime = useCallback(() => {
    if (!enabled || !audioCtxRef.current) return
    try {
      const ctx = audioCtxRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.8)
    } catch {}
  }, [enabled])

  // Cleanup on unmount
  useEffect(() => {
    return () => { stop(); audioCtxRef.current?.close() }
  }, [stop])

  return { enabled, toggle, playChime }
}

export default function SoundToggle() {
  const { enabled, toggle } = useSoundSystem()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <button
      onClick={toggle}
      title={enabled ? 'Mute ambient sound' : 'Enable ambient sound'}
      className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all text-sm ${
        enabled
          ? 'border-celestial-gold/50 bg-celestial-gold/10 text-celestial-gold'
          : 'border-white/20 text-soft-silver/40 hover:border-white/30'
      }`}
    >
      {enabled ? '♫' : '♪'}
    </button>
  )
}
