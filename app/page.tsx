'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Sparkles, TreePine, MessageCircle, BarChart3, Book, Lock, Crown, Flame, Zap, Heart, Star } from 'lucide-react'
import { unlockStorage, lockStorage, isUnlocked, isVaultCreated } from '@/lib/encrypted-storage'
import { getGame, addPlant, getLevelName, getLevelIndex, addXp, saveGame, checkStreak, type PlantType, type GameState } from '@/lib/game-storage'
import { isPremium, enablePremium } from '@/lib/premium'
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
import type { Emotion } from '@/types/emotion'

type Tab = 'garden' | 'spirit' | 'dashboard' | 'tracker' | 'journal'

const TABS: { key: Tab; label: string; icon: typeof Sparkles }[] = [
  { key: 'garden', label: 'Garden', icon: TreePine },
  { key: 'spirit', label: 'Spirit', icon: MessageCircle },
  { key: 'dashboard', label: 'Stats', icon: BarChart3 },
  { key: 'tracker', label: 'Mood', icon: Heart },
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

// ─── Particle Background ───

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cvs = canvas; let animId: number
    const stars: { x: number; y: number; r: number; speed: number; opacity: number }[] = []
    const motes: { x: number; y: number; r: number; vx: number; vy: number; opacity: number; phase: number }[] = []

    function resize() {
      cvs.width = window.innerWidth
      cvs.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 80; i++) {
      stars.push({
        x: cvs.width * Math.random(),
        y: cvs.height * Math.random() * 0.6,
        r: Math.random() * 1.2 + 0.3,
        speed: 0.2 + Math.random() * 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      })
    }

    for (let i = 0; i < 15; i++) {
      motes.push({
        x: cvs.width * Math.random(),
        y: cvs.height * 0.3 + cvs.height * Math.random() * 0.5,
        r: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.1 - Math.random() * 0.2,
        opacity: Math.random() * 0.4 + 0.1,
        phase: Math.random() * Math.PI * 2,
      })
    }

    let time = 0
    function draw() {
    if (!ctx) return
      time += 0.01
      ctx.clearRect(0, 0, cvs.width, cvs.height)

      for (const s of stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(time * s.speed + s.x)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity * twinkle})`
        ctx.fill()
      }

      for (const m of motes) {
        m.x += m.vx
        m.y += m.vy
        if (m.x < 0) m.x = cvs.width
        if (m.x > cvs.width) m.x = 0
        if (m.y < -10) { m.y  = cvs.height + 10; m.x = cvs.width * Math.random() }
        const pulse = 0.6 + 0.4 * Math.sin(time * 2 + m.phase)
        ctx.beginPath()
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 182, 255, ${m.opacity * pulse})`
        ctx.fill()
        ctx.beginPath()
        ctx.arc(m.x, m.y, m.r * 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 182, 255, ${m.opacity * 0.1 * pulse})`
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />
}

// ─── Confetti ───

function Confetti() {
  const colors = ['#52B788', '#95D5B2', '#C8B6FF', '#FBBF24', '#FB7185', '#67E8F9', '#F472B6']
  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {Array.from({ length: 50 }, (_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-12px',
            width: 5 + Math.random() * 7,
            height: 5 + Math.random() * 7,
            backgroundColor: colors[i % colors.length],
            animationDelay: `${Math.random() * 0.8}s`,
            animationDuration: `${2 + Math.random() * 2.5}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  )
}

// ─── Level Up Modal ───

