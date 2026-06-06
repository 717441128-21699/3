import { create } from "zustand";
import type {
  User,
  Chamber,
  GameSession,
  MarketListing,
  RankingEntry,
  ContestEntry,
  RankingCategory,
  PlayerState,
  InventoryItem,
} from "@/shared/types";
import {
  chambersApi,
  sessionsApi,
  usersApi,
  marketApi,
  rankingApi,
  contestApi,
} from "@/utils/api";
import type {
  ChambersListParams,
  CreateChamberPayload,
  MarketListParams,
  CreateListingPayload,
} from "@/utils/api";

export interface GameNotification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  timestamp: number;
}

interface ExtendedUser extends User {
  energy: number;
  maxEnergy: number;
  displayName: string;
  experience: number;
  currency: number;
  createdAt: string;
  lastLoginAt: string;
  roles: string[];
}

interface ExtendedPlayerState extends PlayerState {
  usedInventorySlots: number;
  inventorySlots: number;
}

interface GameStore {
  currentUser: User | null;
  user: ExtendedUser | null;
  playerState: ExtendedPlayerState | null;
  chambers: Chamber[];
  currentChamber: Chamber | null;
  gameSession: GameSession | null;
  marketListings: MarketListing[];
  rankings: RankingEntry[];
  contestEntries: ContestEntry[];
  isLoading: boolean;
  error: string | null;
  notification: GameNotification | null;

  loadData: () => Promise<void>;
  loadInitialData: () => Promise<void>;

  fetchChambers: (params?: ChambersListParams) => Promise<void>;
  fetchChamber: (id: string) => Promise<void>;
  createChamber: (payload: CreateChamberPayload) => Promise<void>;

  startSession: (chamberId: string, playerIds: string[]) => Promise<void>;
  startGameSession: () => void;
  pollSessionEvent: (sessionId: string) => Promise<void>;
  endSession: (sessionId: string, won?: boolean) => Promise<void>;
  endGameSession: () => void;

  fetchMarket: (params?: MarketListParams) => Promise<void>;
  createListing: (payload: CreateListingPayload) => Promise<void>;
  purchaseListing: (listingId: string) => Promise<void>;
  addMarketListing: (listing: MarketListing) => void;

  fetchRankings: (category: RankingCategory) => Promise<void>;
  fetchContestEntries: () => Promise<void>;
  refreshRankings: () => Promise<void>;

  setCurrentChamber: (chamber: Chamber | string) => void;
  updateCurrentUser: (patch: Partial<User>) => void;
  updateUser: (data: Partial<User>) => void;

  setNotification: (notification: Omit<GameNotification, "id" | "timestamp"> | null) => void;
  clearError: () => void;

  consumeEnergy: (amount: number) => boolean;
  addCurrency: (amount: number) => void;
  addExperience: (amount: number) => void;
}

const createExtendedUser = (base: User): ExtendedUser => ({
  ...base,
  energy: base.stamina,
  maxEnergy: 100,
  displayName: base.username,
  experience: base.exp,
  currency: base.coins,
  createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  lastLoginAt: new Date().toISOString(),
  roles: ["artisan"],
});

