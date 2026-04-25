"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  default:
    "bg-[var(--brand-yellow)] text-[var(--brand-blue)] hover:bg-[#e6a427] focus-visible:ring-[var(--brand-yellow)]",
  outline:
    "border border-[var(--border-soft)] text-[var(--brand-blue)] hover:border-[var(--brand-yellow)] hover:bg-[rgba(249,181,46,0.08)] focus-visible:ring-[var(--brand-yellow)]",
  ghost:
    "text-[var(--brand-blue)] hover:bg-[rgba(21,41,70,0.08)] focus-visible:ring-[var(--brand-blue)]",
};

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
