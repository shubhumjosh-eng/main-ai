'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { analyzeEmotion, generateResponse, type EmotionalState } from '@/lib/emotional-analyzer'
import { setItem, getItem } from '@/lib/encrypted-storage'

interface ChatMessage {
  id: string
  role: 'user' | 'bot'
  text: string
  emotion?: EmotionalState
  timestamp: number
}

const PERSONALITIES = [
  { id: 'warm', label: 'Warm (Luna)', emoji: '💛', desc: 'Gentle, nurturing, and supportive' },
  { id: 'professional', label: 'Professional (Dr. Sage)', emoji: '📋', desc: 'Calm, clinical, and structured' },
  { id: 'fun', label: 'Fun (Sunny)', emoji: '🌈', desc: 'Playful, lighthearted, and energetic' },
  { id: 'minimal', label: 'Minimal (Echo)', emoji: '🌊', desc: 'Quiet, simple, and reflective' },
]

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'ar', label: 'العربية' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'pt', label: 'Português' },
]

export function Chatbot({ onMoodDetected, onRiskDetected }: {
  onMoodDetected?: (mood: { emotion: string; emoji: string; note: string }) => void
  onRiskDetected?: (risk: { reason: string; severity: string }) => void
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'bot',
      text: 'Hey there 💙 I\'m here to listen. How are you feeling right now?',
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState('')
  const [personality, setPersonality] = useState('warm')
  const [language, setLanguage] = useState('en')
  const [showSettings, setShowSettings] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions] = useState([
    'I\'m feeling anxious today',
    'Something great happened!',
    'I need to talk about something',
    'I feel really down',
  ])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    getItem<ChatMessage[]>('mh-chat-history', []).then(saved => {
      if (saved.length > 0) setMessages(saved)
    })
  }, [])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return
    setIsLoading(true)

    const emotion = analyzeEmotion(text)

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      emotion,
      timestamp: Date.now(),
    }

    const botText = generateResponse(emotion, personality, language)
    const botMsg: ChatMessage = {
      id: `b-${Date.now()}`,
      role: 'bot',
      text: botText,
      timestamp: Date.now(),
    }

    const updated = [...messages, userMsg, botMsg]
    setMessages(updated)
    setInput('')
    setIsLoading(false)

    try {
      await setItem('mh-chat-history', updated)
    } catch {}

    if (emotion.primary !== 'neutral' && onMoodDetected) {
      onMoodDetected({
        emotion: emotion.primary,
        emoji: emotion.primaryEmoji,
        note: text.trim().slice(0, 200),
      })
    }

    if (emotion.riskLevel !== 'none' && onRiskDetected) {
      onRiskDetected({
        reason: emotion.riskReasons.join(', '),
        severity: emotion.riskLevel,
      })
    }
  }

  return (
    <div className="flex flex-col h-[500px] sm:h-[600px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {PERSONALITIES.find(p => p.id === personality)?.emoji}
          </span>
          <span className="text-sm font-medium text-surface-200">
            {PERSONALITIES.find(p => p.id === personality)?.label.split('(')[1]?.replace(')', '') || 'Luna'}
          </span>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-xs text-surface-500 hover:text-surface-300 transition-colors px-2 py-1 rounded border border-surface-700"
        >
          {showSettings ? 'Done' : 'Customize'}
        </button>
      </div>

      {showSettings && (
        <div className="mb-3 p-3 rounded-xl bg-surface-900/80 border border-surface-700 space-y-3">
          <div>
            <label className="text-[10px] text-surface-500 uppercase tracking-wider font-medium">Personality</label>
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              {PERSONALITIES.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPersonality(p.id)}
                  className={`text-left p-2 rounded-lg text-xs border transition-all ${
                    personality === p.id
                      ? 'border-cyan-600/50 bg-cyan-900/20 text-cyan-300'
                      : 'border-surface-700 text-surface-400 hover:border-surface-600'
                  }`}
                >
                  <span className="block">{p.emoji} {p.label.split('(')[0]}</span>
                  <span className="text-[9px] text-surface-500">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] text-surface-500 uppercase tracking-wider font-medium">Language</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="mt-1 w-full bg-surface-950 border border-surface-700 rounded-lg px-3 py-2 text-xs text-surface-200 focus:outline-none focus:border-surface-500"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-cyan-900/40 border border-cyan-800/40 text-surface-100'
                  : 'bg-surface-800/60 border border-surface-700/50 text-surface-200'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              {msg.emotion && msg.emotion.primary !== 'neutral' && (
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-surface-700/50">
                  <span>{msg.emotion.primaryEmoji}</span>
                  <span className="text-[10px] text-surface-500 capitalize">{msg.emotion.primary}</span>
                  {msg.emotion.riskLevel !== 'none' && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                      msg.emotion.riskLevel === 'critical' ? 'bg-red-900/50 text-red-400' :
                      msg.emotion.riskLevel === 'high' ? 'bg-orange-900/50 text-orange-400' :
                      'bg-amber-900/50 text-amber-400'
                    }`}>
                      {msg.emotion.riskLevel}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-surface-800/60 border border-surface-700/50 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-surface-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-surface-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-surface-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {suggestions.map(s => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="text-[11px] px-3 py-1.5 rounded-full border border-surface-700 text-surface-400 hover:text-surface-200 hover:border-surface-500 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder="Type your message..."
          className="flex-1 bg-surface-950 border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-surface-200 placeholder-surface-500 focus:outline-none focus:border-surface-500"
        />
        <Button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading} size="sm">
          Send
        </Button>
      </div>
    </div>
  )
}
