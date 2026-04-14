'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

interface IridologyInputProps {
  lensInputId: string
  profileId: string
  initialData: Record<string, unknown>
  onComplete: () => void
}

export default function IridologyInput({ lensInputId, profileId, onComplete }: IridologyInputProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [deleteAfter, setDeleteAfter] = useState(true)
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState<'idle' | 'uploading' | 'analyzing'>('idle')
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.')
      return
    }
    if (f.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB.')
      return
    }
    setFile(f)
    setError(null)
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(f)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { setError('Please select an iris photo.'); return }
    setLoading(true)
    setError(null)

    try {
      setStage('uploading')
      const formData = new FormData()
      formData.append('file', file)
      const uploadRes = await fetch('/api/upload/iridology', { method: 'POST', body: formData })
      if (!uploadRes.ok) {
        const d = await uploadRes.json()
        throw new Error(d.error || 'Upload failed')
      }
      const { path, bucket } = await uploadRes.json()

      setStage('analyzing')
      const analyzeRes = await fetch('/api/analyze/iridology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lens_input_id: lensInputId,
          profile_id: profileId,
          image_path: path,
          image_bucket: bucket,
          delete_after: deleteAfter,
        }),
      })
      if (!analyzeRes.ok) {
        const d = await analyzeRes.json()
        throw new Error(d.error || 'Analysis failed')
      }

      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
      setStage('idle')
    }
  }

  return (
    <div className="glass-card p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-4xl">👁</span>
        <div>
          <h2 className="font-serif text-2xl text-white">Iridology</h2>
          <p className="text-xs text-celestial-gold/60">Iris Analysis · Cultural Tradition</p>
        </div>
      </div>

      <p className="text-soft-silver/60 text-sm mb-6 leading-relaxed">
        Upload a close-up photo of one iris (your dominant eye). The unique fiber structure,
        color constitution, nerve rings, and pigmentation patterns are interpreted for personality
        insights using Bernard Jensen&apos;s framework and the Rayid constitutional typing method.
      </p>

      <div className="mb-5 p-4 rounded-lg bg-celestial-gold/5 border border-celestial-gold/20">
        <p className="text-xs text-celestial-gold/80 font-medium mb-1">For best results:</p>
        <ul className="text-xs text-soft-silver/60 space-y-1">
          <li>· Use good natural or ring-flash lighting</li>
          <li>· Hold camera 6–10 cm from the eye</li>
          <li>· Keep the eye wide open and look straight ahead</li>
          <li>· A smartphone macro or portrait mode works well</li>
        </ul>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-white/15 hover:border-celestial-gold/40 rounded-xl p-8 text-center cursor-pointer transition-colors"
        >
          {preview ? (
            <div className="flex flex-col items-center gap-3">
              <img
                src={preview}
                alt="Iris preview"
                className="w-40 h-40 object-cover rounded-full border-2 border-celestial-gold/30"
              />
              <p className="text-xs text-soft-silver/50">Click to change image</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <span className="text-5xl opacity-30">👁</span>
              <p className="text-soft-silver/50 text-sm">Click to upload iris photo</p>
              <p className="text-xs text-soft-silver/30">JPEG · PNG · WebP · max 2MB</p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => setDeleteAfter(!deleteAfter)}
            className={`w-10 h-5 rounded-full transition-colors relative ${deleteAfter ? 'bg-celestial-gold' : 'bg-white/10'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${deleteAfter ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-xs text-soft-silver/60 group-hover:text-soft-silver/80 transition-colors">
            Delete iris image after analysis (recommended for privacy)
          </span>
        </label>

        <motion.button
          type="submit"
          disabled={loading || !file}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="btn-gold mt-2 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="inline-block w-4 h-4 border-2 border-midnight/30 border-t-midnight rounded-full animate-spin" />
              {stage === 'uploading' ? 'Uploading securely...' : 'Analyzing iris patterns...'}
            </span>
          ) : (
            'Analyze My Iris →'
          )}
        </motion.button>
      </form>

      <div className="mt-5 p-4 rounded-lg bg-white/5 border border-white/10">
        <p className="text-xs text-soft-silver/40 leading-relaxed">
          <strong className="text-soft-silver/60">Privacy:</strong> Your iris image is processed
          securely and deleted immediately after analysis by default. No image is stored or shared.{' '}
          <strong className="text-soft-silver/60">Sources:</strong> Bernard Jensen (The Science and
          Practice of Iridology, 1952), Rayid Method constitutional typing. Personality insight only
          — no health claims are made.
        </p>
      </div>
    </div>
  )
}
