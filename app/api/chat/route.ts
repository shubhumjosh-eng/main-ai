import { NextRequest, NextResponse } from 'next/server'

const HF_TOKEN = process.env.HF_TOKEN || ''
const HF_API = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium'

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()
    if (!message) return NextResponse.json({ error: 'No message' }, { status: 400 })

    const prompt = history && history.length > 0
      ? history.map((m: { role: string; text: string }) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n') + `\nUser: ${message}\nAssistant:`
      : `User: ${message}\nAssistant:`

    const res = await fetch(HF_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 256, temperature: 0.7, top_p: 0.9, do_sample: true, return_full_text: false },
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('HF API error:', res.status, errText)
      return NextResponse.json({ error: 'AI service unavailable', fallback: true }, { status: 200 })
    }

    const data = await res.json()
    const reply = data?.[0]?.generated_text?.trim() || ''

    return NextResponse.json({ reply, model: 'DialoGPT-medium' })
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: 'AI service unavailable', fallback: true }, { status: 200 })
  }
}
