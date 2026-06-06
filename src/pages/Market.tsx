import { useState, useEffect, useRef } from "react";
import {
  Store,
  ShoppingCart,
  Coins,
  Tag,
  TrendingUp,
  Search,
  Plus,
  X,
  Package,
  ChevronDown,
  AlertTriangle,
  Scroll,
  Hammer,
  Gem,
  Sparkles,
  Flame,
  Crown,
} from "lucide-react";
import { ParchementCard } from "@/components/ParchementCard";
import { MetalButton } from "@/components/MetalButton";
import { GearDecoration } from "@/components/GearDecoration";

type TabType = "all" | "blueprint" | "material";
type ItemRarity = "common" | "rare" | "epic" | "legendary";

interface MarketItem {
  id: string;
  name: string;
  rarity: ItemRarity;
  category: "blueprint" | "material";
  seller: string;
  price: number;
  icon: React.ReactNode;
}

const rarityConfig: Record<
  ItemRarity,
  { label: string; color: string; border: string; bg: string; text: string }
> = {
  common: {
    label: "普通",
    color: "#8b7336",
    border: "#8b7336",
    bg: "rgba(139,115,54,0.12)",
    text: "#8b7336",
  },
  rare: {
    label: "稀有",
    color: "#4a7fb5",
    border: "#4a7fb5",
    bg: "rgba(74,127,181,0.12)",
    text: "#4a7fb5",
  },
  epic: {
    label: "史诗",
    color: "#9a7c17",
    border: "#c9a227",
    bg: "rgba(201,162,39,0.15)",
    text: "#9a7c17",
  },
  legendary: {
    label: "传说",
    color: "#8b2c2c",
    border: "#b84444",
    bg: "rgba(139,44,44,0.12)",
    text: "#8b2c2c",
  },
};

const mockItems: MarketItem[] = [
  {
    id: "1",
    name: "蒸汽核心蓝图",
    rarity: "epic",
    category: "blueprint",
    seller: "IronMaster",
    price: 3500,
    icon: <Scroll size={32} />,
  },
  {
    id: "2",
    name: "精密齿轮组",
    rarity: "rare",
    category: "material",
    seller: "Clockwork_Art",
    price: 850,
    icon: <Hammer size={32} />,
  },
  {
    id: "3",
    name: "永恒水晶",
    rarity: "legendary",
    category: "material",
    seller: "VoidCollector",
    price: 12800,
    icon: <Gem size={32} />,
  },
  {
    id: "4",
    name: "基础锻造图纸",
    rarity: "common",
    category: "blueprint",
    seller: "NoviceSmith",
    price: 120,
    icon: <Scroll size={32} />,
  },
  {
    id: "5",
    name: "激光矩阵蓝图",
    rarity: "legendary",
    category: "blueprint",
    seller: "MysticEngineer",
    price: 25000,
    icon: <Sparkles size={32} />,
  },
  {
    id: "6",
    name: "高温合金板",
    rarity: "rare",
    category: "material",
    seller: "ForgeMaster",
    price: 680,
    icon: <Flame size={32} />,
  },
  {
    id: "7",
    name: "古代发条装置",
    rarity: "epic",
    category: "material",
    seller: "RelicHunter",
    price: 5600,
    icon: <Crown size={32} />,
  },
  {
    id: "8",
    name: "铜质铆钉包",
    rarity: "common",
    category: "material",
    seller: "PartsDealer",
    price: 45,
    icon: <Package size={32} />,
  },
];

const announcements = [
  "⚙ 玩家 IronMaster 以 3,500G 售出「蒸汽核心蓝图」",
  "⚙ 玩家 VoidCollector 以 12,800G 售出「永恒水晶」",
  "⚙ 玩家 MysticEngineer 以 25,000G 售出「激光矩阵蓝图」",
];

