import type { RegionBar } from '../lib/metrics';

export function RegionBars({ regions }: { regions: RegionBar[] }) {
  const max = Math.max(...regions.map((r) => r.total), 1);

  return (
    <div className="flex flex-col gap-2.5">
      {regions.map((r) => {
        const pct = r.total > 0 ? Math.round((r.active / r.total) * 100) : 0;
        return (
          <div key={r.name}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-xs font-semibold text-ink">{r.name}</span>
              <span className="text-[11px] text-muted">
                <b className="text-ink">{r.active}</b> ativas · {pct}% aprovação
              </span>
            </div>
            <div className="relative h-2 overflow-hidden rounded bg-line-soft">
              <div
                className="absolute left-0 top-0 h-full rounded bg-brand/25"
                style={{ width: `${(r.total / max) * 100}%` }}
              />
              <div
                className="absolute left-0 top-0 h-full rounded bg-brand"
                style={{ width: `${(r.active / max) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
