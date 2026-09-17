import type { Campanha, Doacao, Endereco, Nutriz } from '../api/types';
import { type DateRange, inRange } from './period';

export type PeriodData = {
  nutrizes: Nutriz[];
  doacoes: Doacao[];
  campanhas: Campanha[];
};

export function filterByPeriod(
  nutrizes: Nutriz[],
  doacoes: Doacao[],
  campanhas: Campanha[],
  range: DateRange,
): PeriodData {
  return {
    nutrizes: nutrizes.filter((n) => inRange(n.dataCadastro, range)),
    doacoes: doacoes.filter((d) => inRange(d.dataColeta, range)),
    campanhas: campanhas.filter((c) => inRange(c.dataEnvio, range)),
  };
}

function monthKey(iso: string) {
  return iso.slice(0, 7);
}

function lastMonths(count: number) {
  const now = new Date();
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return keys;
}

function monthlySeries(dates: string[], count = 6) {
  const buckets = new Map<string, number>();
  for (const date of dates) {
    const key = monthKey(date);
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return lastMonths(count).map((key) => buckets.get(key) ?? 0);
}

export type Kpi = {
  label: string;
  value: string;
  hint: string;
  accent: string;
  trend: number[];
};

export function computeKpis(nutrizes: Nutriz[], campanhas: Campanha[], doacoes: Doacao[]): Kpi[] {
  const totalAlcance = campanhas.reduce((sum, c) => sum + c.enviados, 0);
  const aprovadas = nutrizes.filter((n) => n.status === 'aprovada');
  const engajamento = nutrizes.length > 0 ? (aprovadas.length / nutrizes.length) * 100 : 0;
  const doadorasUnicas = new Set(doacoes.map((d) => d.nutrizId)).size;
  const conversao = aprovadas.length > 0 ? (doadorasUnicas / aprovadas.length) * 100 : 0;

  return [
    {
      label: 'Alcance — comunicações',
      value: totalAlcance.toLocaleString('pt-BR'),
      hint: 'Notificações entregues (push + e-mail + SMS) via campanhas',
      accent: 'var(--color-brand)',
      trend: monthlySeries(campanhas.map((c) => c.dataEnvio)),
    },
    {
      label: 'Engajamento — nutrizes',
      value: `${engajamento.toFixed(1)}%`,
      hint: `${aprovadas.length} aprovadas de ${nutrizes.length} cadastradas`,
      accent: 'var(--color-brand-light)',
      trend: monthlySeries(nutrizes.map((n) => n.dataCadastro)),
    },
    {
      label: 'Conversão — primeira doação',
      value: `${conversao.toFixed(1)}%`,
      hint: `${doadorasUnicas} doadoras com pelo menos 1 coleta`,
      accent: 'var(--color-ok)',
      trend: monthlySeries(doacoes.map((d) => d.dataColeta)),
    },
  ];
}

export type FunnelStep = { label: string; value: number };

export function computeFunnel(
  campanhas: Campanha[],
  nutrizes: Nutriz[],
  doacoes: Doacao[],
): FunnelStep[] {
  const enviados = campanhas.reduce((sum, c) => sum + c.enviados, 0);
  const cliques = campanhas.reduce((sum, c) => sum + c.cliques, 0);
  const aprovadas = nutrizes.filter((n) => n.status === 'aprovada').length;
  const doadorasUnicas = new Set(doacoes.map((d) => d.nutrizId)).size;

  return [
    { label: 'Alcance — comunicações entregues', value: enviados },
    { label: 'Cliques / visitas geradas', value: cliques },
    { label: 'Cadastros de nutrizes', value: nutrizes.length },
    { label: 'Cadastros aprovados', value: aprovadas },
    { label: 'Doadoras com 1ª coleta realizada', value: doadorasUnicas },
  ];
}

export type RegionBar = { name: string; active: number; total: number };

export function computeRegionBars(nutrizes: Nutriz[], enderecos: Endereco[]): RegionBar[] {
  const statusByNutriz = new Map(nutrizes.map((n) => [n.id, n.status]));
  const byUf = new Map<string, { active: number; total: number }>();

  for (const endereco of enderecos) {
    const status = statusByNutriz.get(endereco.nutrizId);
    if (!status) continue;
    const entry = byUf.get(endereco.uf) ?? { active: 0, total: 0 };
    entry.total += 1;
    if (status === 'aprovada') entry.active += 1;
    byUf.set(endereco.uf, entry);
  }

  return [...byUf.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.total - a.total);
}

export type StatusSlice = { label: string; value: number; color: string };

export function computeStatusBreakdown(nutrizes: Nutriz[]): StatusSlice[] {
  const counts = { aprovada: 0, pendente: 0, inativa: 0 };
  for (const n of nutrizes) counts[n.status] += 1;

  return [
    { label: 'Aprovadas', value: counts.aprovada, color: 'var(--color-ok)' },
    { label: 'Pendentes', value: counts.pendente, color: 'var(--color-pending)' },
    { label: 'Inativas', value: counts.inativa, color: 'var(--color-muted)' },
  ].filter((slice) => slice.value > 0);
}
