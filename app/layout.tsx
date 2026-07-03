import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mindful Space — Mental Wellness',
  description: 'Multi-agent collaboration platform with AI-powered task execution',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface-950 text-surface-200 font-body antialiased">
        {/* fffuel-style complex inline SVG background */}
        <div className="fixed inset-0 pointer-events-none -z-10" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="none" className="absolute inset-0 opacity-[0.03]">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
              <radialGradient id="glow1" cx="20%" cy="20%" r="60%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
                <stop offset="60%" stopColor="#6366f1" stopOpacity="0.03" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="glow2" cx="80%" cy="80%" r="50%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.12" />
                <stop offset="60%" stopColor="#a855f7" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="glow3" cx="50%" cy="0%" r="70%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#glow1)" />
            <rect width="100%" height="100%" fill="url(#glow2)" />
            <rect width="100%" height="100%" fill="url(#glow3)" />
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        {children}
      </body>
    </html>
  );
}
