'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Flame, Star, Zap, Crown, TrendingUp } from 'lucide-react'
import { getGame, getLevelName, getLevelIndex, checkStreak, type GameState } from '@/lib/game-storage'
import { isPremium } from '@/lib/premium'
import { Card, CardTitle } from '@/components/ui/card'

const LEVEL_NAMES = ['Seedling', 'Sprout', 'Bloom', 'Blossom', 'Grove', 'Garden', 'Sanctuary', 'Paradise']

function XpBar({ current, next, xp }: { current: number; next: number; xp: number }) {
  const needed = next - current
  const earned = xp - current
  const pct = Math.min(100, Math.max(0, Math.round((earned / needed) * 100)))
  const [anim, setAnim] = useState(false)
  useEffect(() => { setTimeout(() => setAnim(true), 300) }, [])

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-zinc-500">XP Progress</span>
        <span className="text-[10px] text-zinc-500">{xp} / {next} XP</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-800/60 overflow-hidden relative">
        <div
          className="h-full rounded-full relative"
          style={{
            width: anim ? `${pct}%` : '0%',
            background: 'linear-gradient(90deg, #52B788, #95D5B2, #C8B6FF)',
            transition: 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" style={{ transform: 'skewX(-20deg) translateX(-100%)', animation: 'shimmer 2s ease-in-out infinite' }} />
        </div>
      </div>
    </div>
  )
}

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

  const levelIdx = getLevelIndex(game.xp)
  const levelName = getLevelName(game.xp)
  const nextXp = LEVEL_NAMES[levelIdx + 1] ? (levelIdx + 1) * 200 : levelIdx * 200
  const currentXp = levelIdx * 200

  return (
    <div className="space-y-3 stagger">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-700/20 flex items-center justify-center border border-emerald-700/20">
              <Star size={18} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Level</p>
              <p className="font-plus text-lg font-bold text-zinc-100">{levelName}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-zinc-100">{game.xp}</p>
            <p className="text-[10px] text-zinc-500">total XP</p>
          </div>
        </div>
        <XpBar current={currentXp} next={nextXp} xp={game.xp} />
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={16} className="text-orange-400" />
            <span className="text-xs text-zinc-500">Streak</span>
          </div>
          <p className="font-space text-2xl font-bold text-zinc-100">
            {game.streak}
            <span className="text-sm text-zinc-500 ml-1">{game.streak === 1 ? 'day' : 'days'}</span>
          </p>
          {game.streak >= 3 && (
            <p className="text-[10px] text-orange-400 mt-1">🔥 On fire! Keep going!</p>
          )}
          {game.streak >= 7 && (
            <p className="text-[10px] text-amber-400 mt-1">⭐ Weekly streak! +50 XP bonus</p>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-emerald-400" />
            <span className="text-xs text-zinc-500">Activity</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Moods</span>
              <span className="text-zinc-200">{game.totalMoods}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Journals</span>
              <span className="text-zinc-200">{game.totalJournals}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Chats</span>
              <span className="text-zinc-200">{game.totalChats}</span>
            </div>
          </div>
        </Card>
      </div>

      {premium && (
        <Card className="p-4 glass-card-premium">
          <div className="flex items-center gap-2 mb-1">
            <Crown size={16} className="text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">Premium Active</span>
          </div>
          <p className="text-xs text-zinc-400">All plant types unlocked. Unlimited garden plots. Priority spirit responses.</p>
        </Card>
      )}
    </div>
  )
}
