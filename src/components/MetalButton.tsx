import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface MetalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  fullWidth?: boolean;
}

const variantMap: Record<ButtonVariant, string> = {
  primary: "",
  danger: "metal-btn-danger",
  ghost: "metal-btn-ghost",
};

const sizeMap: Record<ButtonSize, string> = {
  sm: "py-2 px-4 text-xs",
  md: "",
  lg: "py-3 px-8 text-base",
};

export function MetalButton({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: MetalButtonProps) {
  const variantClass = variantMap[variant];
  const sizeClass = sizeMap[size];

  return (
    <button
      className={cn(
        "metal-btn",
        variantClass,
        sizeClass,
        fullWidth && "w-full",
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {!loading && icon && iconPosition === "left" && (
        <span className="mr-2 -ml-0.5">{icon}</span>
      )}
      {children}
      {!loading && icon && iconPosition === "right" && (
        <span className="ml-2 -mr-0.5">{icon}</span>
      )}
    </button>
  );
}
