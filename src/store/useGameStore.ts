import { create } from "zustand";
import type {
  User,
  Chamber,
  GameSession,
  MarketListing,
  RankingEntry,
  PlayerState,
} from "@/shared/types";

interface MockUser extends User {
  energy: number;
  maxEnergy: number;
}

interface GameStore {
  user: MockUser | null;
  playerState: PlayerState | null;
  currentChamber: Chamber | null;
  chambers: Chamber[];
  gameSession: GameSession | null;
  marketListings: MarketListing[];
  rankings: RankingEntry[];
  isLoading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
  updateUser: (data: Partial<MockUser>) => void;
  setCurrentChamber: (chamberId: string) => void;
  addMarketListing: (listing: MarketListing) => void;
  refreshRankings: () => Promise<void>;
  startGameSession: () => void;
  endGameSession: () => void;
  consumeEnergy: (amount: number) => boolean;
  addCurrency: (amount: number) => void;
  addExperience: (amount: number) => void;
}

const mockUser: MockUser = {
  id: "user-001",
  username: "ArtificerMax",
  email: "max@clockwork.com",
  displayName: "机械师马克思",
  avatarUrl: undefined,
  createdAt: new Date("2025-01-15"),
  lastLoginAt: new Date(),
  reputation: 2840,
  level: 17,
  experience: 42680,
  currency: 15840,
  roles: ["artisan"],
  settings: {
    theme: "gothic",
    notificationsEnabled: true,
    soundEnabled: true,
    language: "zh-CN",
  },
  energy: 78,
  maxEnergy: 100,
};

const mockPlayerState: PlayerState = {
  userId: "user-001",
  currentChamberId: "chamber-001",
  activeMechanismIds: ["mech-001", "mech-003"],
  dailyQuestProgress: [
    { questId: "q-1", progress: 2, target: 5, isCompleted: false, isClaimed: false },
    { questId: "q-2", progress: 1, target: 1, isCompleted: true, isClaimed: false },
    { questId: "q-3", progress: 0, target: 3, isCompleted: false, isClaimed: false },
  ],
  buffs: [],
  debuffs: [],
  energy: 78,
  maxEnergy: 100,
  energyRegenRate: 1,
  lastEnergyUpdate: new Date(),
  inventorySlots: 50,
  usedInventorySlots: 32,
};

const mockChambers: Chamber[] = [
  {
    id: "chamber-001",
    ownerId: "user-001",
    name: "蒸汽工坊",
    description: "一座充满齿轮与铜管的机械工坊，墙上挂满了精密的蓝图。",
    theme: "workshop",
    level: 5,
    capacity: 8,
    mechanisms: ["mech-001", "mech-002", "mech-003"],
    stats: {
      prestige: 120,
      order: 85,
      inspiration: 95,
      energy: 70,
      synergy: 60,
    },
    createdAt: new Date("2025-02-10"),
    lastActiveAt: new Date(),
    decorations: [],
    isPublic: true,
    visitors: 342,
  },
  {
    id: "chamber-002",
    ownerId: "user-001",
    name: "星象观测台",
    description: "黄铜穹顶下陈列着古老的天文仪器，星光透过彩色玻璃洒落。",
    theme: "observatory",
    level: 3,
    capacity: 4,
    mechanisms: ["mech-004"],
    stats: {
      prestige: 80,
      order: 90,
      inspiration: 150,
      energy: 40,
      synergy: 45,
    },
    createdAt: new Date("2025-03-22"),
    decorations: [],
    isPublic: false,
    visitors: 58,
  },
];

const mockMarketListings: MarketListing[] = [
  {
    id: "listing-001",
    sellerId: "user-099",
    listingType: "item",
    title: "精铜齿轮组",
    description: "精密加工的黄铜齿轮，适合制作高级机关装置。",
    price: 250,
    quantity: 5,
    createdAt: new Date(Date.now() - 3600000),
    expiresAt: new Date(Date.now() + 86400000 * 3),
    status: "active",
    isFeatured: true,
    views: 42,
    bids: [],
    allowBidding: false,
  },
  {
    id: "listing-002",
    sellerId: "user-088",
    listingType: "mechanism",
    title: "自动书写机 Mk-II",
    description: "能自动抄写卷宗的精巧机关，效率提升显著。",
    price: 2800,
    originalPrice: 3500,
    quantity: 1,
    createdAt: new Date(Date.now() - 7200000),
    expiresAt: new Date(Date.now() + 86400000 * 5),
    status: "active",
    isFeatured: false,
    views: 128,
    bids: [
      { id: "bid-1", bidderId: "user-002", amount: 2600, timestamp: new Date(Date.now() - 1800000), isWinning: true },
    ],
    allowBidding: true,
    minimumBid: 2400,
  },
  {
    id: "listing-003",
    sellerId: "user-077",
    listingType: "item",
    title: "永动核心蓝图（稀有）",
    description: "传说中的永动装置设计图，需要大师级工匠才能解读。",
    price: 12000,
    quantity: 1,
    createdAt: new Date(Date.now() - 14400000),
    expiresAt: new Date(Date.now() + 86400000 * 7),
    status: "active",
    isFeatured: true,
    views: 512,
    bids: [],
    allowBidding: true,
    minimumBid: 10000,
  },
];

