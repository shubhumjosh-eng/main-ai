'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Sparkles, TreePine, MessageCircle, BarChart3, Book, Lock, Crown, ChevronDown, Flame } from 'lucide-react'
import { unlockStorage, lockStorage, isUnlocked, isVaultCreated } from '@/lib/encrypted-storage'
import { getGame, addPlant, getLevelName, getLevelIndex, addXp, saveGame, checkStreak, type PlantType, type GameState } from '@/lib/game-storage'
import { isPremium, enablePremium } from '@/lib/premium'
import { Button } from '@/components/ui/button'
import { Card, CardTitle, CardHeader } from '@/components/ui/card'
import { GardenScene } from '@/components/garden-scene'
import { NpcCamera } from '@/components/npc-camera'
import { NpcChat } from '@/components/npc-chat'
import { Dashboard } from '@/components/dashboard'
import { QuestsPanel } from '@/components/quests-panel'
import { MoodTracker } from '@/components/mood-tracker'
import { Journal } from '@/components/journal'
import { EmergencyButton } from '@/components/emergency-button'
import type { Emotion } from '@/types/emotion'

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
  sunflower: '🌻 Sunflower', rose: '🌹 Rose', lotus: '🪷 Lotus',
  cherry: '🌸 Cherry Blossom', fern: '🌿 Fern', hibiscus: '🌺 Hibiscus',
  moonflower: '🌙 Moonflower', starlily: '⭐ Star Lily',
}

function Confetti() {
  const colors = ['#52B788', '#95D5B2', '#C8B6FF', '#FBBF24', '#FB7185', '#67E8F9']
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    size: 5 + Math.random() * 6,
    rotation: Math.random() * 360,
  }))
  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  )
}

