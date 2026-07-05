import { getItem, setItem } from './encrypted-storage'

export type PlantType = 'sunflower' | 'rose' | 'lotus' | 'cherry' | 'fern' | 'hibiscus' | 'moonflower' | 'starlily'
export type QuestId = 'speak-spirit' | 'log-mood' | 'write-journal' | 'meditate' | 'water-garden' | 'read-article' | 'breathe' | 'review-mood'

export interface Plant {
  id: string
  type: PlantType
  stage: 0 | 1 | 2
  earnedAt: number
  progress: number
}

export interface Quest {
  id: QuestId
  label: string
  done: boolean
  xp: number
}

export interface GameState {
  xp: number
  level: number
  streak: number
  lastActiveDate: string
  questDate: string
  quests: Quest[]
  plants: Plant[]
  totalMoods: number
  totalJournals: number
  totalMeditations: number
  totalChats: number
}

const LEVELS = [
  { name: 'Seedling', xp: 0 },
  { name: 'Sprout', xp: 100 },
  { name: 'Bloom', xp: 300 },
  { name: 'Blossom', xp: 600 },
  { name: 'Grove', xp: 1000 },
  { name: 'Garden', xp: 1600 },
  { name: 'Sanctuary', xp: 2400 },
  { name: 'Paradise', xp: 3500 },
]

function getToday(): string {
  return new Date().toDateString()
}

function getDailySeed(): number {
  const d = new Date()
  return (d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) * 7
}

function generateQuests(): Quest[] {
  const seed = getDailySeed()
  const pool: { id: QuestId; label: string; xp: number }[] = [
    { id: 'speak-spirit', label: 'Speak to the Garden Spirit', xp: 30 },
    { id: 'log-mood', label: 'Log your mood', xp: 20 },
    { id: 'write-journal', label: 'Write in your journal', xp: 20 },
    { id: 'meditate', label: 'Meditate for 3 minutes', xp: 25 },
    { id: 'water-garden', label: 'Water your plants', xp: 15 },
    { id: 'breathe', label: 'Complete a breathing exercise', xp: 20 },
    { id: 'review-mood', label: 'Review your weekly mood', xp: 15 },
  ]
  const picked: Quest[] = []
  const used = new Set<number>()
  while (picked.length < 3) {
    const idx = Math.floor((seed + picked.length * 13 + 7) % pool.length)
    if (!used.has(idx)) {
      used.add(idx)
      picked.push({ ...pool[idx], done: false })
    }
  }
  return picked
}

export function getDefaultState(): GameState {
  return {
    xp: 0,
    level: 0,
    streak: 0,
    lastActiveDate: '',
    questDate: getToday(),
    quests: generateQuests(),
    plants: [],
    totalMoods: 0,
    totalJournals: 0,
    totalMeditations: 0,
    totalChats: 0,
  }
}

export function getLevelName(xp: number): string {
  let lvl = 0
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) { lvl = i; break }
  }
  return LEVELS[lvl].name
}

export function getLevelIndex(xp: number): number {
  let lvl = 0
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) { lvl = i; break }
  }
  return lvl
}

export function getNextLevelXp(xp: number): number {
  const idx = getLevelIndex(xp)
  if (idx >= LEVELS.length - 1) return LEVELS[idx].xp
  return LEVELS[idx + 1].xp
}

export function xpForLevel(level: number): number {
  if (level >= LEVELS.length) return LEVELS[LEVELS.length - 1].xp
  return LEVELS[level].xp
}

export async function getGame(): Promise<GameState> {
  const game = await getItem<GameState>('gv-game', getDefaultState())
  const today = getToday()
  if (game.questDate !== today) {
    game.questDate = today
    game.quests = generateQuests()
  }
  return game
}

export async function saveGame(game: GameState): Promise<void> {
  await setItem('gv-game', game)
}

export async function addXp(amount: number): Promise<{ game: GameState; leveledUp: boolean }> {
  const game = await getGame()
  const oldLevel = getLevelIndex(game.xp)
  game.xp += amount
  const newLevel = getLevelIndex(game.xp)
  const leveledUp = newLevel > oldLevel
  await saveGame(game)
  return { game, leveledUp }
}

export async function checkStreak(): Promise<GameState> {
  const game = await getGame()
  const today = getToday()
  if (game.lastActiveDate === today) return game
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  if (game.lastActiveDate === yesterday) {
    game.streak += 1
  } else if (game.lastActiveDate && game.lastActiveDate !== today) {
    game.streak = 1
  } else {
    game.streak = 1
  }
  game.lastActiveDate = today
  await saveGame(game)
  return game
}

export async function completeQuest(questId: QuestId): Promise<GameState> {
  const game = await getGame()
  const quest = game.quests.find(q => q.id === questId)
  if (quest && !quest.done) {
    quest.done = true
    game.xp += quest.xp
    const allDone = game.quests.every(q => q.done)
    if (allDone) game.xp += 20
    await saveGame(game)
  }
  return game
}

export async function addPlant(type: PlantType): Promise<GameState> {
  const game = await getGame()
  const existing = game.plants.find(p => p.type === type)
  if (!existing) {
    game.plants.push({ id: `plant-${Date.now()}`, type, stage: 0, earnedAt: Date.now(), progress: 0 })
  } else if (existing.stage < 2) {
    existing.progress += 1
    if (existing.progress >= 3) {
      existing.stage = Math.min(2, existing.stage + 1) as 0 | 1 | 2
      existing.progress = 0
    }
  }
  await saveGame(game)
  return game
}
