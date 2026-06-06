import {
  User,
  Star,
  Sparkles,
  Coins,
  Zap,
  ScrollText,
  Package,
  History,
  Calendar,
  Clock,
  Trophy,
  Bookmark,
  Gem,
  Wrench,
} from "lucide-react";
import { ParchementCard } from "@/components/ParchementCard";
import { MetalButton } from "@/components/MetalButton";
import { GearDecoration } from "@/components/GearDecoration";
import { StatBadge } from "@/components/StatBadge";
import { useGameStore } from "@/store/useGameStore";
import { cn } from "@/lib/utils";
import type { ItemRarity } from "@/shared/types";

interface InventoryItem {
  id: string;
  name: string;
  category: "blueprint" | "material" | "component";
  rarity: ItemRarity;
  quantity: number;
  description: string;
}

interface ChallengeRecord {
  id: string;
  chamberName: string;
  completedAt: Date;
  duration: number;
  success: boolean;
  rewards: {
    currency: number;
    experience: number;
  };
}

const mockInventory: InventoryItem[] = [
  {
    id: "inv-001",
    name: "永动核心蓝图",
    category: "blueprint",
    rarity: "legendary",
    quantity: 1,
    description: "传说中的永动装置设计图",
  },
  {
    id: "inv-002",
    name: "精密齿轮组蓝图",
    category: "blueprint",
    rarity: "rare",
    quantity: 3,
    description: "高级机关核心部件设计图",
  },
  {
    id: "inv-003",
    name: "精铜齿轮",
    category: "material",
    rarity: "uncommon",
    quantity: 42,
    description: "精密加工的黄铜齿轮",
  },
  {
    id: "inv-004",
    name: "蒸汽管道",
    category: "material",
    rarity: "common",
    quantity: 128,
    description: "标准规格的铜制蒸汽管道",
  },
  {
    id: "inv-005",
    name: "魔导水晶",
    category: "material",
    rarity: "epic",
    quantity: 5,
    description: "蕴含神秘能量的稀有晶体",
  },
  {
    id: "inv-006",
    name: "自动发条装置",
    category: "component",
    rarity: "rare",
    quantity: 8,
    description: "精密的自动上链机芯组件",
  },
];

const mockRecords: ChallengeRecord[] = [
  {
    id: "rec-001",
    chamberName: "蒸汽工坊",
    completedAt: new Date(Date.now() - 3600000 * 2),
    duration: 1842,
    success: true,
    rewards: { currency: 850, experience: 320 },
  },
  {
    id: "rec-002",
    chamberName: "星象观测台",
    completedAt: new Date(Date.now() - 3600000 * 26),
    duration: 2756,
    success: true,
    rewards: { currency: 1200, experience: 580 },
  },
  {
    id: "rec-003",
    chamberName: "禁忌图书馆",
    completedAt: new Date(Date.now() - 3600000 * 52),
    duration: 0,
    success: false,
    rewards: { currency: 0, experience: 50 },
  },
  {
    id: "rec-004",
    chamberName: "机械花园",
    completedAt: new Date(Date.now() - 3600000 * 80),
    duration: 923,
    success: true,
    rewards: { currency: 420, experience: 180 },
  },
];

const rarityColorMap: Record<ItemRarity, string> = {
  common: "text-gothic-muted border-gothic-border",
  uncommon: "text-verdigris border-verdigris/40 bg-verdigris/10",
  rare: "text-ice border-ice/40 bg-ice/10",
  epic: "text-bronze border-bronze/40 bg-bronze/10",
  legendary: "text-rust border-rust/40 bg-rust/10",
  mythic: "text-rust border-rust/40 bg-rust/10",
};

const rarityLabelMap: Record<ItemRarity, string> = {
  common: "普通",
  uncommon: "精良",
  rare: "稀有",
  epic: "史诗",
  legendary: "传说",
  mythic: "神话",
};

