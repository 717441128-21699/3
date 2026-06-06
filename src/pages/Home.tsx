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
import { cn } from "@/lib/utils";

interface HotChamber {
  id: string;
  name: string;
  difficulty: number;
  clearRate: number;
  challengers: number;
  theme: string;
  description: string;
}

interface TeamRoom {
  id: string;
  name: string;
  currentPlayers: number;
  maxPlayers: number;
  chamberName: string;
  host: string;
}

const hotChambers: HotChamber[] = [
  {
    id: "chamber-001",
    name: "蒸汽工坊",
    difficulty: 3,
    clearRate: 68,
    challengers: 12847,
    theme: "workshop",
    description: "齿轮与铜管交织的机械迷宫，考验你的逻辑思维。",
  },
  {
    id: "chamber-002",
    name: "星象观测台",
    difficulty: 4,
    clearRate: 42,
    challengers: 8562,
    theme: "observatory",
    description: "解开星辰的秘密，在穹顶之下追寻古老的星图。",
  },
  {
    id: "chamber-003",
    name: "禁忌图书馆",
    difficulty: 5,
    clearRate: 23,
    challengers: 5231,
    theme: "library",
    description: "尘封的典籍中隐藏着被遗忘的知识，敢来挑战吗？",
  },
  {
    id: "chamber-004",
    name: "熔岩熔炉",
    difficulty: 4,
    clearRate: 35,
    challengers: 7894,
    theme: "forge",
    description: "灼热的金属与炽热的火焰，只有强者才能通过。",
  },
  {
    id: "chamber-005",
    name: "机械花园",
    difficulty: 2,
    clearRate: 82,
    challengers: 15673,
    theme: "garden",
    description: "铜枝铁叶构成的奇异花园，适合新手冒险者。",
  },
];

const teamRooms: TeamRoom[] = [
  {
    id: "room-001",
    name: "老手带飞队",
    currentPlayers: 3,
    maxPlayers: 4,
    chamberName: "蒸汽工坊",
    host: "发条之王",
  },
  {
    id: "room-002",
    name: "萌新探险团",
    currentPlayers: 2,
    maxPlayers: 5,
    chamberName: "机械花园",
    host: "黄铜匠人",
  },
  {
    id: "room-003",
    name: "速通挑战组",
    currentPlayers: 4,
    maxPlayers: 4,
    chamberName: "星象观测台",
    host: "蒸汽法师",
  },
];

function DifficultyStars({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={cn(
            i < level ? "text-bronze fill-bronze" : "text-parchment-400/40"
          )}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % hotChambers.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide((index + hotChambers.length) % hotChambers.length);
  };

  const handleEnterChamber = (id: string) => {
    navigate(`/chamber/${id}`);
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
                              {chamber.clearRate}%
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-[#6b5a3e] tracking-wider mb-1">
                              挑战人数
                            </p>
                            <span className="text-xl font-bold text-[#3d2f1a] font-display">
                              {chamber.challengers.toLocaleString()}
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

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Users className="text-verdigris" size={24} />
            <h2 className="text-2xl m-0">快速组队</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {teamRooms.map((room) => {
              const seatsLeft = room.maxPlayers - room.currentPlayers;
              const isFull = seatsLeft <= 0;
              return (
                <ParchementCard key={room.id} className="h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg mb-0.5">{room.name}</h3>
                      <p className="text-xs text-[#6b5a3e] italic">
                        房主：{room.host}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "text-xs px-2 py-1 font-display tracking-wider border",
                        isFull
                          ? "text-rust border-rust/40 bg-rust/10"
                          : "text-verdigris border-verdigris/40 bg-verdigris/10"
                      )}
                    >
                      {isFull ? "已满" : `${seatsLeft} 空位`}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#6b5a3e] flex items-center gap-1.5">
                        <Crown size={14} />
                        目标密室
                      </span>
                      <span className="text-[#3d2f1a] font-semibold">
                        {room.chamberName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#6b5a3e] flex items-center gap-1.5">
                        <Users size={14} />
                        队伍人数
                      </span>
                      <span className="text-[#3d2f1a] font-semibold">
                        {room.currentPlayers} / {room.maxPlayers}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1.5 mb-4">
                    {Array.from({ length: room.maxPlayers }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex-1 h-2",
                          i < room.currentPlayers
                            ? "bg-metal-gradient"
                            : "bg-[#8b6e3e]/20"
                        )}
                      />
                    ))}
                  </div>

                  <MetalButton
                    icon={<UserPlus size={14} />}
                    size="sm"
                    fullWidth
                    disabled={isFull}
                  >
                    {isFull ? "队伍已满" : "一键加入"}
                  </MetalButton>
                </ParchementCard>
              );
            })}
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
                <div className="flex items-center gap-4 text-xs text-gothic-muted">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    剩余 7 天
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    1,284 人已参赛
                  </span>
                </div>
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
                <div className="flex items-center gap-4 text-xs text-gothic-muted">
                  <span className="flex items-center gap-1">
                    <Star size={12} />
                    本周更新
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    共 12,847 人上榜
                  </span>
                </div>
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
