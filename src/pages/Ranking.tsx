import { useState } from "react";
import {
  Trophy,
  Award,
  FileDown,
  TrendingUp,
  TrendingDown,
  Minus,
  Medal,
  Flame,
  Star,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { ParchementCard } from "@/components/ParchementCard";
import { MetalButton } from "@/components/MetalButton";
import { StatBadge } from "@/components/StatBadge";
import { GearDecoration } from "@/components/GearDecoration";
import { cn } from "@/lib/utils";

type TabType = "clearRate" | "rating" | "creativity";

interface RankEntry {
  rank: number;
  username: string;
  value: number;
  level: number;
  previousRank: number;
  avatarSeed: string;
}

const tabs: { key: TabType; label: string; icon: typeof Trophy; unit: string }[] = [
  { key: "clearRate", label: "通关率榜", icon: Trophy, unit: "%" },
  { key: "rating", label: "评分榜", icon: Star, unit: "分" },
  { key: "creativity", label: "创意榜", icon: Lightbulb, unit: "分" },
];

const clearRateData: RankEntry[] = [
  { rank: 1, username: "发条之王", value: 98.7, level: 42, previousRank: 2, avatarSeed: "king" },
  { rank: 2, username: "蒸汽法师", value: 95.3, level: 38, previousRank: 1, avatarSeed: "mage" },
  { rank: 3, username: "黄铜匠人", value: 92.1, level: 35, previousRank: 5, avatarSeed: "smith" },
  { rank: 4, username: "齿轮幽灵", value: 89.8, level: 33, previousRank: 4, avatarSeed: "ghost" },
  { rank: 5, username: "机关学者", value: 87.4, level: 31, previousRank: 7, avatarSeed: "scholar" },
  { rank: 6, username: "蒸汽骑士", value: 85.2, level: 29, previousRank: 6, avatarSeed: "knight" },
  { rank: 7, username: "暗夜工匠", value: 83.9, level: 28, previousRank: 8, avatarSeed: "shadow" },
  { rank: 8, username: "时钟大师", value: 81.6, level: 27, previousRank: 9, avatarSeed: "clock" },
  { rank: 9, username: "迷雾行者", value: 79.3, level: 25, previousRank: 10, avatarSeed: "walker" },
  { rank: 10, username: "铜锈猎手", value: 77.8, level: 24, previousRank: 3, avatarSeed: "hunter" },
];

const ratingData: RankEntry[] = [
  { rank: 1, username: "机关学者", value: 4.95, level: 31, previousRank: 3, avatarSeed: "scholar" },
  { rank: 2, username: "蒸汽法师", value: 4.88, level: 38, previousRank: 2, avatarSeed: "mage" },
  { rank: 3, username: "发条之王", value: 4.82, level: 42, previousRank: 1, avatarSeed: "king" },
  { rank: 4, username: "齿轮幽灵", value: 4.76, level: 33, previousRank: 5, avatarSeed: "ghost" },
  { rank: 5, username: "暗夜工匠", value: 4.71, level: 28, previousRank: 4, avatarSeed: "shadow" },
  { rank: 6, username: "黄铜匠人", value: 4.65, level: 35, previousRank: 8, avatarSeed: "smith" },
  { rank: 7, username: "迷雾行者", value: 4.58, level: 25, previousRank: 6, avatarSeed: "walker" },
  { rank: 8, username: "蒸汽骑士", value: 4.52, level: 29, previousRank: 7, avatarSeed: "knight" },
  { rank: 9, username: "铜锈猎手", value: 4.47, level: 24, previousRank: 11, avatarSeed: "hunter" },
  { rank: 10, username: "时钟大师", value: 4.41, level: 27, previousRank: 9, avatarSeed: "clock" },
];

const creativityData: RankEntry[] = [
  { rank: 1, username: "暗夜工匠", value: 982, level: 28, previousRank: 4, avatarSeed: "shadow" },
  { rank: 2, username: "机关学者", value: 945, level: 31, previousRank: 1, avatarSeed: "scholar" },
  { rank: 3, username: "迷雾行者", value: 912, level: 25, previousRank: 2, avatarSeed: "walker" },
  { rank: 4, username: "时钟大师", value: 878, level: 27, previousRank: 6, avatarSeed: "clock" },
  { rank: 5, username: "蒸汽法师", value: 856, level: 38, previousRank: 3, avatarSeed: "mage" },
  { rank: 6, username: "铜锈猎手", value: 823, level: 24, previousRank: 5, avatarSeed: "hunter" },
  { rank: 7, username: "齿轮幽灵", value: 798, level: 33, previousRank: 8, avatarSeed: "ghost" },
  { rank: 8, username: "发条之王", value: 774, level: 42, previousRank: 7, avatarSeed: "king" },
  { rank: 9, username: "黄铜匠人", value: 751, level: 35, previousRank: 10, avatarSeed: "smith" },
  { rank: 10, username: "蒸汽骑士", value: 728, level: 29, previousRank: 9, avatarSeed: "knight" },
];

const trendData = [
  { week: "第1周", 通关率: 72, 评分: 4.2, 创意: 680 },
  { week: "第2周", 通关率: 76, 评分: 4.4, 创意: 735 },
  { week: "第3周", 通关率: 79, 评分: 4.5, 创意: 812 },
  { week: "第4周", 通关率: 83, 评分: 4.7, 创意: 895 },
];

const heatData = [
  { name: "蒸汽工坊", 热度: 12847 },
  { name: "机械花园", 热度: 15673 },
  { name: "星象观测台", 热度: 8562 },
  { name: "熔岩熔炉", 热度: 7894 },
  { name: "禁忌图书馆", 热度: 5231 },
];

function getMedalBg(rank: number): string {
  if (rank === 1) return "bg-gradient-to-br from-yellow-200/40 via-yellow-400/30 to-yellow-600/20 border-yellow-500/50";
  if (rank === 2) return "bg-gradient-to-br from-gray-200/40 via-gray-400/30 to-gray-500/20 border-gray-400/50";
  if (rank === 3) return "bg-gradient-to-br from-orange-200/40 via-orange-400/30 to-orange-600/20 border-orange-500/50";
  return "";
}

function getMedalColor(rank: number): string {
  if (rank === 1) return "#d4af37";
  if (rank === 2) return "#c0c0c0";
  if (rank === 3) return "#cd7f32";
  return "#8b6e3e";
}

function TrendArrow({ current, previous }: { current: number; previous: number }) {
  if (current < previous) {
    return <TrendingUp size={16} className="text-verdigris-light" />;
  }
  if (current > previous) {
    return <TrendingDown size={16} className="text-rust-light" />;
  }
  return <Minus size={16} className="text-gothic-muted" />;
}

function Avatar({ seed, size = "md" }: { seed: string; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "w-16 h-16" : size === "sm" ? "w-10 h-10" : "w-12 h-12";
  const iconSize = size === "lg" ? 28 : size === "sm" ? 16 : 20;
  const colors = ["#c9a227", "#8b2c2c", "#3d6b4f", "#4a7fb5", "#6a1f1f"];
  const color = colors[seed.charCodeAt(0) % colors.length];
  return (
    <div
      className={cn(
        sizeClass,
        "rounded-full flex items-center justify-center border-2 shadow-metal-inset flex-shrink-0",
        "border-[#8b6e3e]"
      )}
      style={{ background: `linear-gradient(135deg, ${color}40 0%, #1a1410 100%)` }}
    >
      <Award size={iconSize} style={{ color }} />
    </div>
  );
}

function RankRow({
  entry, unit, isTopThree }: { entry: RankEntry; unit: string; isTopThree: boolean }) {
  if (isTopThree) {
    return (
      <div
        className={cn(
          "relative p-4 rounded-sm border mb-3 transition-all duration-300 hover:scale-[1.01]",
          getMedalBg(entry.rank)
        )}
        style={{ backgroundBlendMode: "multiply" }}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar seed={entry.avatarSeed} size="lg" />
            <div
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs border-2 border-[#2a1f15]"
              style={{ background: getMedalColor(entry.rank), color: "#1a1410" }}
            >
              {entry.rank}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Medal size={18} style={{ color: getMedalColor(entry.rank) }} />
              <span className="font-display font-bold text-lg text-[#2a1f15] truncate">
                {entry.username}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <StatBadge
                variant="bronze"
                label="等级"
                value={`Lv.${entry.level}`}
              />
              <div className="flex items-center gap-1">
                <TrendArrow current={entry.rank} previous={entry.previousRank} />
                <span className="text-xs text-[#6b5a3e]">
                  上周 #{entry.previousRank}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-display font-black text-2xl" style={{ color: getMedalColor(entry.rank) }}>
              {entry.value}
              <span className="text-sm ml-0.5 opacity-70">{unit}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 border-b border-[#8b6e3e]/20 hover:bg-[#8b6e3e]/10 transition-colors">
      <div className="w-8 text-center font-display font-bold text-[#5a4a1e]">
        #{entry.rank}
      </div>
      <Avatar seed={entry.avatarSeed} size="sm" />
      <div className="flex-1 min-w-0">
        <span className="font-semibold text-[#2a1f15] truncate">{entry.username}</span>
      </div>
      <StatBadge variant="default" value={`Lv.${entry.level}`} />
      <div className="flex items-center gap-1">
        <TrendArrow current={entry.rank} previous={entry.previousRank} />
      </div>
      <div className="w-20 text-right font-display font-bold text-[#3d2f1a]">
        {entry.value}
        <span className="text-xs ml-0.5 opacity-60">{unit}</span>
      </div>
    </div>
  );
}

export default function Ranking() {
  const [activeTab, setActiveTab] = useState<TabType>("clearRate");
  const [showToast, setShowToast] = useState(false);

  const currentTab = tabs.find((t) => t.key === activeTab)!;
  const data =
    activeTab === "clearRate"
      ? clearRateData
      : activeTab === "rating"
      ? ratingData
      : creativityData;

  const handleExport = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="relative min-h-screen bg-gothic-bg overflow-hidden">
      <GearDecoration
        size="xl"
        direction="clockwise"
        speed="slow"
        className="absolute -bottom-24 -right-20 opacity-[0.05]"
      />
      <GearDecoration
        size="lg"
        direction="counterclockwise"
        speed="slow"
        className="absolute top-40 -left-16 opacity-[0.04]"
      />

      {showToast && (
        <div className="fixed top-6 right-6 z-50 animate-float">
          <div className="gothic-panel px-5 py-3 flex items-center gap-3 shadow-bronze-glow">
            <FileDown size={20} className="text-bronze" />
            <div>
              <p className="font-display text-bronze font-bold text-sm">报告已生成</p>
              <p className="text-xs text-gothic-muted">包含热度图和趋势数据</p>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl mb-2 text-bronze-gradient">
              荣耀排行榜
            </h1>
            <p className="text-gothic-muted italic">
              见证发条之城最杰出的工匠们
            </p>
          </div>
          <MetalButton icon={<FileDown size={16} />} onClick={handleExport}>
            导出PDF报告
          </MetalButton>
        </div>

        <div className="divider-ornate -mt-2 mb-8">
          <GearDecoration size="sm" direction="counterclockwise" speed="normal" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ParchementCard
              title="工匠排名"
              subtitle="依据各项指标综合评定"
              icon={<Trophy size={24} />}
            >
              <div className="flex gap-2 mb-5 border-b border-[#8b6e3e]/30 pb-3">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 font-display text-sm tracking-wider transition-all duration-300",
                        isActive
                          ? "bg-metal-gradient text-gothic-bg border border-[#8b6e3e] shadow-metal-inset"
                          : "text-[#5a4a1e] border border-transparent hover:border-[#8b6e3e]/30 hover:bg-[#8b6e3e]/10"
                      )}
                    >
                      <Icon size={16} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div>
                {data.slice(0, 3).map((entry) => (
                  <RankRow
                    key={entry.rank}
                    entry={entry}
                    unit={currentTab.unit}
                    isTopThree
                  />
                ))}
                <div className="mt-2">
                  {data.slice(3).map((entry) => (
                    <RankRow
                      key={entry.rank}
                      entry={entry}
                      unit={currentTab.unit}
                      isTopThree={false}
                    />
                  ))}
                </div>
              </div>
            </ParchementCard>
          </div>

          <div className="space-y-6">
            <ParchementCard
              title="4周挑战趋势"
              subtitle="三项核心指标走势"
              icon={<ChevronRight size={24} />}
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#8b6e3e30" />
                    <XAxis dataKey="week" stroke="#5a4a1e" fontSize={11} fontFamily="Cinzel Decorative" />
                    <YAxis stroke="#5a4a1e" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: "#1a1410",
                        border: "1px solid #8b6e3e",
                        color: "#d4c4a8",
                        fontFamily: "Cormorant Garamond",
                      }}
                    />
                    <Legend wrapperStyle={{ fontFamily: "Cormorant Garamond", fontSize: "12px" }} />
                    <Line
                      type="monotone"
                      dataKey="通关率"
                      stroke="#c9a227"
                      strokeWidth={2}
                      dot={{ fill: "#c9a227", r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="评分"
                      stroke="#3d6b4f"
                      strokeWidth={2}
                      dot={{ fill: "#3d6b4f", r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="创意"
                      stroke="#8b2c2c"
                      strokeWidth={2}
                      dot={{ fill: "#8b2c2c", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ParchementCard>

            <ParchementCard
              title="密室热度Top5"
              subtitle="本周挑战人数分布"
              icon={<Flame size={24} />}
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={heatData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#8b6e3e30" />
                    <XAxis
                      dataKey="name"
                      stroke="#5a4a1e"
                      fontSize={10}
                      fontFamily="Cinzel Decorative"
                      angle={-20}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis stroke="#5a4a1e" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: "#1a1410",
                        border: "1px solid #8b6e3e",
                        color: "#d4c4a8",
                        fontFamily: "Cormorant Garamond",
                      }}
                    />
                    <Bar
                      dataKey="热度"
                      fill="url(#heatGradient)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="heatGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e5c158" />
                        <stop offset="50%" stopColor="#c9a227" />
                        <stop offset="100%" stopColor="#9a7c17" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ParchementCard>
          </div>
        </div>
      </div>
    </div>
  );
}
