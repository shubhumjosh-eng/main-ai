# Garden of Solace

A gamified mental wellness garden where your emotions shape the world.

-   **NPC Spirit** reads your facial expression via webcam and responds emotionally
-   **Garden** grows as you complete daily self-care quests
-   **Journal** & mood tracker — encrypted client-side with AES-GCM
-   **Streaks, XP, Levels** — game mechanics to motivate daily practice
-   **HK Emergency Helplines** — one tap away

## Getting Started

```bash
npm install   # install dependencies
npm run dev   # start dev server on port 3000
```

Set `HF_TOKEN` in your environment for Hugging Face API access (mood detection + NPC chat).

## Tech Stack

-   Next.js 16 + React 19
-   Tailwind CSS 4
-   Hugging Face Inference API (vit-face-expression + gemma-3-4b-it)
-   Web Crypto API (AES-GCM encryption)
