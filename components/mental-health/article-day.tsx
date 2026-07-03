'use client'

import { useState, useMemo } from 'react'

const ARTICLES = [
  {
    title: '5-Minute Mindfulness: A Quick Reset for Busy Days',
    summary: 'Simple mindfulness exercises you can do anywhere — at your desk, on the bus, or in line at the store. No meditation experience needed.',
    category: 'Mindfulness',
    readTime: '4 min',
    source: 'Mindful.org',
    url: 'https://mindful.org/mindfulness-for-beginners/',
  },
  {
    title: "Understanding Your Anxiety: What's Normal and When to Seek Help",
    summary: 'Anxiety is a normal human response, but when does it cross into something that needs professional attention? Learn the signs and coping strategies.',
    category: 'Anxiety',
    readTime: '6 min',
    source: 'ADAA',
    url: 'https://adaa.org/understanding-anxiety',
  },
  {
    title: 'The Science of Sleep: How Rest Affects Your Mental Health',
    summary: 'Sleep and mental health are deeply connected. Discover how improving your sleep hygiene can reduce stress, boost mood, and sharpen focus.',
    category: 'Wellness',
    readTime: '5 min',
    source: 'Sleep Foundation',
    url: 'https://sleepfoundation.org/mental-health',
  },
  {
    title: 'Building Emotional Resilience: Tools That Actually Work',
    summary: 'Resilience is not about toughing it out alone. Learn evidence-based techniques to bounce back from setbacks and grow through challenges.',
    category: 'Growth',
    readTime: '7 min',
    source: 'Psychology Today',
    url: 'https://psychologytoday.com/us/basics/resilience',
  },
  {
    title: 'How to Start a Gratitude Practice (And Why It Works)',
    summary: 'Gratitude rewires your brain for positivity. A step-by-step guide to building a simple daily gratitude habit backed by neuroscience.',
    category: 'Self-Care',
    readTime: '5 min',
    source: 'Greater Good Magazine',
    url: 'https://greatergood.berkeley.edu/topic/gratitude',
  },
  {
    title: 'Recognizing Burnout Before It Breaks You',
    summary: 'Burnout is more than just being tired. Learn the three key signs — exhaustion, cynicism, and inefficacy — and how to recover at each stage.',
    category: 'Stress',
    readTime: '6 min',
    source: 'Mayo Clinic',
    url: 'https://mayoclinic.org/healthy-lifestyle/adult-health/in-depth/burnout/art-20046642',
  },
  {
    title: 'Therapy 101: What to Expect in Your First Session',
    summary: 'Starting therapy can feel intimidating. Here is exactly what happens in a first session so you can walk in informed and at ease.',
    category: 'Therapy',
    readTime: '5 min',
    source: 'NAMI',
    url: 'https://nami.org/About-Mental-Illness/Treatment/Therapy',
  },
  {
    title: 'Digital Detox: Reclaiming Focus in a Distracted World',
    summary: 'Constant notifications fragment our attention and increase stress. Practical steps to reduce screen time and improve your mental clarity.',
    category: 'Wellness',
    readTime: '4 min',
    source: 'Calm Blog',
    url: 'https://calm.com/blog/digital-detox',
  },
  {
    title: 'How Social Connection Protects Your Mental Health',
    summary: 'Loneliness is a public health crisis. Discover why meaningful relationships are essential for mental health and how to build them.',
    category: 'Connection',
    readTime: '6 min',
    source: 'Harvard Health',
    url: 'https://health.harvard.edu/newsletter_article/the-health-benefits-of-strong-relationships',
  },
  {
    title: 'Grounding Techniques for Panic Attacks',
    summary: 'When panic strikes, grounding brings you back to the present. Learn the 5-4-3-2-1 method and other techniques used by therapists.',
    category: 'Anxiety',
    readTime: '4 min',
    source: 'Verywell Mind',
    url: 'https://verywellmind.com/grounding-techniques-for-panic-disorder-2584096',
  },
  {
    title: 'The Connection Between Exercise and Mood',
    summary: 'Exercise is one of the most effective non-medication treatments for depression and anxiety. Find out how much you need and what works best.',
    category: 'Wellness',
    readTime: '5 min',
    source: 'APA',
    url: 'https://apa.org/topics/exercise-stress',
  },
  {
    title: 'Setting Boundaries Without Guilt',
    summary: 'Healthy boundaries protect your mental energy. Practical scripts and strategies for saying no with kindness and confidence.',
    category: 'Growth',
    readTime: '6 min',
    source: 'Psych Central',
    url: 'https://psychcentral.com/lib/how-to-set-healthy-boundaries',
  },
]

function getTodayArticle() {
  const today = new Date()
  const dateStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i)
    hash |= 0
  }
  const idx = Math.abs(hash) % ARTICLES.length
  return ARTICLES[idx]
}

function getWeekArticles() {
  const articles: typeof ARTICLES = []
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    let hash = 0
    for (let j = 0; j < dateStr.length; j++) {
      hash = ((hash << 5) - hash) + dateStr.charCodeAt(j)
      hash |= 0
    }
    const idx = Math.abs(hash) % ARTICLES.length
    if (!articles.find(a => a.title === ARTICLES[idx].title)) {
      articles.push(ARTICLES[idx])
    }
  }
  return articles
}

export function ArticleDay() {
  const [showWeek, setShowWeek] = useState(false)
  const todayArticle = useMemo(() => getTodayArticle(), [])
  const weekArticles = useMemo(() => getWeekArticles(), [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📖</span>
          <h3 className="text-sm font-semibold text-surface-200">Article of the Day</h3>
        </div>
        <button
          onClick={() => setShowWeek(!showWeek)}
          className="text-[10px] text-surface-500 hover:text-surface-300 px-2 py-1 rounded border border-surface-700 transition-colors"
        >
          {showWeek ? 'Today' : 'This Week'}
        </button>
      </div>

      {!showWeek ? (
        <a
          href={todayArticle.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 rounded-xl bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-800/30 hover:from-cyan-900/30 hover:to-blue-900/30 transition-all group"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-900/40 text-cyan-300 font-medium">
              {todayArticle.category}
            </span>
            <span className="text-[8px] text-surface-500">{todayArticle.readTime} read</span>
          </div>
          <h4 className="text-sm font-semibold text-surface-100 group-hover:text-cyan-200 transition-colors">
            {todayArticle.title}
          </h4>
          <p className="text-xs text-surface-400 mt-1.5 leading-relaxed">
            {todayArticle.summary}
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-[9px] text-surface-500">{todayArticle.source}</span>
            <span className="text-[10px] text-cyan-400 group-hover:text-cyan-300 transition-colors">
              Read full article ↗
            </span>
          </div>
        </a>
      ) : (
        <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
          {weekArticles.map((article, i) => {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : d.toLocaleDateString('en', { weekday: 'long' })
            return (
              <a
                key={`${i}-${article.title}`}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-xl bg-surface-900/40 border border-surface-800/50 hover:bg-surface-800/50 hover:border-surface-700 transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] text-surface-500 font-medium">{dayLabel}</span>
                  <span className="text-[8px] px-1 py-0.5 rounded bg-surface-800 text-surface-500">
                    {article.category}
                  </span>
                </div>
                <p className="text-xs font-medium text-surface-200 group-hover:text-cyan-300 transition-colors">
                  {article.title}
                </p>
                <p className="text-[10px] text-surface-500 mt-0.5 line-clamp-2">{article.summary}</p>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
