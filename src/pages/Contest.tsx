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
import { cn } from "@/lib/utils";

interface ContestWork {
  id: string;
  title: string;
  author: string;
  avgScore: number;
  reviewCount: number;
  totalReviews: number;
  thumbColors: string[];
}

interface PendingWork {
  id: string;
  title: string;
  author: string;
  thumbColors: string[];
}

const contestWorks: ContestWork[] = [
  {
    id: "w1",
    title: "永动机关塔",
    author: "发条之王",
    avgScore: 4.8,
    reviewCount: 3,
    totalReviews: 3,
    thumbColors: ["#c9a227", "#8b6e3e", "#6a1f1f", "#3d6b4f"],
  },
  {
    id: "w2",
    title: "蒸汽迷宫核心",
    author: "蒸汽法师",
    avgScore: 4.6,
    reviewCount: 2,
    totalReviews: 3,
    thumbColors: ["#8b2c2c", "#c9a227", "#4a7fb5", "#2a1f15"],
  },
  {
    id: "w3",
    title: "黄铜时计阵",
    author: "时钟大师",
    avgScore: 4.5,
    reviewCount: 3,
    totalReviews: 3,
    thumbColors: ["#e5c158", "#9a7c17", "#3a2e24", "#6a1f1f"],
  },
  {
    id: "w4",
    title: "齿轮交响殿",
    author: "齿轮幽灵",
    avgScore: 4.3,
    reviewCount: 1,
    totalReviews: 3,
    thumbColors: ["#3d6b4f", "#c9a227", "#8b6e3e", "#1a1410"],
  },
  {
    id: "w5",
    title: "暗夜机关室",
    author: "暗夜工匠",
    avgScore: 4.7,
    reviewCount: 2,
    totalReviews: 3,
    thumbColors: ["#1a1410", "#6a1f1f", "#c9a227", "#4a7fb5"],
  },
  {
    id: "w6",
    title: "迷雾蒸汽园",
    author: "迷雾行者",
    avgScore: 4.4,
    reviewCount: 3,
    totalReviews: 3,
    thumbColors: ["#4a7fb5", "#5a9a74", "#c9a227", "#8b6e3e"],
  },
];

const pendingWorks: PendingWork[] = [
  {
    id: "p1",
    title: "蒸汽心脏塔",
    author: "黄铜匠人",
    thumbColors: ["#c9a227", "#8b2c2c", "#1a1410", "#3d6b4f"],
  },
  {
    id: "p2",
    title: "铜锈迷宫",
    author: "铜锈猎手",
    thumbColors: ["#3d6b4f", "#9a7c17", "#8b2c2c", "#2a1f15"],
  },
  {
    id: "p3",
    title: "星象机关阵",
    author: "机关学者",
    thumbColors: ["#4a7fb5", "#c9a227", "#1a1410", "#8b6e3e"],
  },
];

const myChambers = [
  { id: "c1", name: "我的工坊·初试" },
  { id: "c2", name: "齿轮花园·进阶" },
  { id: "c3", name: "蒸汽穹顶·大师" },
];

