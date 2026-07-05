const HF_TOKEN = process.env.HF_TOKEN || ''
const HF_CHAT = 'https://router.huggingface.co/v1/chat/completions'
const HF_IMAGE = 'https://api-inference.huggingface.co/models/trpakov/vit-face-expression'

export interface MoodResult {
  emotion: string
  confidence: number
}

const EMOTION_MAP: Record<string, string> = {
  happy: 'happy',
  joy: 'happy',
  sad: 'sad',
  sadness: 'sad',
  angry: 'angry',
  anger: 'angry',
  fearful: 'anxious',
  fear: 'anxious',
  anxious: 'anxious',
  surprised: 'surprised',
  surprise: 'surprised',
  neutral: 'neutral',
  disgust: 'neutral',
  disgusted: 'neutral',
}

export async function classifyMood(imageBase64: string): Promise<MoodResult> {
  try {
    const base64 = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const binary = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
    const blob = new Blob([binary], { type: 'image/jpeg' })

    const res = await fetch(HF_IMAGE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: blob,
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('HF Vision error:', res.status, text)
      return { emotion: 'neutral', confidence: 0.5 }
    }

    const data = await res.json()
    const top = Array.isArray(data) ? data[0] : data
    const label = (top?.label || '').toLowerCase()
    const score = top?.score || 0.5
    const emotion = EMOTION_MAP[label] || 'neutral'
    return { emotion, confidence: score }
  } catch (err) {
    console.error('classifyMood error:', err)
    return { emotion: 'neutral', confidence: 0.5 }
  }
}

export async function chatWithNpc(
  message: string,
  emotion: string,
  history: { role: string; content: string }[]
): Promise<string> {
  try {
    const system = {
      role: 'system',
      content: `You are a gentle garden spirit NPC in a game called Garden of Solace. The user just visited you in their garden. Your role is to be a kind, warm companion. The user's facial expression shows they are feeling "${emotion}". Respond based on their emotion. If they look happy, celebrate with them. If sad, comfort them. If anxious, calm them. If angry, help them ground. Be concise (2-3 sentences), poetic, and warm. Never break character. Use nature metaphors. Keep responses under 200 characters.`
    }

    const messages = [system]
    for (const m of (history || []).slice(-6)) {
      if (m.role === 'user' || m.role === 'assistant') {
        messages.push({ role: m.role as 'user' | 'assistant', content: m.content })
      }
    }
    messages.push({ role: 'user', content: message })

    const res = await fetch(HF_CHAT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemma-3-4b-it',
        messages,
        max_tokens: 200,
        temperature: 0.8,
        top_p: 0.9,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('HF Chat error:', res.status, text)
      return getFallbackReply(emotion)
    }

    const data = await res.json()
    const reply = data?.choices?.[0]?.message?.content?.trim() || ''
    return reply || getFallbackReply(emotion)
  } catch (err) {
    console.error('chatWithNpc error:', err)
    return getFallbackReply(emotion)
  }
}

function getFallbackReply(emotion: string): string {
  const replies: Record<string, string> = {
    happy: 'Your joy fills the garden with light! Tell me what made you smile today.',
    sad: 'I sense a gentle sadness in you... I am here. The pond is calm and patient, like me.',
    anxious: 'Your energy flutters like leaves in the wind. Breathe with me... in... out... You are safe.',
    angry: 'There is fire in your heart today. That is okay. Let us plant something new together.',
    surprised: 'The wind brought something unexpected! Take a breath and let it settle.',
    neutral: 'You are at peace today. That is a beautiful thing. Would you like to explore the garden?',
  }
  return replies[emotion] || replies.neutral
}