function formatDuration(seconds: number): string {
  if (seconds === 0) return "未完成";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}分${secs}秒`;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return `${days}天前`;
}

export default function Profile() {
  const { user, playerState } = useGameStore();
  const expToNext = (user?.level || 1) * 3000;

  const blueprints = mockInventory.filter((i) => i.category === "blueprint");
  const materials = mockInventory.filter(
    (i) => i.category === "material" || i.category === "component"
  );

  return (
    <div className="relative min-h-screen bg-gothic-bg overflow-hidden">
      <GearDecoration
        size="xl"
        direction="clockwise"
        speed="slow"
        className="absolute -top-24 -left-24 opacity-[0.05]"
      />
      <GearDecoration
        size="xl"
        direction="counterclockwise"
        speed="slow"
        className="absolute -bottom-32 -right-20 opacity-[0.05]"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl lg:text-4xl mb-2 text-bronze-gradient">
            工匠档案
          </h1>
          <p className="text-gothic-muted italic">
            查看你的成就、收藏与冒险历程
          </p>
          <div className="divider-ornate mt-6">
            <GearDecoration size="sm" direction="clockwise" speed="normal" />
          </div>
        </div>

        <section className="mb-8">
          <ParchementCard
            title="个人信息"
            subtitle={`工匠编号：${user?.id || "N/A"}`}
            icon={<User size={24} />}
          >
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-shrink-0 flex flex-col items-center gap-3 lg:border-r lg:border-[#8b6e3e]/30 lg:pr-6">
                <div className="w-28 h-28 rounded-full bg-metal-gradient shadow-metal-inset flex items-center justify-center border-4 border-[#8b6e3e]">
                  <User className="text-gothic-bg" size={52} />
                </div>
                <div className="text-center">
                  <h3 className="text-xl mb-0.5">{user?.displayName || "无名工匠"}</h3>
                  <p className="text-sm text-[#6b5a3e] italic">
                    @{user?.username || "unknown"}
                  </p>
                </div>
                <MetalButton size="sm" variant="ghost">
                  编辑资料
                </MetalButton>
              </div>

              <div className="flex-1 space-y-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatBadge
                    icon={<Zap size={14} />}
                    value={user?.energy || 0}
                    maxValue={user?.maxEnergy || 100}
                    variant="verdigris"
                    showProgress
                    label="体力"
                  />
                  <StatBadge
                    icon={<Star size={14} />}
                    value={user?.reputation?.toLocaleString() || 0}
                    variant="bronze"
                    label="声望"
                  />
                  <StatBadge
                    icon={<Sparkles size={14} />}
                    value={user?.experience?.toLocaleString() || 0}
                    maxValue={expToNext}
                    variant="ice"
                    showProgress
                    label={`Lv.${user?.level || 1}`}
                  />
                  <StatBadge
                    icon={<Coins size={14} />}
                    value={user?.currency?.toLocaleString() || 0}
                    variant="bronze"
                    label="金币"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-[#8b6e3e]/30">
                  <div>
                    <p className="text-xs text-[#6b5a3e] tracking-wider mb-1">
                      注册时间
                    </p>
                    <p className="text-[#3d2f1a] font-semibold flex items-center gap-1.5">
                      <Calendar size={14} />
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("zh-CN")
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6b5a3e] tracking-wider mb-1">
                      最后登录
                    </p>
                    <p className="text-[#3d2f1a] font-semibold flex items-center gap-1.5">
                      <Clock size={14} />
                      {user?.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString("zh-CN")
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6b5a3e] tracking-wider mb-1">
                      背包容量
                    </p>
                    <p className="text-[#3d2f1a] font-semibold flex items-center gap-1.5">
                      <Package size={14} />
                      {playerState?.usedInventorySlots || 0} /{" "}
                      {playerState?.inventorySlots || 50}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6b5a3e] tracking-wider mb-1">
                      身份等级
                    </p>
                    <p className="text-[#3d2f1a] font-semibold flex items-center gap-1.5">
                      <Trophy size={14} />
                      {user?.roles?.[0] === "admin"
                        ? "管理员"
                        : user?.roles?.[0] === "master"
                        ? "大师工匠"
                        : user?.roles?.[0] === "artisan"
                        ? "熟练工匠"
                        : "新手学徒"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ParchementCard>
        </section>

        <section className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Package className="text-verdigris" size={24} />
            <h2 className="text-2xl m-0">我的背包</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ParchementCard
              title="设计蓝图"
              subtitle={`共 ${blueprints.length} 张`}
              icon={<ScrollText size={20} />}
            >
              <div className="space-y-3">
                {blueprints.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 border border-[#8b6e3e]/30 hover:border-[#8b6e3e] transition-colors"
                  >
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center border border-[#8b6e3e]/40 bg-parchment-100/50">
                      <Bookmark size={22} className="text-[#5a4a1e]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-[#3d2f1a] truncate">
                          {item.name}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] px-2 py-0.5 font-display tracking-wider border",
                            rarityColorMap[item.rarity]
                          )}
                        >
                          {rarityLabelMap[item.rarity]}
                        </span>
                      </div>
                      <p className="text-xs text-[#6b5a3e] truncate italic">
                        {item.description}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-[#5a4a1e] font-display">
                      ×{item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </ParchementCard>

            <ParchementCard
              title="材料与组件"
              subtitle={`共 ${materials.length} 种`}
              icon={<Wrench size={20} />}
            >
              <div className="space-y-3">
                {materials.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 border border-[#8b6e3e]/30 hover:border-[#8b6e3e] transition-colors"
                  >
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center border border-[#8b6e3e]/40 bg-parchment-100/50">
                      <Gem size={22} className="text-[#5a4a1e]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-[#3d2f1a] truncate">
                          {item.name}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] px-2 py-0.5 font-display tracking-wider border",
                            rarityColorMap[item.rarity]
                          )}
                        >
                          {rarityLabelMap[item.rarity]}
                        </span>
                      </div>
                      <p className="text-xs text-[#6b5a3e] truncate italic">
                        {item.description}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-[#5a4a1e] font-display">
                      ×{item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </ParchementCard>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <History className="text-ice" size={24} />
            <h2 className="text-2xl m-0">挑战记录</h2>
          </div>

          <ParchementCard
            title="历史冒险"
            subtitle={`共 ${mockRecords.length} 次挑战`}
            icon={<Trophy size={20} />}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#8b6e3e]/40">
                    <th className="text-left py-3 px-4 text-xs tracking-wider text-[#6b5a3e] font-display">
                      密室名称
                    </th>
                    <th className="text-left py-3 px-4 text-xs tracking-wider text-[#6b5a3e] font-display">
                      结果
                    </th>
                    <th className="text-left py-3 px-4 text-xs tracking-wider text-[#6b5a3e] font-display">
                      用时
                    </th>
                    <th className="text-left py-3 px-4 text-xs tracking-wider text-[#6b5a3e] font-display">
                      金币奖励
                    </th>
                    <th className="text-left py-3 px-4 text-xs tracking-wider text-[#6b5a3e] font-display">
                      经验奖励
                    </th>
                    <th className="text-left py-3 px-4 text-xs tracking-wider text-[#6b5a3e] font-display">
                      时间
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-[#8b6e3e]/20 last:border-0 hover:bg-parchment-100/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#3d2f1a]">
                          {record.chamberName}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "text-xs px-2.5 py-1 font-display tracking-wider border",
                            record.success
                              ? "text-verdigris border-verdigris/40 bg-verdigris/10"
                              : "text-rust border-rust/40 bg-rust/10"
                          )}
                        >
                          {record.success ? "通关成功" : "挑战失败"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#3d2f1a]">
                        {formatDuration(record.duration)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-[#3d2f1a]">
                          <Coins size={14} className="text-[#8b6e3e]" />
                          {record.rewards.currency.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-[#3d2f1a]">
                          <Sparkles size={14} className="text-ice" />
                          {record.rewards.experience.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#6b5a3e] text-sm italic">
                        {formatDate(record.completedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ParchementCard>
        </section>
      </div>
    </div>
  );
}