function LevelUpModal({ level, name, onClose }: { level: number; name: string; onClose: () => void }) {
  const [showConfetti, setShowConfetti] = useState(false)
  useEffect(() => {
    setShowConfetti(true)
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-6 animate-fade-in">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" />
      {showConfetti && <Confetti />}
      <div className="relative z-10 text-center max-w-xs animate-scale-bounce">
        <div className="w-28 h-28 mx-auto mb-5 rounded-full bg-gradient-to-br from-emerald-500/20 via-spirit/20 to-amber-500/20 flex items-center justify-center border-2 border-emerald-500/30 animate-float-slow">
          <Crown size={44} className="text-yellow-400 animate-glow-soft" />
        </div>
        <h2 className="font-plus text-3xl font-bold gradient-text mb-1">Level Up!</h2>
        <p className="text-lg text-zinc-200 font-medium mb-1">{name}</p>
        <p className="text-sm text-zinc-500">The garden celebrates your growth</p>
      </div>
    </div>
  )
}

// ─── Main Component ───

export default function Home() {
  const [unlocked, setUnlocked] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [pinInput, setPinInput] = useState('lrx')
  const [pinError, setPinError] = useState('')
  const [isNew, setIsNew] = useState(false)
  const [tab, setTab] = useState<Tab>('garden')
  const [emotion, setEmotion] = useState<Emotion>('neutral')
  const [processing, setProcessing] = useState(false)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'premium' } | null>(null)
  const [levelUp, setLevelUp] = useState<{ level: number; name: string } | null>(null)
  const [loaded, setLoaded] = useState(false)
  const mainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const created = isVaultCreated()
    setIsNew(!created)
    setShowPin(true)
    if (created && isUnlocked()) {
      setUnlocked(true)
      setShowPin(false)
      loadGame().then(() => setTimeout(() => setLoaded(true), 200))
    } else if (!created) {
      setTimeout(() => setLoaded(true), 200)
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
    setTab('spirit')
    showToast(`Spirit senses you're ${mood}`, 'success')
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
      showToast('Unlock with Premium', 'premium')
      return
    }
    if (!gameState || gameState.xp < 25) {
      showToast('Need 25 XP', 'info')
      return
    }
    const g = await addPlant(type)
    setGameState(g)
    const { game } = await addXp(-25)
    showToast(`🌱 Planted!`, 'success')
  }

  // ─── PIN Screen ───

  if (!unlocked && showPin) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center p-6 relative bg-[#050508]">
        <ParticleBackground />
        <div className="relative z-10 w-full max-w-xs flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/10 via-spirit/10 to-amber-500/10 flex items-center justify-center border border-white/5 animate-float-slow">
              <svg width="48" height="48" viewBox="0 0 100 100">
                <defs>
                  <radialGradient id="pGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#C8B6FF" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#C8B6FF" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="45" fill="url(#pGlow)" className="animate-glow-pulse" />
                <ellipse cx="50" cy="54" rx="20" ry="18" fill="#C8B6FF" opacity="0.2" />
                <ellipse cx="43" cy="48" rx="3" ry="4" fill="#1a1040" opacity="0.8" />
                <ellipse cx="57" cy="48" rx="3" ry="4" fill="#1a1040" opacity="0.8" />
                <path d="M38,58 Q50,68 62,58" fill="none" stroke="#1a1040" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
              </svg>
            </div>
            <div className="absolute -inset-4 rounded-full bg-spirit/5 animate-pulse-ring" />
          </div>

          <h1 className="font-plus text-3xl font-bold gradient-text text-center">Garden of Solace</h1>
          <p className="text-sm text-zinc-500 text-center -mt-4">
            {isNew ? 'Choose a passphrase to begin' : 'Welcome back'}
          </p>

          <input
            type="password"
            value={pinInput}
            onChange={e => { setPinInput(e.target.value); setPinError('') }}
            onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}
            placeholder="Enter passphrase"
            className="w-full h-12 text-center text-lg rounded-2xl bg-white/5 border border-white/10 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600/50 transition-all tracking-wider"
            autoFocus
          />

          {pinError && (
            <p className="text-xs text-red-400">
              {pinError}
              {!isNew && (
                <button onClick={handleReset} className="ml-2 underline text-zinc-500 hover:text-zinc-300">Reset?</button>
              )}
            </p>
          )}

          <Button onClick={handlePinSubmit} className="w-full h-12 text-base" size="lg">
            {isNew ? 'Enter the Garden' : 'Enter'}
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

  // ─── Game ───

  const levelName = gameState ? getLevelName(gameState.xp) : 'Seedling'

  return (
    <main ref={mainRef} className="min-h-dvh pb-28 relative bg-[#050508]">
      <ParticleBackground />
      {levelUp && <LevelUpModal level={levelUp.level} name={levelUp.name} onClose={() => setLevelUp(null)} />}

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-4 pb-4 space-y-4">
        {/* HUD */}
        <div className={`glass-hud rounded-2xl px-4 py-3 flex items-center justify-between ${loaded ? 'animate-slide-down' : 'opacity-0'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-spirit/20 flex items-center justify-center border border-white/5">
              <Star size={16} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 leading-tight">{levelName}</p>
              <p className="text-sm font-semibold text-zinc-100">{gameState?.xp || 0} XP</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-zinc-500 leading-tight">Streak</p>
              <p className="text-sm font-semibold flex items-center gap-1 text-orange-400">
                <Flame size={13} /> {gameState?.streak || 0}
              </p>
            </div>
            <div className="w-px h-8 bg-white/5" />
            <div className="flex items-center gap-1.5">
              {isPremium() ? (
                <span className="text-[10px] text-amber-400 flex items-center gap-1 bg-amber-900/20 px-2 py-1 rounded-full">
                  <Crown size={10} /> Premium
                </span>
              ) : (
                <button
                  onClick={() => { enablePremium(); showToast('Premium unlocked', 'premium'); loadGame() }}
                  className="text-[10px] flex items-center gap-1 bg-amber-900/10 hover:bg-amber-900/20 text-amber-500 px-2 py-1 rounded-full transition-colors"
                >
                  <Crown size={10} /> Unlock
                </button>
              )}
              <button onClick={handleLock} className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-600 hover:text-zinc-400 transition-colors">
                <Lock size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Processing */}
        {processing && (
          <div className="flex justify-center animate-fade-in">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-hud">
              <div className="w-2 h-2 rounded-full bg-spirit animate-glow-soft" />
              <p className="text-xs text-spirit/70">Reading your expression...</p>
            </div>
          </div>
        )}

        {/* Garden */}
        <div className={`${loaded ? 'animate-scale-in' : 'opacity-0'}`}>
          <GardenScene
            plants={gameState?.plants || []}
            onToggle={() => setTab(tab === 'garden' ? 'tracker' : 'garden')}
          />
        </div>

        {/* Plant Shop */}
        {tab === 'garden' && loaded && (
          <div className="animate-slide-up">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-plus text-xs text-zinc-400 font-medium uppercase tracking-widest">Nursery</h3>
                <span className="text-[10px] text-zinc-600">25 XP each</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(isPremium() ? PLANT_TYPES : PLANT_TYPES.slice(0, 4)).map(type => (
                  <button
                    key={type}
                    onClick={() => handleBuyPlant(type)}
                    disabled={!gameState || gameState.xp < 25}
                    className="text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-white/5 hover:border-emerald-800/40 active:scale-95"
                  >
                    {PLANT_LABELS[type]}
                  </button>
                ))}
              </div>
              {!isPremium() && (
                <p className="text-[9px] text-amber-700 mt-2 text-center">+ 4 premium plants with Crown</p>
              )}
            </Card>
          </div>
        )}

        {/* Spirit */}
        {tab === 'spirit' && loaded && (
          <div className="animate-slide-up">
            <Card className="p-4">
              <div className="flex flex-col items-center gap-4">
                <NpcCamera onMoodDetected={handleMoodDetected} disabled={processing} setProcessing={setProcessing} />
                <div className="w-full border-t border-white/5 pt-4">
                  <NpcChat emotion={emotion} onChatComplete={handleChatComplete} />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Dashboard */}
        {tab === 'dashboard' && loaded && (
          <div className="space-y-3">
            <div className="animate-slide-up"><Dashboard /></div>
            <div className="animate-slide-up" style={{ animationDelay: '0.08s' }}>
              <Card className="p-4"><QuestsPanel onQuestComplete={handleQuestComplete} /></Card>
            </div>
          </div>
        )}

        {/* Mood */}
        {tab === 'tracker' && loaded && (
          <div className="animate-slide-up">
            <Card className="p-4"><MoodTracker onLog={handleMoodLog} /></Card>
          </div>
        )}

        {/* Journal */}
        {tab === 'journal' && loaded && (
          <div className="animate-slide-up">
            <Card className="p-4"><Journal /></Card>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-nav">
        <div className="max-w-lg mx-auto flex">
          {TABS.map(t => {
            const Icon = t.icon
            const active = tab === t.key
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-[10px] transition-all duration-200 relative ${
                  active ? 'text-emerald-400' : 'text-zinc-600 hover:text-zinc-400'
                }`}
              >
                {active && <span className="absolute -top-px left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-emerald-500 via-leaf to-spirit" />}
                <div className={active ? 'animate-tab-bounce' : ''}>
                  <Icon size={20} />
                </div>
                <span className={active ? 'font-medium' : ''}>{t.label}</span>
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
              ? 'bg-emerald-900/70 text-emerald-200 border border-emerald-800/40 backdrop-blur-md'
              : toast.type === 'premium'
                ? 'bg-amber-900/70 text-amber-200 border border-amber-800/40 backdrop-blur-md'
                : 'bg-zinc-800/70 text-zinc-200 border border-zinc-700/40 backdrop-blur-md'
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
