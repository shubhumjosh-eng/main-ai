'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sparkles, TreePine, MessageCircle, BarChart3, Book, Lock, Crown } from 'lucide-react'
import { unlockStorage, lockStorage, isUnlocked, isVaultCreated } from '@/lib/encrypted-storage'
import { getGame, addPlant, getLevelName, getLevelIndex, addXp, saveGame, checkStreak, type PlantType } from '@/lib/game-storage'
import { isPremium, enablePremium, disablePremium } from '@/lib/premium'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GardenScene } from '@/components/garden-scene'
import { NpcCamera } from '@/components/npc-camera'
import { NpcChat } from '@/components/npc-chat'
import { Dashboard } from '@/components/dashboard'
import { QuestsPanel } from '@/components/quests-panel'
import { MoodTracker } from '@/components/mood-tracker'
import { Journal } from '@/components/journal'
import { EmergencyButton } from '@/components/emergency-button'
import type { Emotion, ChatMessage } from '@/types/emotion'

type Tab = 'garden' | 'spirit' | 'dashboard' | 'tracker' | 'journal'

const TABS: { key: Tab; label: string; icon: typeof Sparkles }[] = [
  { key: 'garden', label: 'Garden', icon: TreePine },
  { key: 'spirit', label: 'Spirit', icon: MessageCircle },
  { key: 'dashboard', label: 'Stats', icon: BarChart3 },
  { key: 'tracker', label: 'Mood', icon: Sparkles },
  { key: 'journal', label: 'Journal', icon: Book },
]

const PLANT_TYPES: PlantType[] = [
  'sunflower', 'rose', 'lotus', 'cherry', 'fern', 'hibiscus', 'moonflower', 'starlily',
]

const PLANT_LABELS: Record<PlantType, string> = {
  sunflower: '🌻 Sunflower',
  rose: '🌹 Rose',
  lotus: '🪷 Lotus',
  cherry: '🌸 Cherry Blossom',
  fern: '🌿 Fern',
  hibiscus: '🌺 Hibiscus',
  moonflower: '🌙 Moonflower',
  starlily: '⭐ Star Lily',
}

const XP_REWARDS: Record<string, number> = {
  mood: 15,
  chat: 10,
  journal: 20,
  plant: 25,
}

