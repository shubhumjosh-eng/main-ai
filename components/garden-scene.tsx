'use client'

import { useEffect, useState, useMemo } from 'react'
import type { Plant } from '@/lib/game-storage'

interface GardenSceneProps {
  plants: Plant[]
  onToggle: () => void
}

const PLANT_COLORS: Record<string, { flower: string; center: string; stem: string }> = {
  sunflower: { flower: '#FBBF24', center: '#D97706', stem: '#2D6A4F' },
  rose: { flower: '#FB7185', center: '#E11D48', stem: '#2D6A4F' },
  lotus: { flower: '#E9D5FF', center: '#D8B4FE', stem: '#2D6A4F' },
  cherry: { flower: '#F9A8D4', center: '#FB7185', stem: '#2D6A4F' },
  fern: { flower: '#52B788', center: '#2D6A4F', stem: '#1B4332' },
  hibiscus: { flower: '#F472B6', center: '#EC4899', stem: '#2D6A4F' },
  moonflower: { flower: '#C4B5FD', center: '#A78BFA', stem: '#2D6A4F' },
  starlily: { flower: '#FDE68A', center: '#FBBF24', stem: '#2D6A4F' },
}

const PLANT_SVG: Record<string, string[]> = {
  sunflower: [
    `<circle r="2.5" fill="#52B788"/><line x1="0" y1="2.5" x2="0" y2="-10" stroke="#2D6A4F" stroke-width="1.5" stroke-linecap="round"/>`,
    `<line x1="0" y1="2.5" x2="0" y2="-20" stroke="#2D6A4F" stroke-width="2" stroke-linecap="round"/><path d="M-7,-17 Q0,-22 7,-17" fill="none" stroke="#52B788" stroke-width="1.2" stroke-linecap="round"/><circle r="4" fill="#FBBF24"/><circle r="2" fill="#D97706"/>`,
    `<line x1="0" y1="2.5" x2="0" y2="-28" stroke="#1B4332" stroke-width="2.5" stroke-linecap="round"/><path d="M-9,-22 Q0,-28 9,-22" fill="none" stroke="#52B788" stroke-width="1.5" stroke-linecap="round"/><path d="M-7,-15 Q0,-20 7,-15" fill="none" stroke="#52B788" stroke-width="1.2" stroke-linecap="round"/><circle r="7" fill="#FBBF24"/><circle r="4" fill="#D97706"/><circle r="1.5" fill="#F59E0B"/>`,
  ],
  rose: [
    `<circle r="2.5" fill="#52B788"/><line x1="0" y1="2.5" x2="0" y2="-10" stroke="#2D6A4F" stroke-width="1.5" stroke-linecap="round"/>`,
    `<line x1="0" y1="2.5" x2="0" y2="-20" stroke="#2D6A4F" stroke-width="2" stroke-linecap="round"/><path d="M-6,-16 Q0,-21 6,-16" fill="none" stroke="#52B788" stroke-width="1.2" stroke-linecap="round"/><circle r="4" fill="#FB7185"/><circle r="2" fill="#E11D48"/>`,
    `<line x1="0" y1="2.5" x2="0" y2="-28" stroke="#1B4332" stroke-width="2.5" stroke-linecap="round"/><path d="M-8,-21 Q0,-28 8,-21" fill="none" stroke="#52B788" stroke-width="1.5" stroke-linecap="round"/><path d="M-6,-14 Q0,-19 6,-14" fill="none" stroke="#52B788" stroke-width="1.2" stroke-linecap="round"/><circle r="7" fill="#FB7185"/><circle r="4.5" fill="#E11D48"/><path d="M-3,-24 Q0,-27 3,-24" fill="none" stroke="#FB7185" stroke-width="1"/>`,
  ],
  lotus: [
    `<circle r="2.5" fill="#52B788"/><line x1="0" y1="2.5" x2="0" y2="-10" stroke="#2D6A4F" stroke-width="1.5" stroke-linecap="round"/>`,
    `<line x1="0" y1="2.5" x2="0" y2="-20" stroke="#2D6A4F" stroke-width="2" stroke-linecap="round"/><path d="M-5,-15 Q0,-9 5,-15" fill="none" stroke="#52B788" stroke-width="1.2" stroke-linecap="round"/><ellipse rx="4" ry="2.5" fill="#E9D5FF"/><ellipse rx="2" ry="1.5" fill="#D8B4FE"/>`,
    `<line x1="0" y1="2.5" x2="0" y2="-28" stroke="#1B4332" stroke-width="2.5" stroke-linecap="round"/><path d="M-7,-20 Q0,-28 7,-20" fill="none" stroke="#52B788" stroke-width="1.5" stroke-linecap="round"/><path d="M-5,-13 Q0,-8 5,-13" fill="none" stroke="#52B788" stroke-width="1.2" stroke-linecap="round"/><ellipse rx="6" ry="3.5" fill="#E9D5FF"/><ellipse rx="4" ry="2.5" fill="#D8B4FE"/><ellipse rx="2" ry="1.5" fill="#C4B5FD"/><circle r="1.5" fill="#FBBF24"/>`,
  ],
  cherry: [
    `<circle r="2.5" fill="#52B788"/><line x1="0" y1="2.5" x2="0" y2="-10" stroke="#2D6A4F" stroke-width="1.5" stroke-linecap="round"/>`,
    `<line x1="0" y1="2.5" x2="0" y2="-20" stroke="#2D6A4F" stroke-width="2" stroke-linecap="round"/><path d="M-6,-15 Q0,-20 6,-15" fill="none" stroke="#52B788" stroke-width="1.2" stroke-linecap="round"/><circle r="3.5" fill="#F9A8D4"/><circle r="2" fill="#FB7185"/>`,
    `<line x1="0" y1="2.5" x2="0" y2="-28" stroke="#1B4332" stroke-width="2.5" stroke-linecap="round"/><path d="M-8,-20 Q0,-28 8,-20" fill="none" stroke="#52B788" stroke-width="1.5" stroke-linecap="round"/><path d="M-6,-13 Q0,-18 6,-13" fill="none" stroke="#52B788" stroke-width="1.2" stroke-linecap="round"/><circle r="5.5" fill="#F9A8D4"/><circle r="3.5" fill="#FB7185"/><circle r="1.5" fill="#E11D48"/>`,
  ],
  fern: [
    `<circle r="2.5" fill="#52B788"/><line x1="0" y1="2.5" x2="0" y2="-10" stroke="#2D6A4F" stroke-width="1.5" stroke-linecap="round"/>`,
    `<line x1="0" y1="2.5" x2="0" y2="-20" stroke="#2D6A4F" stroke-width="2" stroke-linecap="round"/><path d="M-5,-12 Q-9,-17 -5,-19" fill="none" stroke="#52B788" stroke-width="1" stroke-linecap="round"/><path d="M5,-12 Q9,-17 5,-19" fill="none" stroke="#52B788" stroke-width="1" stroke-linecap="round"/>`,
    `<line x1="0" y1="2.5" x2="0" y2="-28" stroke="#1B4332" stroke-width="2.5" stroke-linecap="round"/><path d="M-6,-16 Q-11,-22 -6,-25" fill="none" stroke="#52B788" stroke-width="1.2" stroke-linecap="round"/><path d="M6,-16 Q11,-22 6,-25" fill="none" stroke="#52B788" stroke-width="1.2" stroke-linecap="round"/><path d="M-4,-9 Q-8,-14 -4,-16" fill="none" stroke="#40916C" stroke-width="1" stroke-linecap="round"/><path d="M4,-9 Q8,-14 4,-16" fill="none" stroke="#40916C" stroke-width="1" stroke-linecap="round"/>`,
  ],
  hibiscus: [
    `<circle r="2.5" fill="#52B788"/><line x1="0" y1="2.5" x2="0" y2="-10" stroke="#2D6A4F" stroke-width="1.5" stroke-linecap="round"/>`,
    `<line x1="0" y1="2.5" x2="0" y2="-20" stroke="#2D6A4F" stroke-width="2" stroke-linecap="round"/><path d="M-6,-15 Q0,-20 6,-15" fill="none" stroke="#52B788" stroke-width="1.2" stroke-linecap="round"/><circle r="4" fill="#F472B6"/><circle r="2" fill="#EC4899"/>`,
    `<line x1="0" y1="2.5" x2="0" y2="-28" stroke="#1B4332" stroke-width="2.5" stroke-linecap="round"/><path d="M-8,-20 Q0,-28 8,-20" fill="none" stroke="#52B788" stroke-width="1.5" stroke-linecap="round"/><path d="M-6,-13 Q0,-18 6,-13" fill="none" stroke="#52B788" stroke-width="1.2" stroke-linecap="round"/><circle r="6" fill="#F472B6"/><circle r="3.5" fill="#EC4899"/><path d="M-2,-26 L0,-29 L2,-26" fill="none" stroke="#F472B6" stroke-width="1"/>`,
  ],
  moonflower: [
    `<circle r="2.5" fill="#52B788"/><line x1="0" y1="2.5" x2="0" y2="-10" stroke="#2D6A4F" stroke-width="1.5" stroke-linecap="round"/>`,
    `<line x1="0" y1="2.5" x2="0" y2="-20" stroke="#2D6A4F" stroke-width="2" stroke-linecap="round"/><path d="M-5,-14 Q0,-9 5,-14" fill="none" stroke="#52B788" stroke-width="1.2" stroke-linecap="round"/><circle r="3.5" fill="#C4B5FD"/><circle r="2" fill="#A78BFA"/>`,
    `<line x1="0" y1="2.5" x2="0" y2="-28" stroke="#1B4332" stroke-width="2.5" stroke-linecap="round"/><path d="M-7,-19 Q0,-28 7,-19" fill="none" stroke="#52B788" stroke-width="1.5" stroke-linecap="round"/><path d="M-5,-12 Q0,-8 5,-12" fill="none" stroke="#52B788" stroke-width="1.2" stroke-linecap="round"/><circle r="6" fill="#C4B5FD"/><circle r="4" fill="#A78BFA"/><circle r="2" fill="#8B5CF6"/><circle r="1" fill="#FDE68A"/>`,
  ],
  starlily: [
    `<circle r="2.5" fill="#52B788"/><line x1="0" y1="2.5" x2="0" y2="-10" stroke="#2D6A4F" stroke-width="1.5" stroke-linecap="round"/>`,
    `<line x1="0" y1="2.5" x2="0" y2="-20" stroke="#2D6A4F" stroke-width="2" stroke-linecap="round"/><path d="M-6,-13 L0,-20 L6,-13" fill="none" stroke="#52B788" stroke-width="1" stroke-linecap="round"/><circle r="3" fill="#FDE68A"/><circle r="1.5" fill="#FBBF24"/>`,
    `<line x1="0" y1="2.5" x2="0" y2="-28" stroke="#1B4332" stroke-width="2.5" stroke-linecap="round"/><path d="M-8,-18 L0,-28 L8,-18" fill="none" stroke="#52B788" stroke-width="1.2" stroke-linecap="round"/><path d="M-5,-10 L0,-7 L5,-10" fill="none" stroke="#52B788" stroke-width="1" stroke-linecap="round"/><circle r="5" fill="#FDE68A"/><circle r="3" fill="#FBBF24"/><circle r="1.5" fill="#F59E0B"/>`,
  ],
}

