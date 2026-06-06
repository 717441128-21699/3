export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: Date;
  lastLoginAt?: Date;
  reputation: number;
  level: number;
  experience: number;
  currency: number;
  roles: UserRole[];
  settings: UserSettings;
}

export type UserRole = "novice" | "artisan" | "master" | "admin";

export interface UserSettings {
  theme: "gothic" | "parchment";
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  language: string;
}

export interface InventoryItem {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: ItemRarity;
  quantity: number;
  maxStack: number;
  value: number;
  weight: number;
  iconUrl?: string;
  acquiredAt: Date;
  attributes?: Record<string, string | number | boolean>;
  isEquipped?: boolean;
}

export type ItemCategory =
  | "material"
  | "component"
  | "tool"
  | "consumable"
  | "relic"
  | "blueprint"
  | "decorative";

export type ItemRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary"
  | "mythic";

export interface Mechanism {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  category: MechanismCategory;
  blueprintId?: string;
  components: MechanismComponent[];
  stats: MechanismStats;
  durability: number;
  maxDurability: number;
  createdAt: Date;
  lastRepairedAt?: Date;
  chamberId?: string;
  isActive: boolean;
  upgrades: MechanismUpgrade[];
  tags: string[];
}

export type MechanismCategory =
  | "automaton"
  | "calculator"
  | "defense"
  | "entertainment"
  | "utility"
  | "transport"
  | "mystical";

export interface MechanismComponent {
  itemId: string;
  slot: string;
  quantity: number;
  isRequired: boolean;
}

export interface MechanismStats {
  efficiency: number;
  reliability: number;
  complexity: number;
  power: number;
  energyCost: number;
}

export interface MechanismUpgrade {
  id: string;
  name: string;
  description: string;
  appliedAt: Date;
  statModifications: Partial<MechanismStats>;
}

export interface Chamber {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  theme: ChamberTheme;
  level: number;
  capacity: number;
  mechanisms: string[];
  stats: ChamberStats;
  createdAt: Date;
  lastActiveAt?: Date;
  decorations: ChamberDecoration[];
  backgroundImageUrl?: string;
  isPublic: boolean;
  visitors: number;
}

export type ChamberTheme =
  | "workshop"
  | "observatory"
  | "library"
  | "forge"
  | "garden"
  | "crypt"
  | "custom";

export interface ChamberStats {
  prestige: number;
  order: number;
  inspiration: number;
  energy: number;
  synergy: number;
}

export interface ChamberDecoration {
  id: string;
  itemId: string;
  positionX: number;
  positionY: number;
  scale: number;
  rotation: number;
}

export interface GameSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  actions: GameAction[];
  eventsTriggered: string[];
  rewardsEarned: Transaction[];
  achievementsUnlocked: string[];
  isActive: boolean;
}

export interface GameAction {
  id: string;
  timestamp: Date;
  type: GameActionType;
  data: Record<string, unknown>;
}

export type GameActionType =
  | "craft"
  | "upgrade"
  | "trade"
  | "explore"
  | "battle"
  | "social"
  | "contest"
  | "market";

export interface PlayerState {
  userId: string;
  currentChamberId?: string;
  activeMechanismIds: string[];
  dailyQuestProgress: DailyQuestProgress[];
  buffs: PlayerBuff[];
  debuffs: PlayerDebuff[];
  energy: number;
  maxEnergy: number;
  energyRegenRate: number;
  lastEnergyUpdate: Date;
  inventorySlots: number;
  usedInventorySlots: number;
}

