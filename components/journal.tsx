'use client'

import { useState, useEffect } from 'react'
import { Book, Plus, Trash2 } from 'lucide-react'
import { getItem, setItem } from '@/lib/encrypted-storage'
import { addXp, saveGame, getGame } from '@/lib/game-storage'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'

interface JournalEntry {
  id: string
  date: number
  content: string
}

export function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')

  useEffect(() => {
    getItem<JournalEntry[]>('gv-journal', []).then(setEntries)
  }, [])

  async function saveEntry() {
    if (!content.trim()) return
    const entry: JournalEntry = { id: `j-${Date.now()}`, date: Date.now(), content: content.trim() }
    entries.unshift(entry)
    await setItem('gv-journal', entries)
    setContent('')
    setOpen(false)

    const { game } = await addXp(20)
    game.totalJournals += 1
    await saveGame(game)
  }

  async function deleteEntry(id: string) {
    const filtered = entries.filter(e => e.id !== id)
    setEntries(filtered)
    await setItem('gv-journal', filtered)
  }

  const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-plus text-sm font-semibold text-zinc-200">Journal</h3>
        <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
          <Plus size={14} className="mr-1" /> New
        </Button>
      </div>

      <div className="space-y-1.5 max-h-[180px] overflow-y-auto scrollbar-thin">
        {entries.slice(0, 5).map(entry => (
          <div key={entry.id} className="group flex items-start gap-2 rounded-lg bg-zinc-800/30 p-2.5">
            <Book size={14} className="text-zinc-500 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-400">{new Date(entry.date).toLocaleDateString()}</p>
              <p className="text-sm text-zinc-300 line-clamp-2">{entry.content}</p>
            </div>
            <button
              onClick={() => deleteEntry(entry.id)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-red-400 transition-all"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-xs text-zinc-500 text-center py-4">Your journal is empty. Write your first entry.</p>
        )}
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title={`Journal - ${todayStr}`}>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="How are you feeling today? What's on your mind?"
          className="w-full h-32 rounded-xl bg-zinc-800 border border-zinc-700 p-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-600 resize-none"
        />
        <div className="flex justify-end gap-2 mt-3">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
          <Button size="sm" onClick={saveEntry}>Save Entry +20 XP</Button>
        </div>
      </Dialog>
    </div>
  )
}