const PLANT_NAMES: Record<string, string> = {
  sunflower: 'Sunflower', rose: 'Rose', lotus: 'Lotus',
  cherry: 'Cherry Blossom', fern: 'Fern', hibiscus: 'Hibiscus',
  moonflower: 'Moonflower', starlily: 'Star Lily',
}

const GRID_POSITIONS = [
  { x: 14, y: 58 }, { x: 26, y: 63 }, { x: 36, y: 56 },
  { x: 47, y: 61 }, { x: 57, y: 58 }, { x: 67, y: 64 },
  { x: 77, y: 60 }, { x: 86, y: 62 },
]

function Star({ cx, cy, r, delay }: { cx: number; cy: number; r: number; delay: number }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  if (!visible) return null
  return (
    <circle cx={cx} cy={cy} r={r} fill="#fff" opacity={0.3 + Math.random() * 0.5}>
      <animate attributeName="opacity" values="0.2;1;0.2" dur={`${2 + Math.random() * 3}s`} repeatCount="indefinite" />
    </circle>
  )
}

function Firefly({ cx, cy }: { cx: number; cy: number }) {
  const dx = (Math.random() - 0.5) * 30
  const dy = (Math.random() - 0.5) * 20 - 10
  return (
    <circle cx={cx} cy={cy} r={1.2} fill="#C8B6FF" opacity="0.8">
      <animate attributeName="cx" values={`${cx};${cx + dx};${cx}`} dur={`${3 + Math.random() * 4}s`} repeatCount="indefinite" />
      <animate attributeName="cy" values={`${cy};${cy + dy};${cy}`} dur={`${3 + Math.random() * 4}s`} repeatCount="indefinite" />
      <animate attributeName="opacity" values="0;1;0.8;0" dur={`${3 + Math.random() * 4}s`} repeatCount="indefinite" />
    </circle>
  )
}

