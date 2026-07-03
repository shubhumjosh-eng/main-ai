'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function EmergencyButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-red-600/90 hover:bg-red-600 text-white text-sm font-semibold shadow-lg shadow-red-900/40 hover:shadow-red-800/60 transition-all hover:scale-105 active:scale-95"
      >
        <span className="text-lg">🆘</span>
        <span className="hidden sm:inline">Emergency</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface-900 border border-surface-700 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="text-center">
              <div className="text-5xl mb-3">❤️</div>
              <h2 className="text-xl font-heading font-bold text-surface-50">You are not alone</h2>
              <p className="text-surface-400 text-sm mt-1">Help is available 24/7. Please reach out.</p>
            </div>

            <div className="space-y-3">
              <a
                href="tel:999"
                className="flex items-center gap-3 p-4 rounded-xl bg-red-900/30 border border-red-800/40 hover:bg-red-900/50 transition-colors group"
              >
                <span className="text-3xl">🚨</span>
                <div>
                  <p className="text-sm font-semibold text-surface-50 group-hover:text-red-300 transition-colors">
                    Emergency — Police
                  </p>
                  <p className="text-xs text-surface-400">Call 999 — life-threatening emergencies</p>
                </div>
              </a>

              <a
                href="tel:18111"
                className="flex items-center gap-3 p-4 rounded-xl bg-red-900/30 border border-orange-800/40 hover:bg-red-900/50 transition-colors group"
              >
                <span className="text-3xl">📞</span>
                <div>
                  <p className="text-sm font-semibold text-surface-50 group-hover:text-red-300 transition-colors">
                    Mental Health Support Hotline
                  </p>
                  <p className="text-xs text-surface-400">Call 18111 — 24-hour emotional support</p>
                </div>
              </a>

              <a
                href="tel:23892222"
                className="flex items-center gap-3 p-4 rounded-xl bg-surface-800/60 border border-surface-700 hover:bg-surface-800 transition-colors group"
              >
                <span className="text-3xl">💬</span>
                <div>
                  <p className="text-sm font-semibold text-surface-50 group-hover:text-cyan-300 transition-colors">
                    Samaritan Befrienders HK
                  </p>
                  <p className="text-xs text-surface-400">Call 2389 2222 — 24-hour suicide prevention</p>
                </div>
              </a>

              <a
                href="tel:28960000"
                className="flex items-center gap-3 p-4 rounded-xl bg-surface-800/60 border border-surface-700 hover:bg-surface-800 transition-colors group"
              >
                <span className="text-3xl">🏥</span>
                <div>
                  <p className="text-sm font-semibold text-surface-50 group-hover:text-cyan-300 transition-colors">
                    The Samaritans HK
                  </p>
                  <p className="text-xs text-surface-400">Call 2896 0000 — 24-hour multilingual support</p>
                </div>
              </a>
            </div>

            <Button variant="ghost" onClick={() => setOpen(false)} className="w-full text-surface-400">
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
