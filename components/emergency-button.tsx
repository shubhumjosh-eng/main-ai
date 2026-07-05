'use client'

import { useState } from 'react'
import { Phone, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

const HELPLINES = [
  { name: 'Emergency', number: '999', description: 'Police, Fire, Ambulance' },
  { name: 'Samaritan Befrienders HK', number: '2389 2222', description: '24-hour emotional support' },
  { name: 'The Samaritans HK', number: '2896 0000', description: '24-hour multi-lingual hotline' },
  { name: 'HK Suicide Prevention', number: '18111', description: 'CES 1833 6 3833' },
]

export function EmergencyButton() {
  const [show, setShow] = useState(false)

  function call(number: string) {
    window.location.href = `tel:${number.replace(/\s/g, '')}`
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
      {show && (
        <div className="bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-2xl p-3 shadow-2xl w-56 space-y-1.5 animate-bloom">
          <p className="text-[10px] text-zinc-400 font-medium mb-1.5">HK Helplines</p>
          {HELPLINES.map(h => (
            <button
              key={h.number}
              onClick={() => call(h.number)}
              className="w-full text-left p-2 rounded-xl hover:bg-red-900/20 transition-colors group"
            >
              <p className="text-sm font-medium text-zinc-100 group-hover:text-red-300">{h.number}</p>
              <p className="text-[10px] text-zinc-500">{h.description}</p>
            </button>
          ))}
          <p className="text-[9px] text-zinc-600 mt-1">You are not alone. Help is available.</p>
        </div>
      )}
      <Button
        variant="danger"
        size="md"
        className="rounded-full shadow-lg shadow-red-900/30"
        onClick={() => setShow(!show)}
      >
        {show ? <Heart size={18} /> : <Phone size={18} />}
      </Button>
    </div>
  )
}
