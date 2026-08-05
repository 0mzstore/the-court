import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("bg-white rounded-card shadow-card border border-black/5", className)}
      {...props}
    />
  );
}

type BadgeVariant = "win" | "loss" | "draw" | "pending" | "info" | "neutral";

const badgeStyles: Record<BadgeVariant, string> = {
  win: "bg-win-bg text-win",
  loss: "bg-loss-bg text-loss",
  draw: "bg-draw-bg text-draw",
  pending: "bg-pending-bg text-pending",
  info: "bg-info-bg text-info",
  neutral: "bg-court-100 text-ink-600",
};

export function Badge({
  variant = "neutral",
  children,
}: {
  variant?: BadgeVariant;
  children: React.ReactNode;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wide px-[9px] py-[4px] rounded-full",
        badgeStyles[variant]
      )}
    >
      {children}
    </span>
  );
}
