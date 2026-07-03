'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { setItem, getItem } from '@/lib/encrypted-storage'

interface JournalEntry {
  id: string
  date: string
  title: string
  content: string
  sentToPro: boolean
}

export function Journal({ shareWithPro }: { shareWithPro: boolean }) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [view, setView] = useState<'write' | 'list'>('list')
  const [sendToPro, setSendToPro] = useState(false)
  const [sending, setSending] = useState(false)
  const [sentStatus, setSentStatus] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getItem<JournalEntry[]>('mh-journal', []).then(data => {
      setEntries(data)
      setLoading(false)
    })
  }, [])

  const saveEntry = async () => {
    if (!content.trim()) return
    const entry: JournalEntry = {
      id: `j-${Date.now()}`,
      date: new Date().toISOString(),
      title: title.trim() || `Entry ${entries.length + 1}`,
      content: content.trim(),
      sentToPro: false,
    }
    const updated = [entry, ...entries]
    setEntries(updated)
    await setItem('mh-journal', updated)

    if (sendToPro && shareWithPro) {
      setSending(true)
      try {
        const res = await fetch('/api/professional/letters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: 'user-1',
            content: content.trim(),
            title: title.trim(),
            anonymous: true,
          }),
        })
        const data = await res.json()
        if (data.ok) {
          entry.sentToPro = true
          setSentStatus('Letter sent to your professional!')
          await setItem('mh-journal', updated)
        }
      } catch {
        setSentStatus('Could not send — check connection')
      }
      setSending(false)
    }

    setTitle('')
    setContent('')
    setSendToPro(false)
    setView('list')
    setTimeout(() => setSentStatus(''), 3000)
  }

  const deleteEntry = async (id: string) => {
    const updated = entries.filter(e => e.id !== id)
    setEntries(updated)
    await setItem('mh-journal', updated)
  }

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-8 bg-surface-800/50 rounded-lg" />
        <div className="h-24 bg-surface-800/50 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant={view === 'list' ? 'primary' : 'ghost'} size="sm" onClick={() => setView('list')}>
            Entries ({entries.length})
          </Button>
          <Button variant={view === 'write' ? 'primary' : 'ghost'} size="sm" onClick={() => setView('write')}>
            New Entry
          </Button>
        </div>
      </div>

      {view === 'write' && (
        <div className="space-y-3">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Entry title (optional)"
            className="w-full bg-surface-950 border border-surface-700 rounded-lg px-4 py-2.5 text-sm text-surface-200 placeholder-surface-500 focus:outline-none focus:border-surface-500"
          />
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your thoughts freely... no limits, no judgment."
            rows={12}
            className="w-full bg-surface-950 border border-surface-700 rounded-lg px-4 py-3 text-sm text-surface-200 placeholder-surface-500 focus:outline-none focus:border-surface-500 resize-none"
          />
          <div className="flex items-center gap-3 flex-wrap">
            <Button onClick={saveEntry} disabled={!content.trim() || sending}>
              {sending ? 'Sending...' : 'Save Entry'}
            </Button>
            {shareWithPro && (
              <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-cyan-900/20 border border-cyan-800/40 cursor-pointer hover:bg-cyan-900/30 transition-colors">
                <input
                  type="checkbox"
                  checked={sendToPro}
                  onChange={e => setSendToPro(e.target.checked)}
                  className="rounded border-cyan-600 bg-surface-800 accent-cyan-500 size-3.5"
                />
                <div>
                  <span className="text-[11px] font-medium text-cyan-300">Send as letter to my professional</span>
                  <p className="text-[8px] text-cyan-500/70">Your entry will be shared anonymously with your connected professional</p>
                </div>
              </label>
            )}
          </div>
          {sentStatus && <p className="text-[10px] text-emerald-400">{sentStatus}</p>}
        </div>
      )}

      {view === 'list' && (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {entries.length === 0 && (
            <div className="text-center py-8">
              <p className="text-surface-500 text-sm">Your journal is empty.</p>
              <p className="text-surface-600 text-[10px] mt-1">Write freely — everything stays private on your device.</p>
            </div>
          )}
          {entries.map(e => (
            <Card key={e.id} className="border-surface-800 bg-surface-900/40">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-surface-200 truncate">{e.title}</p>
                      {e.sentToPro && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-cyan-900/30 text-cyan-400 shrink-0">
                          Sent
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-surface-500 mt-0.5">
                      {new Date(e.date).toLocaleString()}
                    </p>
                    <p className="text-xs text-surface-400 mt-1.5 whitespace-pre-wrap line-clamp-4 leading-relaxed">{e.content}</p>
                  </div>
                  <button
                    onClick={() => deleteEntry(e.id)}
                    className="text-surface-600 hover:text-red-400 transition-colors shrink-0 text-xs"
                  >
                    ✕
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
