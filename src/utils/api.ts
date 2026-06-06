import type {
  Rarity,
  RankingCategory,
  Mechanism,
  Chamber,
  GameSession,
  User,
  InventoryItem,
  MarketListing,
  RankingEntry,
  ContestEntry,
} from '../shared/types'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  total: number
  page: number
  pageSize: number
  items: T[]
}

export interface ChambersListParams {
  page?: number
  pageSize?: number
  difficulty?: number
  minLevel?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  keyword?: string
}

export interface CreateChamberPayload {
  ownerId: string
  name: string
  description?: string
  gridWidth?: number
  gridHeight?: number
  mechanisms?: Mechanism[]
  maxPlayers?: number
  timeLimit?: number
}

export interface UpdateChamberPayload {
  name?: string
  description?: string
  gridWidth?: number
  gridHeight?: number
  mechanisms?: Mechanism[]
  maxPlayers?: number
  timeLimit?: number
}

export interface DifficultyResult {
  difficulty: number
  stars?: number
  label?: string
  suggestedMinLevel?: number
  [key: string]: any
}

export interface MarketListParams {
  page?: number
  pageSize?: number
  itemType?: 'blueprint' | 'material'
  rarity?: Rarity
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  sellerId?: string
}

export interface CreateListingPayload {
  sellerId: string
  itemType: 'blueprint' | 'material'
  itemId: string
  itemName?: string
  rarity: Rarity
  price: number
}

export interface RankingResult {
  category: RankingCategory
  week: string
  items: RankingEntry[]
}

export interface RankingSummary {
  week: string
  summary: Record<string, {
    top3: RankingEntry[]
    total: number
  }>
}

export interface ExportData {
  format: string
  filename: string
  report: any
}

export interface ContestSeason {
  id: string
  name: string
  theme: string
  description: string
  startTime: number
  endTime: number
  status: string
  prizes: any[]
  judges: any[]
  rules: string[]
  entriesCount: number
  top3: ContestEntry[]
}

export interface ContestEntriesParams {
  contestId?: string
  page?: number
  pageSize?: number
  contestantId?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: any
}

