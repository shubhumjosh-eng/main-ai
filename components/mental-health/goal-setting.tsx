'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { setItem, getItem } from '@/lib/encrypted-storage'

interface Goal {
  id: string
  title: string
  description: string
  category: 'habit' | 'task' | 'wellness' | 'growth'
  completed: boolean
  createdAt: string
  completedAt: string | null
}

const CATEGORIES = [
  { id: 'habit', label: 'Habit', icon: '🔄' },
  { id: 'task', label: 'Task', icon: '✅' },
  { id: 'wellness', label: 'Wellness', icon: '🧘' },
  { id: 'growth', label: 'Growth', icon: '🌱' },
]

const SUGGESTIONS: Record<string, string[]> = {
  habit: ['Drink 8 glasses of water', 'Walk for 20 minutes', 'Read for 15 minutes', 'Practice gratitude'],
  task: ['Clean my room', 'Finish a work project', 'Call a friend', 'Organize my schedule'],
  wellness: ['Meditate for 10 minutes', 'Do breathing exercises', 'Stretch for 15 minutes', 'Take a relaxing bath'],
  growth: ['Learn something new', 'Write in my journal', 'Practice a skill', 'Reflect on my week'],
}

export function GoalSetting() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Goal['category']>('task')
  const [showNew, setShowNew] = useState(false)
  const [filter, setFilter] = useState<Goal['category'] | 'all'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getItem<Goal[]>('mh-goals', []).then(data => {
      setGoals(data)
      setLoading(false)
    })
  }, [])

  const addGoal = async () => {
    if (!title.trim()) return
    const goal: Goal = {
      id: `g-${Date.now()}`,
      title: title.trim(),
      description: '',
      category,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    }
    const updated = [goal, ...goals]
    setGoals(updated)
    await setItem('mh-goals', updated)
    setTitle('')
    setShowNew(false)
  }

  const toggleGoal = async (id: string) => {
    const updated = goals.map(g => {
      if (g.id === id) {
        return { ...g, completed: !g.completed, completedAt: !g.completed ? new Date().toISOString() : null }
      }
      return g
    })
    setGoals(updated)
    await setItem('mh-goals', updated)
  }

  const deleteGoal = async (id: string) => {
    const updated = goals.filter(g => g.id !== id)
    setGoals(updated)
    await setItem('mh-goals', updated)
  }

  const filtered = filter === 'all' ? goals : goals.filter(g => g.category === filter)
  const incompleteCount = goals.filter(g => !g.completed).length
  const completedCount = goals.filter(g => g.completed).length

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-8 bg-surface-800/50 rounded-lg" />
        <div className="h-16 bg-surface-800/50 rounded-xl" />
        <div className="h-16 bg-surface-800/50 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-400">
            {incompleteCount} active
          </span>
          {completedCount > 0 && (
            <span className="text-xs text-emerald-500">
              {completedCount} done
            </span>
          )}
        </div>
        <Button size="sm" onClick={() => setShowNew(!showNew)}>
          {showNew ? 'Cancel' : '+ Goal'}
        </Button>
      </div>

      {showNew && (
        <div className="p-4 rounded-xl bg-surface-900/60 border border-surface-700 space-y-3">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addGoal() }}
            placeholder="What do you want to achieve?"
            className="w-full bg-surface-950 border border-surface-700 rounded-lg px-4 py-2.5 text-sm text-surface-200 placeholder-surface-500 focus:outline-none focus:border-surface-500"
            autoFocus
          />
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id as Goal['category'])}
                className={`px-3 py-1 rounded-lg text-[10px] font-medium border transition-all ${
                  category === c.id
                    ? 'border-cyan-600/50 bg-cyan-900/20 text-cyan-300'
                    : 'border-surface-700 text-surface-500 hover:border-surface-600'
                }`}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
          {SUGGESTIONS[category] && (
            <div className="flex flex-wrap gap-1">
              {SUGGESTIONS[category].map(s => (
                <button
                  key={s}
                  onClick={() => { setTitle(s); setShowNew(true) }}
                  className="text-[9px] px-2 py-1 rounded-full border border-surface-700 text-surface-500 hover:text-surface-300 hover:border-surface-500 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <Button onClick={addGoal} disabled={!title.trim()} size="sm">
            Add Goal
          </Button>
        </div>
      )}

      <div className="flex gap-1.5">
        {[{ id: 'all', label: 'All', icon: '📋' }, ...CATEGORIES].map(c => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id as Goal['category'] | 'all')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all ${
              filter === c.id
                ? 'border-cyan-600/50 bg-cyan-900/20 text-cyan-300'
                : 'border-surface-700 text-surface-500 hover:border-surface-600'
            }`}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
        {filtered.length === 0 && (
          <p className="text-center text-surface-500 text-sm py-6">No goals yet. Set one!</p>
        )}
        {filtered.map(g => (
          <div
            key={g.id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              g.completed
                ? 'bg-emerald-900/20 border-emerald-800/30'
                : 'bg-surface-900/40 border-surface-800/50'
            }`}
          >
            <button
              onClick={() => toggleGoal(g.id)}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                g.completed
                  ? 'border-emerald-500 bg-emerald-500'
                  : 'border-surface-600 hover:border-surface-500'
              }`}
            >
              {g.completed && <span className="text-[9px] text-white">✓</span>}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${g.completed ? 'text-surface-500 line-through' : 'text-surface-200'}`}>
                {g.title}
              </p>
              <p className="text-[9px] text-surface-600 mt-0.5">
                {CATEGORIES.find(c => c.id === g.category)?.icon} {g.category}
                {g.completedAt && ` · Done ${new Date(g.completedAt).toLocaleDateString()}`}
              </p>
            </div>
            <button
              onClick={() => deleteGoal(g.id)}
              className="text-surface-600 hover:text-red-400 transition-colors text-xs shrink-0"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
