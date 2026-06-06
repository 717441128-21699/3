export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'
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

interface StoreCollections {
  users: User[]
  chambers: Chamber[]
  sessions: GameSession[]
  listings: MarketListing[]
  transactions: Transaction[]
  rankings: RankingEntry[]
  contestEntries: ContestEntry[]
}

class MemoryStore {
  private data: StoreCollections

  constructor() {
    this.data = {
      users: [],
      chambers: [],
      sessions: [],
      listings: [],
      transactions: [],
      rankings: [],
      contestEntries: [],
    }
    this.initializeMockData()
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  }

  private initializeMockData(): void {
    const now = Date.now()

    this.data.users = [
      {
        id: 'u1',
        username: '迷室工匠',
        level: 15,
        exp: 3200,
        stamina: 80,
        reputation: 950,
        coins: 12500,
        inventory: [
          { id: 'inv1', type: 'blueprint', itemId: 'bp_laser_net', quantity: 1, rarity: 'epic' },
          { id: 'inv2', type: 'material', itemId: 'mat_copper', quantity: 50, rarity: 'common' },
          { id: 'inv3', type: 'material', itemId: 'mat_steel', quantity: 20, rarity: 'rare' },
        ],
      },
      {
        id: 'u2',
        username: '暗夜探险家',
        level: 22,
        exp: 5800,
        stamina: 95,
        reputation: 1420,
        coins: 28700,
        inventory: [
          { id: 'inv4', type: 'blueprint', itemId: 'bp_trap_complex', quantity: 2, rarity: 'rare' },
          { id: 'inv5', type: 'material', itemId: 'mat_crystal', quantity: 8, rarity: 'epic' },
        ],
      },
      {
        id: 'u3',
        username: '机关大师',
        level: 30,
        exp: 9500,
        stamina: 100,
        reputation: 2100,
        coins: 56000,
        inventory: [
          { id: 'inv6', type: 'blueprint', itemId: 'bp_puzzle_master', quantity: 1, rarity: 'legendary' },
          { id: 'inv7', type: 'material', itemId: 'mat_gold', quantity: 15, rarity: 'legendary' },
          { id: 'inv8', type: 'material', itemId: 'mat_wood', quantity: 100, rarity: 'common' },
        ],
      },
    ]

    this.data.chambers = [
      {
        id: 'ch1',
        ownerId: 'u1',
        name: '古墓迷踪',
        description: '一座被遗忘的千年古墓，机关重重，宝藏深藏其中。需要破解符文谜题才能逃脱。',
        gridWidth: 16,
        gridHeight: 12,
        mechanisms: [
          { id: 'm1', type: 'laser', x: 4, y: 3, config: { damage: 20, interval: 2000 }, linkedTo: ['m5'] },
          { id: 'm2', type: 'laser', x: 8, y: 3, config: { damage: 20, interval: 2000 }, linkedTo: ['m5'] },
          { id: 'm3', type: 'trap', x: 6, y: 6, config: { damage: 30, triggerChance: 0.6 } },
          { id: 'm4', type: 'trap', x: 10, y: 8, config: { damage: 30, triggerChance: 0.6 } },
          { id: 'm5', type: 'puzzle', x: 12, y: 5, config: { type: 'rune', answer: '龙', hints: 3 } },
          { id: 'm6', type: 'sensor', x: 2, y: 8, config: { range: 2 }, linkedTo: ['m1'] },
          { id: 'm7', type: 'door', x: 14, y: 6, config: { locked: true, unlockMechanism: 'm5' } },
          { id: 'm8', type: 'chest', x: 15, y: 6, config: { reward: 'bp_laser_net', coins: 500 } },
        ],
        difficulty: 6,
        minLevel: 5,
        maxPlayers: 4,
        timeLimit: 600,
        createdAt: now - 86400000 * 5,
        stats: { plays: 42, clears: 15, avgScore: 720, rating: 4.2 },
      },
      {
        id: 'ch2',
        ownerId: 'u3',
        name: '机械心脏',
        description: '蒸汽朋克风格的机械城堡，核心即将爆炸，必须在限定时间内关闭所有开关。',
        gridWidth: 16,
        gridHeight: 12,
        mechanisms: [
          { id: 'm9', type: 'trap', x: 3, y: 2, config: { damage: 25, triggerChance: 0.7 } },
          { id: 'm10', type: 'trap', x: 7, y: 4, config: { damage: 25, triggerChance: 0.7 } },
          { id: 'm11', type: 'trap', x: 11, y: 2, config: { damage: 25, triggerChance: 0.7 } },
          { id: 'm12', type: 'puzzle', x: 5, y: 7, config: { type: 'sequence', steps: 4, hints: 2 } },
          { id: 'm13', type: 'puzzle', x: 10, y: 7, config: { type: 'math', difficulty: 'hard' } },
          { id: 'm14', type: 'puzzle', x: 13, y: 4, config: { type: 'pattern', tiles: 9 } },
          { id: 'm15', type: 'laser', x: 2, y: 9, config: { damage: 35, interval: 1500 }, linkedTo: ['m16'] },
          { id: 'm16', type: 'laser', x: 14, y: 9, config: { damage: 35, interval: 1500 }, linkedTo: ['m15'] },
          { id: 'm17', type: 'sensor', x: 8, y: 9, config: { range: 3 }, linkedTo: ['m15', 'm16'] },
          { id: 'm18', type: 'door', x: 8, y: 11, config: { locked: true, unlockMechanisms: ['m12', 'm13', 'm14'] } },
          { id: 'm19', type: 'chest', x: 8, y: 0, config: { reward: 'bp_puzzle_master', coins: 1200 } },
        ],
        difficulty: 9,
        minLevel: 15,
        maxPlayers: 3,
        timeLimit: 480,
        createdAt: now - 86400000 * 12,
        stats: { plays: 87, clears: 12, avgScore: 580, rating: 4.8 },
      },
      {
        id: 'ch3',
        ownerId: 'u2',
        name: '幽灵庄园',
        description: '传说中的闹鬼庄园，诡异的幻影四处飘荡，解开神秘家族的秘密才能离开。',
        gridWidth: 16,
        gridHeight: 12,
        mechanisms: [
          { id: 'm20', type: 'sensor', x: 1, y: 1, config: { range: 4 }, linkedTo: ['m21'] },
          { id: 'm21', type: 'laser', x: 5, y: 1, config: { damage: 15, interval: 3000 } },
          { id: 'm22', type: 'puzzle', x: 3, y: 5, config: { type: 'password', password: '1847' } },
          { id: 'm23', type: 'trap', x: 7, y: 6, config: { damage: 20, triggerChance: 0.5 } },
          { id: 'm24', type: 'puzzle', x: 12, y: 3, config: { type: 'rune', answer: '永恒' } },
          { id: 'm25', type: 'door', x: 8, y: 8, config: { locked: true, unlockMechanisms: ['m22', 'm24'] } },
          { id: 'm26', type: 'chest', x: 10, y: 10, config: { reward: 'mat_crystal', coins: 800 } },
        ],
        difficulty: 4,
        minLevel: 3,
        maxPlayers: 5,
        timeLimit: 720,
        createdAt: now - 86400000 * 3,
        stats: { plays: 28, clears: 18, avgScore: 850, rating: 3.9 },
      },
      {
        id: 'ch4',
        ownerId: 'u1',
        name: '深海囚笼',
        description: '沉入海底的古代监狱，水压持续增加，氧气正在耗尽，快速找到逃生路线！',
        gridWidth: 16,
        gridHeight: 12,
        mechanisms: [
          { id: 'm27', type: 'trap', x: 2, y: 4, config: { damage: 40, triggerChance: 0.8 } },
          { id: 'm28', type: 'trap', x: 6, y: 2, config: { damage: 40, triggerChance: 0.8 } },
          { id: 'm29', type: 'trap', x: 10, y: 4, config: { damage: 40, triggerChance: 0.8 } },
          { id: 'm30', type: 'trap', x: 13, y: 7, config: { damage: 40, triggerChance: 0.8 } },
          { id: 'm31', type: 'laser', x: 4, y: 8, config: { damage: 25, interval: 1200 }, linkedTo: ['m32'] },
          { id: 'm32', type: 'laser', x: 8, y: 8, config: { damage: 25, interval: 1200 }, linkedTo: ['m31'] },
          { id: 'm33', type: 'laser', x: 12, y: 8, config: { damage: 25, interval: 1200 } },
          { id: 'm34', type: 'puzzle', x: 7, y: 10, config: { type: 'pattern', tiles: 16, hints: 1 } },
          { id: 'm35', type: 'sensor', x: 1, y: 10, config: { range: 5 }, linkedTo: ['m31', 'm32', 'm33'] },
          { id: 'm36', type: 'door', x: 15, y: 5, config: { locked: true, unlockMechanism: 'm34' } },
          { id: 'm37', type: 'chest', x: 14, y: 11, config: { reward: 'mat_gold', coins: 2000 } },
        ],
        difficulty: 8,
        minLevel: 12,
        maxPlayers: 4,
        timeLimit: 360,
        createdAt: now - 86400000 * 8,
        stats: { plays: 63, clears: 8, avgScore: 490, rating: 4.5 },
      },
      {
        id: 'ch5',
        ownerId: 'u2',
        name: '星辰试炼',
        description: '一座以星座为主题的神秘试炼场，根据星象排列解开谜题，获得星之祝福。',
        gridWidth: 16,
        gridHeight: 12,
        mechanisms: [
          { id: 'm38', type: 'puzzle', x: 2, y: 2, config: { type: 'constellation', constellation: 'orion' } },
          { id: 'm39', type: 'puzzle', x: 13, y: 2, config: { type: 'constellation', constellation: 'bigDipper' } },
          { id: 'm40', type: 'puzzle', x: 7, y: 5, config: { type: 'constellation', constellation: 'cassiopeia' } },
          { id: 'm41', type: 'sensor', x: 7, y: 2, config: { range: 2 }, linkedTo: ['m42'] },
          { id: 'm42', type: 'laser', x: 4, y: 5, config: { damage: 18, interval: 2500 } },
          { id: 'm43', type: 'laser', x: 11, y: 5, config: { damage: 18, interval: 2500 } },
          { id: 'm44', type: 'trap', x: 5, y: 9, config: { damage: 22, triggerChance: 0.55 } },
          { id: 'm45', type: 'trap', x: 10, y: 9, config: { damage: 22, triggerChance: 0.55 } },
          { id: 'm46', type: 'door', x: 7, y: 11, config: { locked: true, unlockMechanisms: ['m38', 'm39', 'm40'] } },
          { id: 'm47', type: 'chest', x: 7, y: 0, config: { reward: 'bp_trap_complex', coins: 1500 } },
        ],
        difficulty: 5,
        minLevel: 8,
        maxPlayers: 4,
        timeLimit: 540,
        createdAt: now - 86400000 * 1,
        stats: { plays: 15, clears: 9, avgScore: 780, rating: 4.1 },
      },
    ]

    this.data.listings = [
      {
        id: 'l1',
        sellerId: 'u1',
        itemType: 'blueprint',
        itemId: 'bp_laser_net',
        itemName: '激光网图纸',
        rarity: 'epic',
        price: 3500,
        suggestedPrice: { min: 2800, max: 4200, avg: 3500 },
        createdAt: now - 3600000 * 4,
      },
      {
        id: 'l2',
        sellerId: 'u3',
        itemType: 'material',
        itemId: 'mat_crystal',
        itemName: '能量水晶',
        rarity: 'epic',
        price: 800,
        suggestedPrice: { min: 600, max: 1000, avg: 800 },
        createdAt: now - 3600000 * 8,
      },
      {
        id: 'l3',
        sellerId: 'u2',
        itemType: 'material',
        itemId: 'mat_copper',
        itemName: '精炼铜',
        rarity: 'common',
        price: 50,
        suggestedPrice: { min: 40, max: 70, avg: 55 },
        createdAt: now - 3600000 * 2,
      },
      {
        id: 'l4',
        sellerId: 'u1',
        itemType: 'material',
        itemId: 'mat_steel',
        itemName: '精钢',
        rarity: 'rare',
        price: 200,
        suggestedPrice: { min: 150, max: 280, avg: 215 },
        createdAt: now - 3600000 * 12,
      },
      {
        id: 'l5',
        sellerId: 'u3',
        itemType: 'blueprint',
        itemId: 'bp_puzzle_master',
        itemName: '大师谜题图纸',
        rarity: 'legendary',
        price: 12000,
        suggestedPrice: { min: 10000, max: 15000, avg: 12500 },
        createdAt: now - 3600000,
      },
    ]

    this.data.transactions = [
      { id: 't1', listingId: 'sold1', buyerId: 'u2', sellerId: 'u1', price: 3200, itemId: 'bp_laser_net', timestamp: now - 86400000 },
      { id: 't2', listingId: 'sold2', buyerId: 'u3', sellerId: 'u2', price: 750, itemId: 'mat_crystal', timestamp: now - 86400000 * 2 },
      { id: 't3', listingId: 'sold3', buyerId: 'u1', sellerId: 'u2', price: 45, itemId: 'mat_copper', timestamp: now - 86400000 * 3 },
      { id: 't4', listingId: 'sold4', buyerId: 'u2', sellerId: 'u3', price: 11000, itemId: 'bp_puzzle_master', timestamp: now - 86400000 * 4 },
      { id: 't5', listingId: 'sold5', buyerId: 'u1', sellerId: 'u3', price: 180, itemId: 'mat_steel', timestamp: now - 86400000 * 5 },
      { id: 't6', listingId: 'sold6', buyerId: 'u3', sellerId: 'u1', price: 3800, itemId: 'bp_laser_net', timestamp: now - 86400000 * 6 },
      { id: 't7', listingId: 'sold7', buyerId: 'u2', sellerId: 'u1', price: 55, itemId: 'mat_copper', timestamp: now - 86400000 * 6 },
      { id: 't8', listingId: 'sold8', buyerId: 'u1', sellerId: 'u2', price: 820, itemId: 'mat_crystal', timestamp: now - 86400000 * 7 },
    ]

    const currentWeek = new Date().toISOString().slice(0, 10)

    this.data.rankings = [
      { userId: 'u3', username: '机关大师', category: 'score', value: 9650, rank: 1, week: currentWeek },
      { userId: 'u2', username: '暗夜探险家', category: 'score', value: 8200, rank: 2, week: currentWeek },
      { userId: 'u1', username: '迷室工匠', category: 'score', value: 7100, rank: 3, week: currentWeek },
      { userId: 'u3', username: '机关大师', category: 'clearRate', value: 0.89, rank: 1, week: currentWeek },
      { userId: 'u2', username: '暗夜探险家', category: 'clearRate', value: 0.76, rank: 2, week: currentWeek },
      { userId: 'u1', username: '迷室工匠', category: 'clearRate', value: 0.62, rank: 3, week: currentWeek },
      { userId: 'u1', username: '迷室工匠', category: 'creativity', value: 4.9, rank: 1, week: currentWeek },
      { userId: 'u3', username: '机关大师', category: 'creativity', value: 4.7, rank: 2, week: currentWeek },
      { userId: 'u2', username: '暗夜探险家', category: 'creativity', value: 4.3, rank: 3, week: currentWeek },
    ]

    this.data.contestEntries = [
      {
        id: 'ce1',
        chamberId: 'ch2',
        contestantId: 'u3',
        contestId: 'contest_2026_s1',
        scores: [
          { judgeId: 'judge1', score: 92, comment: '机关联动设计精巧，难度曲线流畅' },
          { judgeId: 'judge2', score: 88, comment: '主题鲜明，机械感十足' },
          { judgeId: 'judge3', score: 95, comment: '谜题设计极具创意' },
        ],
        avgScore: 91.7,
        submittedAt: now - 86400000 * 2,
      },
      {
        id: 'ce2',
        chamberId: 'ch1',
        contestantId: 'u1',
        contestId: 'contest_2026_s1',
        scores: [
          { judgeId: 'judge1', score: 82, comment: '古墓氛围营造出色' },
          { judgeId: 'judge2', score: 79, comment: '谜题可以更有层次' },
          { judgeId: 'judge3', score: 85, comment: '整体体验良好' },
        ],
        avgScore: 82,
        submittedAt: now - 86400000 * 4,
      },
      {
        id: 'ce3',
        chamberId: 'ch5',
        contestantId: 'u2',
        contestId: 'contest_2026_s1',
        scores: [
          { judgeId: 'judge1', score: 88, comment: '星座主题很有创意' },
          { judgeId: 'judge2', score: 84, comment: '视觉设计优雅' },
          { judgeId: 'judge3', score: 86, comment: '谜题关联巧妙' },
        ],
        avgScore: 86,
        submittedAt: now - 86400000 * 1,
      },
    ]
  }

