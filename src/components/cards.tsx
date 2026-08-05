import { cn } from "@/lib/utils";

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-lg border border-stone-200 bg-white p-5 shadow-sm", className)}>{children}</section>;
}

export function KpiCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Panel className="min-h-32">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-normal text-ink">{value}</p>
      <p className="mt-2 text-sm text-stone-600">{detail}</p>
    </Panel>
  );
}
