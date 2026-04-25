import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border-soft)] bg-white/95 p-6 shadow-[0_10px_35px_rgba(15,23,42,0.07)]",
        className,
      )}
      {...props}
    />
  );
}
