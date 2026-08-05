export function PageHeader({ title, eyebrow, children }: { title: string; eyebrow: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-normal text-brand">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">{title}</h1>
      </div>
      {children}
    </div>
  );
}
