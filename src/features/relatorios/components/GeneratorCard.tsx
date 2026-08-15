import { PERIOD_PRESETS, type DateRange, type PeriodPreset } from '../lib/period';
import type { ReportSectionId } from '../lib/reportData';
import { REPORT_SECTIONS } from '../lib/reportData';
import type { RelatorioFormato } from '../../../shared/api/types';

const FORMATS: { value: RelatorioFormato; label: string; sub: string }[] = [
  { value: 'pdf_completo', label: 'PDF · Completo', sub: 'Indicadores + tabelas' },
  { value: 'pdf_resumo', label: 'PDF · Resumo', sub: 'Apenas KPIs' },
  { value: 'csv', label: 'CSV', sub: 'Dados brutos' },
];

type GeneratorCardProps = {
  preset: PeriodPreset;
  onPresetChange: (p: PeriodPreset) => void;
  customRange: DateRange;
  onCustomRangeChange: (r: DateRange) => void;
  sections: Set<ReportSectionId>;
  onToggleSection: (id: ReportSectionId) => void;
  formato: RelatorioFormato;
  onFormatoChange: (f: RelatorioFormato) => void;
  onGenerate: () => void;
  isGenerating: boolean;
};

export function GeneratorCard({
  preset,
  onPresetChange,
  customRange,
  onCustomRangeChange,
  sections,
  onToggleSection,
  formato,
  onFormatoChange,
  onGenerate,
  isGenerating,
}: GeneratorCardProps) {
  const sectionsDisabled = formato === 'pdf_resumo';

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-line bg-white p-6">
      <div>
        <div className="font-sans text-[17px] font-extrabold text-ink">Novo relatório</div>
        <div className="mt-1 text-xs text-muted">Escolha um período e exporte os indicadores.</div>
      </div>

      <div>
        <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.4px] text-muted">Período</div>
        <div className="mb-3 flex flex-wrap gap-2">
          {PERIOD_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onPresetChange(p.value)}
              className={`rounded-2xl px-3 py-1.5 text-[11.5px] font-semibold ${
                preset === p.value ? 'bg-ink text-white' : 'border border-line bg-white text-ink'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {preset === 'personalizado' && (
          <div className="grid grid-cols-2 gap-2.5">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] text-muted">Data inicial</span>
              <input
                type="date"
                value={customRange.start}
                max={customRange.end}
                onChange={(e) => onCustomRangeChange({ ...customRange, start: e.target.value })}
                className="h-10 rounded-lg border border-line px-3 text-[13px] text-ink"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] text-muted">Data final</span>
              <input
                type="date"
                value={customRange.end}
                min={customRange.start}
                onChange={(e) => onCustomRangeChange({ ...customRange, end: e.target.value })}
                className="h-10 rounded-lg border border-line px-3 text-[13px] text-ink"
              />
            </label>
          </div>
        )}
      </div>

      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.4px] text-muted">Seções incluídas</span>
          {sectionsDisabled && <span className="text-[10.5px] text-faint">Resumo inclui só indicadores</span>}
        </div>
        <div className="flex flex-col gap-2">
          {REPORT_SECTIONS.map((s) => {
            const checked = sections.has(s.id);
            return (
              <label
                key={s.id}
                className={`flex items-center gap-3 rounded-lg border px-3.5 py-2.5 ${
                  checked && !sectionsDisabled ? 'border-brand bg-brand-tint' : 'border-line bg-white'
                } ${sectionsDisabled ? 'opacity-50' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={sectionsDisabled}
                  onChange={() => onToggleSection(s.id)}
                  className="h-[18px] w-[18px] accent-brand"
                />
                <span className="text-[12.5px] font-medium text-ink">{s.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.4px] text-muted">Formato</div>
        <div className="flex gap-2">
          {FORMATS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => onFormatoChange(f.value)}
              className={`flex-1 rounded-lg border p-3 text-left ${
                formato === f.value ? 'border-brand bg-brand text-white' : 'border-line bg-white text-ink'
              }`}
            >
              <div className="text-[12px] font-bold">{f.label}</div>
              <div className={`mt-0.5 text-[10.5px] ${formato === f.value ? 'opacity-85' : 'text-muted'}`}>
                {f.sub}
              </div>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onGenerate}
        disabled={isGenerating}
        className="mt-1 h-11 rounded-xl bg-brand text-[13px] font-bold text-white disabled:opacity-60"
      >
        {isGenerating ? 'Gerando…' : `Gerar e baixar ${formato === 'csv' ? 'CSV' : 'PDF'}`}
      </button>
    </div>
  );
}