function WorkThumb({ colors }: { colors: string[] }) {
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

  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const active = i < displayValue;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && setHover(i + 1)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && onChange?.(i + 1)}
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
  const [timeLeft, setTimeLeft] = useState({ days: 7, hours: 12, mins: 34, secs: 56 });
  const [selectedChamber, setSelectedChamber] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentWorkIdx, setCurrentWorkIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [submitToast, setSubmitToast] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, mins, secs } = prev;
        secs--;
        if (secs < 0) {
          secs = 59;
          mins--;
        }
        if (mins < 0) {
          mins = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
          days--;
        }
        if (days < 0) return { days: 0, hours: 0, mins: 0, secs: 0 };
        return { days, hours, mins, secs };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentWork = pendingWorks[currentWorkIdx];
  const pad = (n: number) => String(n).padStart(2, "0");

  const showToast = (msg: string) => {
    setSubmitToast(msg);
    setTimeout(() => setSubmitToast(null), 3000);
  };

  const handleSubmitWork = () => {
    if (!selectedChamber) {
      showToast("请先选择要提交的密室作品");
      return;
    }
    showToast("作品已成功提交至评审池");
    setSelectedChamber("");
  };

  const handleSubmitReview = () => {
    if (score === 0) {
      showToast("请先给出星级评分");
      return;
    }
    showToast(`评分已提交：${score}星`);
    setScore(0);
    setComment("");
    setCurrentWorkIdx((prev) => (prev + 1) % pendingWorks.length);
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
              title="本赛季 · 蒸汽朋克秘境"
              subtitle="主题：打造充满维多利亚时代工业美学的机关密室"
              icon={<Swords size={24} />}
            >
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
                  <StatBadge
                    variant="rust"
                    icon={<Coins size={14} />}
                    label="古铜金币"
                    value="10,000"
                    className="w-full"
                  />
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
                    value="1,284"
                    showProgress
                    maxValue={2000}
                    className="w-full mb-2"
                  />
                  <StatBadge
                    variant="default"
                    icon={<Eye size={14} />}
                    label="作品数量"
                    value="847"
                    className="w-full"
                  />
                </div>
              </div>
            </ParchementCard>

            <ParchementCard
              title="参赛作品"
              subtitle={`共 ${contestWorks.length} 件作品进入评审阶段`}
              icon={<Award size={24} />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {contestWorks.map((work) => {
                  const progress = (work.reviewCount / work.totalReviews) * 100;
                  const isComplete = work.reviewCount >= work.totalReviews;
                  return (
                    <div
                      key={work.id}
                      className="relative group border border-[#8b6e3e]/40 overflow-hidden transition-all duration-300 hover:shadow-bronze-glow hover:scale-[1.02]"
                    >
                      <div className="aspect-video relative">
                        <WorkThumb colors={work.thumbColors} />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1410]/80 to-transparent" />
                        <div className="absolute top-2 right-2">
                          <div className={cn(
                            "px-2 py-0.5 text-xs font-display tracking-wider border",
                            isComplete
                              ? "text-verdigris-light border-verdigris/50 bg-verdigris/20"
                              : "text-bronze border-bronze/50 bg-bronze/10"
                          )}>
                            {work.reviewCount}/{work.totalReviews} 评审
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <h4 className="font-display font-bold text-bronze text-sm truncate drop-shadow-lg">
                            {work.title}
                          </h4>
                        </div>
                      </div>
                      <div className="p-3 bg-[#ebe0ce]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-[#5a4a1e]">
                            <User size={14} />
                            <span className="text-sm">{work.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star size={14} className="fill-bronze text-bronze" />
                            <span className="font-display font-bold text-[#2a1f15]">
                              {work.avgScore.toFixed(1)}
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
                        ? myChambers.find((c) => c.id === selectedChamber)?.name
                        : "选择要提交的密室作品..."}
                    </span>
                    <ChevronDown size={18} className={cn("transition-transform text-gothic-muted", dropdownOpen && "rotate-180")} />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-20 border border-gothic-border bg-gothic-surface shadow-lg">
                      {myChambers.map((c) => (
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
                      ))}
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
              {currentWork && (
                <div className="space-y-4">
                  <div className="relative aspect-video overflow-hidden border border-[#8b6e3e]/40">
                    <WorkThumb colors={currentWork.thumbColors} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1410]/85 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h4 className="font-display font-bold text-bronze drop-shadow-lg">
                        {currentWork.title}
                      </h4>
                      <p className="text-xs text-[#d4c4a8]/80 flex items-center gap-1">
                        <User size={12} /> {currentWork.author}
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
                        已选择 {score} 星评级
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
                          <WorkThumb colors={w.thumbColors} />
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
