import type { Administrador, RelatorioFormato, RelatorioGerado } from '../../../shared/api/types';
import type { ReportSummary } from '../lib/reportData';
import { formatRangeLabel } from '../lib/period';

const FORMATO_LABEL: Record<RelatorioFormato, string> = {
  pdf_completo: 'PDF completo',
  pdf_resumo: 'PDF resumo',
  csv: 'CSV',
};

function relativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days <= 0) return 'hoje';
  if (days === 1) return 'há 1 dia';
  if (days < 30) return `há ${days} dias`;
  const months = Math.floor(days / 30);
  if (months === 1) return 'há 1 mês';
  if (months < 12) return `há ${months} meses`;
  const years = Math.floor(months / 12);
  return years === 1 ? 'há 1 ano' : `há ${years} anos`;
}

type HistoryPanelProps = {
  summary: ReportSummary;
  relatorios: RelatorioGerado[];
  administradores: Administrador[];
};

export function HistoryPanel({ summary, relatorios, administradores }: HistoryPanelProps) {
  const nomeById = new Map(administradores.map((a) => [a.id, a.nome]));
  const ordenados = [...relatorios].sort((a, b) => b.dataGeracao.localeCompare(a.dataGeracao)).slice(0, 8);

  const alcance = summary.kpis[0];
  const engajamento = summary.kpis[1];
  const conversao = summary.kpis[2];

  return (
    <div className="flex flex-col gap-4.5">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-brand-light p-4.5 text-white">
        <div className="text-[11px] font-bold uppercase tracking-[0.4px] opacity-85">
          Resumo do período selecionado
        </div>
        <div className="mt-3.5 grid grid-cols-2 gap-3.5">
          <div>
            <div className="font-sans text-[20px] font-extrabold tracking-tight">{alcance?.value ?? '—'}</div>
            <div className="mt-0.5 text-[10.5px] opacity-85">alcance total</div>
          </div>
          <div>
            <div className="font-sans text-[20px] font-extrabold tracking-tight">{engajamento?.value ?? '—'}</div>
            <div className="mt-0.5 text-[10.5px] opacity-85">engajamento</div>
          </div>
          <div>
            <div className="font-sans text-[20px] font-extrabold tracking-tight">{conversao?.value ?? '—'}</div>
            <div className="mt-0.5 text-[10.5px] opacity-85">conversão</div>
          </div>
          <div>
            <div className="font-sans text-[20px] font-extrabold tracking-tight">
              {summary.variacaoCadastros === null
                ? '—'
                : `${summary.variacaoCadastros >= 0 ? '+' : ''}${summary.variacaoCadastros.toFixed(1)}%`}
            </div>
            <div className="mt-0.5 text-[10.5px] opacity-85">cadastros vs período anterior</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col rounded-2xl border border-line bg-white p-4.5">
        <div className="mb-3.5">
          <div className="font-sans text-[14px] font-extrabold text-ink">Relatórios anteriores</div>
          <div className="mt-0.5 text-[11px] text-muted">Últimos gerados neste painel</div>
        </div>
        {ordenados.length === 0 ? (
          <p className="text-xs text-muted">Nenhum relatório gerado ainda.</p>
        ) : (
          ordenados.map((r, i) => (
            <div
              key={r.id}
              className={`flex items-center gap-3 py-3 ${i === 0 ? '' : 'border-t border-line-soft'}`}
            >
              <div className="flex h-11 w-9 shrink-0 items-center justify-center rounded bg-brand-tint font-sans text-[9px] font-extrabold text-brand">
                {r.formato === 'csv' ? 'CSV' : 'PDF'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-bold text-ink">
                  {formatRangeLabel({ start: r.periodoInicio, end: r.periodoFim })}
                </div>
                <div className="mt-0.5 truncate text-[10.5px] text-muted">
                  por {nomeById.get(r.administradorId ?? -1) ?? 'administrador'} · {relativeTime(r.dataGeracao)}
                </div>
              </div>
              <span className="shrink-0 rounded-lg bg-brand-tint px-2 py-0.5 text-[9.5px] font-bold text-brand">
                {FORMATO_LABEL[r.formato].toUpperCase()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
