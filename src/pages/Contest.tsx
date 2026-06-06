import { useState, useEffect } from "react";
import {
  Trophy,
  Award,
  Timer,
  Star,
  Upload,
  Crown,
  Coins,
  User,
  ChevronDown,
  Send,
  Swords,
  Eye,
} from "lucide-react";
import { ParchementCard } from "@/components/ParchementCard";
import { MetalButton } from "@/components/MetalButton";
import { StatBadge } from "@/components/StatBadge";
import { GearDecoration } from "@/components/GearDecoration";
import { contestApi, chambersApi } from "@/utils/api";
import { useGameStore } from "@/store/useGameStore";
import { cn } from "@/lib/utils";
import type { ContestEntry, Chamber } from "@/shared/types";

interface ContestSeasonData {
  id: string;
  name: string;
  theme: string;
  description: string;
  startTime: number;
  endTime: number;
  status: string;
  prizes: any[];
  judges: any[];
  rules: string[];
  entriesCount: number;
  top3: ContestEntry[];
}

interface ExtendedContestEntry extends ContestEntry {
  rank?: number;
  chamberName?: string;
  authorName?: string;
}

const thumbColorPalettes = [
  ["#c9a227", "#8b6e3e", "#6a1f1f", "#3d6b4f"],
  ["#8b2c2c", "#c9a227", "#4a7fb5", "#2a1f15"],
  ["#e5c158", "#9a7c17", "#3a2e24", "#6a1f1f"],
  ["#3d6b4f", "#c9a227", "#8b6e3e", "#1a1410"],
  ["#1a1410", "#6a1f1f", "#c9a227", "#4a7fb5"],
  ["#4a7fb5", "#5a9a74", "#c9a227", "#8b6e3e"],
];

function WorkThumb({ idx }: { idx: number }) {
  const colors = thumbColorPalettes[idx % thumbColorPalettes.length];
  return (
    <div className="grid grid-cols-2 gap-0.5 w-full h-full overflow-hidden">
      {colors.map((c, i) => (
        <div
          key={i}
          className="relative"
          style={{
            background: `linear-gradient(135deg, ${c} 0%, ${c}80 100%)`,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%)",
            }}
          />
        </div>
      ))}
    </div>
  );
}

