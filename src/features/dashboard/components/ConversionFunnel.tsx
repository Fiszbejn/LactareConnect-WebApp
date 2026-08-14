import type { FunnelStep } from '../lib/metrics';

const COLORS = [
  'var(--color-brand-light)',
  'var(--color-brand-light)',
  'var(--color-ok)',
  'var(--color-brand)',
  'var(--color-amber)',
];

export function ConversionFunnel({ steps }: { steps: FunnelStep[] }) {
  const max = Math.max(...steps.map((s) => s.value), 1);

  return (
    <div className="flex flex-1 flex-col justify-between gap-3">
      {steps.map((step, i) => {
        const pct = (step.value / max) * 100;
        const prev = i > 0 ? steps[i - 1].value : null;
        const rate = prev ? Math.round((step.value / prev) * 100) : null;
        return (
          <div key={step.label} className="flex items-center gap-3">
            <div className="w-44 shrink-0 text-[12.5px] text-muted">{step.label}</div>
            <div className="relative h-10 flex-1 overflow-hidden rounded-lg bg-line-soft">
              <div
                className="flex h-full items-center rounded-lg px-3 text-[13px] font-bold text-white"
                style={{ width: `${pct}%`, minWidth: '46px', background: COLORS[i % COLORS.length] }}
              >
                {step.value.toLocaleString('pt-BR')}
              </div>
            </div>
            <div className="w-14 shrink-0 text-right text-[12px] font-semibold text-muted">
              {rate !== null ? `${rate}%` : '—'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