function PondRipple() {
  return (
    <ellipse cx={50} cy={55} rx={8} ry={2.5} fill="none" stroke="#1a5276" strokeWidth={0.3} opacity="0.4">
      <animate attributeName="rx" values="6;14;6" dur="6s" repeatCount="indefinite" />
      <animate attributeName="ry" values="2;4;2" dur="6s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.5;0;0.5" dur="6s" repeatCount="indefinite" />
    </ellipse>
  )
}

export function GardenScene({ plants, onToggle }: GardenSceneProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const stars = useMemo(() =>
    Array.from({ length: 25 }, (_, i) => ({
      cx: 3 + Math.random() * 94,
      cy: 2 + Math.random() * 18,
      r: 0.3 + Math.random() * 0.6,
      delay: i * 200,
    })), [])

  const fireflies = useMemo(() =>
    Array.from({ length: 6 }, () => ({
      cx: 8 + Math.random() * 84,
      cy: 30 + Math.random() * 25,
    })), [])

  return (
    <div className="relative w-full h-full min-h-[360px] rounded-2xl overflow-hidden cursor-pointer group" onClick={onToggle}>
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent pointer-events-none z-10" />

      <svg
        viewBox="0 0 100 72"
        className="w-full h-full transition-transform duration-700 group-hover:scale-[1.02]"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a0a1a" />
            <stop offset="35%" stopColor="#0f1629" />
            <stop offset="70%" stopColor="#0a1a2e" />
            <stop offset="100%" stopColor="#061220" />
          </linearGradient>
          <linearGradient id="auroraGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1B4332" stopOpacity="0" />
            <stop offset="30%" stopColor="#2D6A4F" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#52B788" stopOpacity="0.06" />
            <stop offset="70%" stopColor="#C8B6FF" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#1B4332" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hillGrad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a3a2a" />
            <stop offset="100%" stopColor="#0d2018" />
          </linearGradient>
          <linearGradient id="hillGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1B4332" />
            <stop offset="100%" stopColor="#0a1a12" />
          </linearGradient>
          <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d2818" />
            <stop offset="100%" stopColor="#081810" />
          </linearGradient>
          <radialGradient id="pondGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0d3b5e" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#0a2a4a" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#061830" stopOpacity="0.8" />
          </radialGradient>
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C8B6FF" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#C8B6FF" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#C8B6FF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="moonBody" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#E9D5FF" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#C8B6FF" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.4" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-soft">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect width="100" height="72" fill="url(#skyGrad)" />
        <rect x="0" y="0" width="100" height="30" fill="url(#auroraGrad)" className="animate-float-slow" opacity="0.7" />

        {mounted && stars.map((s, i) => (
          <Star key={i} cx={s.cx} cy={s.cy} r={s.r} delay={s.delay} />
        ))}

        <circle cx="82" cy="10" r="14" fill="url(#moonGlow)" className="animate-glow-pulse" />
        <circle cx="82" cy="10" r="4.5" fill="url(#moonBody)" filter="url(#glow)" />
        <circle cx="80.5" cy="8.5" r="1" fill="#fff" opacity="0.3" />
        <circle cx="83.5" cy="11" r="0.7" fill="#fff" opacity="0.2" />

        <ellipse cx="22" cy="40" rx="30" ry="15" fill="url(#hillGrad1)" />
        <ellipse cx="78" cy="38" rx="34" ry="17" fill="url(#hillGrad2)" />

        <rect x="0" y="46" width="100" height="26" fill="url(#groundGrad)" />

        <rect x="0" y="46" width="100" height="3" fill="url(#hillGrad2)" opacity="0.3" />

        <ellipse cx="50" cy="56" rx="14" ry="4.5" fill="url(#pondGrad)" />
        <PondRipple />

        {/* Grass details */}
        {[15, 25, 35, 45, 55, 65, 75, 85].map((x, i) => (
          <line key={`g${i}`} x1={x} y1={49} x2={x - 1} y2={45 + Math.sin(i) * 2} stroke="#1a3a2a" strokeWidth={0.5} opacity="0.4">
            <animate attributeName="x2" values={`${x - 1};${x + 1};${x - 1}`} dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
          </line>
        ))}

        {mounted && fireflies.map((f, i) => (
          <Firefly key={`ff${i}`} cx={f.cx} cy={f.cy} />
        ))}

        {mounted && plants.map((plant, i) => {
          const pos = GRID_POSITIONS[i] || { x: 10 + (i % 8) * 11, y: 52 + (i % 3) * 4 }
          const svgContent = PLANT_SVG[plant.type]?.[plant.stage] || ''
          const colors = PLANT_COLORS[plant.type] || { flower: '#C8B6FF', center: '#A78BFA', stem: '#2D6A4F' }
          return (
            <g
              key={plant.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              className={plant.stage === 2 ? 'animate-sway' : ''}
              style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
            >
              <g
                dangerouslySetInnerHTML={{ __html: svgContent }}
                className={plant.stage > 0 ? 'animate-bloom' : ''}
                style={{ transformOrigin: '0px 2.5px' }}
              />
              {plant.stage === 2 && (
                <circle cx={0} cy={-28} r={10} fill={colors.flower} opacity="0.08" filter="url(#glow)">
                  <animate attributeName="opacity" values="0.08;0.15;0.08" dur="2.5s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          )
        })}

        {/* Bottom mist */}
        <rect x="0" y="62" width="100" height="10" fill="url(#groundGrad)" opacity="0.5" />
        <ellipse cx="50" cy="64" rx="50" ry="4" fill="#0a1a12" opacity="0.3">
          <animate attributeName="rx" values="40;55;40" dur="8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0.35;0.2" dur="8s" repeatCount="indefinite" />
        </ellipse>
      </svg>

      {plants.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <p className="text-xs text-zinc-500 font-medium animate-fade-in">
            Tap to plant your first seed
          </p>
        </div>
      )}

      {plants.some(p => p.stage > 0) && (
        <div className="absolute top-3 left-3 z-20 pointer-events-none">
          {plants.filter(p => p.stage === 2).map(p => (
            <span key={p.id} className="text-[10px] text-spirit/60 font-medium animate-fade-up block leading-relaxed">
              ✦ {PLANT_NAMES[p.type]} in bloom
            </span>
          ))}
        </div>
      )}

      <div className="absolute bottom-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-[9px] text-zinc-500">tap to switch view</span>
      </div>
    </div>
  )
}
