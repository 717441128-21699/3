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
  Radar,
} from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { StatBadge } from "@/components/StatBadge";
import { MetalButton } from "@/components/MetalButton";
import { GearDecoration } from "@/components/GearDecoration";
import { chambersApi, sessionsApi } from "@/utils/api";
import type {
  Chamber,
  PlayerState,
  GameEvent,
  MechanismType,
  EventType,
} from "@/shared/types";
import { cn } from "@/lib/utils";

const GRID_COLS = 16;
const GRID_ROWS = 12;

const MECHANISM_CONFIG: Record<
  MechanismType,
  { icon: React.ElementType; color: string; label: string }
> = {
  laser: { icon: Crosshair, color: "#b84444", label: "激光" },
  trap: { icon: Flame, color: "#c9a227", label: "陷阱" },
  puzzle: { icon: HelpCircle, color: "#6fa5d9", label: "谜题" },
  door: { icon: DoorOpen, color: "#8b6e3e", label: "门" },
  chest: { icon: Crown, color: "#e5c158", label: "宝箱" },
  sensor: { icon: Radar, color: "#a855f7", label: "传感器" },
};

const PLAYER_COLORS = [
  { color: "#c9a227", glowColor: "rgba(201, 162, 39, 0.6)" },
  { color: "#6fa5d9", glowColor: "rgba(111, 165, 217, 0.6)" },
  { color: "#5a9a74", glowColor: "rgba(90, 154, 116, 0.6)" },
];

const PLAYER_NAMES: Record<string, string> = {
  u1: "你",
  u2: "艾琳",
  u3: "马库斯",
};

interface ActiveEventDisplay {
  event: GameEvent;
  endTime: number;
  title: string;
  message: string;
}

