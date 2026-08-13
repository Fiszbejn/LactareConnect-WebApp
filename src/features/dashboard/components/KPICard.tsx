import { Sparkline } from '../../../shared/charts/Sparkline';
import type { Kpi } from '../lib/metrics';

export function KPICard({ label, value, hint, accent, trend }: Kpi) {
  return (
    <div className="relative flex flex-1 flex-col gap-2.5 overflow-hidden rounded-2xl border border-line bg-white p-5">
      <span className="absolute left-0 top-0 h-full w-1" style={{ background: accent }} />
      <div className="text-[11px] font-bold uppercase tracking-[0.4px] text-muted">{label}</div>
      <div className="text-[28px] font-extrabold tracking-tight text-ink">{value}</div>
      <div className="text-[11px] leading-tight text-muted">{hint}</div>
      <Sparkline data={trend} color={accent} />
    </div>
  );
}