const generateNotificationId = () =>
  `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const useGameStore = create<GameStore>((set, get) => ({
  currentUser: null,
  user: null,
  playerState: null,
  chambers: [],
  currentChamber: null,
  gameSession: null,
  marketListings: [],
  rankings: [],
  contestEntries: [],
  isLoading: false,
  error: null,
  notification: null,

  setNotification: (notification) => {
    if (!notification) {
      set({ notification: null });
      return;
    }
    set({
      notification: {
        ...notification,
        id: generateNotificationId(),
        timestamp: Date.now(),
      },
    });
  },

  clearError: () => set({ error: null }),

  loadInitialData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [chambersRes, userRes, marketRes, rankingRes] = await Promise.all([
        chambersApi.getChambers(),
        usersApi.getUser("u1"),
        marketApi.getListings(),
        rankingApi.getSummary(),
      ]);

      let chambers: Chamber[] = [];
      let currentUser: User | null = null;
      let marketListings: MarketListing[] = [];
      let rankings: RankingEntry[] = [];

      if (chambersRes.success && chambersRes.data) {
        chambers = chambersRes.data.items;
      } else if (!chambersRes.success) {
        get().setNotification({
          type: "error",
          message: chambersRes.error || "加载密室列表失败",
        });
      }

      if (userRes.success && userRes.data) {
        currentUser = userRes.data;
      } else if (!userRes.success) {
        get().setNotification({
          type: "error",
          message: userRes.error || "加载用户信息失败",
        });
      }

      if (marketRes.success && marketRes.data) {
        marketListings = marketRes.data.items;
      } else if (!marketRes.success) {
        get().setNotification({
          type: "error",
          message: marketRes.error || "加载市场列表失败",
        });
      }

      if (rankingRes.success && rankingRes.data) {
        const entries: RankingEntry[] = [];
        Object.values(rankingRes.data.summary).forEach((cat) => {
          entries.push(...cat.top3);
        });
        rankings = entries;
      } else if (!rankingRes.success) {
        get().setNotification({
          type: "error",
          message: rankingRes.error || "加载排行榜失败",
        });
      }

      const user = currentUser ? createExtendedUser(currentUser) : null;
      const playerState: ExtendedPlayerState | null = user
        ? {
            userId: user.id,
            x: 0,
            y: 0,
            hp: 100,
            injuries: 0,
            isAlive: true,
            usedInventorySlots: (user.inventory || []).length,
            inventorySlots: 50,
          }
        : null;

      set({
        chambers,
        currentUser,
        user,
        playerState,
        marketListings,
        rankings,
        isLoading: false,
      });

      if (
        chambersRes.success ||
        userRes.success ||
        marketRes.success ||
        rankingRes.success
      ) {
        get().setNotification({
          type: "success",
          message: "数据加载成功",
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载初始数据失败";
      set({ error: message, isLoading: false });
      get().setNotification({ type: "error", message });
    }
  },

  fetchChambers: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const res = await chambersApi.getChambers(params);
      if (res.success && res.data) {
        set({ chambers: res.data.items, isLoading: false });
        get().setNotification({ type: "success", message: "密室列表加载成功" });
      } else {
        const message = res.error || "加载密室列表失败";
        set({ error: message, isLoading: false });
        get().setNotification({ type: "error", message });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载密室列表失败";
      set({ error: message, isLoading: false });
      get().setNotification({ type: "error", message });
    }
  },

  fetchChamber: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await chambersApi.getChamber(id);
      if (res.success && res.data) {
        set((state) => {
          const exists = state.chambers.some((c) => c.id === id);
          const chambers = exists
            ? state.chambers.map((c) => (c.id === id ? res.data! : c))
            : [...state.chambers, res.data!];
          return {
            chambers,
            currentChamber: res.data!,
            isLoading: false,
          };
        });
        get().setNotification({ type: "success", message: "密室详情加载成功" });
      } else {
        const message = res.error || "加载密室详情失败";
        set({ error: message, isLoading: false });
        get().setNotification({ type: "error", message });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载密室详情失败";
      set({ error: message, isLoading: false });
      get().setNotification({ type: "error", message });
    }
  },

  createChamber: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await chambersApi.createChamber(payload);
      if (res.success && res.data) {
        const newChamber: Chamber = {
          id: res.data.id,
          ownerId: res.data.ownerId,
          name: res.data.name,
          description: res.data.description,
          gridWidth: res.data.gridWidth,
          gridHeight: res.data.gridHeight,
          mechanisms: res.data.mechanisms,
          difficulty: res.data.difficulty,
          minLevel: res.data.minLevel,
          maxPlayers: res.data.maxPlayers,
          timeLimit: res.data.timeLimit,
          createdAt: res.data.createdAt,
          stats: res.data.stats,
        };
        set((state) => ({
          chambers: [newChamber, ...state.chambers],
          currentChamber: newChamber,
          isLoading: false,
        }));
        get().setNotification({ type: "success", message: "密室创建成功" });
      } else {
        const message = res.error || "创建密室失败";
        set({ error: message, isLoading: false });
        get().setNotification({ type: "error", message });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "创建密室失败";
      set({ error: message, isLoading: false });
      get().setNotification({ type: "error", message });
    }
  },

  startSession: async (chamberId, playerIds) => {
    set({ isLoading: true, error: null });
    try {
      const res = await sessionsApi.createSession(chamberId, playerIds);
      if (res.success && res.data) {
        set({ gameSession: res.data, isLoading: false });
        get().setNotification({ type: "success", message: "游戏会话已开始" });
      } else {
        const message = res.error || "开始游戏会话失败";
        set({ error: message, isLoading: false });
        get().setNotification({ type: "error", message });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "开始游戏会话失败";
      set({ error: message, isLoading: false });
      get().setNotification({ type: "error", message });
    }
  },

  pollSessionEvent: async (sessionId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await sessionsApi.pollEvent(sessionId);
      if (res.success && res.data) {
        if (res.data.session) {
          set({ gameSession: res.data.session, isLoading: false });
        } else {
          set({ isLoading: false });
        }
        if (res.data.triggered) {
          get().setNotification({
            type: "info",
            message: "触发了新的游戏事件",
          });
        }
      } else {
        const message = res.error || "轮询游戏事件失败";
        set({ error: message, isLoading: false });
        get().setNotification({ type: "error", message });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "轮询游戏事件失败";
      set({ error: message, isLoading: false });
      get().setNotification({ type: "error", message });
    }
  },

  endSession: async (sessionId, won = false) => {
    set({ isLoading: true, error: null });
    try {
      const res = await sessionsApi.endSession(sessionId, won);
      if (res.success && res.data) {
        if (res.data.rewards) {
          const { exp, coins, reputation } = res.data.rewards;
          set((state) => {
            if (!state.currentUser) return { isLoading: false, gameSession: null };
            return {
              currentUser: {
                ...state.currentUser,
                exp: state.currentUser.exp + exp,
                coins: state.currentUser.coins + coins,
                reputation: state.currentUser.reputation + reputation,
              },
              gameSession: null,
              isLoading: false,
            };
          });
        } else {
          set({ gameSession: null, isLoading: false });
        }
        get().setNotification({
          type: "success",
          message: won ? "恭喜通关！奖励已发放" : "游戏结束",
        });
      } else {
        const message = res.error || "结束游戏会话失败";
        set({ error: message, isLoading: false });
        get().setNotification({ type: "error", message });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "结束游戏会话失败";
      set({ error: message, isLoading: false });
      get().setNotification({ type: "error", message });
    }
  },

  fetchMarket: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const res = await marketApi.getListings(params);
      if (res.success && res.data) {
        set({ marketListings: res.data.items, isLoading: false });
        get().setNotification({ type: "success", message: "市场列表加载成功" });
      } else {
        const message = res.error || "加载市场列表失败";
        set({ error: message, isLoading: false });
        get().setNotification({ type: "error", message });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载市场列表失败";
      set({ error: message, isLoading: false });
      get().setNotification({ type: "error", message });
    }
  },

  createListing: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await marketApi.createListing(payload);
      if (res.success && res.data) {
        set((state) => ({
          marketListings: [res.data!.listing, ...state.marketListings],
          isLoading: false,
        }));
        if (res.data.priceWarning) {
          get().setNotification({
            type: "warning",
            message: res.data.priceWarning,
          });
        } else {
          get().setNotification({
            type: "success",
            message: "商品上架成功",
          });
        }
      } else {
        const message = res.error || "上架商品失败";
        set({ error: message, isLoading: false });
        get().setNotification({ type: "error", message });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "上架商品失败";
      set({ error: message, isLoading: false });
      get().setNotification({ type: "error", message });
    }
  },

  purchaseListing: async (listingId) => {
    set({ isLoading: true, error: null });
    const { currentUser } = get();
    if (!currentUser) {
      const message = "请先登录后再购买";
      set({ error: message, isLoading: false });
      get().setNotification({ type: "error", message });
      return;
    }
    try {
      const res = await marketApi.purchase(listingId, currentUser.id);
      if (res.success && res.data) {
        set((state) => ({
          marketListings: state.marketListings.filter((l) => l.id !== listingId),
          currentUser: state.currentUser
            ? { ...state.currentUser, coins: res.data!.buyerRemaining }
            : state.currentUser,
          isLoading: false,
        }));
        get().setNotification({ type: "success", message: "购买成功" });
      } else {
        const message = res.error || "购买失败";
        set({ error: message, isLoading: false });
        get().setNotification({ type: "error", message });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "购买失败";
      set({ error: message, isLoading: false });
      get().setNotification({ type: "error", message });
    }
  },

  fetchRankings: async (category) => {
    set({ isLoading: true, error: null });
    try {
      const res = await rankingApi.getRanking(category);
      if (res.success && res.data) {
        set((state) => {
          const otherRankings = state.rankings.filter((r) => r.category !== category);
          return {
            rankings: [...otherRankings, ...res.data!.items],
            isLoading: false,
          };
        });
        get().setNotification({ type: "success", message: "排行榜加载成功" });
      } else {
        const message = res.error || "加载排行榜失败";
        set({ error: message, isLoading: false });
        get().setNotification({ type: "error", message });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载排行榜失败";
      set({ error: message, isLoading: false });
      get().setNotification({ type: "error", message });
    }
  },

  fetchContestEntries: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await contestApi.getEntries();
      if (res.success && res.data) {
        const entries: ContestEntry[] = res.data.items.map((item) => ({
          id: item.id,
          chamberId: item.chamberId,
          contestantId: item.contestantId,
          contestId: item.contestId,
          scores: item.scores,
          avgScore: item.avgScore,
          submittedAt: item.submittedAt,
        }));
        set({ contestEntries: entries, isLoading: false });
        get().setNotification({ type: "success", message: "比赛作品加载成功" });
      } else {
        const message = res.error || "加载比赛作品失败";
        set({ error: message, isLoading: false });
        get().setNotification({ type: "error", message });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载比赛作品失败";
      set({ error: message, isLoading: false });
      get().setNotification({ type: "error", message });
    }
  },

  loadData: async () => {
    await get().loadInitialData();
  },

  startGameSession: () => {},
  endGameSession: () => {},

  refreshRankings: async () => {
    await Promise.all([
      get().fetchRankings("clearRate"),
      get().fetchRankings("score"),
      get().fetchRankings("creativity"),
    ]);
  },

  addMarketListing: (listing) => {
    set((state) => ({
      marketListings: [listing, ...state.marketListings],
    }));
  },

  setCurrentChamber: (chamber) => {
    set((state) => {
      if (typeof chamber === "string") {
        const found = state.chambers.find((c) => c.id === chamber);
        return { currentChamber: found || state.currentChamber };
      }
      return { currentChamber: chamber };
    });
  },

  updateCurrentUser: (patch) => {
    set((state) => {
      const newCurrentUser = state.currentUser ? { ...state.currentUser, ...patch } : state.currentUser;
      const newUser = newCurrentUser ? createExtendedUser(newCurrentUser) : state.user;
      if (state.user && newUser) {
        Object.assign(newUser, {
          energy: (patch as any).energy ?? newUser.energy,
          maxEnergy: (patch as any).maxEnergy ?? newUser.maxEnergy,
          displayName: (patch as any).displayName ?? newUser.displayName,
          experience: (patch as any).experience ?? (patch.exp ?? newUser.experience),
          currency: (patch as any).currency ?? (patch.coins ?? newUser.currency),
        });
      }
      return { currentUser: newCurrentUser, user: newUser };
    });
  },

  updateUser: (data) => {
    set((state) => {
      if (!state.currentUser) return {};
      const newCurrentUser = { ...state.currentUser, ...data };
      const newUser = createExtendedUser(newCurrentUser);
      return { currentUser: newCurrentUser, user: newUser };
    });
  },

  consumeEnergy: (amount) => {
    const state = get();
    if (!state.user || state.user.energy < amount) return false;
    set({
      user: { ...state.user, energy: state.user.energy - amount },
    });
    return true;
  },

  addCurrency: (amount) => {
    set((state) => {
      if (!state.user || !state.currentUser) return {};
      return {
        user: { ...state.user, currency: state.user.currency + amount },
        currentUser: { ...state.currentUser, coins: state.currentUser.coins + amount },
      };
    });
  },

  addExperience: (amount) => {
    set((state) => {
      if (!state.user || !state.currentUser) return {};
      return {
        user: { ...state.user, experience: state.user.experience + amount },
        currentUser: { ...state.currentUser, exp: state.currentUser.exp + amount },
      };
    });
  },
}));