const inventoryOptions = [
  { id: "inv1", name: "精密齿轮组 ×5", rarity: "rare" as ItemRarity, avgPrice: 820 },
  { id: "inv2", name: "古代符文碎片 ×3", rarity: "epic" as ItemRarity, avgPrice: 2100 },
  { id: "inv3", name: "铜质铆钉包 ×20", rarity: "common" as ItemRarity, avgPrice: 42 },
  { id: "inv4", name: "龙息合金锭 ×1", rarity: "legendary" as ItemRarity, avgPrice: 8500 },
];

export default function Market() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(inventoryOptions[0]);
  const [price, setPrice] = useState<string>("820");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const announceRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => (prev + 1) % 3000);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const filteredItems = mockItems.filter((item) => {
    const matchTab =
      activeTab === "all" || item.category === activeTab;
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.seller.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  const suggestedMin = Math.round(selectedItem.avgPrice * 0.85);
  const suggestedMax = Math.round(selectedItem.avgPrice * 1.15);
  const priceNum = parseInt(price) || 0;
  const isPriceDeviated =
    priceNum < suggestedMin || priceNum > suggestedMax;
  const deviationPercent =
    priceNum > 0
      ? Math.round(((priceNum - selectedItem.avgPrice) / selectedItem.avgPrice) * 100)
      : 0;

  return (
    <div className="relative min-h-screen bg-gothic-bg overflow-hidden pb-24">
      <GearDecoration
        size="xl"
        direction="counterclockwise"
        speed="slow"
        className="absolute -top-20 -left-20 opacity-[0.05]"
      />
      <GearDecoration
        size="lg"
        direction="clockwise"
        speed="slow"
        className="absolute top-40 -right-16 opacity-[0.05]"
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl lg:text-4xl mb-2 text-bronze-gradient">
            发条集市
          </h1>
          <p className="text-gothic-muted italic">
            买卖珍稀材料、蓝图与机关装置
          </p>
          <div className="divider-ornate mt-6">
            <GearDecoration size="sm" direction="clockwise" speed="normal" />
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <div className="w-full lg:w-2/3 bg-gothic-surface border border-gothic-border rounded-sm overflow-hidden mask-fade-edges">
            <div
              className="whitespace-nowrap py-2 px-4"
              style={{ transform: `translateX(-${offset}px)` }}
              ref={announceRef}
            >
              {[...announcements, ...announcements, ...announcements].map(
                (msg, idx) => (
                  <span
                    key={idx}
                    className="inline-block mx-8 font-display text-sm tracking-wider"
                    style={{ color: "#c9a227" }}
                  >
                    {msg}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        <ParchementCard
          title="市场交易"
          subtitle="浏览商品与发布出售"
          icon={<Store size={24} />}
        >
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex gap-1 p-1 bg-[#d9c7a8]/50 border border-[#8b6e3e]/40 rounded-sm">
              {[
                { key: "all" as TabType, label: "全部", icon: <Tag size={16} /> },
                { key: "blueprint" as TabType, label: "图纸", icon: <Scroll size={16} /> },
                { key: "material" as TabType, label: "素材", icon: <Package size={16} /> },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-2 font-display text-sm font-bold tracking-wider transition-all rounded-sm ${
                    activeTab === tab.key
                      ? "bg-metal-gradient text-[#1a1410] shadow-md"
                      : "text-[#5a4a3e] hover:text-[#3d2f1a]"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b6e3e]"
              />
              <input
                type="text"
                placeholder="搜索商品名称或卖家..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-[#ebe0ce]/60 border border-[#8b6e3e]/40 text-[#2a1f15] font-body text-base rounded-sm focus:outline-none focus:border-[#c9a227] focus:shadow-[0_0_0_2px_rgba(201,162,39,0.2)] placeholder:text-[#8b6e3e]/70 italic"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredItems.map((item) => {
              const cfg = rarityConfig[item.rarity];
              return (
                <div
                  key={item.id}
                  className="relative bg-[#ebe0ce]/70 border-2 rounded-sm overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(201,162,39,0.25)] hover:-translate-y-1 group cursor-pointer"
                  style={{ borderColor: cfg.border }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: cfg.border }}
                  />

                  <div
                    className="p-5 flex flex-col items-center text-center relative"
                    style={{ backgroundColor: cfg.bg }}
                  >
                    <div
                      className="w-20 h-20 rounded-sm flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: "rgba(26,20,16,0.85)",
                        border: `2px solid ${cfg.border}`,
                        boxShadow: `inset 0 0 15px ${cfg.border}40`,
                        color: cfg.color,
                      }}
                    >
                      {item.icon}
                    </div>

                    <p className="font-display font-bold text-base text-[#2a1f15] mb-2 line-clamp-1 tracking-wider">
                      {item.name}
                    </p>

                    <span
                      className="inline-block px-3 py-1 font-display text-xs font-bold tracking-widest rounded-sm mb-3"
                      style={{
                        backgroundColor: cfg.color,
                        color: item.rarity === "legendary" ? "#f5efe6" : "#1a1410",
                        border: `1px solid ${cfg.border}`,
                      }}
                    >
                      {cfg.label.toUpperCase()}
                    </span>

                    <div className="w-full pt-3 border-t border-[#8b6e3e]/30 space-y-2">
                      <div className="flex items-center justify-center gap-1.5 text-sm text-[#6b5a3e]">
                        <ShoppingCart size={14} />
                        <span className="italic">卖家: {item.seller}</span>
                      </div>
                      <div
                        className="flex items-center justify-center gap-1.5 font-display font-black text-xl tracking-wider"
                        style={{ color: "#9a7c17" }}
                      >
                        <Coins size={20} />
                        {item.price.toLocaleString()}
                        <span className="text-sm">G</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-16 text-[#6b5a3e]">
              <Package size={48} className="mx-auto mb-4 opacity-40" />
              <p className="text-lg italic">暂无相关商品</p>
            </div>
          )}
        </ParchementCard>
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 z-30 w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(201,162,39,0.5)] hover:shadow-[0_0_40px_rgba(201,162,39,0.7)] hover:scale-105 transition-all duration-300"
        style={{
          background:
            "linear-gradient(135deg, #e5c158 0%, #c9a227 25%, #9a7c17 50%, #c9a227 75%, #e5c158 100%)",
          backgroundSize: "200% 200%",
          border: "2px solid #8b6e3e",
        }}
      >
        <Plus size={32} style={{ color: "#1a1410" }} strokeWidth={3} />
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(10,8,6,0.85)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="parchment relative w-full max-w-lg rounded-sm"
            style={{
              border: "2px solid #c9a227",
              boxShadow: "0 0 50px rgba(201,162,39,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <GearDecoration
              size="lg"
              direction="clockwise"
              speed="slow"
              className="absolute -top-10 -right-10 opacity-[0.08]"
            />
            <div className="relative z-10 p-6">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#8b6e3e]/50">
                <div className="flex items-center gap-3">
                  <Tag size={24} style={{ color: "#c9a227" }} />
                  <h3 className="font-display text-2xl font-bold tracking-wider text-[#3d2f1a]">
                    上架商品
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-sm hover:bg-[#d9c7a8]/60 transition-colors"
                >
                  <X size={22} style={{ color: "#5a4a3e" }} />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block font-display text-sm font-bold text-[#3d2f1a] tracking-wider mb-2">
                    选择物品
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-[#ebe0ce]/60 border-2 border-[#8b6e3e]/40 rounded-sm text-left hover:border-[#c9a227] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Package size={20} style={{ color: rarityConfig[selectedItem.rarity].color }} />
                        <div>
                          <p className="font-bold text-[#2a1f15]">{selectedItem.name}</p>
                          <p
                            className="text-xs font-display tracking-wider"
                            style={{ color: rarityConfig[selectedItem.rarity].text }}
                          >
                            {rarityConfig[selectedItem.rarity].label.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        size={20}
                        style={{
                          color: "#8b6e3e",
                          transform: dropdownOpen ? "rotate(180deg)" : "none",
                          transition: "transform 0.2s",
                        }}
                      />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#f5efe6] border-2 border-[#8b6e3e]/50 rounded-sm shadow-lg z-10 max-h-56 overflow-y-auto">
                        {inventoryOptions.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setSelectedItem(opt);
                              setPrice(opt.avgPrice.toString());
                              setDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#d9c7a8]/60 transition-colors ${
                              selectedItem.id === opt.id ? "bg-[#c9a227]/20" : ""
                            }`}
                          >
                            <Package
                              size={18}
                              style={{ color: rarityConfig[opt.rarity].color }}
                            />
                            <div className="flex-1">
                              <p className="font-bold text-[#2a1f15] text-sm">
                                {opt.name}
                              </p>
                              <p
                                className="text-xs font-display tracking-wider"
                                style={{ color: rarityConfig[opt.rarity].text }}
                              >
                                {rarityConfig[opt.rarity].label.toUpperCase()}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-display text-sm font-bold text-[#3d2f1a] tracking-wider mb-2">
                    定价 (金币)
                  </label>
                  <div className="relative">
                    <Coins
                      size={22}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      style={{ color: "#c9a227" }}
                    />
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 bg-[#ebe0ce]/60 border-2 rounded-sm font-display text-lg font-bold text-[#2a1f15] focus:outline-none transition-colors ${
                        isPriceDeviated && priceNum > 0
                          ? "border-[#8b2c2c] focus:shadow-[0_0_0_2px_rgba(139,44,44,0.2)]"
                          : "border-[#8b6e3e]/40 focus:border-[#c9a227] focus:shadow-[0_0_0_2px_rgba(201,162,39,0.2)]"
                      }`}
                    />
                    {isPriceDeviated && priceNum > 0 && (
                      <div
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 font-display text-xs font-bold"
                        style={{ color: "#8b2c2c" }}
                      >
                        <AlertTriangle size={16} />
                        {deviationPercent > 0 ? `+${deviationPercent}%` : `${deviationPercent}%`}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="p-4 rounded-sm border"
                  style={{
                    backgroundColor: "rgba(201,162,39,0.08)",
                    borderColor: "rgba(201,162,39,0.3)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={18} style={{ color: "#c9a227" }} />
                    <p className="font-display text-sm font-bold tracking-wider text-[#5a4a1e]">
                      系统价格参考 (近7日均价)
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[#6b5a3e] italic mb-1">建议区间</p>
                      <p className="font-display font-bold text-[#3d2f1a]">
                        {suggestedMin.toLocaleString()} ~ {suggestedMax.toLocaleString()} G
                      </p>
                    </div>
                    <div>
                      <p className="text-[#6b5a3e] italic mb-1">7日均价</p>
                      <p
                        className="font-display font-bold"
                        style={{ color: "#9a7c17" }}
                      >
                        {selectedItem.avgPrice.toLocaleString()} G
                      </p>
                    </div>
                  </div>
                  {isPriceDeviated && priceNum > 0 && (
                    <div
                      className="mt-3 pt-3 border-t flex items-start gap-2 text-xs"
                      style={{
                        borderColor: "rgba(139,44,44,0.3)",
                        color: "#8b2c2c",
                      }}
                    >
                      <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                      <p className="italic">
                        定价偏离市场区间较大，可能影响成交速度。
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-5 border-t border-[#8b6e3e]/50">
                <MetalButton
                  variant="ghost"
                  fullWidth
                  onClick={() => setShowModal(false)}
                >
                  取消
                </MetalButton>
                <MetalButton variant="primary" fullWidth icon={<Tag size={18} />}>
                  确认上架
                </MetalButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