export interface DailyQuestProgress {
  questId: string;
  progress: number;
  target: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

export interface PlayerBuff {
  id: string;
  name: string;
  description: string;
  effect: BuffEffect;
  startTime: Date;
  endTime: Date;
  source: string;
  isActive: boolean;
}

export interface PlayerDebuff {
  id: string;
  name: string;
  description: string;
  effect: DebuffEffect;
  startTime: Date;
  endTime: Date;
  source: string;
  isActive: boolean;
}

export interface BuffEffect {
  type:
    | "efficiency_boost"
    | "experience_boost"
    | "currency_boost"
    | "energy_regen"
    | "durability_protect";
  value: number;
  stat?: keyof MechanismStats;
}

export interface DebuffEffect {
  type:
    | "efficiency_penalty"
    | "energy_drain"
    | "durability_decay"
    | "trade_tax";
  value: number;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  type: GameEventType;
  rarity: EventRarity;
  startTime: Date;
  endTime: Date;
  requirements: EventRequirement[];
  rewards: EventReward[];
  participants: string[];
  maxParticipants?: number;
  isActive: boolean;
  isFeatured: boolean;
  bannerImageUrl?: string;
  rules?: string;
}

export type GameEventType =
  | "contest"
  | "market_fluctuation"
  | "mystery_discovery"
  | "weather"
  | "holiday"
  | "maintenance";

export type EventRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface EventRequirement {
  type: "level" | "item" | "mechanism" | "currency" | "role";
  value: string | number;
  quantity?: number;
}

export interface EventReward {
  type: "currency" | "item" | "experience" | "title" | "blueprint";
  value: string | number;
  quantity?: number;
}

export interface MarketListing {
  id: string;
  sellerId: string;
  buyerId?: string;
  itemId?: string;
  mechanismId?: string;
  listingType: "item" | "mechanism" | "service";
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  createdAt: Date;
  expiresAt: Date;
  status: ListingStatus;
  isFeatured: boolean;
  views: number;
  bids: MarketBid[];
  allowBidding: boolean;
  minimumBid?: number;
}

export type ListingStatus = "active" | "sold" | "expired" | "cancelled";

export interface MarketBid {
  id: string;
  bidderId: string;
  amount: number;
  timestamp: Date;
  isWinning: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  fromUserId?: string;
  toUserId?: string;
  amount: number;
  currency: "gold" | "component" | "reputation";
  itemId?: string;
  mechanismId?: string;
  listingId?: string;
  description: string;
  timestamp: Date;
  status: TransactionStatus;
  fee?: number;
}

export type TransactionType =
  | "purchase"
  | "sale"
  | "reward"
  | "fee"
  | "gift"
  | "trade"
  | "refund"
  | "contest_prize"
  | "quest_completion";

export type TransactionStatus = "pending" | "completed" | "failed" | "reversed";

export interface RankingEntry {
  id: string;
  userId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  rankingType: RankingType;
  rank: number;
  previousRank?: number;
  score: number;
  lastUpdated: Date;
  trend: "up" | "down" | "same";
}

export type RankingType =
  | "reputation"
  | "wealth"
  | "mechanisms"
  | "chambers"
  | "contests"
  | "exploration";

export interface ContestEntry {
  id: string;
  contestId: string;
  participantId: string;
  mechanismId: string;
  submissionTitle: string;
  submissionDescription: string;
  imageUrls: string[];
  submittedAt: Date;
  scores: ContestScore[];
  totalScore: number;
  rank?: number;
  prizeClaimed: boolean;
  isWinner: boolean;
}

export interface ContestScore {
  judgeId: string;
  category: string;
  score: number;
  maxScore: number;
  comment?: string;
  scoredAt: Date;
}

export interface MechanismTemplate {
  id: string;
  name: string;
  description: string;
  category: MechanismCategory;
  rarity: ItemRarity;
  requiredLevel: number;
  baseStats: MechanismStats;
  requiredComponents: MechanismTemplateComponent[];
  optionalComponents: MechanismTemplateComponent[];
  buildTime: number;
  unlockCost: number;
  unlockedBy: string[];
  isDefault: boolean;
  iconUrl?: string;
  previewImageUrl?: string;
  tags: string[];
}

export interface MechanismTemplateComponent {
  itemId: string;
  itemName: string;
  slot: string;
  quantity: number;
  isRequired: boolean;
  statModifications?: Partial<MechanismStats>;
}
