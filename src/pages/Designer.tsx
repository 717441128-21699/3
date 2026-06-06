import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Zap,
  AlertTriangle,
  Puzzle,
  DoorOpen,
  Package,
  Gauge,
  Star,
  Save,
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Lock,
  Shield,
  Crosshair,
  Flame,
  Skull,
  Key,
  Gem,
  Eye,
  Radar,
  Hammer,
} from "lucide-react";
import { ParchementCard } from "@/components/ParchementCard";
import { MetalButton } from "@/components/MetalButton";
import { GearDecoration } from "@/components/GearDecoration";
import { cn } from "@/lib/utils";

type MechanismCategory =
  | "laser"
  | "trap"
  | "puzzle"
  | "door"
  | "treasure"
  | "sensor";

type Direction = "up" | "down" | "left" | "right";

interface MechanismTemplate {
  id: string;
  name: string;
  category: MechanismCategory;
  baseDifficulty: number;
  description: string;
  icon: typeof Zap;
  color: string;
}

interface PlacedMechanism {
  id: string;
  templateId: string;
  category: MechanismCategory;
  name: string;
  x: number;
  y: number;
  color: string;
  direction?: Direction;
  damage?: number;
  answer?: string;
  keyId?: string;
  reward?: string;
  range?: number;
}

interface ChamberInfo {
  name: string;
  description: string;
  minLevel: number;
  maxPlayers: number;
  duration: number;
}

const GRID_COLS = 16;
const GRID_ROWS = 12;

const CATEGORY_CONFIG: Record<
  MechanismCategory,
  { label: string; icon: typeof Zap; color: string }
> = {
  laser: { label: "激光", icon: Zap, color: "#8b2c2c" },
  trap: { label: "陷阱", icon: AlertTriangle, color: "#c9a227" },
  puzzle: { label: "谜题", icon: Puzzle, color: "#3d6b4f" },
  door: { label: "门", icon: DoorOpen, color: "#4a7fb5" },
  treasure: { label: "宝箱", icon: Package, color: "#c9a227" },
  sensor: { label: "传感器", icon: Gauge, color: "#8b6914" },
};

const MECHANISM_TEMPLATES: MechanismTemplate[] = [
  {
    id: "laser-beam",
    name: "激光束",
    category: "laser",
    baseDifficulty: 3,
    description: "单向发射的灼热光束，触碰即触发警报",
    icon: Zap,
    color: "#8b2c2c",
  },
  {
    id: "laser-grid",
    name: "激光网",
    category: "laser",
    baseDifficulty: 5,
    description: "多束激光交织成网，需要精确时机穿越",
    icon: Crosshair,
    color: "#8b2c2c",
  },
  {
    id: "laser-turret",
    name: "激光炮塔",
    category: "laser",
    baseDifficulty: 4,
    description: "可旋转的激光发射器，追踪入侵者",
    icon: Flame,
    color: "#8b2c2c",
  },

  {
    id: "trap-spike",
    name: "尖刺陷阱",
    category: "trap",
    baseDifficulty: 2,
    description: "地面突然弹出的锋利尖刺",
    icon: Skull,
    color: "#c9a227",
  },
  {
    id: "trap-pit",
    name: "落穴",
    category: "trap",
    baseDifficulty: 3,
    description: "伪装完美的地板陷阱，一脚踏空",
    icon: Shield,
    color: "#c9a227",
  },
  {
    id: "trap-gas",
    name: "毒气室",
    category: "trap",
    baseDifficulty: 4,
    description: "定时释放的致命毒气装置",
    icon: AlertTriangle,
    color: "#c9a227",
  },

  {
    id: "puzzle-symbol",
    name: "符文谜题",
    category: "puzzle",
    baseDifficulty: 3,
    description: "按正确顺序激活古老符文",
    icon: Sparkles,
    color: "#3d6b4f",
  },
  {
    id: "puzzle-cipher",
    name: "密码锁",
    category: "puzzle",
    baseDifficulty: 4,
    description: "需要破解密码才能通过的机械锁",
    icon: Puzzle,
    color: "#3d6b4f",
  },
  {
    id: "puzzle-sound",
    name: "音律谜",
    category: "puzzle",
    baseDifficulty: 5,
    description: "演奏正确的旋律方可解锁",
    icon: Eye,
    color: "#3d6b4f",
  },

  {
    id: "door-iron",
    name: "铁门",
    category: "door",
    baseDifficulty: 2,
    description: "坚固的铸铁大门，需要钥匙或力量",
    icon: DoorOpen,
    color: "#4a7fb5",
  },
  {
    id: "door-code",
    name: "密码门",
    category: "door",
    baseDifficulty: 4,
    description: "内嵌密码盘的密室之门",
    icon: Lock,
    color: "#4a7fb5",
  },
  {
    id: "door-hidden",
    name: "暗门",
    category: "door",
    baseDifficulty: 5,
    description: "隐藏在墙壁中的秘密通道",
    icon: Key,
    color: "#4a7fb5",
  },

  {
    id: "treasure-wood",
    name: "木质宝箱",
    category: "treasure",
    baseDifficulty: 1,
    description: "普通的木制宝箱，可能藏有金币",
    icon: Package,
    color: "#c9a227",
  },
  {
    id: "treasure-gold",
    name: "黄金宝箱",
    category: "treasure",
    baseDifficulty: 3,
    description: "闪闪发光的黄金宝箱，必有重宝",
    icon: Gem,
    color: "#c9a227",
  },
  {
    id: "treasure-cursed",
    name: "诅咒宝箱",
    category: "treasure",
    baseDifficulty: 5,
    description: "被诅咒的宝箱，开启可能触发陷阱",
    icon: Skull,
    color: "#c9a227",
  },

  {
    id: "sensor-pressure",
    name: "压力板",
    category: "sensor",
    baseDifficulty: 2,
    description: "检测重量变化的地面传感器",
    icon: Gauge,
    color: "#8b6914",
  },
  {
    id: "sensor-motion",
    name: "运动探测器",
    category: "sensor",
    baseDifficulty: 3,
    description: "侦测区域内一切移动的精密仪器",
    icon: Radar,
    color: "#8b6914",
  },
  {
    id: "sensor-heat",
    name: "热感传感器",
    category: "sensor",
    baseDifficulty: 4,
    description: "感知热源位置的红外探测装置",
    icon: Eye,
    color: "#8b6914",
  },
];

