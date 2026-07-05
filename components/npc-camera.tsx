'use client'

import { useRef, useState, useCallback, type Dispatch, type SetStateAction } from 'react'
import { Camera, CameraOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Emotion } from '@/types/emotion'

interface NpcCameraProps {
  onMoodDetected: (emotion: Emotion, confidence: number) => void
  disabled?: boolean
  setProcessing?: Dispatch<SetStateAction<boolean>>
}

export function NpcCamera({ onMoodDetected, disabled, setProcessing }: NpcCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraOn, setCameraOn] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [error, setError] = useState<string>('')

  const startCamera = useCallback(async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 320, height: 240 },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraOn(true)
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraOn(false)
  }, [])

  const capture = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return
    setError('')
    setCapturing(true)
    setProcessing?.(true)

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) { setCapturing(false); setProcessing?.(false); return }

    ctx.drawImage(video, 0, 0)
    const base64 = canvas.toDataURL('image/jpeg', 0.8)

    try {
      const res = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      })
      const data = await res.json()
      const emotion: Emotion = data.emotion || 'neutral'
      const confidence = data.confidence || 0.5
      onMoodDetected(emotion, confidence)
    } catch {
      setError('Could not analyze mood. Try again.')
    }

    stopCamera()
    setCapturing(false)
    setProcessing?.(false)
  }, [onMoodDetected, stopCamera, setProcessing])

  return (
    <div className="flex flex-col items-center gap-3">
      {cameraOn ? (
        <div className="relative rounded-xl overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-64 h-48 object-cover rounded-xl"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
            <Button size="sm" onClick={capture} disabled={capturing}>
              {capturing ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              {capturing ? 'Analyzing...' : 'Capture Mood'}
            </Button>
            <Button size="sm" variant="ghost" onClick={stopCamera}>
              <CameraOff size={14} />
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="secondary" onClick={startCamera} disabled={disabled || capturing}>
          {capturing ? (
            <Loader2 size={16} className="animate-spin mr-2" />
          ) : (
            <Camera size={16} className="mr-2" />
          )}
          Open Camera
        </Button>
      )}
      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
    </div>
  )
}
