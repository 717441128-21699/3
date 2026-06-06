import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { GearDecoration } from "./GearDecoration";

interface ParchementCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  showGears?: boolean;
  className?: string;
  contentClassName?: string;
}

export function ParchementCard({
  children,
  title,
  subtitle,
  icon,
  showGears = true,
  className,
  contentClassName,
}: ParchementCardProps) {
  return (
    <div className={cn("parchment relative overflow-hidden rounded-sm", className)}>
      {showGears && (
        <>
          <GearDecoration
            size="lg"
            direction="clockwise"
            speed="slow"
            className="absolute -top-8 -right-8 opacity-[0.08]"
          />
          <GearDecoration
            size="md"
            direction="counterclockwise"
            speed="slow"
            className="absolute -bottom-6 -left-6 opacity-[0.06]"
          />
        </>
      )}

      <div className="relative z-10">
        {(title || icon) && (
          <div className="border-b border-parchment-400/50 pb-3 mb-4">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="text-[#5a4a1e] flex-shrink-0">
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <h3 className="text-xl font-bold tracking-wider text-[#3d2f1a] m-0 font-display">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-sm text-[#6b5a3e] italic mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            <div className="mt-3 h-px bg-gradient-to-r from-transparent via-[#8b6e3e]/60 to-transparent" />
          </div>
        )}

        <div className={cn("text-[#2a1f15]", contentClassName)}>{children}</div>
      </div>
    </div>
  );
}
