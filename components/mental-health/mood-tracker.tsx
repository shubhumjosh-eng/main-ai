'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { getMoods, saveMood, getPeriodEntries, getMoodSummary, type MoodEntry } from '@/lib/mood-storage'

const MOODS = [
  { emoji: '😊', label: 'Great', color: 'from-emerald-500/30 to-emerald-600/20 border-emerald-600/30' },
  { emoji: '🙂', label: 'Good', color: 'from-blue-500/30 to-blue-600/20 border-blue-600/30' },
  { emoji: '😐', label: 'Okay', color: 'from-amber-500/30 to-amber-600/20 border-amber-600/30' },
  { emoji: '😔', label: 'Down', color: 'from-orange-500/30 to-orange-600/20 border-orange-600/30' },
  { emoji: '😢', label: 'Rough', color: 'from-red-500/30 to-red-600/20 border-red-600/30' },
  { emoji: '😰', label: 'Anxious', color: 'from-purple-500/30 to-purple-600/20 border-purple-600/30' },
  { emoji: '😌', label: 'Peaceful', color: 'from-teal-500/30 to-teal-600/20 border-teal-600/30' },
  { emoji: '😤', label: 'Frustrated', color: 'from-rose-500/30 to-rose-600/20 border-rose-600/30' },
]

const REMINDER_TIMES = [
  { label: 'Morning', hour: 9, icon: '🌅' },
  { label: 'Afternoon', hour: 14, icon: '☀️' },
  { label: 'Night', hour: 20, icon: '🌙' },
]

export function MoodTracker() {
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [selected, setSelected] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('')
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [showHistory, setShowHistory] = useState(false)
  const [remindersEnabled, setRemindersEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMoods().then(data => {
      setEntries(data)
      setLoading(false)
    })
  }, [])

  const today = new Date().toDateString()
  const todaysEntries = entries.filter(e => e.date === today)
  const todaysMood = todaysEntries[todaysEntries.length - 1]

  useEffect(() => {
    const asked = localStorage.getItem('mh-reminder-asked')
    if (!asked) {
      const timeout = setTimeout(() => {
        if (confirm('Would you like mood reminders 3 times a day (morning, afternoon, night)?')) {
          setRemindersEnabled(true)
          localStorage.setItem('mh-reminder-asked', 'yes')
          localStorage.setItem('mh-reminders', 'true')
        } else {
          localStorage.setItem('mh-reminder-asked', 'no')
        }
      }, 10000)
      return () => clearTimeout(timeout)
    }
    if (localStorage.getItem('mh-reminders') === 'true') {
      setRemindersEnabled(true)
    }
  }, [])

  const handleSaveMood = useCallback(async (source: 'manual' | 'chatbot' = 'manual') => {
    if (!selected) return
    const entry: MoodEntry = {
      date: today,
      timestamp: new Date().toISOString(),
      mood: selected,
      emoji: selectedEmoji,
      note: note.trim(),
      source,
    }
    const updated = await saveMood(entry)
    setEntries(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setNote('')
  }, [selected, selectedEmoji, note, today])

  const periodEntries = getPeriodEntries(entries, viewMode)
  const entriesByDay = periodEntries.reduce<Record<string, MoodEntry[]>>((acc, e) => {
    if (!acc[e.date]) acc[e.date] = []
    acc[e.date].push(e)
    return acc
  }, {})
  const summary = getMoodSummary(periodEntries)

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-12 bg-surface-800/50 rounded-xl" />
        <div className="h-8 bg-surface-800/50 rounded-lg" />
        <div className="h-32 bg-surface-800/50 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-surface-200">How are you feeling?</h3>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-[10px] text-surface-500 hover:text-surface-300 px-2 py-1 rounded border border-surface-700"
          >
            {showHistory ? 'Log Mood' : `History (${entries.length})`}
          </button>
        </div>

        {showHistory ? (
          <div className="space-y-3">
            <div className="flex gap-1.5">
              {(['daily', 'weekly', 'monthly'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-medium border transition-all ${
                    viewMode === m
                      ? 'border-cyan-600/50 bg-cyan-900/20 text-cyan-300'
                      : 'border-surface-700 text-surface-500 hover:border-surface-600'
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>

            {summary && (
              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-800/30">
                <p className="text-[10px] text-surface-500 uppercase tracking-wider">Summary</p>
                <p className="text-sm text-surface-200 mt-1">
                  Mostly feeling <span className="font-semibold capitalize">{summary.dominantMood}</span> ({summary.count}x) across {summary.total} entries
                </p>
              </div>
            )}

            {periodEntries.length === 0 && (
              <p className="text-center text-surface-500 text-sm py-6">No mood entries yet.</p>
            )}

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {Object.entries(entriesByDay).reverse().map(([date, dayEntries]) => (
                <div key={date} className="p-2 rounded-lg bg-surface-900/40 border border-surface-800/50">
                  <p className="text-[10px] text-surface-500 mb-1.5">
                    {new Date(date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {dayEntries.reverse().map((e, i) => (
                      <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-md bg-surface-800/40">
                        <span className="text-sm">{e.emoji || '😐'}</span>
                        <span className="text-[10px] text-surface-400 capitalize">{e.mood}</span>
                        {e.source === 'chatbot' && <span className="text-[8px] text-cyan-600">AI</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-2">
              {MOODS.map(m => (
                <button
                  key={m.emoji}
                  onClick={() => { setSelected(m.label.toLowerCase()); setSelectedEmoji(m.emoji); setSaved(false) }}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                    selected === m.label.toLowerCase()
                      ? 'border-white/40 bg-white/10 scale-105 shadow-lg'
                      : 'border-surface-700/50 bg-surface-900/40 hover:bg-surface-800/60 hover:border-surface-600'
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[9px] text-surface-400 font-medium">{m.label}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[10px] text-surface-400 mb-1">Add a note (optional)</label>
              <input
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="What's going on?"
                className="w-full bg-surface-950 border border-surface-700 rounded-lg px-4 py-2 text-sm text-surface-200 placeholder-surface-500 focus:outline-none focus:border-surface-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={() => handleSaveMood('manual')} disabled={!selected}>
                {todaysEntries.length > 0 ? 'Log Another' : 'Save Mood'}
              </Button>
              {saved && <span className="text-[10px] text-emerald-400">Saved! 🎉</span>}
              {todaysMood && (
                <span className="text-[10px] text-surface-500">
                  Today: {todaysMood.emoji} {todaysMood.mood}
                </span>
              )}
            </div>

            {remindersEnabled && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-800/40 border border-surface-700/50">
                <span className="text-xs">🔔</span>
                <span className="text-[10px] text-surface-400">
                  Reminders active — {REMINDER_TIMES.map(r => `${r.icon} ${r.label}`).join(' · ')}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export type { MoodEntry }