const getHpColor = (hp: number, maxHp: number = 100): string => {
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

const getEventTitle = (type: EventType): string => {
  switch (type) {
    case "malfunction":
      return "机关失控";
    case "collapse":
      return "密室崩塌";
    case "bonus":
      return "奖励事件";
  }
};

const getEventMessage = (event: GameEvent): string => {
  return event.data?.description || "未知事件";
};

export default function Chamber() {
  const { chamberId } = useParams<{ chamberId: string }>();
  const navigate = useNavigate();
  const { currentChamber, currentUser, setCurrentChamber, loadData } = useGameStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [puzzleProgress, setPuzzleProgress] = useState(0);
  const [injuries, setInjuries] = useState(0);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [activeEvent, setActiveEvent] = useState<ActiveEventDisplay | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isShaking, setIsShaking] = useState(false);
  const [eventFlash, setEventFlash] = useState<"rust" | "verdigris" | null>(null);

  useEffect(() => {
    if (!currentUser) {
      loadData();
    }
  }, [currentUser, loadData]);

  useEffect(() => {
    if (!chamberId || !currentUser) return;

    const initGame = async () => {
      setIsLoading(true);
      try {
        let chamber: Chamber | null = currentChamber;
        if (!chamber || chamber.id !== chamberId) {
          const chamberRes = await chambersApi.getChamber(chamberId);
          if (chamberRes.success && chamberRes.data) {
            chamber = chamberRes.data;
            setCurrentChamber(chamber);
          } else {
            console.error("获取密室失败:", chamberRes.error);
            return;
          }
        }

        const sessionRes = await sessionsApi.createSession(chamberId, [
          currentUser.id,
          "u2",
          "u3",
        ]);

        if (sessionRes.success && sessionRes.data) {
          const session = sessionRes.data;
          setSessionId(session.id);
          setPlayers(session.players);
          setTimeRemaining(session.timeRemaining);
          setPuzzleProgress(session.puzzleProgress);
          setInjuries(session.injuries);
          setEvents(session.events);
          setGameOver(false);
        } else {
          console.error("创建会话失败:", sessionRes.error);
        }
      } catch (err) {
        console.error("初始化游戏失败:", err);
      } finally {
        setIsLoading(false);
        containerRef.current?.focus();
      }
    };

    initGame();
  }, [chamberId, currentUser, currentChamber, setCurrentChamber]);

  const endGame = useCallback(
    async (result: "won" | "lost") => {
      if (!sessionId || gameOver) return;
      setGameOver(true);

      try {
        await sessionsApi.endSession(sessionId, result === "won");
        navigate(`/result/${sessionId}`);
      } catch (err) {
        console.error("结束游戏失败:", err);
        navigate(`/result/${sessionId}`);
      }
    },
    [sessionId, gameOver, navigate]
  );

  useEffect(() => {
    if (isLoading || !sessionId || gameOver) return;

    const timer = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          clearInterval(timer);
          endGame("lost");
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, sessionId, gameOver, endGame]);

  useEffect(() => {
    if (isLoading || !sessionId || gameOver) return;

    const pollTimer = setInterval(async () => {
      try {
        const res = await sessionsApi.pollEvent(sessionId);
        if (res.success && res.data && res.data.triggered && res.data.event) {
          const event = res.data.event as GameEvent;
          setEvents((prev) => [...prev, event]);

          const duration = event.data?.duration || 20000;
          const clampedDuration = Math.max(15000, Math.min(30000, duration));
          const displayEvent: ActiveEventDisplay = {
            event,
            endTime: Date.now() + clampedDuration,
            title: getEventTitle(event.type),
            message: getEventMessage(event),
          };

          setActiveEvent(displayEvent);

          if (event.type === "malfunction" || event.type === "collapse") {
            setEventFlash("rust");
            if (event.type === "collapse") {
              setIsShaking(true);
              setTimeout(() => setIsShaking(false), 2000);
            }
          } else if (event.type === "bonus") {
            setEventFlash("verdigris");
          }
          setTimeout(() => setEventFlash(null), 800);

          if (res.data.session) {
            const updatedSession = res.data.session;
            setPlayers(updatedSession.players);
            setTimeRemaining(updatedSession.timeRemaining);
            setPuzzleProgress(updatedSession.puzzleProgress);
            setInjuries(updatedSession.injuries);
          }
        }
      } catch (err) {
        console.error("轮询事件失败:", err);
      }
    }, 5000);

    return () => clearInterval(pollTimer);
  }, [isLoading, sessionId, gameOver]);

  useEffect(() => {
    if (!activeEvent) return;

    const checkEnd = setInterval(() => {
      if (Date.now() >= activeEvent.endTime) {
        setActiveEvent(null);
        clearInterval(checkEnd);
      }
    }, 500);

    return () => clearInterval(checkEnd);
  }, [activeEvent]);

  const movePlayer = useCallback(
    async (dx: number, dy: number) => {
      if (!sessionId || !currentUser || gameOver) return;

      setPlayers((prev) => {
        const updated = prev.map((p) => {
          if (p.userId !== currentUser.id || !p.isAlive) return p;
          const gridWidth = currentChamber?.gridWidth || GRID_COLS;
          const gridHeight = currentChamber?.gridHeight || GRID_ROWS;
          const newX = Math.max(0, Math.min(gridWidth - 1, p.x + dx));
          const newY = Math.max(0, Math.min(gridHeight - 1, p.y + dy));
          if (newX === p.x && newY === p.y) return p;
          return { ...p, x: newX, y: newY };
        });

        const hasChanged = updated.some(
          (p, i) => p.x !== prev[i].x || p.y !== prev[i].y
        );

        if (hasChanged) {
          sessionsApi.updateSession(sessionId, { players: updated }).catch((err) => {
            console.error("更新会话失败:", err);
          });
        }

        return updated;
      });
    },
    [sessionId, currentUser, gameOver, currentChamber]
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

  const handleInteract = async () => {
    if (!sessionId || !currentUser || !currentChamber) return;
    const me = players.find((p) => p.userId === currentUser.id);
    if (!me) return;

    const mech = currentChamber.mechanisms.find(
      (m) => m.x === me.x && m.y === me.y
    );

    if (mech && (mech.type === "chest" || mech.type === "puzzle" || mech.type === "door")) {
      const newProgress = Math.min(100, puzzleProgress + 5);
      setPuzzleProgress(newProgress);
      await sessionsApi
        .updateSession(sessionId, { puzzleProgress: newProgress })
        .catch((err) => console.error("更新进度失败:", err));

      if (newProgress >= 100) {
        endGame("won");
      }
    }
  };

  const handleSOS = async () => {
    if (!sessionId || !currentUser) return;
    setPlayers((prev) => {
      const updated = prev.map((p) =>
        p.userId === currentUser.id ? { ...p, hp: Math.min(100, p.hp + 20) } : p
      );
      sessionsApi
        .updateSession(sessionId, { players: updated })
        .catch((err) => console.error("更新HP失败:", err));
      return updated;
    });
  };

  const handleItem = async () => {
    if (!sessionId) return;
    const newProgress = Math.min(100, puzzleProgress + 3);
    setPuzzleProgress(newProgress);
    await sessionsApi
      .updateSession(sessionId, { puzzleProgress: newProgress })
      .catch((err) => console.error("更新进度失败:", err));
  };

  const handleEnd = () => {
    endGame("lost");
  };

  const me = players.find((p) => p.userId === currentUser?.id);
  const isLowTime = timeRemaining < 30;
  const gridWidth = currentChamber?.gridWidth || GRID_COLS;
  const gridHeight = currentChamber?.gridHeight || GRID_ROWS;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gothic-bg flex items-center justify-center">
        <div className="text-bronze-gradient text-xl animate-pulse">正在加载密室...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className={cn(
        "relative min-h-screen bg-gothic-bg overflow-hidden outline-none"
      )}
      style={{
        animation: isShaking ? "shake 0.3s ease-in-out infinite" : undefined,
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
            eventFlash === "rust" && "bg-rust/30",
            eventFlash === "verdigris" && "bg-verdigris/30"
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
                  {currentChamber?.name || "密室挑战"}
                </h2>
                <p className="text-xs text-gothic-muted italic">
                  编号：{chamberId}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
              <StatBadge
                icon={<Clock size={16} />}
                label="剩余时间"
                value={formatTime(timeRemaining)}
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
                          width: `${puzzleProgress}%`,
                          background:
                            "linear-gradient(90deg, #2a4a37, #3d6b4f, #5a9a74)",
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold">{puzzleProgress}%</span>
                  </div>
                </div>
              </div>

              <StatBadge
                icon={<AlertTriangle size={16} />}
                label="受伤次数"
                value={me?.injuries ?? injuries}
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

              {activeEvent && (
                <div
                  className={cn(
                    "absolute top-2 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded border text-sm font-display tracking-wider",
                    activeEvent.event.type === "bonus"
                      ? "bg-verdigris-dark/90 border-verdigris text-verdigris-light"
                      : "bg-rust-dark/90 border-rust text-rust-light"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {activeEvent.event.type === "bonus" ? (
                      <Gift size={16} />
                    ) : activeEvent.event.type === "collapse" ? (
                      <Mountain size={16} />
                    ) : (
                      <AlertTriangle size={16} />
                    )}
                    <span className="font-bold">{activeEvent.title}</span>
                    <span className="ml-2 text-xs opacity-75">
                      {Math.max(0, Math.ceil((activeEvent.endTime - Date.now()) / 1000))}s
                    </span>
                  </div>
                  <p className="text-xs opacity-90 mt-0.5">
                    {activeEvent.message}
                  </p>
                </div>
              )}

              <div
                className="grid gap-[2px] p-2 relative"
                style={{
                  gridTemplateColumns: `repeat(${gridWidth}, 1fr)`,
                  gridTemplateRows: `repeat(${gridHeight}, 1fr)`,
                }}
              >
                {Array.from({ length: gridHeight }).map((_, y) =>
                  Array.from({ length: gridWidth }).map((_, x) => {
                    const mechanism = currentChamber?.mechanisms.find(
                      (m) => m.x === x && m.y === y
                    );
                    const playersHere = players.filter(
                      (p) => p.x === x && p.y === y && p.isAlive
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
                          (x + y) % 2 === 0 && "bg-gothic-surface/40"
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

                        {playersHere.map((player, idx) => {
                          const isMe = player.userId === currentUser?.id;
                          const colorIdx = Math.min(
                            players.findIndex((p) => p.userId === player.userId),
                            PLAYER_COLORS.length - 1
                          );
                          const colors = PLAYER_COLORS[colorIdx] || PLAYER_COLORS[0];
                          const displayName = PLAYER_NAMES[player.userId] || player.userId;

                          return (
                            <div
                              key={player.userId}
                              className="absolute inset-0 flex items-center justify-center z-[5]"
                              style={{
                                transform: `translate(${idx * 2}px, ${idx * 2}px)`,
                              }}
                            >
                              <div className="relative">
                                <div
                                  className="player-pulse absolute inset-0 rounded-full"
                                  style={{
                                    backgroundColor: colors.glowColor,
                                  }}
                                />
                                <div
                                  className={cn(
                                    "relative w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold z-10 border-2",
                                    isMe && "ring-2 ring-white ring-opacity-60"
                                  )}
                                  style={{
                                    backgroundColor: colors.color,
                                    borderColor: colors.color,
                                    boxShadow: isMe
                                      ? `0 0 15px ${colors.glowColor}, 0 0 30px ${colors.glowColor}`
                                      : `0 0 10px ${colors.glowColor}`,
                                  }}
                                >
                                  {isMe ? (
                                    <User size={12} />
                                  ) : (
                                    displayName[0]
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex justify-center gap-1.5 mt-2 text-[10px] text-gothic-muted">
              {(Object.keys(MECHANISM_CONFIG) as MechanismType[]).map((type) => {
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
              })}
            </div>
          </div>

          <div className="w-56 lg:w-64 flex flex-col gap-3">
            <div className="gothic-card rivets p-3 flex-1 overflow-auto">
              <h3 className="text-sm font-display text-bronze-gradient mb-3 flex items-center gap-2 tracking-wider">
                <Shield size={14} /> 队伍状态
              </h3>
              <div className="space-y-3">
                {players.map((player, idx) => {
                  const isMe = player.userId === currentUser?.id;
                  const colors = PLAYER_COLORS[idx] || PLAYER_COLORS[0];
                  const displayName = PLAYER_NAMES[player.userId] || player.userId;

                  return (
                    <div
                      key={player.userId}
                      className={cn(
                        "p-2.5 rounded border transition-all",
                        isMe
                          ? "border-bronze/50 bg-bronze/5"
                          : "border-gothic-border/50 bg-gothic-surface/30",
                        !player.isAlive && "opacity-50 grayscale"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="relative w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold border-2"
                          style={{
                            backgroundColor: colors.color,
                            borderColor: colors.color,
                            boxShadow: `0 0 8px ${colors.glowColor}`,
                          }}
                        >
                          {isMe ? <User size={16} /> : displayName[0]}
                          {!player.isAlive && (
                            <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center">
                              <Skull size={14} className="text-rust-light" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span
                              className="text-sm font-bold truncate"
                              style={{ color: colors.color }}
                            >
                              {displayName}
                              {isMe && (
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
                            {player.hp}/100
                          </span>
                        </div>
                        <div className="h-2 bg-gothic-bg rounded-full overflow-hidden border border-gothic-border">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${(player.hp / 100) * 100}%`,
                              background: getHpColor(player.hp),
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
                            player.isAlive
                              ? "text-verdigris-light bg-verdigris-dark/50"
                              : "text-rust-light bg-rust-dark/50"
                          )}
                        >
                          {player.isAlive ? "存活" : "阵亡"}
                        </span>
                      </div>
                    </div>
                  );
                })}
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