function LevelUpModal({ level, name, onClose }: { level: number; name: string; onClose: () => void }) {
  const [showConfetti, setShowConfetti] = useState(false)
  useEffect(() => {
    setShowConfetti(true)
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 animate-fade-in">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
      {showConfetti && <Confetti />}
      <div className="relative z-10 text-center animate-scale-in">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500/30 to-spirit/30 flex items-center justify-center border border-emerald-500/30 animate-bloom">
          <Crown size={40} className="text-yellow-400 animate-glow-soft" />
        </div>
        <h2 className="font-plus text-2xl font-bold text-zinc-100 mb-1">Level Up!</h2>
        <p className="text-lg gradient-text font-bold mb-1">You reached {name}</p>
        <p className="text-sm text-zinc-400">The garden celebrates your growth</p>
      </div>
    </div>
  )
}

export default function Home() {
  const [unlocked, setUnlocked] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [pinInput, setPinInput] = useState('lrx')
  const [pinError, setPinError] = useState('')
  const [isNew, setIsNew] = useState(false)
  const [tab, setTab] = useState<Tab>('garden')
  const [prevTab, setPrevTab] = useState<Tab>('garden')
  const [emotion, setEmotion] = useState<Emotion>('neutral')
  const [processing, setProcessing] = useState(false)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'premium' } | null>(null)
  const [levelUp, setLevelUp] = useState<{ level: number; name: string } | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const created = isVaultCreated()
    setIsNew(!created)
    setShowPin(true)
    if (created && isUnlocked()) {
      setUnlocked(true)
      setShowPin(false)
      loadGame().then(() => setLoaded(true))
    } else if (!created) {
      setLoaded(true)
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
    const pin = pinInput.trim()
    if (!pin) { setPinError('Enter a passphrase'); return }
    const ok = await unlockStorage(pin)
    if (ok) {
      setUnlocked(true)
      setShowPin(false)
      setPinError('')
      await loadGame()
      setTimeout(() => setLoaded(true), 300)
    } else {
      setPinError('Wrong passphrase.')
    }
  }

  function handleReset() {
    localStorage.removeItem('gv-vault-salt')
    localStorage.removeItem('gv-vault')
    localStorage.removeItem('gv-game')
    localStorage.removeItem('gv-moods')
    localStorage.removeItem('gv-journal')
    localStorage.removeItem('gv-premium')
    setPinInput('lrx')
    setPinError('')
    setIsNew(true)
  }

  function handleLock() {
    lockStorage()
    setUnlocked(false)
    setShowPin(true)
    setLoaded(false)
  }

  function handleMoodDetected(mood: Emotion, conf: number) {
    setEmotion(mood)
    switchTab('spirit')
    showToast(`Spirit senses: ${mood}`, 'success')
  }

  function switchTab(newTab: Tab) {
    setPrevTab(tab)
    setTab(newTab)
  }

  function showToast(msg: string, type: 'success' | 'info' | 'premium') {
    setToast({ msg, type })
  }

  const handleChatComplete = useCallback(async () => {
    const { game } = await addXp(10)
    game.totalChats += 1
    await saveGame(game)
    setGameState(game)
    showToast('+10 XP', 'success')
  }, [])

  const handleQuestComplete = useCallback(async () => {
    const g = await getGame()
    setGameState(g)
  }, [])

  const handleMoodLog = useCallback(async () => {
    const g = await getGame()
    setGameState(g)
  }, [])

  async function handleBuyPlant(type: PlantType) {
    const pref = isPremium() ? PLANT_TYPES : PLANT_TYPES.slice(0, 4)
    if (!pref.includes(type)) {
      showToast('Premium only! Tap Crown to unlock.', 'premium')
      return
    }
    if (!gameState || gameState.xp < 25) {
      showToast('Need 25 XP to plant', 'info')
      return
    }
    const g = await addPlant(type)
    setGameState(g)
    const { game } = await addXp(-25)
    showToast(`🌱 Planted ${PLANT_LABELS[type].split(' ')[1] || type}!`, 'success')
  }

  // ─── PIN Screen ────────────────────────────────────────────

  if (!unlocked && showPin) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center p-6 bg-mesh">
        <div className="w-full max-w-xs flex flex-col items-center gap-6">
          <svg width="72" height="72" viewBox="0 0 100 100" className="spirit-glow">
            <defs>
              <radialGradient id="pinGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#C8B6FF" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#C8B6FF" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="url(#pinGlow)" className="animate-glow-pulse" />
            <ellipse cx="50" cy="55" rx="22" ry="20" fill="#C8B6FF" opacity="0.25" />
            <ellipse cx="42" cy="47" rx="3" ry="4.5" fill="#1a1040" opacity="0.8" />
            <ellipse cx="58" cy="47" rx="3" ry="4.5" fill="#1a1040" opacity="0.8" />
            <path d="M36,58 Q50,70 64,58" fill="none" stroke="#1a1040" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
          </svg>

          <h1 className="font-plus text-2xl font-bold gradient-text text-center">Garden of Solace</h1>

          <p className="text-sm text-zinc-500 text-center">
            {isNew ? 'Create a passphrase to secure your garden' : 'Welcome back to your garden'}
          </p>

          <input
            type="password"
            value={pinInput}
            onChange={e => { setPinInput(e.target.value); setPinError('') }}
            onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}
            placeholder="Passphrase"
            className="w-full h-12 text-center text-lg tracking-wider rounded-2xl bg-zinc-900/60 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600/50 transition-all"
            autoFocus
          />

          {pinError && (
            <p className="text-xs text-red-400">
              {pinError}
              {!isNew && (
                <button onClick={handleReset} className="ml-2 underline text-zinc-500 hover:text-zinc-300">
                  Reset garden?
                </button>
              )}
            </p>
          )}

          <Button onClick={handlePinSubmit} className="w-full" size="lg">
            {isNew ? 'Create Garden' : 'Enter Garden'}
          </Button>
          {!isNew && (
            <button onClick={handleReset} className="text-[10px] text-zinc-700 hover:text-zinc-500 transition-colors">
              Forgot passphrase? Start fresh
            </button>
          )}
        </div>
      </main>
    )
  }

  if (!unlocked) return null

  // ─── Main Game ────────────────────────────────────────────

  return (
    <main className="min-h-dvh pb-24 bg-mesh">
      {levelUp && <LevelUpModal level={levelUp.level} name={levelUp.name} onClose={() => setLevelUp(null)} />}

      <div className="max-w-lg mx-auto px-4 pt-5 pb-6 space-y-4">
        {/* Header */}
        <header className={`flex items-center justify-between ${loaded ? 'animate-slide-down' : 'opacity-0'}`}>
          <div>
            <h1 className="font-plus text-xl font-bold gradient-text">Garden of Solace</h1>
            {gameState && (
              <p className="text-[10px] text-zinc-600 flex items-center gap-1.5 mt-0.5">
                <span>{getLevelName(gameState.xp)}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span>{gameState.xp} XP</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span className="flex items-center gap-0.5">
                  <Flame size={10} className="text-orange-500" /> {gameState.streak} day{gameState.streak !== 1 ? 's' : ''}
                </span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isPremium() ? (
              <span className="text-[10px] text-amber-400 flex items-center gap-1 bg-amber-900/20 px-2.5 py-1 rounded-full">
                <Crown size={10} /> Premium
              </span>
            ) : (
              <button
                onClick={() => { enablePremium(); showToast('✨ Premium unlocked!', 'premium'); loadGame() }}
                className="text-[10px] text-amber-500 flex items-center gap-1 bg-amber-900/10 hover:bg-amber-900/20 px-2.5 py-1 rounded-full transition-colors"
              >
                <Crown size={10} /> Premium
              </button>
            )}
            <button onClick={handleLock} className="p-1.5 rounded-lg hover:bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 transition-colors">
              <Lock size={14} />
            </button>
          </div>
        </header>

        {/* Processing indicator */}
        {processing && (
          <div className="text-center py-2 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-spirit/10 border border-spirit/20">
              <div className="w-1.5 h-1.5 rounded-full bg-spirit animate-glow-soft" />
              <p className="text-xs text-spirit/80">Spirit reading your expression...</p>
            </div>
          </div>
        )}

        {/* Garden Scene */}
        <div className={`${loaded ? 'animate-slide-up' : 'opacity-0'}`}>
          <GardenScene
            plants={gameState?.plants || []}
            onToggle={() => switchTab(tab === 'garden' ? 'tracker' : 'garden')}
          />
        </div>

        {/* Plant Shop */}
        {tab === 'garden' && loaded && (
          <div className="animate-slide-up">
            <Card className="p-4">
              <CardHeader className="mb-3">
                <CardTitle className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Plant Nursery</CardTitle>
                <span className="text-[10px] text-zinc-600">25 XP each</span>
              </CardHeader>
              <div className="flex flex-wrap gap-1.5">
                {(isPremium() ? PLANT_TYPES : PLANT_TYPES.slice(0, 4)).map(type => (
                  <button
                    key={type}
                    onClick={() => handleBuyPlant(type)}
                    disabled={!gameState || gameState.xp < 25}
                    className="text-xs px-3 py-1.5 rounded-xl bg-zinc-800/40 hover:bg-zinc-800/80 disabled:opacity-25 disabled:cursor-not-allowed transition-all border border-zinc-800 hover:border-emerald-800/50 active:scale-95"
                  >
                    {PLANT_LABELS[type]}
                  </button>
                ))}
              </div>
              {!isPremium() && (
                <p className="text-[9px] text-amber-700 mt-2 text-center">✦ 4 premium plants with Crown</p>
              )}
            </Card>
          </div>
        )}

        {/* Spirit Tab */}
        {tab === 'spirit' && loaded && (
          <div className="animate-slide-up">
            <Card className="p-4">
              <div className="flex flex-col items-center gap-4">
                <NpcCamera onMoodDetected={handleMoodDetected} disabled={processing} setProcessing={setProcessing} />
                <div className="w-full border-t border-zinc-800/50 pt-4">
                  <NpcChat emotion={emotion} onChatComplete={handleChatComplete} />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Dashboard */}
        {tab === 'dashboard' && loaded && (
          <div className="animate-slide-up">
            <Dashboard />
          </div>
        )}

        {/* Dashboard - Quests */}
        {tab === 'dashboard' && loaded && (
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <Card className="p-4">
              <QuestsPanel onQuestComplete={handleQuestComplete} />
            </Card>
          </div>
        )}

        {/* Mood Tracker */}
        {tab === 'tracker' && loaded && (
          <div className="animate-slide-up">
            <Card className="p-4">
              <MoodTracker onLog={handleMoodLog} />
            </Card>
          </div>
        )}

        {/* Journal */}
        {tab === 'journal' && loaded && (
          <div className="animate-slide-up">
            <Card className="p-4">
              <Journal />
            </Card>
          </div>
        )}
      </div>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-white/5">
        <div className="max-w-lg mx-auto flex">
          {TABS.map(t => {
            const Icon = t.icon
            const isActive = tab === t.key
            return (
              <button
                key={t.key}
                onClick={() => switchTab(t.key)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-[10px] transition-all duration-200 relative ${
                  isActive ? 'text-emerald-400' : 'text-zinc-600 hover:text-zinc-400'
                }`}
              >
                {isActive && (
                  <span className="absolute -top-px left-1/4 right-1/4 h-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-spirit" />
                )}
                <Icon size={18} className={isActive ? 'animate-float' : ''} />
                {t.label}
              </button>
            )
          })}
        </div>
      </nav>

      <EmergencyButton />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl text-sm shadow-2xl animate-slide-down ${
            toast.type === 'success'
              ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-800/50 backdrop-blur-md'
              : toast.type === 'premium'
                ? 'bg-amber-900/80 text-amber-200 border border-amber-800/50 backdrop-blur-md'
                : 'bg-zinc-800/80 text-zinc-200 border border-zinc-700/50 backdrop-blur-md'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'premium' && <Crown size={14} className="text-amber-400" />}
            {toast.type === 'success' && <Sparkles size={14} className="text-emerald-400" />}
            {toast.msg}
          </div>
        </div>
      )}
    </main>
  )
}
