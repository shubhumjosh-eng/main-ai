'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Sparkles, TreePine, MessageCircle, BarChart3, Book, Lock, Crown,
  Flame, Heart, Star, Plus, X, Camera, Send, ChevronDown
} from 'lucide-react'
import { unlockStorage, lockStorage, isUnlocked, isVaultCreated } from '@/lib/encrypted-storage'
import { getGame, addPlant, getLevelName, getLevelIndex, addXp, saveGame, checkStreak, type PlantType, type GameState } from '@/lib/game-storage'
import { isPremium, enablePremium } from '@/lib/premium'
import { NpcCamera } from '@/components/npc-camera'
import { NpcChat } from '@/components/npc-chat'
import { Dashboard } from '@/components/dashboard'
import { QuestsPanel } from '@/components/quests-panel'
import { MoodTracker } from '@/components/mood-tracker'
import { Journal } from '@/components/journal'
import { EmergencyButton } from '@/components/emergency-button'
import type { Emotion } from '@/types/emotion'

const PLANT_TYPES: PlantType[] = [
  'sunflower','rose','lotus','cherry','fern','hibiscus','moonflower','starlily',
]

const PLANT_LABELS: Record<PlantType, string> = {
  sunflower:'🌻 Sunflower', rose:'🌹 Rose', lotus:'🪷 Lotus',
  cherry:'🌸 Cherry Blossom', fern:'🌿 Fern', hibiscus:'🌺 Hibiscus',
  moonflower:'🌙 Moonflower', starlily:'⭐ Star Lily',
}

const LEVEL_NAMES = ['Seedling','Sprout','Bloom','Blossom','Grove','Garden','Sanctuary','Paradise']
const XP_PER_LEVEL = 200

function GardenBg({ plants, emotion }: { plants: PlantType[]; emotion: Emotion }) {
  const moodTint: Record<string,string> = {
    happy:'#B794F4', sad:'#6366F1', angry:'#F87171',
    anxious:'#22D3EE', surprised:'#FACC15', neutral:'#A78BFA',
  }
  const tint = moodTint[emotion] || '#A78BFA'
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#070712"/>
          <stop offset="40%" stopColor="#0a0e1a"/>
          <stop offset="100%" stopColor="#050508"/>
        </linearGradient>
        <radialGradient id="mg" cx="50%" cy="10%" r="50%">
          <stop offset="0%" stopColor={tint} stopOpacity="0.08"/>
          <stop offset="100%" stopColor={tint} stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="pond" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0d2a4a" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#061020" stopOpacity="0.6"/>
        </radialGradient>
        <linearGradient id="hill1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d2818"/>
          <stop offset="100%" stopColor="#061008"/>
        </linearGradient>
        <linearGradient id="hill2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f2a1a"/>
          <stop offset="100%" stopColor="#081810"/>
        </linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#081408"/>
          <stop offset="100%" stopColor="#030803"/>
        </linearGradient>
      </defs>
      <rect width="390" height="844" fill="url(#sky)"/>
      <rect width="390" height="844" fill="url(#mg)" className="animate-aurora"/>
      {Array.from({length:20}).map((_,i)=>(
        <circle key={i} cx={20+Math.random()*350} cy={10+Math.random()*180} r={0.5+Math.random()*0.8} fill="#fff" opacity={0.2+Math.random()*0.4}>
          <animate attributeName="opacity" values={`${0.2};${0.8};${0.2}`} dur={`${2+Math.random()*3}s`} repeatCount="indefinite"/>
        </circle>
      ))}
      <circle cx="320" cy="60" r="50" fill="#C8B6FF" opacity="0.03" className="animate-glow-pulse"/>
      <circle cx="320" cy="60" r="18" fill="#C8B6FF" opacity="0.06"/>
      <circle cx="317" cy="57" r="14" fill="#C8B6FF" opacity="0.08"/>
      <ellipse cx="100" cy="400" rx="200" ry="100" fill="url(#hill1)"/>
      <ellipse cx="320" cy="380" rx="220" ry="110" fill="url(#hill2)"/>
      <rect x="0" y="420" width="390" height="424" fill="url(#ground)"/>
      <ellipse cx="195" cy="520" rx="60" ry="18" fill="url(#pond)"/>
      <ellipse cx="195" cy="520" rx="50" ry="12" fill="none" stroke="#0d3b5e" strokeWidth="0.3" opacity="0.3">
        <animate attributeName="rx" values="50;65;50" dur="5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;0;0.3" dur="5s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="195" cy="650" rx="200" ry="40" fill="#0d2818" opacity="0.15">
        <animate attributeName="rx" values="180;210;180" dur="10s" repeatCount="indefinite"/>
      </ellipse>
      {plants.map((type,i)=>{
        const x = 60 + i * 35
        const y = 380 + Math.sin(i)*15
        return <foreignObject key={i} x={x-12} y={y-40} width="24" height="44">
          <div className="w-full h-full flex items-end justify-center text-xl"
            style={{animation:`bloom 0.5s ease-out ${i*0.12}s forwards`,opacity:0,transform:'scale(0)'}}>
            {type==='sunflower'?'🌻':type==='rose'?'🌹':type==='lotus'?'🪷':type==='cherry'?'🌸':type==='fern'?'🌿':type==='hibiscus'?'🌺':type==='moonflower'?'🌙':'⭐'}
          </div>
        </foreignObject>
      })}
      <circle cx="195" cy="300" r="40" fill={tint} opacity="0.04" className="animate-glow-pulse">
        <animate attributeName="r" values="35;48;35" dur="4s" repeatCount="indefinite"/>
      </circle>
    </svg>
  )
}

