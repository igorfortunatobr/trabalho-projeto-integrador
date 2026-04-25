import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm text-[var(--brand-blue)] shadow-sm outline-none placeholder:text-slate-400 focus-visible:border-[var(--brand-yellow)] focus-visible:ring-2 focus-visible:ring-[rgba(249,181,46,0.35)]",
        className,
      )}
      {...props}
    />
  );
}