const mockRankings: RankingEntry[] = [
  { id: "r-1", userId: "user-101", username: "ClockworkKing", displayName: "发条之王", rankingType: "reputation", rank: 1, score: 28500, lastUpdated: new Date(), trend: "same" },
  { id: "r-2", userId: "user-102", username: "BrassArtisan", displayName: "黄铜匠人", rankingType: "reputation", rank: 2, previousRank: 3, score: 24100, lastUpdated: new Date(), trend: "up" },
  { id: "r-3", userId: "user-103", username: "SteamMage", displayName: "蒸汽法师", rankingType: "reputation", rank: 3, previousRank: 2, score: 21800, lastUpdated: new Date(), trend: "down" },
  { id: "r-4", userId: "user-104", username: "Gearsmith", displayName: "齿轮锻造师", rankingType: "reputation", rank: 4, score: 19450, lastUpdated: new Date(), trend: "up" },
  { id: "r-5", userId: "user-001", username: "ArtificerMax", displayName: "机械师马克思", rankingType: "reputation", rank: 42, previousRank: 45, score: 2840, lastUpdated: new Date(), trend: "up" },
  { id: "r-6", userId: "user-101", username: "ClockworkKing", displayName: "发条之王", rankingType: "wealth", rank: 1, score: 128000, lastUpdated: new Date(), trend: "same" },
  { id: "r-7", userId: "user-105", username: "GoldVendor", displayName: "金箔商", rankingType: "wealth", rank: 2, score: 98500, lastUpdated: new Date(), trend: "up" },
  { id: "r-8", userId: "user-106", username: "RelicHunter", displayName: "遗物猎人", rankingType: "mechanisms", rank: 1, score: 156, lastUpdated: new Date(), trend: "same" },
];

export const useGameStore = create<GameStore>((set, get) => ({
  user: null,
  playerState: null,
  currentChamber: null,
  chambers: [],
  gameSession: null,
  marketListings: [],
  rankings: [],
  isLoading: false,
  error: null,

  loadData: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      set({
        user: mockUser,
        playerState: mockPlayerState,
        currentChamber: mockChambers[0],
        chambers: mockChambers,
        marketListings: mockMarketListings,
        rankings: mockRankings,
        isLoading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  updateUser: (data) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : state.user,
    }));
  },

  setCurrentChamber: (chamberId) => {
    set((state) => {
      const chamber = state.chambers.find((c) => c.id === chamberId);
      return {
        currentChamber: chamber || null,
        playerState: state.playerState
          ? { ...state.playerState, currentChamberId: chamberId }
          : state.playerState,
      };
    });
  },

  addMarketListing: (listing) => {
    set((state) => ({
      marketListings: [listing, ...state.marketListings],
    }));
  },

  refreshRankings: async () => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 200));
    set({ rankings: [...mockRankings], isLoading: false });
  },

  startGameSession: () => {
    const session: GameSession = {
      id: `session-${Date.now()}`,
      userId: get().user?.id || "",
      startTime: new Date(),
      actions: [],
      eventsTriggered: [],
      rewardsEarned: [],
      achievementsUnlocked: [],
      isActive: true,
    };
    set({ gameSession: session });
  },

  endGameSession: () => {
    set((state) => ({
      gameSession: state.gameSession
        ? {
            ...state.gameSession,
            endTime: new Date(),
            duration:
              state.gameSession.startTime &&
              Math.floor(
                (new Date().getTime() - new Date(state.gameSession.startTime).getTime()) / 1000
              ),
            isActive: false,
          }
        : state.gameSession,
    }));
  },

  consumeEnergy: (amount) => {
    const { user } = get();
    if (!user || user.energy < amount) return false;
    set((state) => ({
      user: state.user ? { ...state.user, energy: state.user.energy - amount } : state.user,
      playerState: state.playerState
        ? { ...state.playerState, energy: state.playerState.energy - amount }
        : state.playerState,
    }));
    return true;
  },

  addCurrency: (amount) => {
    set((state) => ({
      user: state.user ? { ...state.user, currency: state.user.currency + amount } : state.user,
    }));
  },

  addExperience: (amount) => {
    set((state) => {
      if (!state.user) return {};
      let newExp = state.user.experience + amount;
      let newLevel = state.user.level;
      const expToNextLevel = newLevel * 3000;
      if (newExp >= expToNextLevel) {
        newExp -= expToNextLevel;
        newLevel += 1;
      }
      return {
        user: { ...state.user, experience: newExp, level: newLevel },
      };
    });
  },
}));
