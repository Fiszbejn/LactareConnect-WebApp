import { AdminTopbar } from '../../../shared/layout/AdminTopbar';
import { Donut } from '../../../shared/charts/Donut';
import { useCampanhas, useDoacoes, useEnderecos, useNutrizes } from '../api/queries';
import { computeFunnel, computeKpis, computeRegionBars, computeStatusBreakdown } from '../lib/metrics';
import { KPICard } from '../components/KPICard';
import { ConversionFunnel } from '../components/ConversionFunnel';
import { RegionBars } from '../components/RegionBars';

export function DashboardPage() {
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
  const funnel = computeFunnel(campanhas.data!, nutrizes.data!, doacoes.data!);
  const regions = computeRegionBars(nutrizes.data!, enderecos.data!);
  const statusBreakdown = computeStatusBreakdown(nutrizes.data!);
  const totalNutrizes = nutrizes.data!.length;
  const totalAprovadas = nutrizes.data!.filter((n) => n.status === 'aprovada').length;

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
            <div className="mb-5 font-sans text-[15px] font-extrabold text-ink">Funil de conversão</div>
            <ConversionFunnel steps={funnel} />
          </div>
          <div className="flex min-h-[420px] flex-col rounded-2xl border border-line bg-white p-6">
            <div className="mb-5 font-sans text-[15px] font-extrabold text-ink">Segmentação por região</div>
            {regions.length > 0 ? (
              <RegionBars regions={regions} />
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
