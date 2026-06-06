import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatVariant = "bronze" | "rust" | "verdigris" | "ice" | "default";

interface StatBadgeProps {
  icon?: ReactNode;
  label?: string;
  value: string | number;
  maxValue?: number;
  variant?: StatVariant;
  showProgress?: boolean;
  className?: string;
}

const variantMap: Record<StatVariant, string> = {
  bronze: "stat-badge-bronze",
  rust: "stat-badge-rust",
  verdigris: "stat-badge-verdigris",
  ice: "stat-badge-ice",
  default: "",
};

export function StatBadge({
  icon,
  label,
  value,
  maxValue,
  variant = "default",
  showProgress = false,
  className,
}: StatBadgeProps) {
  const variantClass = variantMap[variant];
  const numericValue = typeof value === "number" ? value : parseInt(String(value), 10);
  const progress =
    showProgress && maxValue && !isNaN(numericValue)
      ? Math.min(100, Math.max(0, (numericValue / maxValue) * 100))
      : null;

  return (
    <div className={cn("stat-badge", variantClass, className)}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <div className="flex flex-col leading-tight">
        {label && <span className="text-[10px] opacity-70 tracking-wider">{label}</span>}
        <span className="flex items-baseline gap-0.5">
          <span>{value}</span>
          {maxValue && <span className="text-[10px] opacity-50">/ {maxValue}</span>}
        </span>
      </div>
      {progress !== null && (
        <div className="ml-2 w-16 h-1.5 bg-gothic-bg rounded-full overflow-hidden border border-gothic-border">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background:
                variant === "bronze"
                  ? "linear-gradient(90deg, #9a7c17, #e5c158)"
                  : variant === "rust"
                  ? "linear-gradient(90deg, #6a1f1f, #b84444)"
                  : variant === "verdigris"
                  ? "linear-gradient(90deg, #2a4a37, #5a9a74)"
                  : variant === "ice"
                  ? "linear-gradient(90deg, #355d8a, #6fa5d9)"
                  : "linear-gradient(90deg, #3a2e24, #8b7336)",
            }}
          />
        </div>
      )}
    </div>
  );
}
