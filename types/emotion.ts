export type Emotion = 'happy' | 'sad' | 'angry' | 'anxious' | 'surprised' | 'neutral'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
