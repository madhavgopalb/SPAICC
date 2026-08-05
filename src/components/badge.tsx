import { cn } from "@/lib/utils";

const toneClass = {
  neutral: "border-stone-300 bg-white text-stone-700",
  good: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warn: "border-amber-200 bg-amber-50 text-amber-800",
  bad: "border-red-200 bg-red-50 text-red-800",
  info: "border-cyan-200 bg-cyan-50 text-cyan-800"
};

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: keyof typeof toneClass }) {
  return <span className={cn("inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium", toneClass[tone])}>{children}</span>;
}
