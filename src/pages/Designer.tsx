import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  Hammer,
} from "lucide-react";
import { ParchementCard } from "@/components/ParchementCard";
import { MetalButton } from "@/components/MetalButton";
import { GearDecoration } from "@/components/GearDecoration";
import { cn } from "@/lib/utils";
import type { Mechanism, MechanismType } from "@/shared/types";
import type { DifficultyResult } from "@/utils/api";
import { chambersApi } from "@/utils/api";
import { useGameStore } from "@/store/useGameStore";

const MECHANISM_CATEGORIES: {
  type: MechanismType;
  label: string;
  icon: typeof Zap;
  color: string;
  description: string;
}[] = [
  {
    type: "laser",
    label: "激光",
    icon: Zap,
    color: "#8b2c2c",
    description: "灼热光束发射器，触碰即触发警报",
  },
  {
    type: "trap",
    label: "陷阱",
    icon: AlertTriangle,
    color: "#c9a227",
    description: "隐蔽的机关装置，给闯入者致命打击",
  },
  {
    type: "puzzle",
    label: "谜题",
    icon: Puzzle,
    color: "#3d6b4f",
    description: "需要破解的密码或机关才能通过",
  },
  {
    type: "door",
    label: "门",
    icon: DoorOpen,
    color: "#4a7fb5",
    description: "分隔区域的金属大门",
  },
  {
    type: "chest",
    label: "宝箱",
    icon: Package,
    color: "#c9a227",
    description: "藏匿宝物与奖励的容器",
  },
  {
    type: "sensor",
    label: "传感器",
    icon: Gauge,
    color: "#8b6914",
    description: "侦测动静的精密仪器",
  },
];

const getDefaultConfig = (type: MechanismType): Record<string, any> => {
  switch (type) {
    case "laser":
      return { direction: "right", damage: 30 };
    case "trap":
      return { damage: 25, triggerType: "pressure" };
    case "puzzle":
      return { answer: "", hints: 3, difficulty: "medium" };
    case "door":
      return { keyId: "", isLocked: true };
    case "chest":
      return { reward: "", isLocked: true };
    case "sensor":
      return { range: 2, sensitivity: "normal" };
    default:
      return {};
  }
};

