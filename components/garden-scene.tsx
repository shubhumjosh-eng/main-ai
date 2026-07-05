'use client'

import { useEffect, useState } from 'react'
import type { Plant } from '@/lib/game-storage'

interface GardenSceneProps {
  plants: Plant[]
  onToggle: () => void
}

const PLANT_SVG: Record<string, string[]> = {
  sunflower: [
    `<g transform="translate(0,0)"><circle r="2" fill="#52B788"/><line x1="0" y1="2" x2="0" y2="-8" stroke="#52B788" stroke-width="1"/></g>`,
    `<g transform="translate(0,0)"><line x1="0" y1="2" x2="0" y2="-16" stroke="#2D6A4F" stroke-width="1.5"/><path d="M-6,-14 Q0,-18 6,-14" fill="none" stroke="#52B788" stroke-width="1"/><circle r="3" fill="#FBBF24"/></g>`,
    `<g transform="translate(0,0)"><line x1="0" y1="2" x2="0" y2="-24" stroke="#2D6A4F" stroke-width="2"/><path d="M-8,-20 Q0,-26 8,-20" fill="none" stroke="#52B788" stroke-width="1.2"/><path d="M-6,-14 Q0,-18 6,-14" fill="none" stroke="#52B788" stroke-width="1"/><circle r="5" fill="#FBBF24"/><circle r="3" fill="#D97706"/></g>`,
  ],
  rose: [
    `<g transform="translate(0,0)"><circle r="2" fill="#52B788"/><line x1="0" y1="2" x2="0" y2="-8" stroke="#52B788" stroke-width="1"/></g>`,
    `<g transform="translate(0,0)"><line x1="0" y1="2" x2="0" y2="-16" stroke="#2D6A4F" stroke-width="1.5"/><path d="M-5,-12 Q0,-8 5,-12" fill="none" stroke="#52B788" stroke-width="1"/><circle r="3" fill="#FB7185"/></g>`,
    `<g transform="translate(0,0)"><line x1="0" y1="2" x2="0" y2="-24" stroke="#2D6A4F" stroke-width="2"/><path d="M-7,-18 Q0,-24 7,-18" fill="none" stroke="#52B788" stroke-width="1.2"/><path d="M-5,-12 Q0,-8 5,-12" fill="none" stroke="#52B788" stroke-width="1"/><circle r="5" fill="#FB7185"/><circle r="3" fill="#E11D48"/></g>`,
  ],
  lotus: [
    `<g transform="translate(0,0)"><circle r="2" fill="#52B788"/><line x1="0" y1="2" x2="0" y2="-8" stroke="#52B788" stroke-width="1"/></g>`,
    `<g transform="translate(0,0)"><line x1="0" y1="2" x2="0" y2="-16" stroke="#2D6A4F" stroke-width="1.5"/><path d="M-4,-12 Q0,-6 4,-12" fill="none" stroke="#52B788" stroke-width="1"/><ellipse rx="3" ry="2" fill="#E9D5FF"/></g>`,
    `<g transform="translate(0,0)"><line x1="0" y1="2" x2="0" y2="-24" stroke="#2D6A4F" stroke-width="2"/><path d="M-6,-18 Q0,-24 6,-18" fill="none" stroke="#52B788" stroke-width="1.2"/><path d="M-4,-12 Q0,-6 4,-12" fill="none" stroke="#52B788" stroke-width="1"/><ellipse rx="5" ry="3" fill="#E9D5FF"/><ellipse rx="3" ry="2" fill="#D8B4FE"/><circle r="1.5" fill="#FBBF24"/></g>`,
  ],
  cherry: [
    `<g transform="translate(0,0)"><circle r="2" fill="#52B788"/><line x1="0" y1="2" x2="0" y2="-8" stroke="#52B788" stroke-width="1"/></g>`,
    `<g transform="translate(0,0)"><line x1="0" y1="2" x2="0" y2="-16" stroke="#2D6A4F" stroke-width="1.5"/><path d="M-5,-12 Q0,-16 5,-12" fill="none" stroke="#52B788" stroke-width="1"/><circle r="2.5" fill="#F9A8D4"/></g>`,
    `<g transform="translate(0,0)"><line x1="0" y1="2" x2="0" y2="-24" stroke="#2D6A4F" stroke-width="2"/><path d="M-7,-18 Q0,-24 7,-18" fill="none" stroke="#52B788" stroke-width="1.2"/><path d="M-5,-12 Q0,-16 5,-12" fill="none" stroke="#52B788" stroke-width="1"/><circle r="4" fill="#F9A8D4"/><circle r="2.5" fill="#FB7185"/></g>`,
  ],
  fern: [
    `<g transform="translate(0,0)"><circle r="2" fill="#52B788"/><line x1="0" y1="2" x2="0" y2="-8" stroke="#52B788" stroke-width="1"/></g>`,
    `<g transform="translate(0,0)"><line x1="0" y1="2" x2="0" y2="-16" stroke="#2D6A4F" stroke-width="1.5"/><path d="M-4,-10 Q-8,-14 -4,-16" fill="none" stroke="#52B788" stroke-width="0.8"/><path d="M4,-10 Q8,-14 4,-16" fill="none" stroke="#52B788" stroke-width="0.8"/></g>`,
    `<g transform="translate(0,0)"><line x1="0" y1="2" x2="0" y2="-24" stroke="#2D6A4F" stroke-width="2"/><path d="M-5,-14 Q-10,-18 -5,-22" fill="none" stroke="#52B788" stroke-width="0.8"/><path d="M5,-14 Q10,-18 5,-22" fill="none" stroke="#52B788" stroke-width="0.8"/><path d="M-3,-8 Q-7,-12 -3,-14" fill="none" stroke="#52B788" stroke-width="0.8"/><path d="M3,-8 Q7,-12 3,-14" fill="none" stroke="#52B788" stroke-width="0.8"/></g>`,
  ],
  hibiscus: [
    `<g transform="translate(0,0)"><circle r="2" fill="#52B788"/><line x1="0" y1="2" x2="0" y2="-8" stroke="#52B788" stroke-width="1"/></g>`,
    `<g transform="translate(0,0)"><line x1="0" y1="2" x2="0" y2="-16" stroke="#2D6A4F" stroke-width="1.5"/><path d="M-5,-12 Q0,-16 5,-12" fill="none" stroke="#52B788" stroke-width="1"/><circle r="3" fill="#F472B6"/></g>`,
    `<g transform="translate(0,0)"><line x1="0" y1="2" x2="0" y2="-24" stroke="#2D6A4F" stroke-width="2"/><path d="M-7,-18 Q0,-24 7,-18" fill="none" stroke="#52B788" stroke-width="1.2"/><path d="M-5,-12 Q0,-16 5,-12" fill="none" stroke="#52B788" stroke-width="1"/><circle r="5" fill="#F472B6"/><circle r="2" fill="#EC4899"/></g>`,
  ],
  moonflower: [
    `<g transform="translate(0,0)"><circle r="2" fill="#52B788"/><line x1="0" y1="2" x2="0" y2="-8" stroke="#52B788" stroke-width="1"/></g>`,
    `<g transform="translate(0,0)"><line x1="0" y1="2" x2="0" y2="-16" stroke="#2D6A4F" stroke-width="1.5"/><path d="M-4,-12 Q0,-8 4,-12" fill="none" stroke="#52B788" stroke-width="1"/><circle r="3" fill="#C4B5FD"/></g>`,
    `<g transform="translate(0,0)"><line x1="0" y1="2" x2="0" y2="-24" stroke="#2D6A4F" stroke-width="2"/><path d="M-6,-18 Q0,-24 6,-18" fill="none" stroke="#52B788" stroke-width="1.2"/><path d="M-4,-12 Q0,-8 4,-12" fill="none" stroke="#52B788" stroke-width="1"/><circle r="5" fill="#C4B5FD"/><circle r="3" fill="#A78BFA"/><circle r="1.5" fill="#FDE68A"/></g>`,
  ],
  starlily: [
    `<g transform="translate(0,0)"><circle r="2" fill="#52B788"/><line x1="0" y1="2" x2="0" y2="-8" stroke="#52B788" stroke-width="1"/></g>`,
    `<g transform="translate(0,0)"><line x1="0" y1="2" x2="0" y2="-16" stroke="#2D6A4F" stroke-width="1.5"/><path d="M-5,-10 L0,-16 L5,-10" fill="none" stroke="#52B788" stroke-width="0.8"/><circle r="2.5" fill="#FDE68A"/></g>`,
    `<g transform="translate(0,0)"><line x1="0" y1="2" x2="0" y2="-24" stroke="#2D6A4F" stroke-width="2"/><path d="M-7,-16 L0,-24 L7,-16" fill="none" stroke="#52B788" stroke-width="1"/><path d="M-4,-10 L0,-6 L4,-10" fill="none" stroke="#52B788" stroke-width="0.8"/><circle r="4" fill="#FDE68A"/><circle r="2.5" fill="#FBBF24"/></g>`,
  ],
}

