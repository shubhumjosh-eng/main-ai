import { getItem, setItem } from './encrypted-storage'

export interface MoodEntry {
  date: string
  timestamp: string
  mood: string
  emoji: string
  note: string
  source: 'manual' | 'chatbot'
}

export async function getMoods(): Promise<MoodEntry[]> {
  return getItem<MoodEntry[]>('mh-moods', [])
}

export async function saveMood(entry: MoodEntry): Promise<MoodEntry[]> {
  const existing = await getMoods()
  const updated = [...existing, entry]
  await setItem('mh-moods', updated)
  return updated
}

export function getPeriodEntries(entries: MoodEntry[], mode: 'daily' | 'weekly' | 'monthly'): MoodEntry[] {
  const now = new Date()
  if (mode === 'weekly') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return entries.filter(e => new Date(e.timestamp) >= weekAgo)
  }
  if (mode === 'monthly') {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    return entries.filter(e => new Date(e.timestamp) >= monthAgo)
  }
  return entries.filter(e => e.date === new Date().toDateString())
}

export function getMoodSummary(entries: MoodEntry[]): { dominantMood: string; count: number; total: number } | null {
  if (entries.length === 0) return null
  const counts: Record<string, number> = {}
  entries.forEach(e => {
    counts[e.mood] = (counts[e.mood] || 0) + 1
  })
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  return { dominantMood: top[0], count: top[1], total: entries.length }
}