export default function Designer() {
  const navigate = useNavigate();

  const [chamberName, setChamberName] = useState("未命名密室");
  const [chamberDesc, setChamberDesc] = useState("");
  const [gridWidth] = useState(16);
  const [gridHeight] = useState(12);
  const [mechanisms, setMechanisms] = useState<Mechanism[]>([]);
  const [selectedMechanismType, setSelectedMechanismType] =
    useState<MechanismType | null>(null);
  const [selectedPlacedMechId, setSelectedPlacedMechId] = useState<string | null>(
    null
  );
  const [minLevel, setMinLevel] = useState(1);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [timeLimit, setTimeLimit] = useState(300);
  const [difficultyResult, setDifficultyResult] =
    useState<DifficultyResult | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(
    null
  );
  const [toast, setToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const storeUser = useGameStore.getState().user;
    if (!storeUser) {
      useGameStore.getState().loadData();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const compute = async () => {
      const res = await chambersApi.calculateDifficulty(
        mechanisms,
        gridWidth,
        gridHeight
      );
      if (!cancelled && res.success && res.data) {
        setDifficultyResult(res.data);
      }
    };
    compute();
    return () => {
      cancelled = true;
    };
  }, [mechanisms, gridWidth, gridHeight]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const selectedPlacedMech = useMemo(
    () => mechanisms.find((m) => m.id === selectedPlacedMechId) || null,
    [mechanisms, selectedPlacedMechId]
  );

  const selectedCategoryConfig = useMemo(
    () =>
      selectedMechanismType
        ? MECHANISM_CATEGORIES.find((c) => c.type === selectedMechanismType)
        : null,
    [selectedMechanismType]
  );

  const getMechanismAt = useCallback(
    (x: number, y: number) => mechanisms.find((m) => m.x === x && m.y === y),
    [mechanisms]
  );

  const handleCellClick = useCallback(
    (x: number, y: number) => {
      const existing = getMechanismAt(x, y);
      if (existing) {
        setSelectedPlacedMechId(existing.id);
        setSelectedMechanismType(null);
        return;
      }
      if (selectedMechanismType) {
        const newMech: Mechanism = {
          id: `mech-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: selectedMechanismType,
          x,
          y,
          config: getDefaultConfig(selectedMechanismType),
        };
        setMechanisms((prev) => [...prev, newMech]);
        setSelectedPlacedMechId(newMech.id);
      } else {
        setSelectedPlacedMechId(null);
      }
    },
    [selectedMechanismType, getMechanismAt]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedPlacedMechId) {
        setMechanisms((prev) => prev.filter((m) => m.id !== selectedPlacedMechId));
        setSelectedPlacedMechId(null);
      }
      if (e.key === "Escape") {
        setSelectedMechanismType(null);
        setSelectedPlacedMechId(null);
      }
    },
    [selectedPlacedMechId]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const updatePlacedMechanism = (
    id: string,
    updates: Partial<Mechanism>
  ) => {
    setMechanisms((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const updateMechanismConfig = (
    id: string,
    key: string,
    value: any
  ) => {
    setMechanisms((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, config: { ...m.config, [key]: value } } : m
      )
    );
  };

  const handleSavePublish = async () => {
    const user = useGameStore.getState().user;
    if (!user) {
      showToast("用户信息加载中，请稍候再试");
      return;
    }
    if (!chamberName.trim()) {
      showToast("请输入密室名称");
      return;
    }
    setIsSaving(true);
    try {
      const res = await chambersApi.createChamber({
        ownerId: user.id,
        name: chamberName,
        description: chamberDesc,
        gridWidth,
        gridHeight,
        mechanisms,
        maxPlayers,
        timeLimit,
      });
      if (res.success) {
        showToast("密室发布成功");
        setTimeout(() => navigate("/"), 800);
      } else {
        showToast(res.error || "发布失败，请重试");
      }
    } catch {
      showToast("发布失败，请重试");
    } finally {
      setIsSaving(false);
    }
  };

  const stars = difficultyResult?.stars ?? 0;
  const difficultyLabel = difficultyResult?.label ?? "入门";
  const suggestedMinLevel = difficultyResult?.suggestedMinLevel ?? 1;
  const mechanismCount = difficultyResult?.mechanismCount ?? mechanisms.length;
  const mechanismWeightedScore = difficultyResult?.mechanismWeightedScore ?? 0;
  const linkComplexity = difficultyResult?.linkComplexity ?? 0;
  const puzzleScore = difficultyResult?.puzzleScore ?? 0;
  const totalScore = mechanismWeightedScore + linkComplexity + puzzleScore;
  const densityPct = totalScore > 0 ? Math.min(100, Math.round((mechanismWeightedScore / totalScore) * 100)) : 0;
  const puzzlePct = totalScore > 0 ? Math.min(100, Math.round((puzzleScore / totalScore) * 100)) : 0;
  const linkPct = totalScore > 0 ? Math.min(100, Math.round((linkComplexity / totalScore) * 100)) : 0;

  return (
    <div className="relative min-h-screen bg-[#1a1410] overflow-hidden">
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

      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-float">
          <div className="gothic-panel px-5 py-3 shadow-[0_0_15px_rgba(201,162,39,0.35)] bg-[#2a1f15] border border-[#c9a227]/60">
            <p className="font-display text-[#c9a227] font-bold text-sm">
              {toast}
            </p>
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col h-screen">
        <div className="text-center py-4 border-b border-[#3d2f1a]">
          <h1 className="text-2xl lg:text-3xl mb-1 bg-gradient-to-b from-[#f5d67b] via-[#c9a227] to-[#8b6914] bg-clip-text text-transparent font-display tracking-widest">
            密室设计器
          </h1>
          <p className="text-sm text-[#8b6914] italic">
            匠心独运，铸造属于你的蒸汽朋克密室
          </p>
        </div>

        <div className="flex flex-1 overflow-hidden gap-4 p-4">
          <div className="flex-shrink-0 flex flex-col gap-3" style={{ width: 280 }}>
            <ParchementCard
              title="机关库"
              subtitle="选择机关放置于密室"
              icon={<Hammer size={22} />}
              className="flex-1 flex flex-col overflow-hidden"
              contentClassName="flex-1 flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {MECHANISM_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedMechanismType === cat.type;
                  return (
                    <button
                      key={cat.type}
                      onClick={() => {
                        setSelectedMechanismType(isSelected ? null : cat.type);
                        setSelectedPlacedMechId(null);
                      }}
                      className={cn(
                        "w-full text-left p-3 relative transition-all duration-300",
                        "border bg-[#2a1f15]/30",
                        isSelected
                          ? "border-2 shadow-[0_0_15px_rgba(201,162,39,0.4)] border-[#c9a227]"
                          : "border-[#8b6e3e]/40 hover:border-[#8b6e3e]/70"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-[#8b6e3e]/50"
                          style={{ backgroundColor: `${cat.color}22` }}
                        >
                          <Icon size={20} style={{ color: cat.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-display text-sm font-bold tracking-wide text-[#3d2f1a]">
                              {cat.label}
                            </span>
                          </div>
                          <p className="text-xs text-[#6b5a3e] leading-snug">
                            {cat.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ParchementCard>
          </div>

          <div className="flex-1 flex flex-col gap-3 min-w-0">
            <ParchementCard
              title="密室蓝图"
              subtitle={`${gridWidth} × ${gridHeight} 网格 | 已放置 ${mechanisms.length} 个机关`}
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
                    gridTemplateColumns: `repeat(${gridWidth}, 44px)`,
                    gridTemplateRows: `repeat(${gridHeight}, 44px)`,
                  }}
                >
                  {Array.from({ length: gridHeight }).map((_, y) =>
                    Array.from({ length: gridWidth }).map((_, x) => {
                      const mech = getMechanismAt(x, y);
                      const isHovered =
                        hoveredCell?.x === x && hoveredCell?.y === y;
                      const isSelected = mech?.id === selectedPlacedMechId;
                      const isCheckerDark = (x + y) % 2 === 0;
                      const MechIcon = mech
                        ? MECHANISM_CATEGORIES.find((c) => c.type === mech.type)?.icon
                        : null;
                      const mechColor = mech
                        ? MECHANISM_CATEGORIES.find((c) => c.type === mech.type)?.color
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
                          {mech && MechIcon && mechColor && (
                            <div
                              className={cn(
                                "w-9 h-9 flex items-center justify-center transition-all",
                                isSelected && "animate-pulse"
                              )}
                              style={{
                                filter: isSelected
                                  ? `drop-shadow(0 0 8px ${mechColor})`
                                  : `drop-shadow(0 0 3px ${mechColor}88)`,
                              }}
                            >
                              <MechIcon
                                size={22}
                                style={{ color: mechColor }}
                                strokeWidth={2.2}
                              />
                            </div>
                          )}
                          {!mech && isHovered && selectedCategoryConfig && (
                            <div className="w-9 h-9 flex items-center justify-center opacity-40">
                              <selectedCategoryConfig.icon
                                size={22}
                                style={{ color: selectedCategoryConfig.color }}
                              />
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
                  <kbd className="px-1.5 py-0.5 border border-[#8b6e3e]/50 text-[10px] font-mono">
                    Del
                  </kbd>
                  删除选中
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 border border-[#8b6e3e]/50 text-[10px] font-mono">
                    Esc
                  </kbd>
                  取消选择
                </span>
              </div>
            </ParchementCard>
          </div>

          <div
            className="flex-shrink-0 flex flex-col gap-3 overflow-hidden"
            style={{ width: 320 }}
          >
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
                    value={chamberName}
                    onChange={(e) => setChamberName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#2a1f15]/40 border border-[#8b6e3e]/50 text-[#2a1f15] text-sm focus:outline-none focus:border-[#c9a227] transition-colors"
                    placeholder="输入密室名称..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-display tracking-wider text-[#6b5a3e] mb-1">
                    密室描述
                  </label>
                  <textarea
                    value={chamberDesc}
                    onChange={(e) => setChamberDesc(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-[#2a1f15]/40 border border-[#8b6e3e]/50 text-[#2a1f15] text-sm focus:outline-none focus:border-[#c9a227] transition-colors resize-none"
                    placeholder="简要描述密室主题..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-display tracking-wider text-[#6b5a3e]">
                      最低等级
                    </label>
                    <span className="text-sm font-bold font-display text-[#c9a227]">
                      Lv.{minLevel}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={minLevel}
                    onChange={(e) => setMinLevel(Number(e.target.value))}
                    className="w-full accent-[#c9a227]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-display tracking-wider text-[#6b5a3e]">
                      最大人数
                    </label>
                    <span className="text-sm font-bold font-display text-[#c9a227]">
                      {maxPlayers} 人
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(Number(e.target.value))}
                    className="w-full accent-[#c9a227]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-display tracking-wider text-[#6b5a3e]">
                      时长
                    </label>
                    <span className="text-sm font-bold font-display text-[#c9a227]">
                      {Math.floor(timeLimit / 60)} 分 {timeLimit % 60} 秒
                    </span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={3600}
                    step={30}
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    className="w-full accent-[#c9a227]"
                  />
                </div>
              </div>
            </ParchementCard>

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
                        i < stars
                          ? "text-[#c9a227] fill-[#c9a227]"
                          : "text-[#6b5a3e]/40"
                      )}
                    />
                  ))}
                </div>
                <div className="font-display text-lg font-bold tracking-wider text-[#3d2f1a]">
                  {difficultyLabel}
                </div>
                <div className="mt-2 text-xs">
                  <span className="text-[#6b5a3e]">建议等级：</span>
                  <span className="font-bold font-display text-[#c9a227]">
                    Lv.{suggestedMinLevel}
                  </span>
                </div>
                <div className="mt-1 text-xs text-[#6b5a3e]">
                  机关数量：{mechanismCount}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#6b5a3e]">机关密度</span>
                    <span className="text-xs font-bold text-[#8b2c2c]">
                      {densityPct}%
                    </span>
                  </div>
                  <div className="h-2 bg-[#2a1f15]/50 border border-[#8b6e3e]/30 overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${densityPct}%`,
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
                      {puzzlePct}%
                    </span>
                  </div>
                  <div className="h-2 bg-[#2a1f15]/50 border border-[#8b6e3e]/30 overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${puzzlePct}%`,
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
                      {linkPct}%
                    </span>
                  </div>
                  <div className="h-2 bg-[#2a1f15]/50 border border-[#8b6e3e]/30 overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${linkPct}%`,
                        backgroundColor: "#4a7fb5",
                        boxShadow: "0 0 8px rgba(74, 127, 181, 0.6)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </ParchementCard>

            <ParchementCard
              title="机关属性"
              subtitle={selectedPlacedMech ? MECHANISM_CATEGORIES.find((c) => c.type === selectedPlacedMech.type)?.label || "已选中机关" : "未选中机关"}
              icon={<Sparkles size={20} />}
              className="flex-1 flex flex-col overflow-hidden"
              contentClassName="flex-1 overflow-y-auto"
            >
              {selectedPlacedMech ? (
                <div className="space-y-4">
                  {(() => {
                    const cat = MECHANISM_CATEGORIES.find(
                      (c) => c.type === selectedPlacedMech.type
                    );
                    const MechIcon = cat?.icon || Sparkles;
                    const mechColor = cat?.color || "#c9a227";
                    return (
                      <div className="flex items-center gap-3 pb-3 border-b border-[#8b6e3e]/40">
                        <div
                          className="w-12 h-12 flex items-center justify-center border border-[#8b6e3e]/50"
                          style={{ backgroundColor: `${mechColor}22` }}
                        >
                          <MechIcon size={24} style={{ color: mechColor }} />
                        </div>
                        <div>
                          <div className="font-display font-bold text-[#3d2f1a]">
                            {cat?.label}
                          </div>
                          <div className="text-xs text-[#6b5a3e]">
                            位置: ({selectedPlacedMech.x}, {selectedPlacedMech.y})
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {selectedPlacedMech.type === "laser" && (
                    <>
                      <div>
                        <label className="block text-xs font-display tracking-wider text-[#6b5a3e] mb-2">
                          发射方向
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {(["up", "right", "down", "left"] as const).map((dir) => {
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
                              selectedPlacedMech.config.direction === dir;
                            return (
                              <button
                                key={dir}
                                onClick={() =>
                                  updateMechanismConfig(
                                    selectedPlacedMech.id,
                                    "direction",
                                    dir
                                  )
                                }
                                className={cn(
                                  "flex flex-col items-center justify-center py-2 border transition-all",
                                  isActive
                                    ? "border-[#8b2c2c] bg-[#8b2c2c]/20 text-[#8b2c2c]"
                                    : "border-[#8b6e3e]/40 bg-[#2a1f15]/30 text-[#6b5a3e] hover:border-[#8b6e3e]/70"
                                )}
                              >
                                <DirIcon size={16} />
                                <span className="text-[10px] mt-0.5 font-display">
                                  {labels[dir]}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-display tracking-wider text-[#6b5a3e]">
                            伤害值
                          </label>
                          <span className="text-sm font-bold font-display text-[#c9a227]">
                            {selectedPlacedMech.config.damage ?? 30}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={5}
                          max={100}
                          step={5}
                          value={selectedPlacedMech.config.damage ?? 30}
                          onChange={(e) =>
                            updateMechanismConfig(
                              selectedPlacedMech.id,
                              "damage",
                              Number(e.target.value)
                            )
                          }
                          className="w-full accent-[#c9a227]"
                        />
                      </div>
                    </>
                  )}

                  {selectedPlacedMech.type === "trap" && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-display tracking-wider text-[#6b5a3e]">
                          伤害值
                        </label>
                        <span className="text-sm font-bold font-display text-[#c9a227]">
                          {selectedPlacedMech.config.damage ?? 25}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={100}
                        step={5}
                        value={selectedPlacedMech.config.damage ?? 25}
                        onChange={(e) =>
                          updateMechanismConfig(
                            selectedPlacedMech.id,
                            "damage",
                            Number(e.target.value)
                          )
                        }
                        className="w-full accent-[#c9a227]"
                      />
                      <div className="mt-3">
                        <label className="block text-xs font-display tracking-wider text-[#6b5a3e] mb-1">
                          触发类型
                        </label>
                        <select
                          value={selectedPlacedMech.config.triggerType ?? "pressure"}
                          onChange={(e) =>
                            updateMechanismConfig(
                              selectedPlacedMech.id,
                              "triggerType",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 bg-[#2a1f15]/40 border border-[#8b6e3e]/50 text-[#2a1f15] text-sm focus:outline-none focus:border-[#c9a227] transition-colors"
                        >
                          <option value="pressure">压力触发</option>
                          <option value="proximity">接近触发</option>
                          <option value="timer">定时触发</option>
                          <option value="tripwire">绊线触发</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {selectedPlacedMech.type === "puzzle" && (
                    <>
                      <div>
                        <label className="block text-xs font-display tracking-wider text-[#6b5a3e] mb-1">
                          谜题答案
                        </label>
                        <input
                          type="text"
                          value={selectedPlacedMech.config.answer ?? ""}
                          onChange={(e) =>
                            updateMechanismConfig(
                              selectedPlacedMech.id,
                              "answer",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 bg-[#2a1f15]/40 border border-[#8b6e3e]/50 text-[#2a1f15] text-sm focus:outline-none focus:border-[#3d6b4f] transition-colors"
                          placeholder="输入正确答案..."
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-display tracking-wider text-[#6b5a3e]">
                            提示数量
                          </label>
                          <span className="text-sm font-bold font-display text-[#c9a227]">
                            {selectedPlacedMech.config.hints ?? 3}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={5}
                          value={selectedPlacedMech.config.hints ?? 3}
                          onChange={(e) =>
                            updateMechanismConfig(
                              selectedPlacedMech.id,
                              "hints",
                              Number(e.target.value)
                            )
                          }
                          className="w-full accent-[#c9a227]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-display tracking-wider text-[#6b5a3e] mb-1">
                          难度等级
                        </label>
                        <select
                          value={selectedPlacedMech.config.difficulty ?? "medium"}
                          onChange={(e) =>
                            updateMechanismConfig(
                              selectedPlacedMech.id,
                              "difficulty",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 bg-[#2a1f15]/40 border border-[#8b6e3e]/50 text-[#2a1f15] text-sm focus:outline-none focus:border-[#3d6b4f] transition-colors"
                        >
                          <option value="easy">简单</option>
                          <option value="medium">中等</option>
                          <option value="hard">困难</option>
                        </select>
                      </div>
                    </>
                  )}

                  {selectedPlacedMech.type === "door" && (
                    <>
                      <div>
                        <label className="block text-xs font-display tracking-wider text-[#6b5a3e] mb-1">
                          钥匙 ID
                        </label>
                        <input
                          type="text"
                          value={selectedPlacedMech.config.keyId ?? ""}
                          onChange={(e) =>
                            updateMechanismConfig(
                              selectedPlacedMech.id,
                              "keyId",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 bg-[#2a1f15]/40 border border-[#8b6e3e]/50 text-[#2a1f15] text-sm focus:outline-none focus:border-[#4a7fb5] transition-colors"
                          placeholder="关联钥匙编号..."
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-display tracking-wider text-[#6b5a3e]">
                          初始锁定
                        </label>
                        <button
                          onClick={() =>
                            updateMechanismConfig(
                              selectedPlacedMech.id,
                              "isLocked",
                              !selectedPlacedMech.config.isLocked
                            )
                          }
                          className={cn(
                            "w-12 h-6 rounded-full relative transition-all",
                            selectedPlacedMech.config.isLocked
                              ? "bg-[#4a7fb5]"
                              : "bg-[#6b5a3e]/40"
                          )}
                        >
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full absolute top-0.5 transition-all bg-white",
                              selectedPlacedMech.config.isLocked
                                ? "left-6"
                                : "left-0.5"
                            )}
                          />
                        </button>
                      </div>
                    </>
                  )}

                  {selectedPlacedMech.type === "chest" && (
                    <>
                      <div>
                        <label className="block text-xs font-display tracking-wider text-[#6b5a3e] mb-1">
                          宝箱奖励
                        </label>
                        <textarea
                          value={selectedPlacedMech.config.reward ?? ""}
                          onChange={(e) =>
                            updateMechanismConfig(
                              selectedPlacedMech.id,
                              "reward",
                              e.target.value
                            )
                          }
                          rows={3}
                          className="w-full px-3 py-2 bg-[#2a1f15]/40 border border-[#8b6e3e]/50 text-[#2a1f15] text-sm focus:outline-none focus:border-[#c9a227] transition-colors resize-none"
                          placeholder="描述奖励内容..."
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-display tracking-wider text-[#6b5a3e]">
                          初始锁定
                        </label>
                        <button
                          onClick={() =>
                            updateMechanismConfig(
                              selectedPlacedMech.id,
                              "isLocked",
                              !selectedPlacedMech.config.isLocked
                            )
                          }
                          className={cn(
                            "w-12 h-6 rounded-full relative transition-all",
                            selectedPlacedMech.config.isLocked
                              ? "bg-[#c9a227]"
                              : "bg-[#6b5a3e]/40"
                          )}
                        >
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full absolute top-0.5 transition-all bg-white",
                              selectedPlacedMech.config.isLocked
                                ? "left-6"
                                : "left-0.5"
                            )}
                          />
                        </button>
                      </div>
                    </>
                  )}

                  {selectedPlacedMech.type === "sensor" && (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-display tracking-wider text-[#6b5a3e]">
                            探测范围
                          </label>
                          <span className="text-sm font-bold font-display text-[#c9a227]">
                            {selectedPlacedMech.config.range ?? 2} 格
                          </span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={8}
                          value={selectedPlacedMech.config.range ?? 2}
                          onChange={(e) =>
                            updateMechanismConfig(
                              selectedPlacedMech.id,
                              "range",
                              Number(e.target.value)
                            )
                          }
                          className="w-full accent-[#8b6914]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-display tracking-wider text-[#6b5a3e] mb-1">
                          灵敏度
                        </label>
                        <select
                          value={selectedPlacedMech.config.sensitivity ?? "normal"}
                          onChange={(e) =>
                            updateMechanismConfig(
                              selectedPlacedMech.id,
                              "sensitivity",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 bg-[#2a1f15]/40 border border-[#8b6e3e]/50 text-[#2a1f15] text-sm focus:outline-none focus:border-[#8b6914] transition-colors"
                        >
                          <option value="low">低</option>
                          <option value="normal">中等</option>
                          <option value="high">高</option>
                        </select>
                      </div>
                    </>
                  )}

                  <button
                    onClick={() => {
                      setMechanisms((prev) =>
                        prev.filter((m) => m.id !== selectedPlacedMech.id)
                      );
                      setSelectedPlacedMechId(null);
                    }}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-2 border border-[#8b2c2c]/50 text-[#8b2c2c] text-sm font-display tracking-wider hover:bg-[#8b2c2c]/10 transition-colors"
                  >
                    <Trash2 size={16} />
                    移除此机关
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                  <div className="w-16 h-16 flex items-center justify-center border-2 border-dashed border-[#8b6e3e]/40 mb-3">
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

        <div className="flex-shrink-0 px-4 pb-4">
          <div className="border-2 border-[#3d2f1a] flex items-center justify-between gap-4 py-3 px-6 bg-[#2a1f15] relative">
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#c9a227]" />
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#c9a227]" />
            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#c9a227]" />
            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#c9a227]" />

            <div className="flex items-center gap-3">
              <GearDecoration
                size="sm"
                direction="clockwise"
                speed="normal"
                className="relative opacity-60"
              />
              <div>
                <div className="font-display text-sm tracking-wider text-[#c9a227]">
                  {chamberName || "未命名密室"}
                </div>
                <div className="text-xs text-[#8b6914]">
                  {mechanisms.length} 个机关 · {difficultyLabel} · 建议 Lv.
                  {suggestedMinLevel}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MetalButton
                variant="ghost"
                icon={<Save size={18} />}
                onClick={() => showToast("草稿已保存")}
              >
                保存草稿
              </MetalButton>
              <MetalButton
                variant="primary"
                icon={<Upload size={18} />}
                loading={isSaving}
                onClick={handleSavePublish}
              >
                发布密室
              </MetalButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
