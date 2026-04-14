'use client'

import { useMemo } from 'react'

interface ConvergenceMapProps {
  traitConvergence: Record<string, number>
  highConfidenceTraits: string[]
  size?: number
}

export default function ConvergenceMap({ traitConvergence, highConfidenceTraits, size = 320 }: ConvergenceMapProps) {
  const traits = useMemo(() => {
    return Object.entries(traitConvergence)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8) // max 8 spokes for readability
  }, [traitConvergence])

  if (traits.length < 3) return null

  const cx = size / 2
  const cy = size / 2
  const maxR = size / 2 - 48
  const levels = [0.25, 0.5, 0.75, 1.0]
  const angleStep = (2 * Math.PI) / traits.length

  const pointOnSpoke = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2
    const r = value * maxR
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    }
  }

  const labelPoint = (index: number) => {
    const angle = index * angleStep - Math.PI / 2
    const r = maxR + 22
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    }
  }

  // Build polygon path for the data
  const dataPoints = traits.map(([, v], i) => pointOnSpoke(i, v))
  const polygonPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z'

  // Grid rings
  const gridPolygons = levels.map((level) => {
    const pts = traits.map((_, i) => pointOnSpoke(i, level))
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z'
  })

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-serif text-xl text-white">Convergence Map</h3>
          <p className="text-xs text-soft-silver/50 mt-0.5">How strongly each trait appears across your lenses</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-soft-silver/40">
          <span className="w-3 h-0.5 bg-celestial-gold/60 inline-block rounded" />
          High confidence
        </div>
      </div>

      <div className="flex justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <radialGradient id="convergence-fill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#C9A84C" stopOpacity="0.05" />
            </radialGradient>
          </defs>

          {/* Grid rings */}
          {gridPolygons.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          ))}

          {/* Spokes */}
          {traits.map((_, i) => {
            const outer = pointOnSpoke(i, 1)
            return (
              <line
                key={i}
                x1={cx} y1={cy}
                x2={outer.x} y2={outer.y}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
            )
          })}

          {/* Data polygon */}
          <path d={polygonPath} fill="url(#convergence-fill)" stroke="#C9A84C" strokeWidth="1.5" strokeOpacity="0.7" />

          {/* Data points */}
          {dataPoints.map((p, i) => {
            const isHigh = highConfidenceTraits.includes(traits[i][0])
            return (
              <circle
                key={i}
                cx={p.x} cy={p.y}
                r={isHigh ? 5 : 3}
                fill={isHigh ? '#C9A84C' : 'rgba(201,168,76,0.5)'}
                stroke={isHigh ? '#C9A84C' : 'none'}
                strokeWidth="1.5"
              />
            )
          })}

          {/* Labels */}
          {traits.map(([name, value], i) => {
            const lp = labelPoint(i)
            const short = name.length > 14 ? name.slice(0, 13) + '…' : name
            const isHigh = highConfidenceTraits.includes(name)
            const pct = Math.round(value * 100)
            return (
              <g key={i}>
                <text
                  x={lp.x} y={lp.y - 5}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isHigh ? 'rgba(201,168,76,0.9)' : 'rgba(184,196,212,0.6)'}
                  fontFamily="serif"
                >
                  {short}
                </text>
                <text
                  x={lp.x} y={lp.y + 7}
                  textAnchor="middle"
                  fontSize="8"
                  fill="rgba(184,196,212,0.35)"
                >
                  {pct}%
                </text>
              </g>
            )
          })}

          {/* Center dot */}
          <circle cx={cx} cy={cy} r="3" fill="rgba(201,168,76,0.4)" />
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {traits.slice(0, 5).filter(([name]) => highConfidenceTraits.includes(name)).map(([name]) => (
          <span key={name} className="text-xs px-2 py-0.5 rounded-full bg-celestial-gold/10 border border-celestial-gold/25 text-celestial-gold/80">
            ✦ {name}
          </span>
        ))}
      </div>
    </div>
  )
}
