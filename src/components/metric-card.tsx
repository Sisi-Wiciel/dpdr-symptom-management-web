type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <article className="surface-card rounded-[28px] p-6">
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
      <div className="mt-5 space-y-3">
        <p className="display-heading text-4xl font-semibold text-[var(--ink)]">{value}</p>
        <p className="max-w-xs text-sm leading-6 text-[var(--muted)]">{detail}</p>
      </div>
    </article>
  );
}