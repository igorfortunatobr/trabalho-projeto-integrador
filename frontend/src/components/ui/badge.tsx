import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[rgba(21,41,70,0.2)] bg-[rgba(21,41,70,0.06)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-blue)]",
        className,
      )}
      {...props}
    />
  );
}
