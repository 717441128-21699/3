import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Clock,
  Zap,
  Skull,
  LifeBuoy,
  Package,
  Hand,
  User,
  Heart,
  MapPin,
  AlertTriangle,
  Gift,
  Mountain,
  Crosshair,
  HelpCircle,
  DoorOpen,
  Crown,
  Shield,
  Flame,
} from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { StatBadge } from "@/components/StatBadge";
import { MetalButton } from "@/components/MetalButton";
import { GearDecoration } from "@/components/GearDecoration";
import { cn } from "@/lib/utils";

const GRID_COLS = 16;
const GRID_ROWS = 12;
const INITIAL_TIME = 600;

type MechanismType = "laser" | "trap" | "puzzle" | "door" | "chest";
type EventType = "mechanism_out_of_control" | "chamber_collapse" | "reward" | null;

interface Mechanism {
  id: string;
  type: MechanismType;
  x: number;
  y: number;
  active: boolean;
}

interface Player {
  id: string;
  name: string;
  displayName: string;
  color: string;
  glowColor: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  injuries: number;
  alive: boolean;
  isMe: boolean;
}

interface GameEvent {
  type: EventType;
  title: string;
  message: string;
  endTime: number;
}

const MECHANISM_CONFIG: Record<
  MechanismType,
  { icon: React.ElementType; color: string; label: string }
> = {
  laser: { icon: Crosshair, color: "#b84444", label: "激光" },
  trap: { icon: Flame, color: "#c9a227", label: "陷阱" },
  puzzle: { icon: HelpCircle, color: "#6fa5d9", label: "谜题" },
  door: { icon: DoorOpen, color: "#8b6e3e", label: "门" },
  chest: { icon: Crown, color: "#e5c158", label: "宝箱" },
};

const generateInitialMechanisms = (): Mechanism[] => {
  const mechanisms: Mechanism[] = [];
  const types: MechanismType[] = ["laser", "trap", "puzzle", "door", "chest"];
  const positions = new Set<string>();

  const occupiedPositions = [
    "2-2", "13-2", "8-6",
  ];
  occupiedPositions.forEach((p) => positions.add(p));

  for (let i = 0; i < 14; i++) {
    let x: number, y: number;
    do {
      x = Math.floor(Math.random() * GRID_COLS);
      y = Math.floor(Math.random() * GRID_ROWS);
    } while (positions.has(`${x}-${y}`));
    positions.add(`${x}-${y}`);
    mechanisms.push({
      id: `mech-${i}`,
      type: types[i % 5],
      x,
      y,
      active: true,
    });
  }
  return mechanisms;
};

const INITIAL_PLAYERS: Player[] = [
  {
    id: "me",
    name: "me",
    displayName: "你",
    color: "#c9a227",
    glowColor: "rgba(201, 162, 39, 0.6)",
    x: 2,
    y: 2,
    hp: 100,
    maxHp: 100,
    injuries: 0,
    alive: true,
    isMe: true,
  },
  {
    id: "erin",
    name: "erin",
    displayName: "艾琳",
    color: "#6fa5d9",
    glowColor: "rgba(111, 165, 217, 0.6)",
    x: 13,
    y: 2,
    hp: 85,
    maxHp: 100,
    injuries: 1,
    alive: true,
    isMe: false,
  },
  {
    id: "marcus",
    name: "marcus",
    displayName: "马库斯",
    color: "#5a9a74",
    glowColor: "rgba(90, 154, 116, 0.6)",
    x: 8,
    y: 6,
    hp: 70,
    maxHp: 100,
    injuries: 2,
    alive: true,
    isMe: false,
  },
];

