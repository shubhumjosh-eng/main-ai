'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Sparkles } from 'lucide-react'
import type { Emotion, ChatMessage } from '@/types/emotion'
import { NpcSpirit } from '@/components/npc-spirit'

interface NpcChatProps {
  emotion: Emotion
  onChatComplete?: () => void
}

export function NpcChat({ emotion, onChatComplete }: NpcChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    content: getGreeting(emotion),
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send() {
    if (!input.trim() || loading) return
    const userMsg: ChatMessage = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMsg.content,
        emotion,
        history: [...messages, userMsg],
      }),
    })
      .then(res => res.json())
      .then(data => {
        const reply: ChatMessage = { role: 'assistant', content: data.reply || '...' }
        setMessages(prev => [...prev, reply])
        onChatComplete?.()
      })
      .catch(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: 'The wind carries my words away... Let us try again.' }])
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <NpcSpirit emotion={emotion} size={80} />

      <div className="w-full max-w-sm space-y-2 max-h-[240px] overflow-y-auto scrollbar-thin px-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === 'user'
                  ? 'bg-emerald-800/50 text-emerald-100 rounded-tr-md'
                  : 'bg-zinc-800/50 text-zinc-200 rounded-tl-md'
              }`}
            >
              {m.role === 'assistant' && (
                <Sparkles size={12} className="inline mr-1 text-spirit" />
              )}
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800/50 rounded-2xl rounded-tl-md px-4 py-2.5">
              <Loader2 size={14} className="animate-spin text-spirit" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex w-full max-w-sm gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Speak to the spirit..."
          className="flex-1 h-10 rounded-xl bg-zinc-800 border border-zinc-700 px-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 transition-colors"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  )
}

function getGreeting(emotion: Emotion): string {
  const greetings: Record<Emotion, string> = {
    happy: 'Your light shines so bright today, friend! Tell me what brings you joy.',
    sad: 'I feel your heart is heavy... I am here beside you. Would you like to sit with me by the pond?',
    angry: 'There is a storm in you today. Let it pass... I will stay with you.',
    anxious: 'I sense the fluttering in your chest. Breathe with me... in... out... You are safe here.',
    surprised: 'Oh! You caught me off guard too. How are you feeling right now?',
    neutral: 'Welcome back to the garden. The moon is beautiful tonight. How do you feel?',
  }
  return greetings[emotion] || greetings.neutral
}
