'use client'

import { useState, useEffect } from 'react'
import { getItem, setItem } from '@/lib/encrypted-storage'
import { addXp, saveGame, getGame } from '@/lib/game-storage'
import type { Emotion } from '@/types/emotion'

const EMOTIONS: { key: Emotion; label: string; color: string }[] = [
  { key: 'happy', label: 'Happy', color: '#B794F4' },
  { key: 'sad', label: 'Sad', color: '#818CF8' },
  { key: 'angry', label: 'Angry', color: '#FCA5A5' },
  { key: 'anxious', label: 'Anxious', color: '#67E8F9' },
  { key: 'surprised', label: 'Surprised', color: '#FDE68A' },
  { key: 'neutral', label: 'Neutral', color: '#C8B6FF' },
]

interface MoodEntry {
  emotion: Emotion
  timestamp: number
  note?: string
}

interface MoodTrackerProps {
  onLog?: () => void
}

export function MoodTracker({ onLog }: MoodTrackerProps) {
  const [todayMood, setTodayMood] = useState<Emotion | null>(null)
  const [recent, setRecent] = useState<MoodEntry[]>([])

  useEffect(() => {
    getItem<MoodEntry[]>('gv-moods', []).then(moods => {
      const today = new Date().toDateString()
      const todaysEntry = moods.find(m => new Date(m.timestamp).toDateString() === today)
      if (todaysEntry) setTodayMood(todaysEntry.emotion)
      setRecent(moods.slice(-7).reverse())
    })
  }, [])

  async function logMood(emotion: Emotion) {
    const moods = await getItem<MoodEntry[]>('gv-moods', [])
    const entry: MoodEntry = { emotion, timestamp: Date.now() }
    moods.push(entry)
    await setItem('gv-moods', moods)
    setTodayMood(emotion)
    setRecent(moods.slice(-7).reverse())

    const { game } = await addXp(15)
    game.totalMoods += 1
    await saveGame(game)
    onLog?.()
  }

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-plus text-sm font-semibold text-zinc-200">{todayStr}</h3>
        {todayMood && (
          <span className="text-[10px] text-emerald-400">Logged today ✓</span>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {EMOTIONS.map(e => (
          <button
            key={e.key}
            onClick={() => !todayMood && logMood(e.key)}
            disabled={!!todayMood}
            className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs transition-all ${
              todayMood === e.key
                ? 'bg-emerald-800/40 border border-emerald-700'
                : todayMood
                  ? 'opacity-30 cursor-not-allowed'
                  : 'bg-zinc-800/40 hover:bg-zinc-800 cursor-pointer border border-transparent hover:border-zinc-700'
            }`}
          >
            <span className="text-lg">{getEmoji(e.key)}</span>
            <span className="text-[10px] text-zinc-400">{e.label}</span>
          </button>
        ))}
      </div>

      {recent.length > 0 && (
        <div className="flex gap-1.5 items-end h-8">
          {recent.map((m, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm transition-all"
              style={{
                height: `${Math.max(25, 100 - i * 8)}%`,
                backgroundColor: EMOTIONS.find(e => e.key === m.emotion)?.color || '#C8B6FF',
                opacity: 0.3 + (1 - i * 0.08),
              }}
              title={new Date(m.timestamp).toLocaleDateString()}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function getEmoji(emotion: Emotion): string {
  const map: Record<Emotion, string> = {
    happy: '😊',
    sad: '😢',
    angry: '😤',
    anxious: '😰',
    surprised: '😮',
    neutral: '😌',
  }
  return map[emotion] || '😌'
}