const DIFFICULTY_LABELS = [
  { level: 1, label: "学徒级", text: "适合初次尝试的新手" },
  { level: 2, label: "工匠级", text: "需要一定的解谜基础" },
  { level: 3, label: "大师级", text: "考验真正的密室爱好者" },
  { level: 4, label: "宗师级", text: "只有精英才能全身而退" },
  { level: 5, label: "传说级", text: "据说从未有人成功逃脱" },
];

export default function Designer() {
  const [activeCategory, setActiveCategory] = useState<MechanismCategory>("laser");
  const [selectedTemplate, setSelectedTemplate] = useState<MechanismTemplate | null>(null);
  const [placedMechanisms, setPlacedMechanisms] = useState<PlacedMechanism[]>([]);
  const [selectedPlacedId, setSelectedPlacedId] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);

  const [chamberInfo, setChamberInfo] = useState<ChamberInfo>({
    name: "未命名密室",
    description: "",
    minLevel: 1,
    maxPlayers: 4,
    duration: 30,
  });

  const filteredTemplates = useMemo(
    () => MECHANISM_TEMPLATES.filter((t) => t.category === activeCategory),
    [activeCategory]
  );

  const selectedPlaced = useMemo(
    () => placedMechanisms.find((m) => m.id === selectedPlacedId) || null,
    [placedMechanisms, selectedPlacedId]
  );

  const difficultyStats = useMemo(() => {
    const total = placedMechanisms.length;
    const gridCells = GRID_COLS * GRID_ROWS;
    const density = Math.min(100, Math.round((total / gridCells) * 100 * 5));

    const puzzleCount = placedMechanisms.filter((m) => m.category === "puzzle").length;
    const highDiffCount = placedMechanisms.filter((m) => {
      const tpl = MECHANISM_TEMPLATES.find((t) => t.id === m.templateId);
      return tpl && tpl.baseDifficulty >= 4;
    }).length;
    const complexity = Math.min(100, puzzleCount * 25 + highDiffCount * 15);

    const categories = new Set(placedMechanisms.map((m) => m.category));
    const linkage = Math.min(100, categories.size * 20 + (total > 8 ? 20 : 0));

    const avgScore = (density + complexity + linkage) / 3;
    const stars = Math.min(5, Math.max(1, Math.ceil(avgScore / 20)));

    return { density, complexity, linkage, stars };
  }, [placedMechanisms]);

  const difficultyInfo = DIFFICULTY_LABELS[difficultyStats.stars - 1];
  const suggestedLevel = Math.min(50, difficultyStats.stars * 10 + placedMechanisms.length);

  const handleCellClick = useCallback(
    (x: number, y: number) => {
      const existing = placedMechanisms.find((m) => m.x === x && m.y === y);
      if (existing) {
        setSelectedPlacedId(existing.id);
        setSelectedTemplate(null);
        return;
      }

      if (selectedTemplate) {
        const newMech: PlacedMechanism = {
          id: `mech-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          templateId: selectedTemplate.id,
          category: selectedTemplate.category,
          name: selectedTemplate.name,
          x,
          y,
          color: selectedTemplate.color,
          direction: selectedTemplate.category === "laser" ? "right" : undefined,
          damage: selectedTemplate.category === "trap" ? 25 : undefined,
          answer: selectedTemplate.category === "puzzle" ? "" : undefined,
          keyId: selectedTemplate.category === "door" ? "" : undefined,
          reward: selectedTemplate.category === "treasure" ? "" : undefined,
          range: selectedTemplate.category === "sensor" ? 2 : undefined,
        };
        setPlacedMechanisms((prev) => [...prev, newMech]);
        setSelectedPlacedId(newMech.id);
      } else {
        setSelectedPlacedId(null);
      }
    },
    [placedMechanisms, selectedTemplate]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedPlacedId && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
          setPlacedMechanisms((prev) => prev.filter((m) => m.id !== selectedPlacedId));
          setSelectedPlacedId(null);
        }
      }
      if (e.key === "Escape") {
        setSelectedTemplate(null);
        setSelectedPlacedId(null);
      }
    },
    [selectedPlacedId]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const updatePlacedMechanism = (id: string, updates: Partial<PlacedMechanism>) => {
    setPlacedMechanisms((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const getMechanismAt = (x: number, y: number) =>
    placedMechanisms.find((m) => m.x === x && m.y === y);

  return (
    <div className="relative min-h-screen bg-gothic-bg overflow-hidden">
      <GearDecoration
        size="xl"
        direction="clockwise"
        speed="slow"
        className="absolute -top-20 -right-20 opacity-[0.05]"
      />
      <GearDecoration
        size="lg"
        direction="counterclockwise"
        speed="slow"
        className="absolute -bottom-16 -left-16 opacity-[0.04]"
      />

      <div className="relative z-10 flex flex-col h-screen">
        <div className="text-center py-4 border-b border-gothic-border">
          <h1 className="text-2xl lg:text-3xl mb-1 text-bronze-gradient">
            密室设计器
          </h1>
          <p className="text-sm text-gothic-muted italic">
            匠心独运，铸造属于你的蒸汽朋克密室
          </p>
        </div>

        <div className="flex flex-1 overflow-hidden gap-4 p-4">
          {/* 左侧机关库 */}
          <div
            className="flex-shrink-0 flex flex-col gap-3"
            style={{ width: 280 }}
          >
            <ParchementCard
              title="机关库"
              subtitle="选择机关放置于密室"
              icon={<Hammer size={22} />}
              className="flex-1 flex flex-col overflow-hidden"
              contentClassName="flex-1 flex flex-col overflow-hidden"
            >
              <div className="grid grid-cols-3 gap-1.5 mb-4">
                {(
                  Object.keys(CATEGORY_CONFIG) as MechanismCategory[]
                ).map((cat) => {
                  const config = CATEGORY_CONFIG[cat];
                  const Icon = config.icon;
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        "flex flex-col items-center justify-center py-2.5 px-1 transition-all duration-300 relative",
                        "border",
                        isActive
                          ? "bg-gradient-to-b from-[#3d2f1a] to-[#2a1f15] border-[#c9a227] shadow-[0_0_12px_rgba(201,162,39,0.35)]"
                          : "bg-[#2a1f15]/40 border-parchment-400/40 hover:border-parchment-400/70 hover:bg-[#2a1f15]/60"
                      )}
                    >
                      <Icon
                        size={20}
                        className={cn(
                          "mb-1",
                          isActive ? "text-[#c9a227]" : "text-[#6b5a3e]"
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs font-display tracking-wider",
                          isActive ? "text-[#c9a227]" : "text-[#6b5a3e]"
                        )}
                      >
                        {config.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filteredTemplates.map((tpl) => {
                  const Icon = tpl.icon;
                  const isSelected = selectedTemplate?.id === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => {
                        setSelectedTemplate(isSelected ? null : tpl);
                        setSelectedPlacedId(null);
                      }}
                      className={cn(
                        "w-full text-left p-3 relative transition-all duration-300",
                        "border bg-[#2a1f15]/30",
                        isSelected
                          ? "border-2 shadow-[0_0_15px_rgba(201,162,39,0.4)]"
                          : "border-parchment-400/40 hover:border-parchment-400/70"
                      )}
                      style={{
                        borderColor: isSelected ? "#c9a227" : undefined,
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-parchment-400/50"
                          style={{ backgroundColor: `${tpl.color}22` }}
                        >
                          <Icon size={20} style={{ color: tpl.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-display text-sm font-bold tracking-wide text-[#3d2f1a]">
                              {tpl.name}
                            </span>
                            <span className="flex-shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-display border border-parchment-400/50 bg-parchment-100/50 text-[#6b5a3e]">
                              <Star size={10} className="fill-current" />
                              {tpl.baseDifficulty}
                            </span>
                          </div>
                          <p className="text-xs text-[#6b5a3e] leading-snug">
                            {tpl.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ParchementCard>
          </div>

          {/* 中央网格画布 */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            <ParchementCard
              title="密室蓝图"
              subtitle={`${GRID_COLS} × ${GRID_ROWS} 网格 | 已放置 ${placedMechanisms.length} 个机关`}
              icon={<Sparkles size={22} />}
              className="flex-1 flex flex-col overflow-hidden"
              contentClassName="flex-1 flex flex-col items-center justify-center overflow-auto p-4"
            >
              <div
                className="relative"
                style={{
                  border: "2px solid #c9a227",
                  boxShadow:
                    "0 0 20px rgba(201, 162, 39, 0.15), inset 0 0 40px rgba(0, 0, 0, 0.3)",
                }}
              >
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${GRID_COLS}, 44px)`,
                    gridTemplateRows: `repeat(${GRID_ROWS}, 44px)`,
                  }}
                >
                  {Array.from({ length: GRID_ROWS }).map((_, y) =>
                    Array.from({ length: GRID_COLS }).map((_, x) => {
                      const mech = getMechanismAt(x, y);
                      const isHovered =
                        hoveredCell?.x === x && hoveredCell?.y === y;
                      const isSelected = mech?.id === selectedPlacedId;
                      const isCheckerDark = (x + y) % 2 === 0;
                      const TemplateIcon = mech
                        ? MECHANISM_TEMPLATES.find(
                            (t) => t.id === mech.templateId
                          )?.icon || Zap
                        : null;

                      return (
                        <div
                          key={`${x}-${y}`}
                          onClick={() => handleCellClick(x, y)}
                          onMouseEnter={() => setHoveredCell({ x, y })}
                          onMouseLeave={() => setHoveredCell(null)}
                          className={cn(
                            "relative flex items-center justify-center cursor-pointer transition-all duration-150",
                            "border border-black/20"
                          )}
                          style={{
                            backgroundColor: isCheckerDark ? "#2a2018" : "#221a14",
                            outline: isSelected
                              ? "2px solid #c9a227"
                              : isHovered && !mech
                              ? "1px solid rgba(201, 162, 39, 0.5)"
                              : "none",
                            outlineOffset: isSelected ? "-2px" : "-1px",
                            boxShadow: isSelected
                              ? "0 0 15px rgba(201, 162, 39, 0.6), inset 0 0 10px rgba(201, 162, 39, 0.2)"
                              : isHovered && !mech
                              ? "inset 0 0 10px rgba(201, 162, 39, 0.15)"
                              : "none",
                          }}
                        >
                          {mech && TemplateIcon && (
                            <div
                              className={cn(
                                "w-9 h-9 flex items-center justify-center transition-all",
                                isSelected && "animate-pulse-glow"
                              )}
                              style={{
                                filter: isSelected
                                  ? `drop-shadow(0 0 8px ${mech.color})`
                                  : `drop-shadow(0 0 3px ${mech.color}88)`,
                              }}
                            >
                              <TemplateIcon
                                size={22}
                                style={{ color: mech.color }}
                                strokeWidth={2.2}
                              />
                            </div>
                          )}
                          {!mech && isHovered && selectedTemplate && (
                            <div
                              className="w-9 h-9 flex items-center justify-center opacity-40"
                            >
                              {(() => {
                                const PrevIcon = selectedTemplate.icon;
                                return (
                                  <PrevIcon
                                    size={22}
                                    style={{ color: selectedTemplate.color }}
                                  />
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="absolute -left-3 -top-3 w-5 h-5 border-t-2 border-l-2 border-[#c9a227]" />
                <div className="absolute -right-3 -top-3 w-5 h-5 border-t-2 border-r-2 border-[#c9a227]" />
                <div className="absolute -left-3 -bottom-3 w-5 h-5 border-b-2 border-l-2 border-[#c9a227]" />
                <div className="absolute -right-3 -bottom-3 w-5 h-5 border-b-2 border-r-2 border-[#c9a227]" />
              </div>

              <div className="mt-4 flex items-center gap-6 text-xs text-[#6b5a3e]">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border border-[#c9a227]" />
                  左键放置/选中
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 border border-parchment-400/50 text-[10px] font-mono">
                    Del
                  </kbd>
                  删除选中
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 border border-parchment-400/50 text-[10px] font-mono">
                    Esc
                  </kbd>
                  取消选择
                </span>
              </div>
            </ParchementCard>
          </div>

          {/* 右侧面板 */}
          <div
            className="flex-shrink-0 flex flex-col gap-3 overflow-hidden"
            style={{ width: 320 }}
          >
            {/* 上部：密室信息 */}
            <ParchementCard
              title="密室信息"
              subtitle="定义密室基本属性"
              icon={<Lock size={20} />}
            >
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-display tracking-wider text-[#6b5a3e] mb-1">
                    密室名称
                  </label>
                  <input
                    type="text"
                    value={chamberInfo.name}
                    onChange={(e) =>
                      setChamberInfo((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-[#2a1f15]/40 border border-parchment-400/50 text-[#2a1f15] text-sm font-body focus:outline-none focus:border-[#c9a227] transition-colors"
                    placeholder="输入密室名称..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-display tracking-wider text-[#6b5a3e] mb-1">
                    密室描述
                  </label>
                  <textarea
                    value={chamberInfo.description}
                    onChange={(e) =>
                      setChamberInfo((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={2}
                    className="w-full px-3 py-2 bg-[#2a1f15]/40 border border-parchment-400/50 text-[#2a1f15] text-sm font-body focus:outline-none focus:border-[#c9a227] transition-colors resize-none"
                    placeholder="简要描述密室主题..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-display tracking-wider text-[#6b5a3e]">
                      最低等级
                    </label>
                    <span className="text-sm font-bold font-display text-[#c9a227]">
                      Lv.{chamberInfo.minLevel}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={chamberInfo.minLevel}
                    onChange={(e) =>
                      setChamberInfo((prev) => ({
                        ...prev,
                        minLevel: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-[#c9a227]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-display tracking-wider text-[#6b5a3e]">
                      最大人数
                    </label>
                    <span className="text-sm font-bold font-display text-[#c9a227]">
                      {chamberInfo.maxPlayers} 人
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={chamberInfo.maxPlayers}
                    onChange={(e) =>
                      setChamberInfo((prev) => ({
                        ...prev,
                        maxPlayers: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-[#c9a227]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-display tracking-wider text-[#6b5a3e]">
                      时长
                    </label>
                    <span className="text-sm font-bold font-display text-[#c9a227]">
                      {chamberInfo.duration} 分钟
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={60}
                    step={5}
                    value={chamberInfo.duration}
                    onChange={(e) =>
                      setChamberInfo((prev) => ({
                        ...prev,
                        duration: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-[#c9a227]"
                  />
                </div>
              </div>
            </ParchementCard>

            {/* 中部：实时难度 */}
            <ParchementCard
              title="难度分析"
              subtitle="实时评估密室挑战度"
              icon={<Gauge size={20} />}
            >
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={24}
                      className={cn(
                        "transition-all",
                        i < difficultyStats.stars
                          ? "text-[#c9a227] fill-[#c9a227]"
                          : "text-[#6b5a3e]/40"
                      )}
                    />
                  ))}
                </div>
                <div className="font-display text-lg font-bold tracking-wider text-[#3d2f1a]">
                  {difficultyInfo.label}
                </div>
                <div className="text-xs text-[#6b5a3e] italic mt-0.5">
                  {difficultyInfo.text}
                </div>
                <div className="mt-2 text-xs">
                  <span className="text-[#6b5a3e]">建议等级：</span>
                  <span className="font-bold font-display text-[#c9a227]">
                    Lv.{suggestedLevel}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#6b5a3e]">机关密度</span>
                    <span className="text-xs font-bold text-[#8b2c2c]">
                      {difficultyStats.density}%
                    </span>
                  </div>
                  <div className="h-2 bg-[#2a1f15]/50 border border-parchment-400/30 overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${difficultyStats.density}%`,
                        backgroundColor: "#8b2c2c",
                        boxShadow: "0 0 8px rgba(139, 44, 44, 0.6)",
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#6b5a3e]">谜题复杂度</span>
                    <span className="text-xs font-bold text-[#3d6b4f]">
                      {difficultyStats.complexity}%
                    </span>
                  </div>
                  <div className="h-2 bg-[#2a1f15]/50 border border-parchment-400/30 overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${difficultyStats.complexity}%`,
                        backgroundColor: "#3d6b4f",
                        boxShadow: "0 0 8px rgba(61, 107, 79, 0.6)",
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#6b5a3e]">联动深度</span>
                    <span className="text-xs font-bold text-[#4a7fb5]">
                      {difficultyStats.linkage}%
                    </span>
                  </div>
                  <div className="h-2 bg-[#2a1f15]/50 border border-parchment-400/30 overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${difficultyStats.linkage}%`,
                        backgroundColor: "#4a7fb5",
                        boxShadow: "0 0 8px rgba(74, 127, 181, 0.6)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </ParchementCard>

            {/* 下部：机关属性 */}
            <ParchementCard
              title="机关属性"
              subtitle={selectedPlaced ? selectedPlaced.name : "未选中机关"}
              icon={<Sparkles size={20} />}
              className="flex-1 flex flex-col overflow-hidden"
              contentClassName="flex-1 overflow-y-auto"
            >
              {selectedPlaced ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-parchment-400/40">
                    <div
                      className="w-12 h-12 flex items-center justify-center border border-parchment-400/50"
                      style={{ backgroundColor: `${selectedPlaced.color}22` }}
                    >
                      {(() => {
                        const IconComp =
                          MECHANISM_TEMPLATES.find(
                            (t) => t.id === selectedPlaced.templateId
                          )?.icon || Zap;
                        return (
                          <IconComp
                            size={24}
                            style={{ color: selectedPlaced.color }}
                          />
                        );
                      })()}
                    </div>
                    <div>
                      <div className="font-display font-bold text-[#3d2f1a]">
                        {selectedPlaced.name}
                      </div>
                      <div className="text-xs text-[#6b5a3e]">
                        位置: ({selectedPlaced.x}, {selectedPlaced.y})
                      </div>
                    </div>
                  </div>

                  {selectedPlaced.category === "laser" && (
                    <div>
                      <label className="block text-xs font-display tracking-wider text-[#6b5a3e] mb-2">
                        发射方向
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(["up", "right", "down", "left"] as Direction[]).map(
                          (dir) => {
                            const icons = {
                              up: ArrowUp,
                              down: ArrowDown,
                              left: ArrowLeft,
                              right: ArrowRight,
                            };
                            const labels = {
                              up: "上",
                              down: "下",
                              left: "左",
                              right: "右",
                            };
                            const DirIcon = icons[dir];
                            const isActive =
                              selectedPlaced.direction === dir;
                            return (
                              <button
                                key={dir}
                                onClick={() =>
                                  updatePlacedMechanism(selectedPlaced.id, {
                                    direction: dir,
                                  })
                                }
                                className={cn(
                                  "flex flex-col items-center justify-center py-2 border transition-all",
                                  isActive
                                    ? "border-[#8b2c2c] bg-[#8b2c2c]/20 text-[#8b2c2c]"
                                    : "border-parchment-400/40 bg-[#2a1f15]/30 text-[#6b5a3e] hover:border-parchment-400/70"
                                )}
                              >
                                <DirIcon size={16} />
                                <span className="text-[10px] mt-0.5 font-display">
                                  {labels[dir]}
                                </span>
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}

                  {selectedPlaced.category === "trap" && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-display tracking-wider text-[#6b5a3e]">
                          伤害值
                        </label>
                        <span className="text-sm font-bold font-display text-[#c9a227]">
                          {selectedPlaced.damage}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={100}
                        step={5}
                        value={selectedPlaced.damage || 25}
                        onChange={(e) =>
                          updatePlacedMechanism(selectedPlaced.id, {
                            damage: Number(e.target.value),
                          })
                        }
                        className="w-full accent-[#c9a227]"
                      />
                    </div>
                  )}

                  {selectedPlaced.category === "puzzle" && (
                    <div>
                      <label className="block text-xs font-display tracking-wider text-[#6b5a3e] mb-1">
                        谜题答案
                      </label>
                      <input
                        type="text"
                        value={selectedPlaced.answer || ""}
                        onChange={(e) =>
                          updatePlacedMechanism(selectedPlaced.id, {
                            answer: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-[#2a1f15]/40 border border-parchment-400/50 text-[#2a1f15] text-sm font-body focus:outline-none focus:border-[#3d6b4f] transition-colors"
                        placeholder="输入正确答案..."
                      />
                    </div>
                  )}

                  {selectedPlaced.category === "door" && (
                    <div>
                      <label className="block text-xs font-display tracking-wider text-[#6b5a3e] mb-1">
                        钥匙 ID
                      </label>
                      <input
                        type="text"
                        value={selectedPlaced.keyId || ""}
                        onChange={(e) =>
                          updatePlacedMechanism(selectedPlaced.id, {
                            keyId: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-[#2a1f15]/40 border border-parchment-400/50 text-[#2a1f15] text-sm font-body focus:outline-none focus:border-[#4a7fb5] transition-colors"
                        placeholder="关联钥匙编号..."
                      />
                    </div>
                  )}

                  {selectedPlaced.category === "treasure" && (
                    <div>
                      <label className="block text-xs font-display tracking-wider text-[#6b5a3e] mb-1">
                        宝箱奖励
                      </label>
                      <textarea
                        value={selectedPlaced.reward || ""}
                        onChange={(e) =>
                          updatePlacedMechanism(selectedPlaced.id, {
                            reward: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-3 py-2 bg-[#2a1f15]/40 border border-parchment-400/50 text-[#2a1f15] text-sm font-body focus:outline-none focus:border-[#c9a227] transition-colors resize-none"
                        placeholder="描述奖励内容..."
                      />
                    </div>
                  )}

                  {selectedPlaced.category === "sensor" && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-display tracking-wider text-[#6b5a3e]">
                          探测范围
                        </label>
                        <span className="text-sm font-bold font-display text-[#c9a227]">
                          {selectedPlaced.range} 格
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={8}
                        value={selectedPlaced.range || 2}
                        onChange={(e) =>
                          updatePlacedMechanism(selectedPlaced.id, {
                            range: Number(e.target.value),
                          })
                        }
                        className="w-full accent-[#8b6914]"
                      />
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setPlacedMechanisms((prev) =>
                        prev.filter((m) => m.id !== selectedPlaced.id)
                      );
                      setSelectedPlacedId(null);
                    }}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-2 border border-[#8b2c2c]/50 text-[#8b2c2c] text-sm font-display tracking-wider hover:bg-[#8b2c2c]/10 transition-colors"
                  >
                    <Trash2 size={16} />
                    移除此机关
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                  <div className="w-16 h-16 flex items-center justify-center border-2 border-dashed border-parchment-400/40 mb-3">
                    <Sparkles size={28} className="text-[#6b5a3e]/50" />
                  </div>
                  <p className="text-sm text-[#6b5a3e] italic">
                    在画布上选择已放置的机关
                    <br />
                    可查看并编辑其详细属性
                  </p>
                </div>
              )}
            </ParchementCard>
          </div>
        </div>

        {/* 底部保存发布按钮 */}
        <div className="flex-shrink-0 px-4 pb-4">
          <div className="ornate-border flex items-center justify-between gap-4 py-3 px-6 bg-gothic-surface">
            <div className="flex items-center gap-3">
              <GearDecoration
                size="sm"
                direction="clockwise"
                speed="normal"
                className="relative opacity-60"
              />
              <div>
                <div className="font-display text-sm tracking-wider text-[#c9a227]">
                  {chamberInfo.name || "未命名密室"}
                </div>
                <div className="text-xs text-gothic-muted">
                  {placedMechanisms.length} 个机关 · {difficultyInfo.label} ·
                  建议 Lv.{suggestedLevel}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MetalButton variant="ghost" icon={<Save size={18} />}>
                保存草稿
              </MetalButton>
              <MetalButton variant="primary" icon={<Upload size={18} />}>
                发布密室
              </MetalButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
