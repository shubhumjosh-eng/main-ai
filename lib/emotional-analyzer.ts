export interface EmotionalState {
  primary: string;
  primaryEmoji: string;
  secondary: string | null;
  intensity: number;
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  riskReasons: string[];
}

const EMOTION_KEYWORDS: Record<string, { emoji: string; keywords: string[]; weight: number }> = {
  joyful: { emoji: '😊', keywords: ['happy', 'joy', 'great', 'wonderful', 'amazing', 'fantastic', 'excellent', 'blessed', 'grateful', 'thankful', 'appreciate', 'love', 'loved', 'beautiful', 'perfect', 'excited', 'thrilled', 'delighted', 'glad', 'cheerful', 'elated', 'ecstatic', 'overjoyed', 'content'], weight: 1 },
  hopeful: { emoji: '🌟', keywords: ['hopeful', 'optimistic', 'confident', 'positive', 'motivated', 'inspired', 'determined', 'encouraged', 'looking forward', 'excited for', 'can do', 'believe'], weight: 0.9 },
  peaceful: { emoji: '😌', keywords: ['peaceful', 'calm', 'relaxed', 'serene', 'tranquil', 'balanced', 'centered', 'mindful', 'at ease', 'content', 'safe', 'comfortable'], weight: 0.8 },
  sad: { emoji: '😢', keywords: ['sad', 'unhappy', 'down', 'depressed', 'depressing', 'miserable', 'heartbroken', 'grief', 'grieving', 'sorrow', 'sorrowful', 'cry', 'crying', 'tears', 'lonely', 'alone', 'isolated', 'empty', 'hollow', 'hurt', 'pain', 'painful', 'suffering', 'devastated', 'hopeless', 'worthless', 'disappointed'], weight: 1.2 },
  anxious: { emoji: '😰', keywords: ['anxious', 'anxiety', 'worried', 'worry', 'nervous', 'stressed', 'stress', 'overwhelmed', 'panic', 'panicked', 'fear', 'afraid', 'scared', 'terrified', 'dread', 'uneasy', 'restless', 'on edge', 'tense', 'frightened', 'paranoid'], weight: 1.2 },
  angry: { emoji: '😠', keywords: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'rage', 'livid', 'resentful', 'bitter', 'hostile', 'agitated', 'pissed', 'fuming', 'enraged', 'frustration'], weight: 1.1 },
  scared: { emoji: '😨', keywords: ['scared', 'afraid', 'terrified', 'frightened', 'horrified', 'panic', 'alarmed', 'spooked', 'petrified', 'terrifying', 'fearful', 'unsafe', 'threatened', 'danger'], weight: 1.3 },
  numb: { emoji: '😶', keywords: ['numb', 'empty', 'hollow', 'detached', 'disconnected', 'nothing', 'void', 'apathetic', 'indifferent', 'unfeeling', 'shut down', 'blank', 'meh', 'whatever'], weight: 1.0 },
  tired: { emoji: '😫', keywords: ['tired', 'exhausted', 'drained', 'fatigued', 'sleepy', 'burnout', 'burned out', 'depleted', 'worn out', 'weary', 'spent', 'dead'], weight: 0.8 },
  grateful: { emoji: '🙏', keywords: ['grateful', 'thankful', 'blessed', 'appreciate', 'appreciation', 'thank you', 'thanks', 'gratitude', 'fortunate', 'lucky'], weight: 0.9 },
  loved: { emoji: '💕', keywords: ['loved', 'cherished', 'supported', 'cared for', 'valued', 'appreciated', 'wanted', 'welcomed', 'belong', 'connected'], weight: 0.9 },
};

