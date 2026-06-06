import { cn } from "@/lib/utils";

interface GearDecorationProps {
  size?: "sm" | "md" | "lg" | "xl";
  direction?: "clockwise" | "counterclockwise";
  speed?: "slow" | "normal" | "fast";
  className?: string;
  opacity?: number;
}

const sizeMap = {
  sm: 24,
  md: 48,
  lg: 80,
  xl: 120,
};

const speedMap = {
  slow: "animate-gear-spin-slow",
  normal: "animate-gear-spin",
  fast: "animate-gear-spin",
};

export function GearDecoration({
  size = "md",
  direction = "clockwise",
  speed = "normal",
  className,
  opacity = 0.12,
}: GearDecorationProps) {
  const px = sizeMap[size];
  const animClass = speedMap[speed];
  const reverse = direction === "counterclockwise" ? "animate-gear-spin-reverse" : "";

  return (
    <div
      className={cn("gear-decoration", className)}
      style={{ opacity, width: px, height: px }}
    >
      <svg
        viewBox="0 0 100 100"
        className={cn(animClass, reverse)}
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <linearGradient id={`gearGrad-${size}-${direction}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e5c158" />
            <stop offset="50%" stopColor="#c9a227" />
            <stop offset="100%" stopColor="#8b7336" />
          </linearGradient>
        </defs>
        <g fill={`url(#gearGrad-${size}-${direction})`}>
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 360) / 12;
            const rad = (angle * Math.PI) / 180;
            const cx = 50 + Math.cos(rad) * 38;
            const cy = 50 + Math.sin(rad) * 38;
            return (
              <rect
                key={i}
                x={cx - 4}
                y={cy - 14}
                width="8"
                height="28"
                rx="2"
                transform={`rotate(${angle} ${cx} ${cy})`}
              />
            );
          })}
          <circle cx="50" cy="50" r="32" />
          <circle cx="50" cy="50" r="22" fill="#1a1410" />
          <circle cx="50" cy="50" r="18" />
          <circle cx="50" cy="50" r="10" fill="#1a1410" />
          <circle cx="50" cy="50" r="6" />
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i * 360) / 6;
            const rad = (angle * Math.PI) / 180;
            const cx = 50 + Math.cos(rad) * 14;
            const cy = 50 + Math.sin(rad) * 14;
            return <circle key={i} cx={cx} cy={cy} r="3" fill="#1a1410" />;
          })}
        </g>
      </svg>
    </div>
  );
}