function getPlantSvg(type: string, stage: number): string {
  const stages = PLANT_SVG[type]
  if (!stages) return ''
  return stages[Math.min(stage, stages.length - 1)]
}

const PLANT_NAMES: Record<string, string> = {
  sunflower: 'Sunflower',
  rose: 'Rose',
  lotus: 'Lotus',
  cherry: 'Cherry Blossom',
  fern: 'Fern',
  hibiscus: 'Hibiscus',
  moonflower: 'Moonflower',
  starlily: 'Star Lily',
}

const GRID_POSITIONS = [
  { x: 15, y: 60 }, { x: 25, y: 65 }, { x: 35, y: 58 },
  { x: 45, y: 63 }, { x: 55, y: 60 }, { x: 65, y: 66 },
  { x: 75, y: 62 }, { x: 85, y: 64 },
]

export function GardenScene({ plants, onToggle }: GardenSceneProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="relative w-full h-full min-h-[320px] rounded-2xl overflow-hidden" onClick={onToggle}>
      <svg
        viewBox="0 0 100 70"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="40%" stopColor="#16213e" />
            <stop offset="100%" stopColor="#0f3460" />
          </linearGradient>
          <linearGradient id="hillGrad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1B4332" />
            <stop offset="100%" stopColor="#0d2818" />
          </linearGradient>
          <linearGradient id="hillGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2D6A4F" />
            <stop offset="100%" stopColor="#1B4332" />
          </linearGradient>
          <linearGradient id="pondGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a5276" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0d3b5e" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a3a2a" />
            <stop offset="100%" stopColor="#0d2018" />
          </linearGradient>
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C8B6FF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#C8B6FF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect width="100" height="70" fill="url(#skyGrad)" />

        <circle cx="80" cy="12" r="8" fill="url(#moonGlow)" />
        <circle cx="80" cy="12" r="3" fill="#E9D5FF" opacity="0.9" filter="url(#glow)" />

        {mounted && [1,2,3,4,5,6,7,8,9,10].map((_, i) => (
          <circle
            key={i}
            cx={10 + Math.random() * 80}
            cy={3 + Math.random() * 12}
            r={0.3 + Math.random() * 0.5}
            fill="#fff"
            opacity={0.3 + Math.random() * 0.5}
            filter="url(#glow)"
          />
        ))}

        <ellipse cx="20" cy="38" rx="28" ry="14" fill="url(#hillGrad1)" />
        <ellipse cx="80" cy="36" rx="32" ry="16" fill="url(#hillGrad2)" />

        <rect x="0" y="45" width="100" height="25" fill="url(#groundGrad)" />

        <ellipse cx="50" cy="55" rx="12" ry="4" fill="url(#pondGrad)" />

        <path d="M30,45 Q35,42 40,45 Q45,42 50,45" fill="none" stroke="#2D6A4F" strokeWidth="0.3" opacity="0.5" />
        <path d="M55,47 Q60,44 65,47 Q70,44 75,47" fill="none" stroke="#2D6A4F" strokeWidth="0.3" opacity="0.5" />

        {plants.map((plant, i) => {
          const pos = GRID_POSITIONS[i] || { x: 10 + (i % 8) * 11, y: 50 + (i % 3) * 5 }
          const svgContent = getPlantSvg(plant.type, plant.stage)
          const isAnimating = mounted
          return (
            <g
              key={plant.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              className={isAnimating && plant.stage === 2 ? 'animate-sway' : ''}
              style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
            >
              <g
                dangerouslySetInnerHTML={{ __html: svgContent }}
                className={isAnimating && plant.stage > 0 ? 'animate-bloom' : ''}
                style={{ transformOrigin: '0px 2px' }}
              />
            </g>
          )
        })}
      </svg>

      {plants.some(p => p.stage > 0) && (
        <div className="absolute top-2 left-2">
          {plants.filter(p => p.stage === 2).length > 0 && (
            <span className="text-[10px] text-spirit/60 font-medium">
              ✦ {PLANT_NAMES[plants.find(p => p.stage === 2)?.type || '']}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

type GetGardenScene = typeof GardenScene

export { getPlantSvg, PLANT_NAMES, GRID_POSITIONS }
export type { GetGardenScene }