  getUsers(): User[] {
    return [...this.data.users]
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id)
  }

  addUser(user: Omit<User, 'id'>): User {
    const newUser: User = { ...user, id: this.generateId('u') }
    this.data.users.push(newUser)
    return newUser
  }

  getChambers(): Chamber[] {
    return [...this.data.chambers]
  }

  getChamberById(id: string): Chamber | undefined {
    return this.data.chambers.find((c) => c.id === id)
  }

  addChamber(chamber: Omit<Chamber, 'id' | 'createdAt' | 'stats'>): Chamber {
    const newChamber: Chamber = {
      ...chamber,
      id: this.generateId('ch'),
      createdAt: Date.now(),
      stats: { plays: 0, clears: 0, avgScore: 0, rating: 0 },
    }
    this.data.chambers.push(newChamber)
    return newChamber
  }

  updateChamberStats(chamberId: string, won: boolean, score: number): void {
    const chamber = this.getChamberById(chamberId)
    if (!chamber) return
    chamber.stats.plays += 1
    if (won) chamber.stats.clears += 1
    const totalScore = chamber.stats.avgScore * (chamber.stats.plays - 1) + score
    chamber.stats.avgScore = totalScore / chamber.stats.plays
  }

  getSessions(): GameSession[] {
    return [...this.data.sessions]
  }

  getSessionById(id: string): GameSession | undefined {
    return this.data.sessions.find((s) => s.id === id)
  }

  addSession(session: Omit<GameSession, 'id'>): GameSession {
    const newSession: GameSession = { ...session, id: this.generateId('s') }
    this.data.sessions.push(newSession)
    return newSession
  }

  updateSession(id: string, updates: Partial<GameSession>): GameSession | undefined {
    const idx = this.data.sessions.findIndex((s) => s.id === id)
    if (idx === -1) return undefined
    this.data.sessions[idx] = { ...this.data.sessions[idx], ...updates }
    return this.data.sessions[idx]
  }

  getListings(): MarketListing[] {
    return [...this.data.listings]
  }

  getListingById(id: string): MarketListing | undefined {
    return this.data.listings.find((l) => l.id === id)
  }

  addListing(listing: Omit<MarketListing, 'id' | 'createdAt'>): MarketListing {
    const newListing: MarketListing = { ...listing, id: this.generateId('l'), createdAt: Date.now() }
    this.data.listings.push(newListing)
    return newListing
  }

  removeListing(id: string): boolean {
    const idx = this.data.listings.findIndex((l) => l.id === id)
    if (idx === -1) return false
    this.data.listings.splice(idx, 1)
    return true
  }

  getTransactions(): Transaction[] {
    return [...this.data.transactions]
  }

  addTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>): Transaction {
    const newTx: Transaction = { ...transaction, id: this.generateId('t'), timestamp: Date.now() }
    this.data.transactions.push(newTx)
    return newTx
  }

  getTransactionsByItem(itemId: string, days: number = 7): Transaction[] {
    const cutoff = Date.now() - days * 86400000
    return this.data.transactions.filter((t) => t.itemId === itemId && t.timestamp >= cutoff)
  }

  getRankings(category: RankingCategory, week?: string): RankingEntry[] {
    const w = week ?? new Date().toISOString().slice(0, 10)
    return this.data.rankings.filter((r) => r.category === category && r.week === w)
  }

  addRanking(entry: Omit<RankingEntry, 'rank'>): RankingEntry {
    const sameWeek = this.data.rankings.filter((r) => r.week === entry.week && r.category === entry.category)
    const newRank = sameWeek.filter((r) => r.value > entry.value).length + 1
    const newEntry: RankingEntry = { ...entry, rank: newRank }
    this.data.rankings.push(newEntry)
    return newEntry
  }

  getContestEntries(contestId?: string): ContestEntry[] {
    if (!contestId) return [...this.data.contestEntries]
    return this.data.contestEntries.filter((c) => c.contestId === contestId)
  }

  addContestEntry(entry: Omit<ContestEntry, 'id' | 'submittedAt' | 'avgScore'>): ContestEntry {
    const avgScore =
      entry.scores.length > 0
        ? entry.scores.reduce((sum, s) => sum + s.score, 0) / entry.scores.length
        : 0
    const newEntry: ContestEntry = {
      ...entry,
      id: this.generateId('ce'),
      avgScore,
      submittedAt: Date.now(),
    }
    this.data.contestEntries.push(newEntry)
    return newEntry
  }

  scoreContestEntry(entryId: string, judgeId: string, score: number, comment?: string): ContestEntry | undefined {
    const entry = this.data.contestEntries.find((e) => e.id === entryId)
    if (!entry) return undefined
    entry.scores.push({ judgeId, score, comment })
    entry.avgScore = entry.scores.reduce((sum, s) => sum + s.score, 0) / entry.scores.length
    return entry
  }
}

export const memoryStore = new MemoryStore()
export default memoryStore
