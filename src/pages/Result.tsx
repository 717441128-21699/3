import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Scroll,
  Trophy,
  Skull,
  Coins,
  Star,
  Zap,
  Award,
  Home,
  RefreshCw,
} from "lucide-react";
import { ParchementCard } from "@/components/ParchementCard";
import { MetalButton } from "@/components/MetalButton";
import { GearDecoration } from "@/components/GearDecoration";

type GameResult = "victory" | "defeat";
type Grade = "S" | "A" | "B" | "C" | "D";

interface RadarData {
  subject: string;
  score: number;
  fullMark: number;
}

export default function Result() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [result] = useState<GameResult>("victory");

  const isVictory = result === "victory";

  const radarData: RadarData[] = [
    { subject: "时间效率", score: isVictory ? 85 : 45, fullMark: 100 },
    { subject: "解谜完成度", score: isVictory ? 92 : 38, fullMark: 100 },
    { subject: "生存能力", score: isVictory ? 78 : 22, fullMark: 100 },
    { subject: "团队协作", score: isVictory ? 88 : 50, fullMark: 100 },
    { subject: "机关触发", score: isVictory ? 95 : 30, fullMark: 100 },
  ];

  const totalScore = radarData.reduce((sum, d) => sum + d.score, 0);
  const avgScore = totalScore / radarData.length;

  const getGrade = (score: number): Grade => {
    if (score >= 90) return "S";
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    return "D";
  };

  const grade = getGrade(avgScore);

  const gradeColors: Record<Grade, string> = {
    S: "#c9a227",
    A: "#5a9a74",
    B: "#4a7fb5",
    C: "#8b6e3e",
    D: "#8b2c2c",
  };

  return (
    <div className="relative min-h-screen bg-gothic-bg overflow-hidden">
      <GearDecoration
        size="xl"
        direction="clockwise"
        speed="slow"
        className="absolute top-20 -right-20 opacity-[0.05]"
      />
      <GearDecoration
        size="lg"
        direction="counterclockwise"
        speed="slow"
        className="absolute bottom-20 -left-16 opacity-[0.05]"
      />
      <div className="relative z-10 max-w-5xl mx-auto px-4 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl mb-2 text-bronze-gradient">
            挑战结算
          </h1>
          <p className="text-gothic-muted italic">
            会话编号：{sessionId || "UNKNOWN-001"}
          </p>
          <div className="divider-ornate mt-6">
            <GearDecoration size="sm" direction="clockwise" speed="normal" />
          </div>
        </div>

        <ParchementCard
          title={isVictory ? "胜 利 凯 歌" : "失 败 录"}
          subtitle={
            isVictory
              ? "机关破除，荣耀加身"
              : "虽败犹荣，重整旗鼓"
          }
          icon={
            isVictory ? (
              <Trophy size={28} style={{ color: "#3d6b4f" }} />
            ) : (
              <Skull size={28} style={{ color: "#8b2c2c" }} />
            )
          }
        >
          <div className="text-center mb-8">
            <div
              className="inline-block font-display text-6xl lg:text-7xl font-black tracking-[0.2em] glow-text mb-4"
              style={{
                color: isVictory ? "#3d6b4f" : "#8b2c2c",
                textShadow: isVictory
                  ? "0 0 20px rgba(61,107,79,0.6), 0 0 40px rgba(61,107,79,0.3)"
                  : "0 0 20px rgba(139,44,44,0.6), 0 0 40px rgba(139,44,44,0.3)",
              }}
            >
              {isVictory ? "VICTORY" : "DEFEAT"}
            </div>
            <p className="text-[#5a4a3e] italic text-lg">
              {isVictory ? "你成功穿越了机关密室！" : "机关重重，下次再来挑战吧..."}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <div className="ornate-border">
              <h4 className="font-display text-lg text-[#3d2f1a] mb-4 text-center tracking-wider">
                ⚙ 五维评估 ⚙
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="75%"
                    data={radarData}
                  >
                    <PolarGrid
                      stroke="#8b6e3e"
                      strokeOpacity={0.4}
                    />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{
                        fill: "#3d2f1a",
                        fontSize: 13,
                        fontFamily: '"Cormorant Garamond", serif',
                        fontWeight: 600,
                      }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{
                        fill: "#6b5a3e",
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickCount={5}
                    />
                    <Radar
                      name="得分"
                      dataKey="score"
                      stroke="#9a7c17"
                      strokeWidth={2}
                      fill="#c9a227"
                      fillOpacity={0.45}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="ornate-border">
              <h4 className="font-display text-lg text-[#3d2f1a] mb-4 text-center tracking-wider">
                ⚔ 评分明细 ⚔
              </h4>

              <div className="text-center mb-6">
                <div
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 font-display text-5xl font-black mb-2"
                  style={{
                    borderColor: gradeColors[grade],
                    color: gradeColors[grade],
                    backgroundColor: "rgba(201,162,39,0.08)",
                    boxShadow: `0 0 20px ${gradeColors[grade]}40, inset 0 0 20px ${gradeColors[grade]}20`,
                  }}
                >
                  {grade}
                </div>
                <p className="text-[#6b5a3e] text-sm italic">
                  综合评级
                </p>
              </div>

              <div className="space-y-3">
                {radarData.map((item) => (
                  <div key={item.subject}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#3d2f1a] font-semibold">
                        {item.subject}
                      </span>
                      <span className="font-display text-[#8b6e3e] font-bold">
                        {item.score}/100
                      </span>
                    </div>
                    <div className="h-2 bg-[#d9c7a8] rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm transition-all duration-700"
                        style={{
                          width: `${item.score}%`,
                          background:
                            "linear-gradient(90deg, #9a7c17 0%, #c9a227 50%, #e5c158 100%)",
                        }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-3 mt-3 border-t border-[#8b6e3e]/40">
                  <div className="flex justify-between items-center">
                    <span className="font-display text-[#3d2f1a] font-bold text-lg tracking-wider">
                      总得分
                    </span>
                    <span
                      className="font-display text-3xl font-black"
                      style={{ color: "#c9a227" }}
                    >
                      {totalScore}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="ornate-border mb-8">
            <h4 className="font-display text-lg text-[#3d2f1a] mb-4 text-center tracking-wider">
              {isVictory ? "🎁 奖励发放 🎁" : "💀 惩罚结算 💀"}
            </h4>

            {isVictory ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-[#ebe0ce]/60 border border-[#8b6e3e]/30">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: "rgba(61,107,79,0.15)",
                        border: "1px solid #3d6b4f",
                      }}
                    >
                      <Star size={24} style={{ color: "#3d6b4f" }} />
                    </div>
                    <div>
                      <p className="text-sm text-[#6b5a3e]">经验值</p>
                      <p className="font-display text-xl font-bold text-[#3d6b4f]">
                        +500 EXP
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#ebe0ce]/60 border border-[#8b6e3e]/30">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: "rgba(201,162,39,0.15)",
                        border: "1px solid #c9a227",
                      }}
                    >
                      <Coins size={24} style={{ color: "#c9a227" }} />
                    </div>
                    <div>
                      <p className="text-sm text-[#6b5a3e]">金币</p>
                      <p className="font-display text-xl font-bold text-[#9a7c17]">
                        +1,200 G
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#ebe0ce]/60 border-2 border-[#c9a227]/50 relative overflow-hidden">
                  <div
                    className="absolute top-0 right-0 px-3 py-1 text-xs font-display font-bold text-white tracking-wider"
                    style={{ backgroundColor: "#9a7c17" }}
                  >
                    EPIC
                  </div>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, #e5c158 0%, #9a7c17 100%)",
                        boxShadow: "0 0 20px rgba(201,162,39,0.4)",
                      }}
                    >
                      <Award size={32} style={{ color: "#1a1410" }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-display text-lg font-bold text-[#9a7c17] tracking-wider">
                        史诗级激光蓝图
                      </p>
                      <p className="text-sm text-[#6b5a3e] italic">
                        传说级工匠留下的珍贵设计图
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#6b5a3e]">数量</p>
                      <p className="font-display text-2xl font-bold text-[#3d2f1a]">
                        ×1
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-[#ebe0ce]/60 border border-[#8b2c2c]/30">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: "rgba(139,44,44,0.15)",
                      border: "1px solid #8b2c2c",
                    }}
                  >
                    <Zap size={24} style={{ color: "#8b2c2c" }} />
                  </div>
                  <div>
                    <p className="text-sm text-[#6b5a3e]">体力</p>
                    <p className="font-display text-xl font-bold text-[#8b2c2c]">
                      -20
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#ebe0ce]/60 border border-[#8b2c2c]/30">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: "rgba(139,44,44,0.15)",
                      border: "1px solid #8b2c2c",
                    }}
                  >
                    <Award size={24} style={{ color: "#8b2c2c" }} />
                  </div>
                  <div>
                    <p className="text-sm text-[#6b5a3e]">声望</p>
                    <p className="font-display text-xl font-bold text-[#8b2c2c]">
                      -15
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <MetalButton
              variant="ghost"
              size="lg"
              icon={<Home size={20} />}
              onClick={() => navigate("/")}
            >
              返回大厅
            </MetalButton>
            <MetalButton
              variant="primary"
              size="lg"
              icon={<RefreshCw size={20} />}
              onClick={() => navigate("/chamber")}
            >
              再次挑战
            </MetalButton>
          </div>
        </ParchementCard>
      </div>
    </div>
  );
}
