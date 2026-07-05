'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import { getGame, completeQuest, type QuestId, type GameState } from '@/lib/game-storage'

const QUEST_ICONS: Record<QuestId, string> = {
  'speak-spirit': '💬',
  'log-mood': '📊',
  'write-journal': '📝',
  'meditate': '🧘',
  'water-garden': '💧',
  'read-article': '📖',
  'breathe': '🌬️',
  'review-mood': '📈',
}

interface QuestsPanelProps {
  onQuestComplete?: () => void
}

export function QuestsPanel({ onQuestComplete }: QuestsPanelProps) {
  const [game, setGame] = useState<GameState | null>(null)

  useEffect(() => {
    getGame().then(setGame)
  }, [])

  async function handleComplete(questId: QuestId) {
    const updated = await completeQuest(questId)
    setGame(updated)
    onQuestComplete?.()
  }

  if (!game) return null
  const allDone = game.quests.every(q => q.done)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-plus text-sm font-semibold text-zinc-200">Daily Quests</h3>
        {allDone && (
          <span className="text-[10px] text-emerald-400 font-medium">✓ All done! +20 bonus XP</span>
        )}
      </div>
      {game.quests.map((quest) => (
        <button
          key={quest.id}
          onClick={() => !quest.done && handleComplete(quest.id)}
          disabled={quest.done}
          className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
            quest.done
              ? 'bg-emerald-900/20 opacity-50'
              : 'bg-zinc-800/40 hover:bg-zinc-800 cursor-pointer'
          }`}
        >
          <span className="text-base">{QUEST_ICONS[quest.id] || '🌱'}</span>
          <span className="flex-1 text-sm text-zinc-300">{quest.label}</span>
          <span className="text-[10px] text-zinc-500">+{quest.xp} XP</span>
          {quest.done ? (
            <CheckCircle2 size={16} className="text-emerald-500" />
          ) : (
            <Circle size={16} className="text-zinc-600" />
          )}
        </button>
      ))}
    </div>
  )
}