const RISK_PATTERNS: { pattern: RegExp; level: 'low' | 'medium' | 'high' | 'critical'; reason: string }[] = [
  { pattern: /kill\s*myself|kill\s*me|end\s*my\s*life|end\s*it\s*all|suicide|suicid|take\s*my\s*own\s*life/i, level: 'critical', reason: 'Suicidal ideation detected' },
  { pattern: /hurt\s*myself|self[\s-]?harm|cut\s*myself|cutting|harm\s*myself/i, level: 'critical', reason: 'Self-harm detected' },
  { pattern: /want\s*to\s*die|wish\s*I\s*were\s*dead|better\s*off\s*dead|don't\s*want\s*to\s*be\s*alive/i, level: 'high', reason: 'Suicidal thoughts detected' },
  { pattern: /hurt\s*someone|hurt\s*them|kill\s*someone|violent|attack/i, level: 'high', reason: 'Potential violence detected' },
  { pattern: /can't\s*go\s*on|can't\s*take\s*it\s*anymore|give\s*up|giving\s*up|no\s*way\s*out/i, level: 'high', reason: 'Hopelessness detected' },
  { pattern: /hate\s*myself|hate\s*who\s*i\s*am|disgusting|worthless|useless|nobody\s*loves\s*me/i, level: 'medium', reason: 'Negative self-talk detected' },
  { pattern: /panic\s*attack|can't\s*breathe|heart\s*racing|hyperventilat/i, level: 'medium', reason: 'Panic symptoms detected' },
  { pattern: /severe\s*depression|severe\s*anxiety|crisis/i, level: 'medium', reason: 'Severe emotional distress detected' },
];

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function analyzeEmotion(text: string): EmotionalState {
  const normalized = normalizeText(text);
  if (!normalized) {
    return { primary: 'neutral', primaryEmoji: '😐', secondary: null, intensity: 0, riskLevel: 'none', riskReasons: [] };
  }

  const riskResults = RISK_PATTERNS
    .filter(r => r.pattern.test(text))
    .map(r => ({ level: r.level, reason: r.reason }));

  const riskLevels: ('none' | 'low' | 'medium' | 'high' | 'critical')[] = ['none', 'low', 'medium', 'high', 'critical'];
  const maxRisk: 'none' | 'low' | 'medium' | 'high' | 'critical' = riskResults.length > 0
    ? riskResults.reduce((a, b) => riskLevels.indexOf(a.level) > riskLevels.indexOf(b.level) ? a : b).level
    : 'none';

  const scores: { emotion: string; score: number }[] = [];
  for (const [emotion, data] of Object.entries(EMOTION_KEYWORDS)) {
    let score = 0;
    const words = normalized.split(/\s+/);
    for (const word of words) {
      if (data.keywords.includes(word)) {
        score += data.weight;
      }
    }
    for (const phrase of data.keywords) {
      if (phrase.includes(' ') && normalized.includes(phrase)) {
        score += data.weight * 2;
      }
    }
    if (score > 0) scores.push({ emotion, score });
  }

  scores.sort((a, b) => b.score - a.score);

  const top = scores.slice(0, 2);
  const primary = top[0]?.emotion || 'neutral';
  const secondary = top[1]?.emotion || null;
  const intensity = top[0]?.score || 0;

  return {
    primary,
    primaryEmoji: EMOTION_KEYWORDS[primary]?.emoji || '😐',
    secondary,
    intensity: Math.min(intensity, 10),
    riskLevel: maxRisk,
    riskReasons: riskResults.map(r => r.reason),
  };
}

export function generateResponse(emotion: EmotionalState, personality: string, language: string): string {
  const name = personality === 'warm' ? 'Luna' : personality === 'professional' ? 'Dr. Sage' : personality === 'fun' ? 'Sunny' : 'Echo';

  if (emotion.riskLevel === 'critical') {
    return 'I hear you, and I want you to know you are not alone. Please reach out for support right now — call or text **988** (Suicide & Crisis Lifeline). They have people trained to help, 24/7. Would you like me to show more resources?';
  }
  if (emotion.riskLevel === 'high') {
    return 'That sounds really heavy. Thank you for trusting me with this. I think it would be good to talk to someone who can support you through this — the Crisis Lifeline is available 24/7 at **988**. Can I help you connect with more resources?';
  }

  const responses: Record<string, string[]> = {
    joyful: [
      `That's wonderful to hear! Your joy is contagious ${emotion.primaryEmoji}. What's been the highlight of your day?`,
      `I love that energy! It's so important to savor these good moments. What are you grateful for right now?`,
    ],
    hopeful: [
      `That hopeful energy is beautiful 🌟. What's something you're looking forward to?`,
      `Hope is such a powerful feeling. I'm glad you're feeling optimistic! What's helping you feel this way?`,
    ],
    peaceful: [
      `That sounds so peaceful 😌. Taking time to just be is really important. What helps you feel this calm?`,
      `Peace feels so good. I'm glad you're finding moments of tranquility.`,
    ],
    sad: [
      `I'm sorry you're feeling this way ${emotion.primaryEmoji}. It's okay to be sad — your feelings are valid. Want to talk about what's weighing on you?`,
      `That sounds really hard. I'm here with you. Sometimes just naming our sadness helps a little. What's going on?`,
    ],
    anxious: [
      `I can sense the anxiety ${emotion.primaryEmoji}. That's really tough. Let's take a slow breath together — breathe in for 4 seconds, hold for 4, out for 4. Want to tell me what's on your mind?`,
      `Anxiety is so hard to carry. You're not alone in this. Can you identify one small thing that might help you feel more grounded right now?`,
    ],
    angry: [
      `It sounds like you're really frustrated ${emotion.primaryEmoji}. That's completely valid. What's been building up?`,
      `Anger can be so overwhelming. Take your time — I'm here to listen. What's triggering these feelings?`,
    ],
    scared: [
      `That sounds really frightening ${emotion.primaryEmoji}. You're safe here. Can you tell me more about what's scaring you?`,
      `Fear is real and valid. I'm here with you. What would feel most supportive right now?`,
    ],
    numb: [
      `That feeling of emptiness or numbness can be confusing ${emotion.primaryEmoji}. You don't have to figure it all out at once. What does your body feel right now?`,
      `Sometimes numbness is our mind's way of protecting us. It's okay to feel nothing too. Is there anything that usually brings you comfort?`,
    ],
    tired: [
      `You sound exhausted ${emotion.primaryEmoji}. Please be gentle with yourself today. Rest is not a luxury — it's a need.`,
      `Burnout is real and it's hard. Can you give yourself permission to rest, even for 5 minutes?`,
    ],
    grateful: [
      `Gratitude is such a beautiful practice 🙏. What are you most grateful for today?`,
      `That's lovely! Recognizing the good things makes such a difference. I'd love to hear more.`,
    ],
    loved: [
      `That's so beautiful! Feeling loved and connected is everything 💕. Who are the people that make you feel this way?`,
      `I'm so glad you have that support. Being loved and valued is so important for our wellbeing.`,
    ],
  };

  const neutralResponses = [
    `${name} here 💙 How are you feeling today? I'm here to listen or help however you need.`,
    `Hey there! I'm here for you. What's on your mind today?`,
  ];

  const pool = responses[emotion.primary] || neutralResponses;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}
