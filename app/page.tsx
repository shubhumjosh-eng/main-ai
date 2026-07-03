'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { OnboardingOverlay } from '@/components/mental-health/onboarding-overlay'
import { EmergencyButton } from '@/components/mental-health/emergency-button'
import { Chatbot } from '@/components/mental-health/chatbot'
import { MoodTracker } from '@/components/mental-health/mood-tracker'
import { Journal } from '@/components/mental-health/journal'
import { ArticleDay } from '@/components/mental-health/article-day'
import { SeekHelp } from '@/components/mental-health/seek-help'
import { Meditation } from '@/components/mental-health/meditation'
import { unlockStorage, isVaultCreated, isUnlocked, setItem, getItem, lockStorage } from '@/lib/encrypted-storage'
import { saveMood, getMoods } from '@/lib/mood-storage'

type Tab = 'chat' | 'mood' | 'journal' | 'article' | 'meditate' | 'help' | 'settings'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'mood', label: 'Mood', icon: '😊' },
  { id: 'journal', label: 'Journal', icon: '📝' },
  { id: 'article', label: 'Article', icon: '📖' },
  { id: 'meditate', label: 'Meditate', icon: '🧘' },
  { id: 'help', label: 'Help', icon: '🆘' },
]

export default function MentalHealthPage() {
  const [tab, setTab] = useState<Tab>('chat')
  const [menuOpen, setMenuOpen] = useState(false)
  const [onboarding, setOnboarding] = useState(true)
  const [locked, setLocked] = useState(true)
  const [unlockPin, setUnlockPin] = useState('')
  const [unlockError, setUnlockError] = useState('')
  const [pinAttempts, setPinAttempts] = useState(0)
  const [shareWithPro, setShareWithPro] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [proConsent, setProConsent] = useState(false)
  const [riskAlerts, setRiskAlerts] = useState<{ reason: string; severity: string }[]>([])
  const [notificationsGranted, setNotificationsGranted] = useState(false)
  const [exportStatus, setExportStatus] = useState('')
  const [showRiskBanner, setShowRiskBanner] = useState(false)
  const [initState, setInitState] = useState<'loading' | 'onboarding' | 'locked' | 'ready'>('loading')
  const [loadingMessage, setLoadingMessage] = useState('Initializing your secure space...')

  useEffect(() => {
    const init = async () => {
      setLoadingMessage('Checking security...')
      const vaultCreated = isVaultCreated()
      if (!vaultCreated) {
        setInitState('onboarding')
        setOnboarding(true)
        setLocked(true)
        setLoadingMessage('')
        return
      }
      setInitState('locked')
      setLocked(true)
      setOnboarding(false)
      setLoadingMessage('')
    }
    init()
  }, [])

  useEffect(() => {
    getItem<boolean>('mh-pro-consent', false).then(val => {
      setProConsent(val)
      setShareWithPro(val)
    })
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsGranted(true)
    }
  }, [])

  useEffect(() => {
    if (!notificationsGranted) return
    const checkReminder = () => {
      const h = new Date().getHours()
      const m = new Date().getMinutes()
      const lastReminder = localStorage.getItem('mh-last-reminder-date')
      const today = new Date().toDateString()
      if (lastReminder === today) return

      const schedule = [
        { hour: 9, label: 'morning' },
        { hour: 14, label: 'afternoon' },
        { hour: 20, label: 'night' },
      ]
      for (const s of schedule) {
        if (h === s.hour && m < 5) {
          new Notification('Mindful Space', {
            body: `Good ${s.label}! How are you feeling? 🌅`,
          })
          localStorage.setItem('mh-last-reminder-date', today)
          break
        }
      }
    }
    checkReminder()
    const interval = setInterval(checkReminder, 60000)
    return () => clearInterval(interval)
  }, [notificationsGranted])

  useEffect(() => {
    if (riskAlerts.length > 0) {
      setShowRiskBanner(true)
      const timeout = setTimeout(() => setShowRiskBanner(false), 8000)
      return () => clearTimeout(timeout)
    }
  }, [riskAlerts.length])

  const handleOnboard = async (pin: string, sharePro: boolean) => {
    setLoadingMessage('Encrypting your vault...')
    const ok = await unlockStorage(pin)
    if (ok) {
      setLocked(false)
      setOnboarding(false)
      setShareWithPro(sharePro)
      setProConsent(sharePro)
      setInitState('ready')
      await setItem('mh-pro-consent', sharePro)
      if (sharePro) {
        try {
          await fetch('/api/professional/patients/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patientId: 'user-1', consent: true }),
          })
        } catch {}
      }
      setLoadingMessage('')
    }
  }

  const handleUnlock = async () => {
    setLoadingMessage('Decrypting vault...')
    const ok = await unlockStorage(unlockPin)
    if (ok) {
      setLocked(false)
      setUnlockError('')
      setPinAttempts(0)
      setInitState('ready')
      setLoadingMessage('')
    } else {
      setPinAttempts(prev => prev + 1)
      setUnlockError(pinAttempts >= 3 ? 'Too many attempts. Your data remains encrypted.' : 'Incorrect PIN')
      setLoadingMessage('')
    }
  }

  const handleMoodFromChatbot = useCallback(async (detected: { emotion: string; emoji: string; note: string }) => {
    await saveMood({
      date: new Date().toDateString(),
      timestamp: new Date().toISOString(),
      mood: detected.emotion,
      emoji: detected.emoji,
      note: detected.note,
      source: 'chatbot',
    })
  }, [])

  const handleRiskDetected = useCallback(async (risk: { reason: string; severity: string }) => {
    setRiskAlerts(prev => [...prev, risk])
    if (shareWithPro) {
      try {
        await fetch('/api/professional/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: 'user-1',
            reason: risk.reason,
            severity: risk.severity,
            triggeredBy: 'chatbot',
          }),
        })
      } catch {}
    }
  }, [shareWithPro])

  const requestNotifications = async () => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'granted') {
      setNotificationsGranted(true)
      return
    }
    const result = await Notification.requestPermission()
    if (result === 'granted') {
      setNotificationsGranted(true)
      new Notification('Mindful Space', { body: 'You\'ll get gentle mood reminders 3 times a day 💙' })
    }
  }

  const exportData = async () => {
    setExportStatus('Preparing export...')
    try {
      const moods = await getMoods()
      const journals = await getItem<unknown[]>('mh-journal', [])
      const goals = await getItem<unknown[]>('mh-goals', [])
      const meditation = await getItem<unknown[]>('mh-meditation', [])
      const exportObj = {
        exportedAt: new Date().toISOString(),
        moods,
        journals,
        goals,
        meditation,
      }
      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mindful-space-export-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      setExportStatus('Data exported successfully!')
    } catch {
      setExportStatus('Export failed')
    }
    setTimeout(() => setExportStatus(''), 3000)
  }

  const toggleProConsent = async () => {
    const newVal = !proConsent
    setProConsent(newVal)
    setShareWithPro(newVal)
    await setItem('mh-pro-consent', newVal)
    try {
      await fetch('/api/professional/patients/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: 'user-1', consent: newVal }),
      })
    } catch {}
  }

  const handleLock = () => {
    lockStorage()
    setLocked(true)
    setInitState('locked')
  }

  if (initState === 'loading') {
    return (
      <div className="relative min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="fixed inset-0 bg-mesh bg-grid pointer-events-none -z-10" />
        <div className="text-center space-y-4">
          <div className="flex justify-center gap-1">
            <span className="w-3 h-3 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-3 h-3 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-surface-400 text-sm">{loadingMessage}</p>
        </div>
      </div>
    )
  }

  if (onboarding) {
    return <OnboardingOverlay onComplete={handleOnboard} />
  }

  if (locked) {
    return (
      <div className="relative min-h-screen bg-surface-950 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-mesh bg-grid pointer-events-none -z-10" />
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="text-6xl">🔐</div>
          <h1 className="text-2xl font-heading font-bold text-surface-50">Your Space is Locked</h1>
          <p className="text-surface-400 text-sm">Enter your PIN to access your encrypted data.</p>
          <div className="space-y-3">
            <input
              type="password"
              value={unlockPin}
              onChange={e => { setUnlockPin(e.target.value); setUnlockError('') }}
              onKeyDown={e => { if (e.key === 'Enter') handleUnlock() }}
              placeholder="Enter your PIN"
              className="w-full bg-surface-950 border border-surface-700 rounded-lg px-4 py-3 text-sm text-surface-200 placeholder-surface-500 focus:outline-none focus:border-surface-500 text-center tracking-widest"
              autoFocus
              disabled={pinAttempts >= 5}
            />
            {unlockError && <p className="text-xs text-red-400">{unlockError}</p>}
            {pinAttempts >= 5 && (
              <p className="text-xs text-amber-400">Maximum attempts reached. Your data is securely encrypted.</p>
            )}
            <Button onClick={handleUnlock} disabled={!unlockPin || pinAttempts >= 5} className="w-full">
              Unlock
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-surface-950">
      <div className="fixed inset-0 bg-mesh bg-grid pointer-events-none -z-10" />

      {/* Risk alert banner */}
      {showRiskBanner && riskAlerts.length > 0 && (
        <div className="fixed top-4 left-4 right-4 z-30 max-w-lg mx-auto">
          <div className="p-3 rounded-xl bg-red-900/80 border border-red-700/50 backdrop-blur shadow-2xl">
            <div className="flex items-start gap-2">
              <span className="text-lg shrink-0">⚠️</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-red-200">Concern detected</p>
                <p className="text-[10px] text-red-300 mt-0.5">{riskAlerts[riskAlerts.length - 1]?.reason}</p>
                {shareWithPro && (
                  <p className="text-[9px] text-amber-400 mt-1">Professional has been notified.</p>
                )}
              </div>
              <button onClick={() => setShowRiskBanner(false)} className="text-red-400 text-xs">✕</button>
            </div>
          </div>
        </div>
      )}

      <EmergencyButton />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-6">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-surface-700 bg-surface-900/50 text-[10px] text-surface-400">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                Private & Encrypted
              </div>
              {shareWithPro && (
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-cyan-700/50 bg-cyan-900/20 text-[9px] text-cyan-400">
                  👩‍⚕️ Pro Connected
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="text-surface-500 hover:text-surface-300 text-sm px-2 py-1 rounded border border-surface-700"
              >
                ⚙️
              </button>
            </div>
          </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-surface-50">
            Solce
          </h1>
          <p className="text-surface-400 text-xs sm:text-sm mt-1 max-w-md">
            Your private sanctuary. Chat, track, journal, and grow — all encrypted on your device.
          </p>
        </header>

        {/* Settings panel */}
        {settingsOpen && (
          <Card className="mb-6 border-surface-700 bg-surface-900/80 backdrop-blur">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-surface-200">Settings</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between gap-3 p-3 rounded-lg bg-surface-950/50 border border-surface-800 cursor-pointer">
                  <div>
                    <p className="text-xs font-medium text-surface-200">Professional Connection</p>
                    <p className="text-[9px] text-surface-500">Share data with a mental health professional</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={proConsent}
                    onChange={toggleProConsent}
                    className="rounded border-surface-600 bg-surface-800 size-4"
                  />
                </label>

                <div className="p-3 rounded-lg bg-surface-950/50 border border-surface-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-surface-200">Mood Reminders</p>
                      <p className="text-[9px] text-surface-500">Morning, afternoon, and night check-ins</p>
                    </div>
                    <button
                      onClick={requestNotifications}
                      className={`px-3 py-1 rounded-lg text-[9px] font-medium border transition-all ${
                        notificationsGranted
                          ? 'border-emerald-700/50 bg-emerald-900/20 text-emerald-400'
                          : 'border-surface-700 text-surface-400 hover:border-surface-500'
                      }`}
                    >
                      {notificationsGranted ? '✅ Active' : '🔔 Enable'}
                    </button>
                  </div>
                </div>

                <button
                  onClick={exportData}
                  className="w-full p-3 rounded-lg bg-surface-950/50 border border-surface-800 text-left hover:bg-surface-900/50 transition-colors"
                >
                  <p className="text-xs font-medium text-surface-200">📥 Export My Data</p>
                  <p className="text-[9px] text-surface-500">Download all your data as JSON</p>
                  {exportStatus && (
                    <p className="text-[9px] text-emerald-400 mt-1">{exportStatus}</p>
                  )}
                </button>

                <div className="p-3 rounded-lg bg-surface-950/50 border border-surface-800">
                  <p className="text-[10px] text-surface-500">
                    🔒 All data is encrypted with AES-GCM using your PIN. Nothing leaves your device
                    without your explicit consent.
                  </p>
                </div>

                <Button variant="ghost" size="sm" onClick={handleLock} className="text-amber-400 hover:text-amber-300">
                  Lock & Exit
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hamburger menu */}
        <div className="relative mb-6">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-900/60 border border-surface-800 text-surface-300 hover:text-surface-50 transition-colors w-full"
          >
            <span className="text-lg">{TABS.find(t => t.id === tab)?.icon}</span>
            <span className="text-sm font-medium">{TABS.find(t => t.id === tab)?.label}</span>
            <span className="ml-auto text-surface-500">{menuOpen ? '▲' : '▼'}</span>
          </button>

          {menuOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 p-1 rounded-xl bg-surface-900 border border-surface-800 shadow-xl z-20">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setMenuOpen(false) }}
                  className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    tab === t.id
                      ? 'bg-surface-800 text-surface-50'
                      : 'text-surface-500 hover:text-surface-300 hover:bg-surface-800/50'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                  {tab === t.id && <span className="ml-auto text-[10px] text-cyan-500">●</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <Card className="border-surface-800 bg-surface-900/60 backdrop-blur">
          <CardContent className="p-4 sm:p-6">
            {tab === 'chat' && (
              <Chatbot
                onMoodDetected={handleMoodFromChatbot}
                onRiskDetected={handleRiskDetected}
              />
            )}
            {tab === 'mood' && <MoodTracker />}
            {tab === 'journal' && <Journal shareWithPro={shareWithPro} />}
            {tab === 'article' && <ArticleDay />}
            {tab === 'meditate' && <Meditation />}
            {tab === 'help' && <SeekHelp />}
            {tab === 'settings' && (
              <div className="text-center text-surface-500 text-sm py-8">
                Settings panel above. Click ⚙️ to configure.
              </div>
            )}
          </CardContent>
        </Card>

        <footer className="mt-6 text-center text-[9px] text-surface-600">
          All data encrypted with AES-GCM · Stored only on your device · PIN cannot be recovered
        </footer>
      </div>
    </div>
  )
}
