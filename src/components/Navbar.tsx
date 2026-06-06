import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Hammer,
  Store,
  Trophy,
  Swords,
  User,
  Zap,
  Star,
  Sparkles,
  Coins,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/store/useGameStore";
import { StatBadge } from "./StatBadge";
import { GearDecoration } from "./GearDecoration";

interface NavItem {
  label: string;
  path: string;
  icon: typeof Home;
}

const navItems: NavItem[] = [
  { label: "大厅", path: "/", icon: Home },
  { label: "设计器", path: "/designer", icon: Hammer },
  { label: "市场", path: "/market", icon: Store },
  { label: "排行榜", path: "/ranking", icon: Trophy },
  { label: "赛事", path: "/contest", icon: Swords },
  { label: "个人中心", path: "/profile", icon: User },
];

export function Navbar() {
  const location = useLocation();
  const { user, loadData } = useGameStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const expToNext = (user?.level || 1) * 3000;

  return (
    <nav
      className={cn(
        "relative w-full z-50 transition-all duration-300",
        scrolled
          ? "bg-gothic-bg/95 backdrop-blur-md shadow-lg shadow-black/40 border-b border-gothic-border"
          : "bg-gradient-to-b from-gothic-bg via-gothic-bg/80 to-transparent"
      )}
    >
      <GearDecoration
        size="md"
        direction="counterclockwise"
        speed="slow"
        className="absolute left-4 top-1/2 -translate-y-1/2 opacity-[0.08]"
      />
      <GearDecoration
        size="sm"
        direction="clockwise"
        speed="normal"
        className="absolute right-60 top-1/2 -translate-y-1/2 opacity-[0.1] hidden lg:block"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-11 h-11 rounded-sm flex items-center justify-center bg-metal-gradient shadow-metal-inset border border-bronze-dark">
                <svg viewBox="0 0 40 40" className="w-7 h-7">
                  <defs>
                    <linearGradient id="navGear" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1a1410" />
                      <stop offset="100%" stopColor="#3a2e24" />
                    </linearGradient>
                  </defs>
                  <g fill="url(#navGear)">
                    {Array.from({ length: 10 }).map((_, i) => {
                      const angle = (i * 360) / 10;
                      const rad = (angle * Math.PI) / 180;
                      const cx = 20 + Math.cos(rad) * 15;
                      const cy = 20 + Math.sin(rad) * 15;
                      return (
                        <rect
                          key={i}
                          x={cx - 2}
                          y={cy - 6}
                          width="4"
                          height="12"
                          rx="1"
                          transform={`rotate(${angle} ${cx} ${cy})`}
                        />
                      );
                    })}
                    <circle cx="20" cy="20" r="13" />
                    <circle cx="20" cy="20" r="8" fill="url(#navGear)" />
                    <circle cx="20" cy="20" r="4" />
                  </g>
                </svg>
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-display tracking-widest text-bronze-gradient m-0 leading-tight">
                CLOCKWORK
              </h1>
              <p className="text-[10px] tracking-[0.3em] text-gothic-muted uppercase m-0">
                Chamber of Artifice
              </p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative px-4 py-2 rounded-sm flex items-center gap-2 font-display text-sm tracking-wider transition-all duration-200",
                    isActive
                      ? "text-bronze bg-bronze/10 border border-bronze/40"
                      : "text-gothic-text hover:text-bronze hover:bg-gothic-surface/60 border border-transparent"
                  )}
                >
                  <Icon size={16} className={isActive ? "text-bronze" : ""} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-bronze to-transparent" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              {user && (
                <>
                  <StatBadge
                    icon={<Zap size={14} />}
                    value={user.energy}
                    maxValue={user.maxEnergy}
                    variant="verdigris"
                    showProgress
                    label="体力"
                  />
                  <StatBadge
                    icon={<Star size={14} />}
                    value={user.reputation}
                    variant="bronze"
                    label="声望"
                  />
                  <StatBadge
                    icon={<Sparkles size={14} />}
                    value={user.experience}
                    maxValue={expToNext}
                    variant="ice"
                    showProgress
                    label={`Lv.${user.level}`}
                  />
                  <StatBadge
                    icon={<Coins size={14} />}
                    value={user.currency.toLocaleString()}
                    variant="bronze"
                    label="金币"
                  />
                </>
              )}
            </div>

            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-gothic-border">
              <div className="w-9 h-9 rounded-sm flex items-center justify-center bg-metal-gradient shadow-metal-inset border border-bronze-dark">
                <User size={18} className="text-gothic-bg" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-sm text-bronze tracking-wider">
                  {user?.displayName || "工匠"}
                </span>
                <span className="text-[10px] text-gothic-muted tracking-wider flex items-center gap-1">
                  Lv.{user?.level || 1}
                  <ChevronDown size={10} />
                </span>
              </div>
            </div>

            <button
              className="lg:hidden p-2 text-gothic-text hover:text-bronze transition-colors border border-gothic-border rounded-sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-gothic-border pt-4">
            {user && (
              <div className="flex flex-wrap gap-2 mb-4">
                <StatBadge
                  icon={<Zap size={12} />}
                  value={user.energy}
                  maxValue={user.maxEnergy}
                  variant="verdigris"
                  showProgress
                  label="体力"
                />
                <StatBadge
                  icon={<Star size={12} />}
                  value={user.reputation}
                  variant="bronze"
                  label="声望"
                />
                <StatBadge
                  icon={<Sparkles size={12} />}
                  value={user.experience}
                  maxValue={expToNext}
                  variant="ice"
                  showProgress
                  label={`Lv.${user.level}`}
                />
                <StatBadge
                  icon={<Coins size={12} />}
                  value={user.currency.toLocaleString()}
                  variant="bronze"
                  label="金币"
                />
              </div>
            )}
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-4 py-3 rounded-sm flex items-center gap-3 font-display text-sm tracking-wider transition-all",
                      isActive
                        ? "text-bronze bg-bronze/10 border border-bronze/40"
                        : "text-gothic-text hover:text-bronze hover:bg-gothic-surface/60 border border-transparent"
                    )}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-bronze/60 to-transparent" />
    </nav>
  );
}
