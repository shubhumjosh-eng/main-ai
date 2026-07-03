'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface OnboardingOverlayProps {
  onComplete: (pin: string, shareWithPro: boolean) => void
}

export function OnboardingOverlay({ onComplete }: OnboardingOverlayProps) {
  const [step, setStep] = useState(0)
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [shareWithPro, setShareWithPro] = useState(false)
  const [error, setError] = useState('')

  const steps = [
    {
      title: 'Your privacy is our priority',
      content: 'All your data is encrypted and stored only on your device. Nothing is ever sent to our servers unless you explicitly choose to share it with a professional.',
      icon: '🔒',
    },
    {
      title: 'Connect with a professional (optional)',
      content: 'You can choose to share your data with a licensed mental health professional. They can monitor your journal letters and receive alerts if the chatbot detects concerning patterns. You can change this anytime.',
      icon: '👩‍⚕️',
    },
    {
      title: 'Set your security PIN',
      content: 'This PIN encrypts all your data. It cannot be recovered if forgotten.',
      icon: '🔐',
    },
  ]

  const handleNext = () => {
    if (step === 1) {
      setStep(2)
      return
    }
    if (step === 2) {
      if (pin.length < 4) {
        setError('PIN must be at least 4 characters')
        return
      }
      if (pin !== confirmPin) {
        setError('PINs do not match')
        return
      }
      setError('')
      onComplete(pin, shareWithPro)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/95 backdrop-blur-sm p-4">
      <div className="w-full max-w-md">
        {step === 0 && (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-heading font-bold text-surface-50">Your privacy is our priority</h2>
            <p className="text-surface-400 text-sm leading-relaxed">
              All your data is encrypted and stored only on your device. Nothing is ever sent to our servers
              unless you explicitly choose to share it with a professional.
            </p>
            <div className="flex justify-center gap-3 pt-4">
              <Button onClick={() => setStep(1)}>Get Started</Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">👩‍⚕️</div>
            <h2 className="text-2xl font-heading font-bold text-surface-50">Connect with a professional</h2>
            <p className="text-surface-400 text-sm leading-relaxed">
              You can choose to share your data with a licensed mental health professional.
              They can monitor your journal letters and receive alerts if the chatbot detects
              concerning patterns. You can change this anytime in Settings.
            </p>
            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={() => { setShareWithPro(true); setStep(2); }}>
                Yes, I'd like professional support
              </Button>
              <Button variant="ghost" onClick={() => { setShareWithPro(false); setStep(2); }}>
                No, I'll use the app privately
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-heading font-bold text-surface-50">Set your security PIN</h2>
            <p className="text-surface-400 text-sm leading-relaxed">
              This PIN encrypts all your data. It cannot be recovered if forgotten.
            </p>
            <div className="space-y-3 max-w-xs mx-auto">
              <input
                type="password"
                value={pin}
                onChange={e => { setPin(e.target.value); setError('') }}
                placeholder="Enter PIN (4+ characters)"
                className="w-full bg-surface-950 border border-surface-700 rounded-lg px-4 py-2.5 text-sm text-surface-200 placeholder-surface-500 focus:outline-none focus:border-surface-500 text-center tracking-widest"
                autoFocus
              />
              <input
                type="password"
                value={confirmPin}
                onChange={e => { setConfirmPin(e.target.value); setError('') }}
                placeholder="Confirm PIN"
                className="w-full bg-surface-950 border border-surface-700 rounded-lg px-4 py-2.5 text-sm text-surface-200 placeholder-surface-500 focus:outline-none focus:border-surface-500 text-center tracking-widest"
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <Button onClick={handleNext} disabled={!pin || !confirmPin} className="w-full">
                Secure My Space
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
