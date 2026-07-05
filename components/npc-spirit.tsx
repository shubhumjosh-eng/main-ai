'use client'

import { useEffect, useState, useMemo } from 'react'

interface NpcSpiritProps {
  emotion: string
  size?: number
  pulse?: boolean
  onClick?: () => void
}

const EMOTION_COLORS: Record<string, { primary: string; secondary: string; glow: string }> = {
  happy: { primary: '#B794F4', secondary: '#D8B4FE', glow: '#C8B6FF' },
  sad: { primary: '#818CF8', secondary: '#A5B4FC', glow: '#93A5FB' },
  angry: { primary: '#FCA5A5', secondary: '#FECACA', glow: '#F87171' },
  anxious: { primary: '#67E8F9', secondary: '#A5F3FC', glow: '#22D3EE' },
  surprised: { primary: '#FDE68A', secondary: '#FEF08A', glow: '#FACC15' },
  neutral: { primary: '#C8B6FF', secondary: '#DDD6FE', glow: '#A78BFA' },
}

function Particle({ index, emotion }: { index: number; emotion: string }) {
  const colors = EMOTION_COLORS[emotion] || EMOTION_COLORS.neutral
  const angle = (index / 10) * Math.PI * 2
  const distance = 38 + Math.random() * 18
  const x = Math.cos(angle) * distance
  const y = Math.sin(angle) * distance
  return (
    <circle cx={50} cy={50} r={1.2} fill={colors.glow} opacity="0.5">
      <animate attributeName="cx" values={`${50 + x};${50 + x * 0.3};${50 + x}`} dur={`${4 + Math.random() * 3}s`} repeatCount="indefinite" />
      <animate attributeName="cy" values={`${50 + y};${50 + y * 0.3};${50 + y}`} dur={`${4 + Math.random() * 3}s`} repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.1;0.7;0" dur={`${4 + Math.random() * 3}s`} repeatCount="indefinite" />
    </circle>
  )
}

export function NpcSpirit({ emotion, size = 120, pulse = true, onClick }: NpcSpiritProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const colors = EMOTION_COLORS[emotion] || EMOTION_COLORS.neutral
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.22

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={`${pulse ? 'animate-float' : ''} cursor-pointer select-none`}
        onClick={onClick}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={`sg-${emotion}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colors.glow} stopOpacity="0.5" />
            <stop offset="50%" stopColor={colors.glow} stopOpacity="0.15" />
            <stop offset="100%" stopColor={colors.glow} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`sb-${emotion}`} cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="30%" stopColor={colors.primary} stopOpacity="0.8" />
            <stop offset="70%" stopColor={colors.secondary} stopOpacity="0.5" />
            <stop offset="100%" stopColor={colors.primary} stopOpacity="0.2" />
          </radialGradient>
        </defs>

        <circle cx={cx} cy={cy} r={size * 0.48} fill={`url(#sg-${emotion})`} className="animate-glow-pulse" />

        {mounted && Array.from({ length: 10 }).map((_, i) => (
          <Particle key={i} index={i} emotion={emotion} />
        ))}

        <filter id="spirit-blur">
          <feGaussianBlur stdDeviation="0.5" />
        </filter>

        <ellipse cx={cx} cy={cy + r * 0.15} rx={r * 1.15} ry={r * 1.05} fill={`url(#sb-${emotion})`} filter="url(#spirit-blur)" />

        <ellipse cx={cx - r * 0.32} cy={cy - r * 0.18} rx={r * 0.16} ry={r * 0.2} fill="#1a1040" opacity="0.85" />
        <ellipse cx={cx + r * 0.32} cy={cy - r * 0.18} rx={r * 0.16} ry={r * 0.2} fill="#1a1040" opacity="0.85" />
        <ellipse cx={cx - r * 0.3} cy={cy - r * 0.2} rx={r * 0.07} ry={r * 0.09} fill="#ffffff" opacity="0.95" />
        <ellipse cx={cx + r * 0.34} cy={cy - r * 0.2} rx={r * 0.07} ry={r * 0.09} fill="#ffffff" opacity="0.95" />

        {emotion === 'happy' && (
          <path d={`M${cx - r * 0.3},${cy + r * 0.25} Q${cx},${cy + r * 0.55} ${cx + r * 0.3},${cy + r * 0.25}`} fill="none" stroke="#1a1040" strokeWidth={r * 0.08} strokeLinecap="round" opacity="0.5" />
        )}
        {emotion === 'sad' && (
          <path d={`M${cx - r * 0.3},${cy + r * 0.35} Q${cx},${cy + r * 0.15} ${cx + r * 0.3},${cy + r * 0.35}`} fill="none" stroke="#1a1040" strokeWidth={r * 0.08} strokeLinecap="round" opacity="0.5" />
        )}
        {emotion === 'angry' && (
          <>
            <line x1={cx - r * 0.4} y1={cy - r * 0.05} x2={cx - r * 0.15} y2={cy + r * 0.05} stroke="#1a1040" strokeWidth={r * 0.06} strokeLinecap="round" opacity="0.4" />
            <line x1={cx + r * 0.4} y1={cy - r * 0.05} x2={cx + r * 0.15} y2={cy + r * 0.05} stroke="#1a1040" strokeWidth={r * 0.06} strokeLinecap="round" opacity="0.4" />
          </>
        )}
        {emotion === 'surprised' && (
          <ellipse cx={cx} cy={cy + r * 0.3} rx={r * 0.1} ry={r * 0.12} fill="#1a1040" opacity="0.3" />
        )}
        {emotion === 'neutral' && (
          <line x1={cx - r * 0.25} y1={cy + r * 0.3} x2={cx + r * 0.25} y2={cy + r * 0.3} stroke="#1a1040" strokeWidth={r * 0.06} strokeLinecap="round" opacity="0.4" />
        )}
        {emotion === 'anxious' && (
          <path d={`M${cx - r * 0.2},${cy + r * 0.25} Q${cx},${cy + r * 0.35} ${cx + r * 0.2},${cy + r * 0.25}`} fill="none" stroke="#1a1040" strokeWidth={r * 0.06} strokeLinecap="round" opacity="0.3" />
        )}

        {[1, 2, 3].map((_, i) => (
          <circle key={i} cx={cx + (i - 1) * r * 0.6} cy={cy + r * 0.95 + i * 2.5} r={r * 0.08 - i * 0.015} fill={colors.primary} opacity={0.35 - i * 0.08} className="animate-glow-soft" />
        ))}
      </svg>
    </div>
  )
}