const getHpColor = (hp: number, maxHp: number): string => {
  const ratio = hp / maxHp;
  if (ratio > 0.6) return "linear-gradient(90deg, #2a4a37, #5a9a74)";
  if (ratio > 0.3) return "linear-gradient(90deg, #8b6e3e, #c9a227)";
  return "linear-gradient(90deg, #6a1f1f, #b84444)";
};

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export default function Chamber() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { startGameSession, endGameSession } = useGameStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [progress, setProgress] = useState(0);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [mechanisms, setMechanisms] = useState<Mechanism[]>(() =>
    generateInitialMechanisms()
  );
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [collapsedCells, setCollapsedCells] = useState<Set<string>>(new Set());
  const [isShaking, setIsShaking] = useState(false);
  const [eventFlash, setEventFlash] = useState<"red" | "green" | null>(null);

  useEffect(() => {
    startGameSession();
    containerRef.current?.focus();
  }, [startGameSession]);

  useEffect(() => {
    if (timeLeft <= 0) {
      endGameSession();
      navigate("/result/s1");
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, endGameSession, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + 1));
    }, 5000 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const triggerEvent = () => {
      const rand = Math.random();
      const duration = 15000 + Math.random() * 15000;
      const endTime = Date.now() + duration;

      if (rand < 0.4) {
        setCurrentEvent({
          type: "mechanism_out_of_control",
          title: "机关失控",
          message: "危险！部分机关出现异常，请注意躲避红色激光！",
          endTime,
        });
        setEventFlash("red");
        setTimeout(() => setEventFlash(null), 800);
        setTimeout(() => {
          setPlayers((prev) =>
            prev.map((p) => {
              if (!p.isMe || !p.alive) return p;
              const newInjuries = p.injuries + 1;
              const newHp = Math.max(0, p.hp - 15);
              return {
                ...p,
                hp: newHp,
                injuries: newInjuries,
                alive: newHp > 0,
              };
            })
          );
        }, 3000);
      } else if (rand < 0.75) {
        setCurrentEvent({
          type: "chamber_collapse",
          title: "密室崩塌",
          message: "墙体正在崩塌！部分区域已被封锁，请寻找安全路径。",
          endTime,
        });
        setIsShaking(true);
        setEventFlash("red");
        setTimeout(() => setEventFlash(null), 800);
        setTimeout(() => setIsShaking(false), 2000);
        const newCollapsed = new Set<string>();
        for (let i = 0; i < 8; i++) {
          const cx = Math.floor(Math.random() * GRID_COLS);
          const cy = Math.floor(Math.random() * GRID_ROWS);
          newCollapsed.add(`${cx}-${cy}`);
        }
        setCollapsedCells(newCollapsed);
      } else {
        setCurrentEvent({
          type: "reward",
          title: "奖励事件",
          message: "发现神秘补给！全体队员生命值恢复。",
          endTime,
        });
        setEventFlash("green");
        setTimeout(() => setEventFlash(null), 800);
        setPlayers((prev) =>
          prev.map((p) => ({
            ...p,
            hp: Math.min(p.maxHp, p.hp + 25),
          }))
        );
      }

      setTimeout(() => {
        setCurrentEvent(null);
        setCollapsedCells(new Set());
      }, duration);
    };

    const interval = setInterval(triggerEvent, 30000);
    const firstTimeout = setTimeout(triggerEvent, 10000);
    return () => {
      clearInterval(interval);
      clearTimeout(firstTimeout);
    };
  }, []);

  const movePlayer = useCallback(
    (dx: number, dy: number) => {
      setPlayers((prev) =>
        prev.map((p) => {
          if (!p.isMe || !p.alive) return p;
          const newX = Math.max(0, Math.min(GRID_COLS - 1, p.x + dx));
          const newY = Math.max(0, Math.min(GRID_ROWS - 1, p.y + dy));
          if (collapsedCells.has(`${newX}-${newY}`)) return p;
          const mech = mechanisms.find(
            (m) => m.x === newX && m.y === newY && m.active
          );
          let newHp = p.hp;
          let newInjuries = p.injuries;
          if (mech && (mech.type === "laser" || mech.type === "trap")) {
            newHp = Math.max(0, p.hp - 10);
            newInjuries = p.injuries + 1;
            if (mech.type === "trap") {
              setMechanisms((ms) =>
                ms.map((m) => (m.id === mech.id ? { ...m, active: false } : m))
              );
            }
          }
          return {
            ...p,
            x: newX,
            y: newY,
            hp: newHp,
            injuries: newInjuries,
            alive: newHp > 0,
          };
        })
      );
    },
    [collapsedCells, mechanisms]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
          e.preventDefault();
          movePlayer(0, -1);
          break;
        case "s":
        case "arrowdown":
          e.preventDefault();
          movePlayer(0, 1);
          break;
        case "a":
        case "arrowleft":
          e.preventDefault();
          movePlayer(-1, 0);
          break;
        case "d":
        case "arrowright":
          e.preventDefault();
          movePlayer(1, 0);
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movePlayer]);

  const handleInteract = () => {
    const me = players.find((p) => p.isMe);
    if (!me) return;
    const mech = mechanisms.find(
      (m) => m.x === me.x && m.y === me.y && m.active
    );
    if (mech) {
      if (mech.type === "chest" || mech.type === "puzzle" || mech.type === "door") {
        setMechanisms((prev) =>
          prev.map((m) => (m.id === mech.id ? { ...m, active: false } : m))
        );
        setProgress((p) => Math.min(100, p + 5));
      }
    }
  };

  const handleSOS = () => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.isMe ? { ...p, hp: Math.min(p.maxHp, p.hp + 20) } : p
      )
    );
  };

  const handleItem = () => {
    setProgress((p) => Math.min(100, p + 3));
  };

  const handleEnd = () => {
    endGameSession();
    navigate("/result/s1");
  };

  const me = players.find((p) => p.isMe);
  const isLowTime = timeLeft < 30;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className={cn(
        "relative min-h-screen bg-gothic-bg overflow-hidden outline-none",
        isShaking && "animate-[shake_0.5s_ease-in-out_infinite]"
      )}
      style={{
        animation: isShaking
          ? "shake 0.3s ease-in-out infinite"
          : undefined,
      }}
    >
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes fog {
          0%, 100% { opacity: 0.15; transform: translateX(0) translateY(0); }
          50% { opacity: 0.3; transform: translateX(10px) translateY(-5px); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .player-pulse {
          animation: pulse-ring 1.5s ease-out infinite;
        }
        .fog-overlay {
          animation: fog 8s ease-in-out infinite;
        }
        .time-urgent {
          animation: blink 0.8s ease-in-out infinite;
        }
      `}</style>

      {eventFlash && (
        <div
          className={cn(
            "fixed inset-0 z-50 pointer-events-none",
            eventFlash === "red" && "bg-rust/30",
            eventFlash === "green" && "bg-verdigris/30"
          )}
        />
      )}

      <GearDecoration
        size="xl"
        direction="counterclockwise"
        speed="slow"
        className="absolute -top-24 -right-20 opacity-[0.04]"
      />
      <GearDecoration
        size="xl"
        direction="clockwise"
        speed="slow"
        className="absolute -bottom-24 -left-20 opacity-[0.04]"
      />

      <div className="relative z-10 h-screen flex flex-col p-3 lg:p-4">
        <div className="gothic-card rivets p-3 lg:p-4 mb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-xl lg:text-2xl text-bronze-gradient mb-0.5">
                  密室挑战
                </h2>
                <p className="text-xs text-gothic-muted italic">
                  编号：{id}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
              <StatBadge
                icon={<Clock size={16} />}
                label="剩余时间"
                value={formatTime(timeLeft)}
                variant={isLowTime ? "rust" : "bronze"}
                className={cn(isLowTime && "time-urgent")}
              />

              <div className="stat-badge stat-badge-verdigris min-w-[180px]">
                <Zap size={16} />
                <div className="flex flex-col leading-tight flex-1">
                  <span className="text-[10px] opacity-70 tracking-wider">
                    解密进度
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gothic-bg rounded-full overflow-hidden border border-gothic-border">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${progress}%`,
                          background:
                            "linear-gradient(90deg, #2a4a37, #3d6b4f, #5a9a74)",
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold">{progress}%</span>
                  </div>
                </div>
              </div>

              <StatBadge
                icon={<AlertTriangle size={16} />}
                label="受伤次数"
                value={me?.injuries ?? 0}
                variant="rust"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 flex gap-3 min-h-0">
          <div className="flex-1 gothic-card rivets p-3 relative overflow-hidden flex flex-col">
            <div className="relative flex-1 flex items-center justify-center">
              <div
                className="relative fog-overlay absolute inset-0 pointer-events-none z-10"
                style={{
                  background:
                    "radial-gradient(ellipse at 30% 40%, rgba(26,20,16,0) 0%, rgba(26,20,16,0.7) 100%), radial-gradient(ellipse at 70% 60%, rgba(26,20,16,0) 0%, rgba(26,20,16,0.6) 100%)",
                }}
              />

              {currentEvent && (
                <div
                  className={cn(
                    "absolute top-2 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded border text-sm font-display tracking-wider",
                    currentEvent.type === "reward"
                      ? "bg-verdigris-dark/90 border-verdigris text-verdigris-light"
                      : "bg-rust-dark/90 border-rust text-rust-light"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {currentEvent.type === "reward" ? (
                      <Gift size={16} />
                    ) : currentEvent.type === "chamber_collapse" ? (
                      <Mountain size={16} />
                    ) : (
                      <AlertTriangle size={16} />
                    )}
                    <span className="font-bold">{currentEvent.title}</span>
                  </div>
                  <p className="text-xs opacity-90 mt-0.5">
                    {currentEvent.message}
                  </p>
                </div>
              )}

              <div
                className="grid gap-[2px] p-2 relative"
                style={{
                  gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                  gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
                }}
              >
                {Array.from({ length: GRID_ROWS }).map((_, y) =>
                  Array.from({ length: GRID_COLS }).map((_, x) => {
                    const isCollapsed = collapsedCells.has(`${x}-${y}`);
                    const mechanism = mechanisms.find(
                      (m) => m.x === x && m.y === y && m.active
                    );
                    const playersHere = players.filter(
                      (p) => p.x === x && p.y === y && p.alive
                    );
                    const MechIcon = mechanism
                      ? MECHANISM_CONFIG[mechanism.type].icon
                      : null;

                    return (
                      <div
                        key={`${x}-${y}`}
                        className={cn(
                          "relative w-7 h-7 lg:w-9 lg:h-9 flex items-center justify-center transition-colors duration-300",
                          "bg-gothic-surface/60 border border-gothic-border/40",
                          (x + y) % 2 === 0 && "bg-gothic-surface/40",
                          isCollapsed &&
                            "bg-gothic-muted/80 border-rust/50 animate-pulse"
                        )}
                      >
                        {mechanism && MechIcon && (
                          <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{
                              color: MECHANISM_CONFIG[mechanism.type].color,
                              filter: `drop-shadow(0 0 4px ${MECHANISM_CONFIG[mechanism.type].color})`,
                            }}
                          >
                            <MechIcon
                              size={18}
                              strokeWidth={2}
                              className={cn(
                                mechanism.type === "laser" && "animate-pulse"
                              )}
                            />
                          </div>
                        )}

                        {playersHere.map((player, idx) => (
                          <div
                            key={player.id}
                            className="absolute inset-0 flex items-center justify-center z-[5]"
                            style={{
                              transform: `translate(${idx * 2}px, ${
                                idx * 2
                              }px)`,
                            }}
                          >
                            <div className="relative">
                              <div
                                className="player-pulse absolute inset-0 rounded-full"
                                style={{
                                  backgroundColor: player.glowColor,
                                }}
                              />
                              <div
                                className={cn(
                                  "relative w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold z-10 animate-pulse-glow border-2"
                                )}
                                style={{
                                  backgroundColor: player.color,
                                  borderColor: player.color,
                                  boxShadow: `0 0 10px ${player.glowColor}, 0 0 20px ${player.glowColor}`,
                                }}
                              >
                                {player.isMe ? (
                                  <User size={12} />
                                ) : (
                                  player.displayName[0]
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex justify-center gap-1.5 mt-2 text-[10px] text-gothic-muted">
              {(["laser", "trap", "puzzle", "door", "chest"] as MechanismType[]).map(
                (type) => {
                  const cfg = MECHANISM_CONFIG[type];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={type}
                      className="flex items-center gap-1 px-2 py-1 bg-gothic-surface/50 rounded border border-gothic-border/30"
                    >
                      <Icon size={12} style={{ color: cfg.color }} />
                      <span>{cfg.label}</span>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          <div className="w-56 lg:w-64 flex flex-col gap-3">
            <div className="gothic-card rivets p-3 flex-1 overflow-auto">
              <h3 className="text-sm font-display text-bronze-gradient mb-3 flex items-center gap-2 tracking-wider">
                <Shield size={14} /> 队伍状态
              </h3>
              <div className="space-y-3">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className={cn(
                      "p-2.5 rounded border transition-all",
                      player.isMe
                        ? "border-bronze/50 bg-bronze/5"
                        : "border-gothic-border/50 bg-gothic-surface/30",
                      !player.alive && "opacity-50 grayscale"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="relative w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold border-2"
                        style={{
                          backgroundColor: player.color,
                          borderColor: player.color,
                          boxShadow: `0 0 8px ${player.glowColor}`,
                        }}
                      >
                        {player.isMe ? (
                          <User size={16} />
                        ) : (
                          player.displayName[0]
                        )}
                        {!player.alive && (
                          <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center">
                            <Skull size={14} className="text-rust-light" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className="text-sm font-bold truncate"
                            style={{ color: player.color }}
                          >
                            {player.displayName}
                            {player.isMe && (
                              <span className="text-[9px] ml-1 opacity-70">
                                (我)
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin size={10} className="text-gothic-muted" />
                          <span className="text-[10px] text-gothic-muted">
                            ({player.x}, {player.y})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-1.5">
                      <div className="flex items-center justify-between text-[10px] mb-0.5">
                        <span className="flex items-center gap-1 text-gothic-muted">
                          <Heart size={10} /> HP
                        </span>
                        <span className="font-bold">
                          {player.hp}/{player.maxHp}
                        </span>
                      </div>
                      <div className="h-2 bg-gothic-bg rounded-full overflow-hidden border border-gothic-border">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(player.hp / player.maxHp) * 100}%`,
                            background: getHpColor(player.hp, player.maxHp),
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[10px]">
                        <AlertTriangle
                          size={10}
                          className={
                            player.injuries > 0
                              ? "text-rust-light"
                              : "text-gothic-muted"
                          }
                        />
                        <span
                          className={
                            player.injuries > 0
                              ? "text-rust-light"
                              : "text-gothic-muted"
                          }
                        >
                          受伤 {player.injuries}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded",
                          player.alive
                            ? "text-verdigris-light bg-verdigris-dark/50"
                            : "text-rust-light bg-rust-dark/50"
                        )}
                      >
                        {player.alive ? "存活" : "阵亡"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[10px] text-gothic-muted text-center px-2 italic">
              使用 WASD 或方向键移动角色
            </div>
          </div>
        </div>

        <div className="gothic-card rivets p-3 mt-3">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <MetalButton
              variant="primary"
              size="md"
              icon={<Hand size={18} />}
              onClick={handleInteract}
            >
              互动
            </MetalButton>
            <MetalButton
              variant="ghost"
              size="md"
              icon={<LifeBuoy size={18} />}
              onClick={handleSOS}
            >
              求救
            </MetalButton>
            <MetalButton
              variant="ghost"
              size="md"
              icon={<Package size={18} />}
              onClick={handleItem}
            >
              道具
            </MetalButton>
            <MetalButton
              variant="danger"
              size="md"
              icon={<Skull size={18} />}
              onClick={handleEnd}
            >
              结束
            </MetalButton>
          </div>
        </div>
      </div>
    </div>
  );
}
