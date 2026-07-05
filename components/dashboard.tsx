'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Flame, Star, Zap } from 'lucide-react'
import { getGame, getLevelName, getLevelIndex, checkStreak, type GameState } from '@/lib/game-storage'
import { isPremium } from '@/lib/premium'
import { Card } from '@/components/ui/card'

export function Dashboard() {
  const [game, setGame] = useState<GameState | null>(null)
  const [premium, setPremium] = useState(false)

  useEffect(() => {
    async function load() {
      const g = await checkStreak()
      setGame(g)
      setPremium(isPremium())
    }
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  if (!game) return null

  const level = getLevelIndex(game.xp)
  const levelName = getLevelName(game.xp)
  const nextXp = (level + 1) * 200
  const xpInLevel = game.xp - level * 200
  const xpNeeded = nextXp - level * 200
  const progress = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100))

  return (
    <div className="grid grid-cols-2 gap-2">
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <Star size={14} className="text-yellow-400" />
          <span className="text-xs text-zinc-400">Level</span>
        </div>
        <p className="font-space text-lg font-bold text-zinc-100">{levelName}</p>
        <div className="mt-1.5 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-leaf transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-[10px] text-zinc-500 mt-1">{game.xp} XP</p>
      </Card>

      <Card className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <Flame size={14} className="text-orange-400" />
          <span className="text-xs text-zinc-400">Streak</span>
        </div>
        <p className="font-space text-lg font-bold text-zinc-100">{game.streak} {game.streak === 1 ? 'day' : 'days'}</p>
        <p className="text-[10px] text-zinc-500 mt-1">
          {progress >= 100 ? '🔥 On fire!' : `${progress}% to next level`}
        </p>
      </Card>

      {premium && (
        <Card className="p-3 col-span-2 border-amber-800/40">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-amber-400" />
            <span className="text-xs text-amber-400">Premium</span>
          </div>
          <p className="text-xs text-zinc-400">Unlimited garden plots & all plant types unlocked.</p>
        </Card>
      )}
    </div>
  )
}
