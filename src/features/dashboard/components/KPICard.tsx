import { Sparkline } from '../../../shared/charts/Sparkline';
import type { Kpi } from '../lib/metrics';

export function KPICard({ label, value, hint, accent, trend }: Kpi) {
  return (
    <div className="relative flex min-h-[220px] flex-1 flex-col gap-3 overflow-hidden rounded-2xl border border-line bg-white p-6">
      <span className="absolute left-0 top-0 h-full w-1" style={{ background: accent }} />
      <div className="text-[11px] font-bold uppercase tracking-[0.4px] text-muted">{label}</div>
      <div className="text-[32px] font-extrabold tracking-tight text-ink">{value}</div>
      <div className="text-[11px] leading-tight text-muted">{hint}</div>
      <div className="flex-1" />
      <Sparkline data={trend} color={accent} height={56} />
    </div>
  );
}
