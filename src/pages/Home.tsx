import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Users,
  Trophy,
  Flame,
  ChevronLeft,
  ChevronRight,
  Hammer,
  Crown,
  Clock,
  Zap,
  Play,
  UserPlus,
} from "lucide-react";
import { ParchementCard } from "@/components/ParchementCard";
import { MetalButton } from "@/components/MetalButton";
import { GearDecoration } from "@/components/GearDecoration";
import { useGameStore } from "@/store/useGameStore";
import { cn } from "@/lib/utils";
import type { Chamber } from "@/shared/types";

function DifficultyStars({ level }: { level: number }) {
  const normalized = Math.min(5, Math.max(1, Math.ceil(level / 2)));
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={cn(
            i < normalized ? "text-bronze fill-bronze" : "text-parchment-400/40"
          )}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const chambers = useGameStore((s) => s.chambers);
  const user = useGameStore((s) => s.user);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    useGameStore.getState().loadInitialData();
  }, []);

  const hotChambers = chambers.slice(0, 5);

  useEffect(() => {
    if (hotChambers.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % hotChambers.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [hotChambers.length]);

  const goToSlide = (index: number) => {
    if (hotChambers.length === 0) return;
    setCurrentSlide((index + hotChambers.length) % hotChambers.length);
  };

  const handleEnterChamber = (id: string) => {
    navigate(`/chamber/${id}`);
  };

  const getClearRate = (c: Chamber) => {
    if (!c.stats || c.stats.plays === 0) return 0;
    return Math.round((c.stats.clears / c.stats.plays) * 100);
  };

  return (
    <div className="relative min-h-screen bg-gothic-bg overflow-hidden">
      <GearDecoration
        size="xl"
        direction="clockwise"
        speed="slow"
        className="absolute -top-20 -left-20 opacity-[0.05]"
      />
      <GearDecoration
        size="xl"
        direction="counterclockwise"
        speed="slow"
        className="absolute -bottom-32 -right-24 opacity-[0.05]"
      />
      <GearDecoration
        size="lg"
        direction="clockwise"
        speed="slow"
        className="absolute top-1/3 right-8 opacity-[0.04]"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl lg:text-4xl mb-2 text-bronze-gradient">
            发条密室大厅
          </h1>
          <p className="text-gothic-muted italic">
            选择你的命运，踏入齿轮与阴谋编织的迷宫
          </p>
          <div className="divider-ornate mt-6">
            <GearDecoration size="sm" direction="clockwise" speed="normal" />
          </div>
        </div>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Flame className="text-rust" size={24} />
              <h2 className="text-2xl m-0">热门密室</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => goToSlide(currentSlide - 1)}
                className="w-10 h-10 flex items-center justify-center border border-gothic-border text-gothic-text hover:text-bronze hover:border-bronze transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => goToSlide(currentSlide + 1)}
                className="w-10 h-10 flex items-center justify-center border border-gothic-border text-gothic-text hover:text-bronze hover:border-bronze transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {hotChambers.map((chamber, idx) => (
                <div key={chamber.id} className="w-full flex-shrink-0 px-2">
                  <ParchementCard
                    className="cursor-pointer hover:shadow-bronze-glow transition-all duration-300"
                    contentClassName="p-0"
                  >
                    <div
                      className="p-6 flex flex-col lg:flex-row gap-6"
                      onClick={() => handleEnterChamber(chamber.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-2xl mb-1">{chamber.name}</h3>
                            <p className="text-[#6b5a3e] italic text-sm">
                              {chamber.description}
                            </p>
                          </div>
                          <span className="text-xs px-3 py-1 border border-[#8b6e3e]/50 text-[#5a4a1e] font-display tracking-wider">
                            #{idx + 1}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-5">
                          <div>
                            <p className="text-xs text-[#6b5a3e] tracking-wider mb-1">
                              难度等级
                            </p>
                            <DifficultyStars level={chamber.difficulty} />
                          </div>
                          <div>
                            <p className="text-xs text-[#6b5a3e] tracking-wider mb-1">
                              通关率
                            </p>
                            <span className="text-xl font-bold text-[#3d2f1a] font-display">
                              {getClearRate(chamber)}%
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-[#6b5a3e] tracking-wider mb-1">
                              挑战人数
                            </p>
                            <span className="text-xl font-bold text-[#3d2f1a] font-display">
                              {(chamber.stats?.plays || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="lg:w-48 flex flex-col justify-center items-center gap-3 border-t lg:border-t-0 lg:border-l border-[#8b6e3e]/30 pt-4 lg:pt-0 lg:pl-6">
                        <div className="w-20 h-20 rounded-full bg-metal-gradient shadow-metal-inset flex items-center justify-center border-2 border-[#8b6e3e]">
                          <Trophy className="text-gothic-bg" size={36} />
                        </div>
                        <MetalButton
                          icon={<Play size={16} />}
                          fullWidth
                          onClick={() => handleEnterChamber(chamber.id)}
                        >
                          进入挑战
                        </MetalButton>
                      </div>
                    </div>
                  </ParchementCard>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-2 mt-5">
              {hotChambers.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={cn(
                    "h-2 transition-all duration-300",
                    idx === currentSlide
                      ? "w-8 bg-bronze"
                      : "w-2 bg-gothic-border hover:bg-gothic-muted"
                  )}
                />
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <Zap className="text-ice" size={24} />
            <h2 className="text-2xl m-0">精彩活动</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div
              onClick={() => navigate("/contest")}
              className="relative overflow-hidden cursor-pointer group border border-bronze/30"
              style={{
                background:
                  "linear-gradient(135deg, rgba(139,44,44,0.2) 0%, rgba(26,20,16,0.95) 50%, rgba(201,162,39,0.1) 100%)",
              }}
            >
              <GearDecoration
                size="md"
                direction="clockwise"
                speed="slow"
                className="absolute -top-4 -right-4 opacity-[0.1]"
              />
              <div className="relative z-10 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-sm flex items-center justify-center bg-metal-gradient shadow-metal-inset border border-bronze-dark">
                    <Hammer className="text-gothic-bg" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl mb-0 text-bronze">设计大师赛</h3>
                    <p className="text-xs text-gothic-muted">
                      展示你的机关设计才华
                    </p>
                  </div>
                </div>
                <p className="text-gothic-text/80 text-sm mb-4 leading-relaxed">
                  参与季度机关设计大赛，赢取稀有蓝图与限定称号。提交你的原创作品，由大师工匠评审团评选。
                </p>
                <div className="mt-4">
                  <MetalButton size="sm" icon={<Crown size={14} />}>
                    立即参赛
                  </MetalButton>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-rust to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div
              onClick={() => navigate("/ranking")}
              className="relative overflow-hidden cursor-pointer group border border-bronze/30"
              style={{
                background:
                  "linear-gradient(135deg, rgba(74,127,181,0.2) 0%, rgba(26,20,16,0.95) 50%, rgba(201,162,39,0.1) 100%)",
              }}
            >
              <GearDecoration
                size="md"
                direction="counterclockwise"
                speed="slow"
                className="absolute -bottom-4 -left-4 opacity-[0.1]"
              />
              <div className="relative z-10 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-sm flex items-center justify-center bg-metal-gradient shadow-metal-inset border border-bronze-dark">
                    <Trophy className="text-gothic-bg" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl mb-0 text-bronze">荣耀排行榜</h3>
                    <p className="text-xs text-gothic-muted">
                      见证最强工匠的荣耀
                    </p>
                  </div>
                </div>
                <p className="text-gothic-text/80 text-sm mb-4 leading-relaxed">
                  查看全服声望、财富、机关造诣等各项排名。登上榜首，成为发条之城传颂的传奇人物。
                </p>
                <div className="mt-4">
                  <MetalButton size="sm" variant="ghost" icon={<Trophy size={14} />}>
                    查看榜单
                  </MetalButton>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-ice to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
