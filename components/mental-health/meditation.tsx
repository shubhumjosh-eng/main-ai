'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { setItem, getItem } from '@/lib/encrypted-storage'
import { BreathingExercise } from './breathing'

interface Session {
  date: string
  seconds: number
}

const SOUNDS = [
  { id: 'none', label: 'Silence', icon: '🔇', url: '' },
  { id: 'rain', label: 'Rain', icon: '🌧️', url: 'https://cdn.freesound.org/previews/646/646599_10876017-lq.mp3' },
  { id: 'lofi', label: 'Lo-Fi', icon: '🎵', url: '' },
  { id: 'classical', label: 'Classical', icon: '🎻', url: '' },
  { id: 'ocean', label: 'Ocean', icon: '🌊', url: 'https://cdn.freesound.org/previews/652/652370_14262738-lq.mp3' },
  { id: 'forest', label: 'Forest', icon: '🌲', url: 'https://cdn.freesound.org/previews/655/655255_11465030-lq.mp3' },
]

const DURATIONS = [
  { label: '1 min', value: 60 },
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
  { label: '15 min', value: 900 },
  { label: '∞', value: 0 },
]

export function Meditation() {
  const [subTab, setSubTab] = useState<'timer' | 'breathing'>('timer')
  const [time, setTime] = useState(0)
  const [running, setRunning] = useState(false)
  const [duration, setDuration] = useState(300)
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSound, setSelectedSound] = useState('none')
  const [showSounds, setShowSounds] = useState(false)
  const [totalMinutes, setTotalMinutes] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getItem<Session[]>('mh-meditation', []).then(data => {
      setSessions(data)
      setTotalMinutes(Math.round(data.reduce((sum, s) => sum + s.seconds, 0) / 60))
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTime(t => {
          if (duration > 0 && t >= duration - 1) {
            setRunning(false)
            return duration
          }
          return t + 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, duration])

  useEffect(() => {
    if (selectedSound !== 'none' && running) {
      const sound = SOUNDS.find(s => s.id === selectedSound)
      if (sound?.url) {
        if (!audioRef.current) {
          audioRef.current = new Audio(sound.url)
          audioRef.current.loop = true
          audioRef.current.volume = 0.3
        }
        audioRef.current.play().catch(() => {})
      }
    } else if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }, [selectedSound, running])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const startTimer = () => { setTime(0); setRunning(true) }
  const pauseTimer = () => { setRunning(false) }
  const resetTimer = () => { setRunning(false); setTime(0) }

  const completeSession = async () => {
    if (time < 5) return
    const entry = { date: new Date().toISOString(), seconds: time }
    const updated = [...sessions, entry]
    setSessions(updated)
    await setItem('mh-meditation', updated)
    setTotalMinutes(Math.round(updated.reduce((sum, s) => sum + s.seconds, 0) / 60))
    setTime(0)
  }

  const progress = duration > 0 ? (time / duration) * 100 : 0

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-24 bg-surface-800/50 rounded-2xl" />
        <div className="h-8 bg-surface-800/50 rounded-lg" />
        <div className="h-6 bg-surface-800/50 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-1 p-1 rounded-lg bg-surface-900/40 border border-surface-800">
        <button
          onClick={() => { if (running) { setRunning(false); setTime(0) }; setSubTab('timer') }}
          className={`px-4 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
            subTab === 'timer' ? 'bg-surface-800 text-surface-200 shadow-sm' : 'text-surface-500 hover:text-surface-300'
          }`}
        >
          ⏱️ Timer
        </button>
        <button
          onClick={() => { if (running) { setRunning(false); setTime(0) }; setSubTab('breathing') }}
          className={`px-4 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
            subTab === 'breathing' ? 'bg-surface-800 text-surface-200 shadow-sm' : 'text-surface-500 hover:text-surface-300'
          }`}
        >
          🌬️ Breathing
        </button>
      </div>

      {subTab === 'timer' && (
        <div className="text-center">
          <div className="text-6xl sm:text-7xl font-light text-surface-50 tabular-nums mb-3 font-mono tracking-wider">
            {formatTime(time)}
          </div>
          {duration > 0 && (
            <div className="text-[10px] text-surface-500 mb-2">
              Target: {formatTime(duration)}
            </div>
          )}

          <div className="flex justify-center gap-1.5 flex-wrap mb-5">
            {DURATIONS.map(d => (
              <button
                key={d.value}
                onClick={() => { if (!running) { setDuration(d.value); setTime(0) } }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${
                  duration === d.value
                    ? 'border-cyan-600/50 bg-cyan-900/20 text-cyan-300'
                    : 'border-surface-700 text-surface-500 hover:border-surface-600'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-3 mb-5">
            {!running ? (
              <Button onClick={startTimer} disabled={time > 0 && duration > 0 && time >= duration}>
                {time > 0 ? 'Restart' : 'Start'}
              </Button>
            ) : (
              <Button onClick={pauseTimer} variant="secondary">Pause</Button>
            )}
            {(time > 0 || running) && (
              <Button onClick={resetTimer} variant="ghost">Reset</Button>
            )}
            {time > 0 && !running && (
              <Button onClick={completeSession} variant="outline">
                Log Session
              </Button>
            )}
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setShowSounds(!showSounds)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${
                selectedSound !== 'none'
                  ? 'border-cyan-600/50 bg-cyan-900/20 text-cyan-300'
                  : 'border-surface-700 text-surface-500 hover:border-surface-600'
              }`}
            >
              {SOUNDS.find(s => s.id === selectedSound)?.icon} Sound
            </button>
          </div>

          {showSounds && (
            <div className="flex justify-center gap-1.5 flex-wrap mt-3">
              {SOUNDS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSound(s.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${
                    selectedSound === s.id
                      ? 'border-cyan-600/50 bg-cyan-900/20 text-cyan-300'
                      : 'border-surface-700 text-surface-500 hover:border-surface-600'
                  }`}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 h-1.5 rounded-full bg-surface-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-1000"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          {sessions.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-surface-500 mb-2">
                {totalMinutes}m across {sessions.length} sessions
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {sessions.slice(-10).reverse().map((s, i) => (
                  <div key={i} className="text-[9px] px-2 py-1 rounded bg-surface-900/40 border border-surface-800 text-surface-400">
                    {Math.round(s.seconds / 60)}m
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {subTab === 'breathing' && <BreathingExercise />}
    </div>
  )
}
