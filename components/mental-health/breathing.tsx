'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'

type Phase = 'inhale' | 'hold' | 'exhale' | 'rest'

interface Pattern {
  name: string
  icon: string
  inhale: number
  hold: number
  exhale: number
  rest: number
}

const PATTERNS: Pattern[] = [
  { name: 'Box Breathing', icon: '📦', inhale: 4, hold: 4, exhale: 4, rest: 4 },
  { name: '4-7-8', icon: '🌊', inhale: 4, hold: 7, exhale: 8, rest: 0 },
  { name: 'Simple', icon: '🌬️', inhale: 4, hold: 0, exhale: 4, rest: 0 },
  { name: 'Deep Calm', icon: '🧘', inhale: 5, hold: 2, exhale: 6, rest: 2 },
]

const PHASE_INFO: Record<Phase, { label: string; color: string }> = {
  inhale: { label: 'Breathe In', color: 'from-cyan-500 to-blue-500' },
  hold: { label: 'Hold', color: 'from-purple-500 to-violet-500' },
  exhale: { label: 'Breathe Out', color: 'from-teal-500 to-emerald-500' },
  rest: { label: 'Rest', color: 'from-amber-500 to-orange-500' },
}

export function BreathingExercise() {
  const [active, setActive] = useState(false)
  const [patternIdx, setPatternIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('inhale')
  const [count, setCount] = useState(0)
  const [rounds, setRounds] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const pattern = PATTERNS[patternIdx]

  useEffect(() => {
    if (!active) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    const totalCycle = pattern.inhale + pattern.hold + pattern.exhale + pattern.rest
    let tick = 0

    const getPhase = (t: number): Phase => {
      if (t < pattern.inhale) return 'inhale'
      t -= pattern.inhale
      if (t < pattern.hold) return 'hold'
      t -= pattern.hold
      if (t < pattern.exhale) return 'exhale'
      return 'rest'
    }

    intervalRef.current = setInterval(() => {
      tick++
      if (tick >= totalCycle) {
        tick = 0
        setRounds(r => r + 1)
      }
      const currentPhase = getPhase(tick)
      setPhase(currentPhase)

      if (currentPhase === 'inhale') setCount(pattern.inhale - tick)
      else if (currentPhase === 'hold') setCount(pattern.hold - (tick - pattern.inhale))
      else if (currentPhase === 'exhale') setCount(pattern.exhale - (tick - pattern.inhale - pattern.hold))
      else setCount(pattern.rest - (tick - pattern.inhale - pattern.hold - pattern.exhale))
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [active, patternIdx])

  const startStop = () => {
    if (active) {
      setActive(false)
      setPhase('inhale')
      setCount(0)
      setRounds(0)
    } else {
      setActive(true)
      setCount(pattern.inhale)
      setRounds(1)
    }
  }

  const phaseInfo = PHASE_INFO[phase]
  const size = 180

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-1.5 flex-wrap">
        {PATTERNS.map((p, i) => (
          <button
            key={p.name}
            onClick={() => { if (!active) setPatternIdx(i) }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${
              patternIdx === i
                ? 'border-cyan-600/50 bg-cyan-900/20 text-cyan-300'
                : 'border-surface-700 text-surface-500 hover:border-surface-600'
            }`}
          >
            {p.icon} {p.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${phaseInfo.color} transition-all duration-1000 ease-in-out ${
              active ? 'animate-pulse-glow' : 'opacity-30'
            }`}
            style={{
              transform: active
                ? `scale(${phase === 'inhale' ? 1.3 : phase === 'hold' ? 1.3 : phase === 'exhale' ? 0.8 : 0.8})`
                : 'scale(1)',
              opacity: active ? 0.7 : 0.2,
              transition: 'transform 1s ease-in-out, opacity 0.5s',
            }}
          />
          <div
            className={`absolute inset-4 rounded-full bg-surface-950 flex items-center justify-center transition-all duration-1000`}
          >
            <div className="text-center">
              <p className="text-3xl font-light text-surface-50 tabular-nums font-mono">
                {count}
              </p>
              {active && (
                <p className="text-[10px] text-surface-400 mt-1">{phaseInfo.label}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center space-y-2">
          <Button onClick={startStop}>
            {active ? 'Stop' : 'Start Breathing'}
          </Button>
          {active && rounds > 0 && (
            <p className="text-[10px] text-surface-500">Round {rounds}</p>
          )}
        </div>
      </div>

      {!active && (
        <div className="p-4 rounded-xl bg-surface-900/40 border border-surface-800/50">
          <p className="text-xs text-surface-400 leading-relaxed">
            Find a comfortable position. Follow the circle — breathe in as it expands,
            hold when it pauses, breathe out as it contracts.
          </p>
        </div>
      )}
    </div>
  )
}
