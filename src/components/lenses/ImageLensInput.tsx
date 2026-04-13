'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

interface ImageLensInputProps {
  lensInputId: string
  profileId: string
  uploadType: 'palm' | 'handwriting' | 'face_reading'
  analyzeEndpoint: string
  title: string
  subtitle: string
  instructions: string[]
  icon: string
  privacyNote?: string
  showDeleteOption?: boolean
  onComplete: () => void
}

export default function ImageLensInput({
  lensInputId,
  profileId,
  uploadType,
  analyzeEndpoint,
  title,
  subtitle,
  instructions,
  icon,
  privacyNote,
  showDeleteOption = false,
  onComplete,
}: ImageLensInputProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [deleteAfter, setDeleteAfter] = useState(uploadType === 'face_reading')
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.')
      return
    }
    if (selected.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB.')
      return
    }

    setFile(selected)
    setError(null)
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(selected)
  }

  const handleSubmit = async () => {
    if (!file) return
    setUploading(true)
    setError(null)

    try {
      // Upload image
      const formData = new FormData()
      formData.append('file', file)
      const uploadRes = await fetch(`/api/upload/${uploadType}`, {
        method: 'POST',
        body: formData,
      })
      if (!uploadRes.ok) {
        const d = await uploadRes.json()
        throw new Error(d.error || 'Upload failed')
      }
      const { path: imagePath, bucket: imageBucket } = await uploadRes.json()

      // Analyze
      setUploading(false)
      setAnalyzing(true)
      const analyzeRes = await fetch(analyzeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lens_input_id: lensInputId,
          profile_id: profileId,
          image_path: imagePath,
          image_bucket: imageBucket,
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
      setUploading(false)
      setAnalyzing(false)
    }
  }

  const isLoading = uploading || analyzing

  return (
    <div className="glass-card p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-royal-purple/40 border border-celestial-gold/30 flex items-center justify-center text-2xl">
          {icon}
        </div>
        <div>
          <h2 className="font-serif text-2xl text-white">{title}</h2>
          <p className="text-soft-silver/60 text-sm">{subtitle}</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-6 space-y-2">
        {instructions.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full border border-celestial-gold/40 text-celestial-gold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              {i + 1}
            </span>
            <p className="text-soft-silver/70 text-sm">{step}</p>
          </div>
        ))}
      </div>

      {/* Upload area */}
      <div
        onClick={() => !isLoading && fileRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          preview
            ? 'border-celestial-gold/40 bg-celestial-gold/5'
            : 'border-white/20 hover:border-celestial-gold/30 hover:bg-white/5'
        } ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {preview ? (
          <div className="space-y-3">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg object-contain"
            />
            <p className="text-celestial-gold text-sm">{file?.name}</p>
            <p className="text-soft-silver/40 text-xs">Click to change image</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-4xl opacity-40">{icon}</div>
            <p className="text-white/70">Click to upload or drag and drop</p>
            <p className="text-soft-silver/40 text-xs">JPEG, PNG, or WebP — max 2MB</p>
          </div>
        )}
      </div>

      {/* Privacy option */}
      {showDeleteOption && (
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDeleteAfter(!deleteAfter)}
            className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
              deleteAfter ? 'border-celestial-gold bg-celestial-gold' : 'border-white/30'
            }`}
          >
            {deleteAfter && <span className="text-midnight text-xs font-bold">✓</span>}
          </button>
          <span className="text-soft-silver/60 text-sm">Delete image after analysis (recommended for privacy)</span>
        </div>
      )}

      {privacyNote && (
        <p className="mt-3 text-soft-silver/40 text-xs">{privacyNote}</p>
      )}

      {error && (
        <p className="mt-4 text-red-400 text-sm">{error}</p>
      )}

      {/* Submit */}
      <motion.button
        onClick={handleSubmit}
        disabled={!file || isLoading}
        className="btn-gold w-full mt-6 py-3 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
        whileHover={!file || isLoading ? {} : { scale: 1.01 }}
      >
        {uploading
          ? 'Uploading image...'
          : analyzing
          ? 'Analyzing with Claude Vision...'
          : 'Analyze My Image →'}
      </motion.button>
    </div>
  )
}