async function fetchApi<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const apiUrl = url.startsWith('/api') ? url : `/api${url.startsWith('/') ? '' : '/'}${url}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    if (options.body && typeof options.body !== 'string') {
      config.body = JSON.stringify(options.body)
    }

    const response = await fetch(apiUrl, config)
    const result = await response.json()
    return result as ApiResponse<T>
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络请求失败',
    }
  }
}

export const chambersApi = {
  getChambers: (params?: ChambersListParams): Promise<ApiResponse<PaginatedResponse<Chamber>>> => {
    const query = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.append(key, String(value))
      })
    }
    const queryString = query.toString()
    return fetchApi<PaginatedResponse<Chamber>>(`/chambers${queryString ? `?${queryString}` : ''}`)
  },

  getChamber: (id: string): Promise<ApiResponse<Chamber>> => {
    return fetchApi<Chamber>(`/chambers/${id}`)
  },

  createChamber: (payload: CreateChamberPayload): Promise<ApiResponse<Chamber & { difficultyBreakdown: DifficultyResult }>> => {
    return fetchApi<Chamber & { difficultyBreakdown: DifficultyResult }>('/chambers', {
      method: 'POST',
      body: payload,
    })
  },

  updateChamber: (id: string, payload: UpdateChamberPayload): Promise<ApiResponse<Chamber & { difficultyBreakdown: DifficultyResult }>> => {
    return fetchApi<Chamber & { difficultyBreakdown: DifficultyResult }>(`/chambers/${id}`, {
      method: 'PUT',
      body: payload,
    })
  },

  deleteChamber: (id: string): Promise<ApiResponse<{ id: string }>> => {
    return fetchApi<{ id: string }>(`/chambers/${id}`, {
      method: 'DELETE',
    })
  },

  calculateDifficulty: (mechanisms: Mechanism[], gridWidth: number, gridHeight: number): Promise<ApiResponse<DifficultyResult>> => {
    return fetchApi<DifficultyResult>('/chambers/calculate-difficulty', {
      method: 'POST',
      body: { mechanisms, gridWidth, gridHeight },
    })
  },
}

export const sessionsApi = {
  createSession: (chamberId: string, playerIds: string[]): Promise<ApiResponse<GameSession>> => {
    return fetchApi<GameSession>('/sessions', {
      method: 'POST',
      body: { chamberId, playerIds },
    })
  },

  getSession: (id: string): Promise<ApiResponse<GameSession>> => {
    return fetchApi<GameSession>(`/sessions/${id}`)
  },

  pollEvent: (id: string): Promise<ApiResponse<{
    triggered: boolean
    event: any | null
    effect: any | null
    session?: GameSession
  }>> => {
    return fetchApi<{
      triggered: boolean
      event: any | null
      effect: any | null
      session?: GameSession
    }>(`/sessions/${id}/poll-event`, {
      method: 'POST',
    })
  },

  updateSession: (id: string, patch: Partial<GameSession>): Promise<ApiResponse<GameSession>> => {
    return fetchApi<GameSession>(`/sessions/${id}`, {
      method: 'PATCH',
      body: patch,
    })
  },

  endSession: (id: string, won: boolean): Promise<ApiResponse<{
    sessionId: string
    won: boolean
    score: any
    grade: string
    rewards: { exp: number; coins: number; reputation: number }
  }>> => {
    return fetchApi<{
      sessionId: string
      won: boolean
      score: any
      grade: string
      rewards: { exp: number; coins: number; reputation: number }
    }>(`/sessions/${id}/end`, {
      method: 'POST',
      body: { won },
    })
  },

  getResult: (id: string): Promise<ApiResponse<{
    session: GameSession
    chamber: Chamber | null
    score: any
    grade: string
  }>> => {
    return fetchApi<{
      session: GameSession
      chamber: Chamber | null
      score: any
      grade: string
    }>(`/sessions/${id}/result`)
  },
}

export const usersApi = {
  getUser: (id: string): Promise<ApiResponse<User>> => {
    return fetchApi<User>(`/users/${id}`)
  },

  getInventory: (userId: string, params?: { type?: string; rarity?: Rarity }): Promise<ApiResponse<{ total: number; items: InventoryItem[] }>> => {
    const query = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.append(key, String(value))
      })
    }
    const queryString = query.toString()
    return fetchApi<{ total: number; items: InventoryItem[] }>(`/users/${userId}/inventory${queryString ? `?${queryString}` : ''}`)
  },
}

export const marketApi = {
  getListings: (params?: MarketListParams): Promise<ApiResponse<PaginatedResponse<MarketListing>>> => {
    const query = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.append(key, String(value))
      })
    }
    const queryString = query.toString()
    return fetchApi<PaginatedResponse<MarketListing>>(`/market${queryString ? `?${queryString}` : ''}`)
  },

  getSuggestedPrice: (itemId: string, itemType: 'blueprint' | 'material', rarity: Rarity): Promise<ApiResponse<{ min: number; max: number; avg: number; [key: string]: any }>> => {
    const query = new URLSearchParams({ itemId, itemType, rarity })
    return fetchApi<{ min: number; max: number; avg: number; [key: string]: any }>(`/market/suggest-price?${query.toString()}`)
  },

  createListing: (payload: CreateListingPayload): Promise<ApiResponse<{
    listing: MarketListing
    suggestion: { min: number; max: number; avg: number }
    priceWarning: string | null
  }>> => {
    return fetchApi<{
      listing: MarketListing
      suggestion: { min: number; max: number; avg: number }
      priceWarning: string | null
    }>('/market', {
      method: 'POST',
      body: payload,
    })
  },

  purchase: (id: string, buyerId: string): Promise<ApiResponse<{
    transaction: any
    tax: number
    buyerRemaining: number
    sellerEarned: number
  }>> => {
    return fetchApi<{
      transaction: any
      tax: number
      buyerRemaining: number
      sellerEarned: number
    }>(`/market/${id}/purchase`, {
      method: 'POST',
      body: { buyerId },
    })
  },
}

export const rankingApi = {
  getRanking: (category: RankingCategory, week?: string): Promise<ApiResponse<RankingResult>> => {
    const query = new URLSearchParams({ category })
    if (week) query.append('week', week)
    return fetchApi<RankingResult>(`/ranking?${query.toString()}`)
  },

  getSummary: (week?: string): Promise<ApiResponse<RankingSummary>> => {
    const query = new URLSearchParams()
    if (week) query.append('week', week)
    const queryString = query.toString()
    return fetchApi<RankingSummary>(`/ranking/summary${queryString ? `?${queryString}` : ''}`)
  },

  getExportData: (week?: string): Promise<ApiResponse<ExportData>> => {
    const query = new URLSearchParams()
    if (week) query.append('week', week)
    const queryString = query.toString()
    return fetchApi<ExportData>(`/ranking/export/pdf${queryString ? `?${queryString}` : ''}`)
  },
}

export const contestApi = {
  getCurrentSeason: (): Promise<ApiResponse<ContestSeason>> => {
    return fetchApi<ContestSeason>('/contest/current-season')
  },

  getEntries: (params?: ContestEntriesParams): Promise<ApiResponse<PaginatedResponse<ContestEntry & { rank: number }>>> => {
    const query = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.append(key, String(value))
      })
    }
    const queryString = query.toString()
    return fetchApi<PaginatedResponse<ContestEntry & { rank: number }>>(`/contest/entries${queryString ? `?${queryString}` : ''}`)
  },

  submitEntry: (chamberId: string, contestId?: string): Promise<ApiResponse<ContestEntry>> => {
    return fetchApi<ContestEntry>('/contest/entries', {
      method: 'POST',
      body: { chamberId, contestId },
    })
  },

  scoreEntry: (id: string, judgeId: string, score: number, comment?: string): Promise<ApiResponse<ContestEntry>> => {
    return fetchApi<ContestEntry>(`/contest/entries/${id}/score`, {
      method: 'POST',
      body: { judgeId, score, comment },
    })
  },
}

export default {
  fetchApi,
  chambersApi,
  sessionsApi,
  usersApi,
  marketApi,
  rankingApi,
  contestApi,
}
