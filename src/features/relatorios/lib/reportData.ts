import type { Endereco } from '../../../shared/api/types';
import {
  computeFunnel,
  computeKpis,
  computeRegionBars,
  computeStatusBreakdown,
  type FunnelStep,
  type Kpi,
  type PeriodData,
  type RegionBar,
  type StatusSlice,
} from '../../../shared/lib/metrics';

export type ReportSectionId = 'kpis' | 'funnel' | 'region' | 'status' | 'nutrizes';

export const REPORT_SECTIONS: { id: ReportSectionId; label: string; defaultOn: boolean }[] = [
  { id: 'kpis', label: 'Indicadores principais (Alcance · Engajamento · Conversão)', defaultOn: true },
  { id: 'funnel', label: 'Funil de conversão completo', defaultOn: true },
  { id: 'region', label: 'Segmentação por região', defaultOn: true },
  { id: 'status', label: 'Nutrizes por status de cadastro', defaultOn: true },
  { id: 'nutrizes', label: 'Lista detalhada de nutrizes (anexo CSV)', defaultOn: false },
];

export { filterByPeriod } from '../../../shared/lib/metrics';

export type ReportSummary = {
  kpis: Kpi[];
  funnel: FunnelStep[];
  region: RegionBar[];
  status: StatusSlice[];
  cadastrosNoPeriodo: number;
  cadastrosPeriodoAnterior: number;
  variacaoCadastros: number | null;
};

export function computeReportSummary(
  atual: PeriodData,
  anterior: PeriodData,
  enderecos: Endereco[],
): ReportSummary {
  const cadastrosNoPeriodo = atual.nutrizes.length;
  const cadastrosPeriodoAnterior = anterior.nutrizes.length;
  const variacaoCadastros =
    cadastrosPeriodoAnterior > 0
      ? ((cadastrosNoPeriodo - cadastrosPeriodoAnterior) / cadastrosPeriodoAnterior) * 100
      : null;

  return {
    kpis: computeKpis(atual.nutrizes, atual.campanhas, atual.doacoes),
    funnel: computeFunnel(atual.campanhas, atual.nutrizes, atual.doacoes),
    region: computeRegionBars(atual.nutrizes, enderecos),
    status: computeStatusBreakdown(atual.nutrizes),
    cadastrosNoPeriodo,
    cadastrosPeriodoAnterior,
    variacaoCadastros,
  };
}
