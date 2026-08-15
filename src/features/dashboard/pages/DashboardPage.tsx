import { useState } from 'react';
import { AdminTopbar } from '../../../shared/layout/AdminTopbar';
import { Donut } from '../../../shared/charts/Donut';
import { useCampanhas, useDoacoes, useEnderecos, useNutrizes } from '../api/queries';
import { computeFunnel, computeKpis, computeRegionBars, computeStatusBreakdown } from '../lib/metrics';
import { KPICard } from '../components/KPICard';
import { ConversionFunnel } from '../components/ConversionFunnel';
import { RegionBars } from '../components/RegionBars';

export function DashboardPage() {
  const [selectedUf, setSelectedUf] = useState<string | null>(null);
  const nutrizes = useNutrizes();
  const enderecos = useEnderecos();
  const doacoes = useDoacoes();
  const campanhas = useCampanhas();

  const isLoading = nutrizes.isLoading || enderecos.isLoading || doacoes.isLoading || campanhas.isLoading;
  const isError = nutrizes.isError || enderecos.isError || doacoes.isError || campanhas.isError;

  if (isLoading) {
    return (
      <>
        <AdminTopbar title="Dashboard" subtitle="Carregando indicadores…" />
        <div className="flex-1 p-7 text-sm text-muted">Carregando…</div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <AdminTopbar title="Dashboard" subtitle="Não foi possível carregar os dados" />
        <div className="flex-1 p-7 text-sm text-error">
          Erro ao consultar o backend. Confirme se a API está rodando em{' '}
          <code>{import.meta.env.VITE_API_URL}</code>.
        </div>
      </>
    );
  }

  const kpis = computeKpis(nutrizes.data!, campanhas.data!, doacoes.data!);
  const allRegions = computeRegionBars(nutrizes.data!, enderecos.data!);
  const regions = allRegions.slice(0, 6);
  const extraRegionsCount = allRegions.length - regions.length;
  const statusBreakdown = computeStatusBreakdown(nutrizes.data!);
  const totalNutrizes = nutrizes.data!.length;
  const totalAprovadas = nutrizes.data!.filter((n) => n.status === 'aprovada').length;

  const allUfs = [...new Set(enderecos.data!.map((e) => e.uf))].sort();
  const nutrizIdsInUf = selectedUf
    ? new Set(enderecos.data!.filter((e) => e.uf === selectedUf).map((e) => e.nutrizId))
    : null;
  const funnelNutrizes = nutrizIdsInUf
    ? nutrizes.data!.filter((n) => nutrizIdsInUf.has(n.id))
    : nutrizes.data!;
  const funnelDoacoes = nutrizIdsInUf
    ? doacoes.data!.filter((d) => nutrizIdsInUf.has(d.nutrizId))
    : doacoes.data!;
  const funnel = computeFunnel(campanhas.data!, funnelNutrizes, funnelDoacoes);

  return (
    <>
      <AdminTopbar
        title="Dashboard"
        subtitle={`${totalNutrizes} nutrizes cadastradas · ${totalAprovadas} aprovadas`}
      />
      <div className="flex-1 overflow-auto p-7">
        <div className="mb-5 flex gap-4">
          {kpis.map((kpi) => (
            <KPICard key={kpi.label} {...kpi} />
          ))}
        </div>

        <div className="mb-5 grid grid-cols-[1.4fr_1fr] gap-4">
          <div className="flex min-h-[420px] flex-col rounded-2xl border border-line bg-white p-6">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <div className="font-sans text-[15px] font-extrabold text-ink">Funil de conversão</div>
                <div className="mt-0.5 text-[11px] text-muted">Do alcance ao primeiro frasco doado.</div>
              </div>
              <select
                value={selectedUf ?? 'Geral'}
                onChange={(e) => setSelectedUf(e.target.value === 'Geral' ? null : e.target.value)}
                className="rounded-lg border border-line bg-white px-2.5 py-1 font-sans text-[11px] font-semibold text-ink"
              >
                <option value="Geral">Geral</option>
                {allUfs.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
            <ConversionFunnel steps={funnel} showNationalHint={selectedUf !== null} />
          </div>
          <div className="flex min-h-[420px] flex-col rounded-2xl border border-line bg-white p-6">
            <div className="mb-5 font-sans text-[15px] font-extrabold text-ink">Segmentação por região</div>
            {regions.length > 0 ? (
              <>
                <RegionBars regions={regions} />
                {extraRegionsCount > 0 && (
                  <div className="mt-3 text-[11px] text-muted">
                    +{extraRegionsCount} outro{extraRegionsCount > 1 ? 's' : ''} estado
                    {extraRegionsCount > 1 ? 's' : ''} com nutrizes cadastradas
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-muted">Nenhuma nutriz com endereço cadastrado ainda.</p>
            )}
          </div>
        </div>

        <div className="flex min-h-[320px] flex-col rounded-2xl border border-line bg-white p-6">
          <div className="mb-5 font-sans text-[15px] font-extrabold text-ink">
            Nutrizes por status de cadastro
          </div>
          {statusBreakdown.length > 0 ? (
            <div className="flex flex-1 items-center">
              <Donut
                segments={statusBreakdown}
                centerValue={String(totalNutrizes)}
                centerLabel="nutrizes"
              />
            </div>
          ) : (
            <p className="text-xs text-muted">Nenhuma nutriz cadastrada ainda.</p>
          )}
        </div>
      </div>
    </>
  );
}