export default function Home() {
  const [unlocked, setUnlocked] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [pinInput, setPinInput] = useState(['', '', '', ''])
  const [pinError, setPinError] = useState('')
  const [isNew, setIsNew] = useState(false)
  const [tab, setTab] = useState<Tab>('garden')
  const [emotion, setEmotion] = useState<Emotion>('neutral')
  const [confidence, setConfidence] = useState(0.5)
  const [gameState, setGameState] = useState<Awaited<ReturnType<typeof getGame>> | null>(null)
  const [chats, setChats] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'premium' } | null>(null)

  useEffect(() => {
    const created = isVaultCreated()
    setIsNew(!created)
    setShowPin(true)
    if (created && isUnlocked()) {
      setUnlocked(true)
      setShowPin(false)
      loadGame()
    }
  }, [])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  async function loadGame() {
    const g = await checkStreak()
    setGameState(g)
  }

  async function handlePinSubmit() {
    const pin = pinInput.join('')
    if (pin.length !== 4) { setPinError('Enter a 4-digit PIN'); return }
    const ok = await unlockStorage(pin)
    if (ok) {
      setUnlocked(true)
      setShowPin(false)
      setPinError('')
      setPinInput(['', '', '', ''])
      loadGame()
    } else {
      setPinError('Wrong PIN. Try again.')
      setPinInput(['', '', '', ''])
    }
  }

  function handleLock() {
    lockStorage()
    setUnlocked(false)
    setShowPin(true)
  }

  function handleMoodDetected(mood: Emotion, conf: number) {
    setEmotion(mood)
    setConfidence(conf)
    setTab('spirit')
    showToast(`Mood detected: ${mood}`, 'success')
  }

  function handlePinDigit(idx: number, val: string) {
    if (val && !/^\d$/.test(val)) return
    const next = [...pinInput]
    next[idx] = val
    setPinInput(next)
    setPinError('')
    if (val && idx < 3) {
      const nextInput = document.querySelector<HTMLInputElement>(`[data-pin="${idx + 1}"]`)
      nextInput?.focus()
    }
    if (val && idx === 3) {
      setTimeout(() => handlePinSubmit(), 100)
    }
  }

  function handlePinKey(idx: number, key: string) {
    if (key === 'Backspace' && !pinInput[idx] && idx > 0) {
      const prevInput = document.querySelector<HTMLInputElement>(`[data-pin="${idx - 1}"]`)
      prevInput?.focus()
    }
  }

  function showToast(msg: string, type: 'success' | 'info' | 'premium') {
    setToast({ msg, type })
  }

  const handleChatComplete = useCallback(async () => {
    const { game } = await addXp(10)
    game.totalChats += 1
    await saveGame(game)
    setGameState(game)
    setChats(c => c + 1)
    showToast('+10 XP for chatting!', 'success')
  }, [])

  const handleQuestComplete = useCallback(async () => {
    const g = await getGame()
    setGameState(g)
    showToast('Quest completed!', 'success')
  }, [])

  const handleMoodLog = useCallback(async () => {
    const g = await getGame()
    setGameState(g)
    showToast('+15 XP for logging mood!', 'success')
  }, [])

  const handleJournalSave = useCallback(async () => {
    const g = await getGame()
    setGameState(g)
    showToast('+20 XP for journaling!', 'success')
  }, [])

  async function handleBuyPlant(type: PlantType) {
    const pref = isPremium() ? PLANT_TYPES.slice(0, 8) : PLANT_TYPES.slice(0, 4)
    if (!pref.includes(type)) {
      showToast('Premium only! Upgrade to unlock all plants.', 'premium')
      return
    }
    const needed = gameState && (gameState.xp >= 50)
    if (!needed) {
      showToast('Need 50 XP to buy a plant!', 'info')
      return
    }

    const g = await addPlant(type)
    setGameState(g)
    const { game } = await addXp(-25)
    showToast(`Planted a ${type}!`, 'success')
  }

  if (!unlocked && showPin) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center p-6 bg-gradient-to-b from-zinc-950 via-emerald-950/20 to-zinc-950">
        <div className="w-full max-w-xs flex flex-col items-center gap-6">
          <svg width="64" height="64" viewBox="0 0 100 100" className="spirit-glow">
            <defs>
              <radialGradient id="pinGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#C8B6FF" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#C8B6FF" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="url(#pinGlow)" className="animate-glow" />
            <ellipse cx="50" cy="55" rx="20" ry="18" fill="#C8B6FF" opacity="0.3" />
            <ellipse cx="43" cy="48" rx="3" ry="4" fill="#2d1b69" opacity="0.8" />
            <ellipse cx="57" cy="48" rx="3" ry="4" fill="#2d1b69" opacity="0.8" />
            <path d="M38,58 Q50,68 62,58" fill="none" stroke="#2d1b69" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          </svg>

          <h1 className="font-plus text-2xl font-bold gradient-text text-center">Garden of Solace</h1>

          <p className="text-sm text-zinc-400 text-center">
            {isNew ? 'Create a 4-digit PIN to secure your garden' : 'Enter your PIN to enter the garden'}
          </p>

          <div className="flex gap-3">
            {pinInput.map((digit, idx) => (
              <input
                key={idx}
                data-pin={idx}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handlePinDigit(idx, e.target.value)}
                onKeyDown={e => handlePinKey(idx, e.key)}
                className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
              />
            ))}
          </div>

          {pinError && <p className="text-xs text-red-400">{pinError}</p>}

          <Button onClick={handlePinSubmit} className="w-full" size="lg">
            {isNew ? 'Create Garden' : 'Enter Garden'}
          </Button>
        </div>
      </main>
    )
  }

  if (!unlocked) return null

  return (
    <main className="min-h-dvh pb-20 bg-gradient-to-b from-zinc-950 via-emerald-950/10 to-zinc-950">
      <div className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-plus text-lg font-bold gradient-text">Garden of Solace</h1>
            {gameState && (
              <p className="text-[10px] text-zinc-500">
                {getLevelName(gameState.xp)} · {gameState.xp} XP · {gameState.streak} day streak
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isPremium() ? (
              <span className="text-[10px] text-amber-400 flex items-center gap-1">
                <Crown size={12} /> Premium
              </span>
            ) : (
              <Button
                size="sm"
                variant="premium"
                className="text-[10px] h-7 px-2"
                onClick={() => { enablePremium(); showToast('Premium unlocked for testing!', 'premium'); loadGame() }}
              >
                <Crown size={10} className="mr-1" /> Premium
              </Button>
            )}
            <button onClick={handleLock} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400">
              <Lock size={14} />
            </button>
          </div>
        </header>

        {processing && (
          <div className="text-center py-2">
            <p className="text-xs text-zinc-400 animate-pulse">Spirit reading your expression...</p>
          </div>
        )}

        <GardenScene
          plants={gameState?.plants || []}
          onToggle={() => setTab(tab === 'garden' ? 'tracker' : 'garden')}
        />

        {tab === 'garden' && (
          <Card>
            <div className="flex flex-wrap gap-1.5">
              {(isPremium() ? PLANT_TYPES : PLANT_TYPES.slice(0, 4)).map(type => (
                <button
                  key={type}
                  onClick={() => handleBuyPlant(type)}
                  disabled={!gameState || gameState.xp < 25}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                >
                  {PLANT_LABELS[type]}
                </button>
              ))}
              {!isPremium() && (
                <p className="text-[9px] text-amber-600 w-full mt-1">+ 4 more with Premium</p>
              )}
            </div>
          </Card>
        )}

        {tab === 'spirit' && (
          <Card>
            <NpcCamera onMoodDetected={handleMoodDetected} disabled={processing} setProcessing={setProcessing} />
            <div className="mt-4">
              <NpcChat emotion={emotion} onChatComplete={handleChatComplete} />
            </div>
          </Card>
        )}

        {tab === 'dashboard' && (
          <div className="space-y-3">
            <Dashboard />
            <QuestsPanel onQuestComplete={handleQuestComplete} />
          </div>
        )}

        {tab === 'tracker' && (
          <Card>
            <MoodTracker onLog={handleMoodLog} />
          </Card>
        )}

        {tab === 'journal' && (
          <Card>
            <Journal />
          </Card>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md">
        <div className="max-w-lg mx-auto flex">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] transition-all ${
                  tab === t.key
                    ? 'text-emerald-400'
                    : 'text-zinc-600 hover:text-zinc-400'
                }`}
              >
                <Icon size={18} />
                {t.label}
              </button>
            )
          })}
        </div>
      </nav>

      <EmergencyButton />

      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-sm shadow-2xl animate-bloom ${
            toast.type === 'success'
              ? 'bg-emerald-900/90 text-emerald-200 border border-emerald-800'
              : toast.type === 'premium'
                ? 'bg-amber-900/90 text-amber-200 border border-amber-800'
                : 'bg-zinc-800/90 text-zinc-200 border border-zinc-700'
          }`}
        >
          {toast.type === 'premium' && <Crown size={14} className="inline mr-1.5" />}
          {toast.msg}
        </div>
      )}
    </main>
  )
}
