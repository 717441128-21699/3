export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'
export type MechanismType = 'laser' | 'trap' | 'puzzle' | 'door' | 'chest' | 'sensor'
export type EventType = 'malfunction' | 'collapse' | 'bonus'
export type SessionStatus = 'playing' | 'won' | 'lost'
export type RankingCategory = 'clearRate' | 'score' | 'creativity'

export interface InventoryItem {
  id: string
  type: 'blueprint' | 'material'
  itemId: string
  quantity: number
  rarity: Rarity
}

export interface User {
  id: string
  username: string
  level: number
  exp: number
  stamina: number
  reputation: number
  coins: number
  inventory: InventoryItem[]
}

export interface Mechanism {
  id: string
  type: MechanismType
  x: number
  y: number
  config: Record<string, any>
  linkedTo?: string[]
}

export interface ChamberStats {
  plays: number
  clears: number
  avgScore: number
  rating: number
}

export interface Chamber {
  id: string
  ownerId: string
  name: string
  description: string
  gridWidth: number
  gridHeight: number
  mechanisms: Mechanism[]
  difficulty: number
  minLevel: number
  maxPlayers: number
  timeLimit: number
  createdAt: number
  stats: ChamberStats
}

export interface PlayerState {
  userId: string
  x: number
  y: number
  hp: number
  injuries: number
  isAlive: boolean
}

export interface GameEvent {
  id: string
  type: EventType
  triggeredAt: number
  resolved: boolean
  data: Record<string, any>
}

export interface GameSession {
  id: string
  chamberId: string
  players: PlayerState[]
  startTime: number
  timeRemaining: number
  puzzleProgress: number
  injuries: number
  events: GameEvent[]
  status: SessionStatus
}

export interface MarketListing {
  id: string
  sellerId: string
  itemType: 'blueprint' | 'material'
  itemId: string
  itemName?: string
  rarity: Rarity
  price: number
  suggestedPrice: { min: number; max: number; avg: number }
  createdAt: number
}

export interface Transaction {
  id: string
  listingId: string
  buyerId: string
  sellerId: string
  price: number
  itemId: string
  timestamp: number
}

export interface RankingEntry {
  userId: string
  username: string
  category: RankingCategory
  value: number
  rank: number
  week: string
}

export interface ContestEntry {
  id: string
  chamberId: string
  contestantId: string
  contestId: string
  scores: { judgeId: string; score: number; comment?: string }[]
  avgScore: number
  submittedAt: number
}