function StarRating({
  value,
  onChange,
  interactive = false,
  size = 18,
}: {
  value: number;
  onChange?: (v: number) => void;
  interactive?: boolean;
  size?: number;
}) {
  const [hover, setHover] = useState(0);
  const displayValue = interactive && hover ? hover : value;
  const normalizedValue = Math.min(5, Math.max(0, Math.round(displayValue / 20)));

  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const active = i < normalizedValue;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && setHover((i + 1) * 20)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && onChange?.((i + 1) * 20)}
            className={cn(interactive && "cursor-pointer", "transition-transform hover:scale-110")}
          >
            <Star
              size={size}
              className={cn(
                "transition-colors",
                active ? "fill-bronze text-bronze" : "text-gothic-muted"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function Contest() {
  const user = useGameStore((s) => s.user);
  const chambers = useGameStore((s) => s.chambers);
  const loadInitialData = useGameStore((s) => s.loadInitialData);

  const [season, setSeason] = useState<ContestSeasonData | null>(null);
  const [entries, setEntries] = useState<ExtendedContestEntry[]>([]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [selectedChamber, setSelectedChamber] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentWorkIdx, setCurrentWorkIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [submitToast, setSubmitToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userChambers, setUserChambers] = useState<Chamber[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await loadInitialData();
        const [seasonRes, entriesRes] = await Promise.all([
          contestApi.getCurrentSeason(),
          contestApi.getEntries({ pageSize: 50 }),
        ]);

        if (seasonRes.success && seasonRes.data) {
          setSeason(seasonRes.data);
        }

        if (entriesRes.success && entriesRes.data) {
          const enrichedEntries: ExtendedContestEntry[] = await Promise.all(
            entriesRes.data.items.map(async (entry: ExtendedContestEntry) => {
              try {
                const chRes = await chambersApi.getChamber(entry.chamberId);
                const chamberName = chRes.success && chRes.data ? chRes.data.name : `密室 #${entry.chamberId.slice(-4)}`;
                return { ...entry, chamberName };
              } catch {
                return { ...entry, chamberName: `密室 #${entry.chamberId.slice(-4)}` };
              }
            })
          );
          setEntries(enrichedEntries);
        }
      } catch (err) {
        console.error("Failed to fetch contest data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [loadInitialData]);

  useEffect(() => {
    if (!chambers || !user) return;
    const owned = chambers.filter((c) => c.ownerId === user.id);
    setUserChambers(owned);
  }, [chambers, user]);

  useEffect(() => {
    if (!season) return;
    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, season.endTime - now);

      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((remaining % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, mins, secs });
    }, 1000);
    return () => clearInterval(timer);
  }, [season]);

  const pendingWorks = entries.filter((e) => e.scores.length < 3);
  const currentWork = pendingWorks[currentWorkIdx];
  const pad = (n: number) => String(n).padStart(2, "0");

  const showToast = (msg: string) => {
    setSubmitToast(msg);
    setTimeout(() => setSubmitToast(null), 3000);
  };

  const handleSubmitWork = async () => {
    if (!selectedChamber) {
      showToast("请先选择要提交的密室作品");
      return;
    }
    if (!user) {
      showToast("请先登录");
      return;
    }
    try {
      const res = await contestApi.submitEntry(selectedChamber, season?.id);
      if (res.success && res.data) {
        showToast("作品已成功提交至评审池");
        setSelectedChamber("");
      } else {
        showToast(res.error || "提交失败");
      }
    } catch (err) {
      showToast("提交失败，请重试");
    }
  };

  const handleSubmitReview = async () => {
    if (score === 0) {
      showToast("请先给出星级评分");
      return;
    }
    if (!currentWork) {
      showToast("暂无待评审作品");
      return;
    }
    try {
      const judgeId = season?.judges?.[0]?.id || "judge1";
      const res = await contestApi.scoreEntry(currentWork.id, judgeId, score, comment);
      if (res.success) {
        showToast(`评分已提交：${Math.round(score / 20)}星`);
        setScore(0);
        setComment("");
        setCurrentWorkIdx((prev) => (prev + 1) % Math.max(1, pendingWorks.length));
        const updatedEntries = entries.map((e) =>
          e.id === currentWork.id
            ? { ...e, scores: [...e.scores, { judgeId, score, comment }], avgScore: res.data?.avgScore || e.avgScore }
            : e
        );
        setEntries(updatedEntries);
      } else {
        showToast(res.error || "评分失败");
      }
    } catch (err) {
      showToast("评分失败，请重试");
    }
  };

  return (
    <div className="relative min-h-screen bg-gothic-bg overflow-hidden">
      <GearDecoration
        size="xl"
        direction="counterclockwise"
        speed="slow"
        className="absolute top-20 -left-20 opacity-[0.05]"
      />
      <GearDecoration
        size="lg"
        direction="clockwise"
        speed="slow"
        className="absolute -bottom-20 -right-16 opacity-[0.05]"
      />

      {submitToast && (
        <div className="fixed top-6 right-6 z-50 animate-float">
          <div className="gothic-panel px-5 py-3 shadow-bronze-glow">
            <p className="font-display text-bronze font-bold text-sm">{submitToast}</p>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl mb-2 text-bronze-gradient">
            设计大师赛
          </h1>
          <p className="text-gothic-muted italic">
            展示你的机关设计才华，赢取传说级奖励
          </p>
          <div className="divider-ornate mt-6">
            <GearDecoration size="sm" direction="clockwise" speed="normal" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ParchementCard
              title={season ? `本赛季 · ${season.name}` : "本赛季信息加载中..."}
              subtitle={season?.theme || ""}
              icon={<Swords size={24} />}
            >
              {isLoading ? (
                <div className="text-center py-8 text-[#6b5a3e]">
                  <Swords size={48} className="mx-auto mb-4 opacity-40 animate-pulse" />
                  <p className="text-lg italic">加载赛季信息...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative overflow-hidden border border-[#8b6e3e]/40 rounded-sm p-4"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(201,162,39,0.1) 0%, rgba(26,20,16,0.6) 100%)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Timer size={18} className="text-rust-light" />
                      <span className="font-display text-sm tracking-wider text-[#5a4a1e]">
                        剩余时间
                      </span>
                    </div>
                    <div className="flex gap-2 text-center">
                      {[
                        { v: timeLeft.days, l: "天" },
                        { v: timeLeft.hours, l: "时" },
                        { v: timeLeft.mins, l: "分" },
                        { v: timeLeft.secs, l: "秒" },
                      ].map((t, i) => (
                        <div key={i} className="flex-1">
                          <div className="font-display font-black text-2xl text-[#2a1f15] bg-metal-gradient rounded-sm py-1 shadow-metal-inset border border-[#8b6e3e]">
                            {pad(t.v)}
                          </div>
                          <div className="text-xs text-[#6b5a3e] mt-1 tracking-wider">
                            {t.l}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative overflow-hidden border border-[#8b6e3e]/40 rounded-sm p-4"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(139,44,44,0.12) 0%, rgba(26,20,16,0.6) 100%)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Crown size={18} className="text-bronze" />
                      <span className="font-display text-sm tracking-wider text-[#5a4a1e]">
                        冠军奖励
                      </span>
                    </div>
                    <StatBadge
                      variant="bronze"
                      icon={<Award size={14} />}
                      label="限定传说级"
                      value="机关图纸"
                      className="w-full mb-2"
                    />
                    {season?.prizes?.[0]?.reward?.coins && (
                      <StatBadge
                        variant="rust"
                        icon={<Coins size={14} />}
                        label="古铜金币"
                        value={season.prizes[0].reward.coins.toLocaleString()}
                        className="w-full"
                      />
                    )}
                  </div>

                  <div className="relative overflow-hidden border border-[#8b6e3e]/40 rounded-sm p-4"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(61,107,79,0.12) 0%, rgba(26,20,16,0.6) 100%)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Trophy size={18} className="text-verdigris-light" />
                      <span className="font-display text-sm tracking-wider text-[#5a4a1e]">
                        赛季进度
                      </span>
                    </div>
                    <StatBadge
                      variant="verdigris"
                      icon={<User size={14} />}
                      label="参赛人数"
                      value={(season?.entriesCount || 0).toLocaleString()}
                      showProgress
                      maxValue={2000}
                      className="w-full mb-2"
                    />
                    <StatBadge
                      variant="default"
                      icon={<Eye size={14} />}
                      label="作品数量"
                      value={entries.length.toLocaleString()}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </ParchementCard>

            <ParchementCard
              title="参赛作品"
              subtitle={`共 ${entries.length} 件作品进入评审阶段`}
              icon={<Award size={24} />}
            >
              {isLoading ? (
                <div className="text-center py-12 text-[#6b5a3e]">
                  <Award size={48} className="mx-auto mb-4 opacity-40 animate-pulse" />
                  <p className="text-lg italic">加载作品列表...</p>
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-12 text-[#6b5a3e]">
                  <Award size={48} className="mx-auto mb-4 opacity-40" />
                  <p className="text-lg italic">暂无参赛作品</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {entries.map((work, idx) => {
                    const totalReviews = 3;
                    const reviewCount = work.scores.length;
                    const progress = (reviewCount / totalReviews) * 100;
                    const isComplete = reviewCount >= totalReviews;
                    return (
                      <div
                        key={work.id}
                        className="relative group border border-[#8b6e3e]/40 overflow-hidden transition-all duration-300 hover:shadow-bronze-glow hover:scale-[1.02]"
                      >
                        <div className="aspect-video relative">
                          <WorkThumb idx={idx} />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1410]/80 to-transparent" />
                          <div className="absolute top-2 right-2">
                            <div className={cn(
                              "px-2 py-0.5 text-xs font-display tracking-wider border",
                              isComplete
                                ? "text-verdigris-light border-verdigris/50 bg-verdigris/20"
                                : "text-bronze border-bronze/50 bg-bronze/10"
                            )}>
                              {reviewCount}/{totalReviews} 评审
                            </div>
                          </div>
                          <div className="absolute bottom-2 left-2 right-2">
                            <h4 className="font-display font-bold text-bronze text-sm truncate drop-shadow-lg">
                              {work.chamberName || "未知密室"}
                            </h4>
                          </div>
                        </div>
                        <div className="p-3 bg-[#ebe0ce]">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5 text-[#5a4a1e]">
                              <User size={14} />
                              <span className="text-sm">
                                {work.authorName || `参赛者 #${work.contestantId.slice(-4)}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star size={14} className="fill-bronze text-bronze" />
                              <span className="font-display font-bold text-[#2a1f15]">
                                {work.avgScore > 0 ? work.avgScore.toFixed(1) : "待评"}
                              </span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-gothic-bg rounded-full overflow-hidden border border-gothic-border">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                isComplete ? "bg-gradient-to-r from-verdigris-dark to-verdigris-light"
                                           : "bg-gradient-to-r from-bronze-dark to-bronze-light"
                              )}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ParchementCard>

            <ParchementCard
              title="我的提交"
              subtitle="选择你的密室作品，提交至本赛季评审"
              icon={<Upload size={24} />}
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <button
                    onClick={() => setDropdownOpen((o) => !o)}
                    className="w-full input-gothic flex items-center justify-between text-left"
                  >
                    <span className={cn(selectedChamber ? "text-gothic-text" : "text-gothic-muted italic")}>
                      {selectedChamber
                        ? userChambers.find((c) => c.id === selectedChamber)?.name
                        : "选择要提交的密室作品..."}
                    </span>
                    <ChevronDown size={18} className={cn("transition-transform text-gothic-muted", dropdownOpen && "rotate-180")} />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-20 border border-gothic-border bg-gothic-surface shadow-lg">
                      {userChambers.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gothic-muted italic">
                          暂无可用的密室作品
                        </div>
                      ) : (
                        userChambers.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setSelectedChamber(c.id);
                              setDropdownOpen(false);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-2.5 font-body text-sm transition-colors",
                              selectedChamber === c.id
                                ? "bg-bronze/10 text-bronze"
                                : "text-gothic-text hover:bg-gothic-bg"
                            )}
                          >
                            {c.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <MetalButton icon={<Upload size={16} />} onClick={handleSubmitWork}>
                  提交作品
                </MetalButton>
              </div>
            </ParchementCard>
          </div>

          <div>
            <ParchementCard
              title="评审面板"
              subtitle="为待评审作品打分并撰写评论"
              icon={<Trophy size={24} />}
            >
              {pendingWorks.length === 0 ? (
                <div className="text-center py-8 text-[#6b5a3e]">
                  <Trophy size={48} className="mx-auto mb-4 opacity-40" />
                  <p className="text-lg italic">暂无待评审作品</p>
                </div>
              ) : currentWork && (
                <div className="space-y-4">
                  <div className="relative aspect-video overflow-hidden border border-[#8b6e3e]/40">
                    <WorkThumb idx={currentWorkIdx} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1410]/85 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h4 className="font-display font-bold text-bronze drop-shadow-lg">
                        {currentWork.chamberName || "未知作品"}
                      </h4>
                      <p className="text-xs text-[#d4c4a8]/80 flex items-center gap-1">
                        <User size={12} /> 参赛者 #{currentWork.contestantId.slice(-4)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-display tracking-wider text-[#5a4a1e] mb-2">
                      你的评分
                    </p>
                    <StarRating value={score} onChange={setScore} interactive size={28} />
                    {score > 0 && (
                      <p className="text-sm text-[#3d2f1a] mt-2 italic">
                        已选择 {Math.round(score / 20)} 星评级 ({score}分)
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-display tracking-wider text-[#5a4a1e] mb-2">
                      文字评论
                    </p>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="分享你对这件作品的看法..."
                      rows={4}
                      className="input-gothic resize-none"
                      style={{ background: "rgba(26,20,16,0.5)", color: "#2a1f15" }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6b5a3e] italic">
                      待评审 {currentWorkIdx + 1} / {pendingWorks.length}
                    </span>
                    <MetalButton icon={<Send size={14} />} size="sm" onClick={handleSubmitReview}>
                      提交评分
                    </MetalButton>
                  </div>

                  <div className="border-t border-[#8b6e3e]/30 pt-3">
                    <p className="text-xs font-display tracking-wider text-[#5a4a1e] mb-2">
                      队列预览
                    </p>
                    <div className="flex gap-2">
                      {pendingWorks.map((w, i) => (
                        <button
                          key={w.id}
                          onClick={() => setCurrentWorkIdx(i)}
                          className={cn(
                            "flex-1 h-14 overflow-hidden border transition-all",
                            currentWorkIdx === i
                              ? "border-bronze shadow-bronze-glow"
                              : "border-[#8b6e3e]/30 opacity-60 hover:opacity-100"
                          )}
                        >
                          <WorkThumb idx={i} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </ParchementCard>
          </div>
        </div>
      </div>
    </div>
  );
}
