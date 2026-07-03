import { NextRequest, NextResponse } from 'next/server'

const HF_TOKEN = process.env.HF_TOKEN || ''
const HF_API = 'https://router.huggingface.co/v1/chat/completions'

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()
    if (!message) return NextResponse.json({ error: 'No message' }, { status: 400 })

    const system = {
      role: 'system',
      content: 'You are a warm, supportive mental wellness companion. Respond with empathy, be concise (2-4 sentences), ask gentle follow-up questions. Never provide medical advice — encourage professional help when needed. Use an encouraging, non-judgmental tone.'
    }

    const messages = [system]
    if (history && history.length > 0) {
      for (const m of history.slice(-6)) {
        if (m.role === 'user' || m.role === 'bot') {
          messages.push({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text })
        }
      }
    }
    messages.push({ role: 'user', content: message })

    const res = await fetch(HF_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemma-3-4b-it',
        messages,
        max_tokens: 256,
        temperature: 0.8,
        top_p: 0.9,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('HF API error:', res.status, errText)
      return NextResponse.json({ error: 'AI service unavailable', fallback: true }, { status: 200 })
    }

    const data = await res.json()
    const reply = data?.choices?.[0]?.message?.content?.trim() || ''

    return NextResponse.json({ reply, model: 'gemma-3-4b-it' })
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: 'AI service unavailable', fallback: true }, { status: 200 })
  }
}