function Sheet({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: React.ReactNode; title?: string }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-25 bg-black/30 backdrop-blur-sm" onClick={onClose} />}
      <div className={`sheet ${open ? 'open' : ''}`}>
        <div className="handle" />
        {title && (
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h2 className="font-plus text-base font-semibold text-zinc-100">{title}</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/5 text-zinc-500"><X size={16}/></button>
          </div>
        )}
        <div className="px-5 pb-6">{children}</div>
      </div>
    </>
  )
}

function LevelUpModal({ name, onDone }: { name: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t) }, [onDone])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
      {Array.from({length:40}).map((_,i)=>(
        <div key={i} className="confetti-piece" style={{
          left:`${Math.random()*100}%`,top:'-8px',
          width:5+Math.random()*6,height:5+Math.random()*6,
          backgroundColor:['#52B788','#C8B6FF','#FBBF24','#FB7185','#67E8F9'][i%5],
          animationDelay:`${Math.random()*0.6}s`,
          animationDuration:`${2+Math.random()*2}s`,
          borderRadius:Math.random()>0.5?'50%':'2px',
        }}/>
      ))}
      <div className="text-center animate-scale-bounce">
        <div className="w-28 h-28 mx-auto mb-5 rounded-full bg-gradient-to-br from-emerald-500/20 via-spirit/20 to-amber-500/20 flex items-center justify-center border border-white/10 animate-float-slow">
          <Crown size={40} className="text-yellow-400 animate-glow-soft"/>
        </div>
        <p className="font-plus text-2xl font-bold gradient-text mb-1">Level Up!</p>
        <p className="text-lg text-zinc-200">{name}</p>
      </div>
    </div>
  )
}

