import { NextResponse } from 'next/server'
import { chatWithNpc } from '@/lib/hf-inference'

export async function POST(request: Request) {
  try {
    const { message, emotion, history } = await request.json()
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 })
    }

    const reply = await chatWithNpc(message, emotion || 'neutral', history || [])
    return NextResponse.json({ reply })
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json({ reply: 'The garden is quiet tonight... Let us try again later.' })
  }
}
