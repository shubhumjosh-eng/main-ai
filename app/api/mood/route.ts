import { NextResponse } from 'next/server'
import { classifyMood } from '@/lib/hf-inference'

export async function POST(request: Request) {
  try {
    const { image } = await request.json()
    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const result = await classifyMood(image)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Mood API error:', err)
    return NextResponse.json({ emotion: 'neutral', confidence: 0.5 })
  }
}