export default function Home() {
  const [unlocked, setUnlocked] = useState(false)
  const [pin, setPin] = useState('lrx')
  const [pinErr, setPinErr] = useState('')
  const [isNew, setIsNew] = useState(false)
  const [showPin, setShowPin] = useState(true)
  const [sheet, setSheet] = useState<'spirit'|'shop'|'quests'|null>(null)
  const [emotion, setEmotion] = useState<Emotion>('neutral')
  const [processing, setProcessing] = useState(false)
  const [game, setGame] = useState<GameState|null>(null)
  const [levelUp, setLevelUp] = useState<string|null>(null)
  const [toast, setToast] = useState<{msg:string;type:'success'|'info'|'premium'} | null>(null)
  const [toastId, setToastId] = useState(0)

  useEffect(() => {
    const c = isVaultCreated()
    setIsNew(!c)
    setShowPin(true)
    if (c && isUnlocked()) { setUnlocked(true); setShowPin(false); loadGame() }
  }, [])

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t) }, [toast, toastId])

  async function loadGame() { setGame(await checkStreak()) }

  async function handlePin() {
    const p = pin.trim()
    if (!p) { setPinErr('Enter passphrase'); return }
    if (await unlockStorage(p)) {
      setUnlocked(true); setShowPin(false); setPinErr(''); await loadGame()
    } else setPinErr('Wrong passphrase')
  }
  function handleReset() {
    ['gv-vault-salt','gv-vault','gv-game','gv-moods','gv-journal','gv-premium'].forEach(k => localStorage.removeItem(k))
    setPin('lrx'); setPinErr(''); setIsNew(true)
  }

  function t(msg:string, type:'success'|'info'|'premium'='success') { setToast({msg,type}); setToastId(id=>id+1) }

  const handleMood = useCallback((m: Emotion) => { setEmotion(m); setSheet('spirit'); t(`Spirit senses ${m}`) }, [])
  const handleChat = useCallback(async () => {
    if (!game) return
    const r = await addXp(10)
    r.game.totalChats = (game.totalChats||0)+1
    await saveGame(r.game)
    setGame(r.game)
  }, [game])
  const handleQuest = useCallback(async () => { setGame(await getGame()) }, [])

  async function buyPlant(type: PlantType) {
    const avail = isPremium() ? PLANT_TYPES : PLANT_TYPES.slice(0,4)
    if (!avail.includes(type)) { t('Premium only','premium'); return }
    if (!game || game.xp < 25) { t('Need 25 XP','info'); return }
    const g = await addPlant(type)
    setGame(g)
    const {game:ng} = await addXp(-25)
    setGame(ng)
    t('Planted!')
  }

  if (!unlocked && showPin) return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-6 bg-[#050508]">
      <div className="relative w-full max-w-xs flex flex-col items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/10 via-spirit/10 to-amber-500/10 flex items-center justify-center border border-white/5 animate-float-slow">
            <svg width="44" height="44" viewBox="0 0 100 100">
              <defs><radialGradient id="pGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#C8B6FF" stopOpacity="0.5"/><stop offset="100%" stopColor="#C8B6FF" stopOpacity="0"/></radialGradient></defs>
              <circle cx="50" cy="50" r="45" fill="url(#pGlow)" className="animate-glow-pulse"/>
              <ellipse cx="50" cy="54" rx="20" ry="18" fill="#C8B6FF" opacity="0.2"/>
              <ellipse cx="43" cy="48" rx="3" ry="4" fill="#1a1040" opacity="0.7"/>
              <ellipse cx="57" cy="48" rx="3" ry="4" fill="#1a1040" opacity="0.7"/>
              <path d="M38,58 Q50,68 62,58" fill="none" stroke="#1a1040" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
            </svg>
          </div>
          <div className="absolute -inset-4 rounded-full bg-spirit/5 animate-pulse-ring"/>
        </div>
        <h1 className="font-plus text-3xl font-bold gradient-text">Garden of Solace</h1>
        <input type="password" value={pin} onChange={e=>{setPin(e.target.value);setPinErr('')}} onKeyDown={e=>e.key==='Enter'&&handlePin()}
          placeholder="Passphrase" autoFocus
          className="w-full h-12 text-center text-lg rounded-2xl bg-white/5 border border-white/10 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 transition-all tracking-wider"/>
        {pinErr && <p className="text-xs text-red-400">{pinErr}{!isNew && <button onClick={handleReset} className="ml-2 underline text-zinc-500">Reset?</button>}</p>}
        <button onClick={handlePin} className="w-full h-12 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-medium transition-all active:scale-[0.98]">{isNew?'Create Garden':'Enter'}</button>
        {!isNew && <button onClick={handleReset} className="text-[10px] text-zinc-700 hover:text-zinc-500">Forgot? Start fresh</button>}
      </div>
    </main>
  )
  if (!unlocked) return null

  const lvl = game ? getLevelIndex(game.xp) : 0
  const lvlName = game ? getLevelName(game.xp) : 'Seedling'
  const nextXp = (lvl + 1) * XP_PER_LEVEL
  const currXp = lvl * XP_PER_LEVEL
  const pct = game ? Math.min(100, Math.round(((game.xp - currXp) / (nextXp - currXp)) * 100)) : 0

  return (
    <main className="h-dvh w-full relative overflow-hidden bg-[#050508]">
      {levelUp && <LevelUpModal name={levelUp} onDone={()=>setLevelUp(null)}/>}
      <div className="absolute inset-0 z-0">
        <GardenBg plants={game?.plants.map(p=>p.type)||[]} emotion={emotion}/>
      </div>
      <div className="hud z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
            <Star size={15} className="text-yellow-400"/>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 leading-tight">{lvlName}</p>
            <p className="text-sm font-semibold text-zinc-100">{game?.xp||0} XP</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-zinc-500 leading-tight">Streak</p>
            <p className="text-sm font-semibold flex items-center gap-1 text-orange-400"><Flame size={13}/>{game?.streak||0}</p>
          </div>
          <div className="w-px h-7 bg-white/5"/>
          {isPremium() ? (
            <span className="text-[10px] text-amber-400 flex items-center gap-1 bg-amber-900/20 px-2 py-1 rounded-full"><Crown size={10}/></span>
          ) : (
            <button onClick={()=>{enablePremium();t('Premium unlocked','premium');loadGame()}} className="text-[10px] text-amber-600 bg-amber-900/10 px-2 py-1 rounded-full hover:bg-amber-900/20 transition-colors"><Crown size={10}/></button>
          )}
          <button onClick={()=>{lockStorage();setUnlocked(false);setShowPin(true)}} className="p-1.5 text-zinc-600 hover:text-zinc-400"><Lock size={13}/></button>
        </div>
      </div>
      <div className="absolute top-[72px] left-4 right-4 z-10 h-1 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-leaf to-spirit transition-all duration-1000 ease-out" style={{width:`${pct}%`}}/>
      </div>
      {processing && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
          <div className="glass-light px-4 py-1.5 rounded-full flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-spirit animate-glow-soft"/>
            <span className="text-xs text-spirit/70">Reading you...</span>
          </div>
        </div>
      )}
      <div className="absolute bottom-28 left-0 right-0 z-10 flex justify-center gap-3">
        <button onClick={()=>setSheet('spirit')}
          className="w-14 h-14 rounded-full glass flex items-center justify-center text-spirit hover:text-white transition-all active:scale-90">
          <MessageCircle size={24}/>
        </button>
        <button onClick={()=>setSheet('shop')}
          className="w-14 h-14 rounded-full glass flex items-center justify-center text-leaf hover:text-white transition-all active:scale-90">
          <Plus size={24}/>
        </button>
        <button onClick={()=>setSheet('quests')}
          className="w-14 h-14 rounded-full glass flex items-center justify-center text-amber-400 hover:text-white transition-all active:scale-90">
          <Sparkles size={24}/>
        </button>
      </div>
      <div className="absolute bottom-20 left-0 right-0 z-10 flex justify-center gap-2">
        {['spirit','shop','quests'].map(s => (
          <div key={s} className={`nav-dot ${sheet===s?'bg-spirit w-6':'bg-white/20'}`}/>
        ))}
      </div>
      <Sheet open={sheet==='spirit'} onClose={()=>setSheet(null)} title="Garden Spirit">
        <div className="flex flex-col items-center gap-3">
          <NpcCamera onMoodDetected={handleMood} disabled={processing} setProcessing={setProcessing}/>
          <div className="w-full border-t border-white/5 pt-3">
            <NpcChat emotion={emotion} onChatComplete={handleChat}/>
          </div>
        </div>
      </Sheet>
      <Sheet open={sheet==='shop'} onClose={()=>setSheet(null)} title="Plant Nursery">
        <div className="flex flex-wrap gap-2">
          {(isPremium()?PLANT_TYPES:PLANT_TYPES.slice(0,4)).map(type=>(
            <button key={type} onClick={()=>buyPlant(type)}
              disabled={!game||game.xp<25}
              className="text-sm px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-white/5 hover:border-leaf/30 active:scale-95">
              {PLANT_LABELS[type]}
            </button>
          ))}
        </div>
        {!isPremium() && <p className="text-[10px] text-amber-700 mt-3 text-center">+ 4 premium plants with Crown</p>}
      </Sheet>
      <Sheet open={sheet==='quests'} onClose={()=>setSheet(null)} title="Daily">
        <div className="space-y-3">
          <MoodTracker onLog={()=>{loadGame();t('+15 XP')}}/>
          <div className="border-t border-white/5 pt-3">
            <QuestsPanel onQuestComplete={()=>{loadGame();t('Quest done!')}}/>
          </div>
          <div className="border-t border-white/5 pt-3">
            <Journal/>
          </div>
        </div>
      </Sheet>
      <EmergencyButton/>
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl text-sm shadow-2xl animate-fade-up ${
          toast.type==='premium'?'bg-amber-900/80 text-amber-200 border border-amber-800/40 backdrop-blur-md'
          :'bg-emerald-900/80 text-emerald-200 border border-emerald-800/40 backdrop-blur-md'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type==='premium'?<Crown size={14}/>:<Sparkles size={14}/>}
            {toast.msg}
          </div>
        </div>
      )}
    </main>
  )
}
