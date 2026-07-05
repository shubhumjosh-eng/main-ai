'use client'

interface NpcSpiritProps {
  emotion: string
  size?: number
  pulse?: boolean
  onClick?: () => void
}

const EMOTION_COLORS: Record<string, string> = {
  happy: '#B794F4',
  sad: '#818CF8',
  angry: '#FCA5A5',
  anxious: '#67E8F9',
  surprised: '#FDE68A',
  neutral: '#C8B6FF',
}

export function NpcSpirit({ emotion, size = 120, pulse = true, onClick }: NpcSpiritProps) {
  const color = EMOTION_COLORS[emotion] || '#C8B6FF'
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.25

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={`spirit-glow ${pulse ? 'animate-float' : ''} cursor-pointer`}
        onClick={onClick}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={`spiritGlow-${emotion}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="60%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`spiritBody-${emotion}`} cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="40%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="0.3" />
          </radialGradient>
        </defs>

        <circle cx={cx} cy={cy} r={size * 0.45} fill={`url(#spiritGlow-${emotion})`} className="animate-glow" />

        <ellipse cx={cx} cy={cy + r * 0.2} rx={r * 1.1} ry={r * 1.0} fill={`url(#spiritBody-${emotion})`} />

        <ellipse cx={cx - r * 0.3} cy={cy - r * 0.15} rx={r * 0.15} ry={r * 0.18} fill="#2d1b69" opacity="0.8" />
        <ellipse cx={cx + r * 0.3} cy={cy - r * 0.15} rx={r * 0.15} ry={r * 0.18} fill="#2d1b69" opacity="0.8" />

        <ellipse cx={cx - r * 0.3} cy={cy - r * 0.15} rx={r * 0.07} ry={r * 0.08} fill="#ffffff" opacity="0.9" />
        <ellipse cx={cx + r * 0.3} cy={cy - r * 0.15} rx={r * 0.07} ry={r * 0.08} fill="#ffffff" opacity="0.9" />

        <path
          d={`M${cx - r * 0.35},${cy + r * 0.2} Q${cx},${cy + r * 0.5} ${cx + r * 0.35},${cy + r * 0.2}`}
          fill="none"
          stroke="#2d1b69"
          strokeWidth={r * 0.08}
          strokeLinecap="round"
          opacity="0.6"
        />

        {[1,2,3].map((_, i) => (
          <circle
            key={i}
            cx={cx + (i - 1) * r * 0.6}
            cy={cy + r * 0.9 + i * 3}
            r={r * 0.08 - i * 0.02}
            fill={color}
            opacity={0.4 - i * 0.1}
            className="animate-glow"
          />
        ))}
      </svg>
    </div>
  )
}
