import { useMemo, useState } from 'react';
import { AdminTopbar } from '../../../shared/layout/AdminTopbar';
import {
  useAdministradores,
  useCampanhas,
  useCreateRelatorioGerado,
  useDoacoes,
  useEnderecos,
  useNutrizes,
  useRelatoriosGerados,
} from '../../../shared/api/queries';
import { getAdminId } from '../../../shared/api/auth';
import type { RelatorioFormato, RelatorioGerado } from '../../../shared/api/types';
import { GeneratorCard } from '../components/GeneratorCard';
import { HistoryPanel } from '../components/HistoryPanel';
import { type DateRange, type PeriodPreset, previousPeriod, resolvePeriod } from '../../../shared/lib/period';
import { computeReportSummary, filterByPeriod, REPORT_SECTIONS, type ReportSectionId } from '../lib/reportData';
import { buildCsv, buildPdf, computeNutrizRows, downloadFile, reportFilename } from '../lib/reportExport';

export function RelatoriosPage() {
  const nutrizes = useNutrizes();
  const doacoes = useDoacoes();
  const campanhas = useCampanhas();
  const enderecos = useEnderecos();
  const administradores = useAdministradores();
  const relatoriosGerados = useRelatoriosGerados();
  const createRelatorio = useCreateRelatorioGerado();

  const [preset, setPreset] = useState<PeriodPreset>('este-mes');
  const [customRange, setCustomRange] = useState<DateRange>(() => resolvePeriod('este-mes'));
  const [sections, setSections] = useState<Set<ReportSectionId>>(
    () => new Set(REPORT_SECTIONS.filter((s) => s.defaultOn).map((s) => s.id)),
  );
  const [formato, setFormato] = useState<RelatorioFormato>('pdf_completo');

  function toggleSection(id: ReportSectionId) {
    setSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const isLoading =
    nutrizes.isLoading || doacoes.isLoading || campanhas.isLoading || enderecos.isLoading;
  const isError = nutrizes.isError || doacoes.isError || campanhas.isError || enderecos.isError;

  const range = useMemo(() => resolvePeriod(preset, customRange), [preset, customRange]);

  const summary = useMemo(() => {
    if (!nutrizes.data || !doacoes.data || !campanhas.data || !enderecos.data) return null;
    const atual = filterByPeriod(nutrizes.data, doacoes.data, campanhas.data, range);
    const anterior = filterByPeriod(nutrizes.data, doacoes.data, campanhas.data, previousPeriod(range));
    return computeReportSummary(atual, anterior, enderecos.data);
  }, [nutrizes.data, doacoes.data, campanhas.data, enderecos.data, range]);

  if (isLoading) {
    return (
      <>
        <AdminTopbar title="Relatórios" subtitle="Carregando dados…" />
        <div className="flex-1 p-7 text-sm text-muted">Carregando…</div>
      </>
    );
  }

  if (isError || !summary) {
    return (
      <>
        <AdminTopbar title="Relatórios" subtitle="Não foi possível carregar os dados" />
        <div className="flex-1 p-7 text-sm text-error">
          Erro ao consultar o backend. Confirme se a API está rodando em{' '}
          <code>{import.meta.env.VITE_API_URL}</code>.
        </div>
      </>
    );
  }

  function buildAndDownload(targetRange: DateRange, targetSections: Set<ReportSectionId>, targetFormato: RelatorioFormato) {
    const atual = filterByPeriod(nutrizes.data!, doacoes.data!, campanhas.data!, targetRange);
    const anterior = filterByPeriod(nutrizes.data!, doacoes.data!, campanhas.data!, previousPeriod(targetRange));
    const targetSummary = computeReportSummary(atual, anterior, enderecos.data!);
    const nutrizRows = computeNutrizRows(atual.nutrizes, doacoes.data!, enderecos.data!);

    if (targetFormato === 'csv') {
      const csv = buildCsv(targetRange, targetSections, targetSummary, nutrizRows);
      downloadFile(reportFilename(targetRange, targetFormato), csv, 'text/csv;charset=utf-8');
    } else {
      buildPdf(targetRange, targetFormato, targetSections, targetSummary, nutrizRows);
    }
  }

  function handleGenerate() {
    buildAndDownload(range, sections, formato);

    const adminId = getAdminId();
    if (adminId) {
      createRelatorio.mutate({
        periodoInicio: range.start,
        periodoFim: range.end,
        secoesIncluidas: [...sections].join(','),
        formato,
        administradorId: adminId,
      });
    }
  }

  function handleRedownload(relatorio: RelatorioGerado) {
    const targetRange: DateRange = { start: relatorio.periodoInicio, end: relatorio.periodoFim };
    const targetSections = new Set(relatorio.secoesIncluidas.split(',').filter(Boolean) as ReportSectionId[]);
    buildAndDownload(targetRange, targetSections, relatorio.formato);
  }

  return (
    <>
      <AdminTopbar title="Relatórios" subtitle="Exporte os indicadores do painel por período" />
      <div className="flex-1 overflow-auto p-7">
        <div className="grid grid-cols-[1.4fr_1fr] gap-5">
          <GeneratorCard
            preset={preset}
            onPresetChange={setPreset}
            customRange={customRange}
            onCustomRangeChange={setCustomRange}
            sections={sections}
            onToggleSection={toggleSection}
            formato={formato}
            onFormatoChange={setFormato}
            onGenerate={handleGenerate}
            isGenerating={createRelatorio.isPending}
          />
          <HistoryPanel
            summary={summary}
            relatorios={relatoriosGerados.data ?? []}
            administradores={administradores.data ?? []}
            onDownload={handleRedownload}
          />
        </div>
      </div>
    </>
  );
}
