import { clsx } from "clsx";
import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "dark" | "outline";

const variantStyles: Record<Variant, string> = {
  primary: "bg-ball-500 text-ball-ink hover:bg-[#dcf16b]",
  dark: "bg-court-950 text-white hover:bg-court-800",
  outline: "bg-transparent border-[1.5px] border-court-950 text-court-950 hover:bg-court-950 hover:text-white",
};

const base =
  "inline-flex items-center gap-2 rounded-[10px] px-5 py-[11px] font-extrabold text-sm cursor-pointer transition-all duration-150 active:scale-[0.97]";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  href?: string;
}

/**
 * Shared action button. Pass `href` to render as a link (e.g. "Join a session"
 * on the marketing site); omit it to render a real <button> for in-app actions
 * (e.g. "Confirm waiting-list spot") that trigger a server action.
 */
export function Button({ variant = "primary", href, className, children, ...props }: ButtonProps) {
  const classes = clsx(base, variantStyles[variant], className);
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
