import type { Doacao, Endereco, Nutriz, RelatorioFormato } from '../../../shared/api/types';
import { buildPdfDocument } from './pdfReport';
import type { ReportSectionId, ReportSummary } from './reportData';
import { type DateRange, formatRangeLabel } from './period';

export type NutrizRow = {
  nome: string;
  cpf: string;
  cidade: string;
  uf: string;
  status: string;
  doacoes: number;
  ultimaColeta: string | null;
};

export function computeNutrizRows(
  nutrizesPeriodo: Nutriz[],
  doacoesTodas: Doacao[],
  enderecos: Endereco[],
): NutrizRow[] {
  const enderecoByNutriz = new Map(enderecos.map((e) => [e.nutrizId, e]));
  return nutrizesPeriodo.map((n) => {
    const minhas = doacoesTodas.filter((d) => d.nutrizId === n.id);
    const ultimaColeta =
      minhas.length > 0 ? [...minhas].map((d) => d.dataColeta).sort().at(-1)! : null;
    const endereco = enderecoByNutriz.get(n.id);
    return {
      nome: n.nome,
      cpf: n.cpf,
      cidade: endereco?.cidade ?? '—',
      uf: endereco?.uf ?? '—',
      status: n.status,
      doacoes: minhas.length,
      ultimaColeta,
    };
  });
}

function csvEscape(value: string | number) {
  const str = String(value);
  return /[";\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function csvRow(values: (string | number)[]) {
  return values.map(csvEscape).join(';');
}

export function buildCsv(
  range: DateRange,
  sections: Set<ReportSectionId>,
  summary: ReportSummary,
  nutrizRows: NutrizRow[],
) {
  const blocks: string[] = [];

  blocks.push(
    ['Relatório LactareConnect', formatRangeLabel(range)].join('\n') +
      '\n' +
      csvRow(['gerado em', new Date().toLocaleString('pt-BR')]),
  );

  if (sections.has('kpis')) {
    blocks.push(
      [csvRow(['indicador', 'valor', 'detalhe']), ...summary.kpis.map((k) => csvRow([k.label, k.value, k.hint]))].join(
        '\n',
      ),
    );
  }

  if (sections.has('funnel')) {
    blocks.push(
      [csvRow(['etapa do funil', 'valor']), ...summary.funnel.map((f) => csvRow([f.label, f.value]))].join('\n'),
    );
  }

  if (sections.has('region')) {
    blocks.push(
      [
        csvRow(['uf', 'nutrizes aprovadas', 'nutrizes total']),
        ...summary.region.map((r) => csvRow([r.name, r.active, r.total])),
      ].join('\n'),
    );
  }

  if (sections.has('status')) {
    blocks.push(
      [csvRow(['status', 'quantidade']), ...summary.status.map((s) => csvRow([s.label, s.value]))].join('\n'),
    );
  }

  if (sections.has('nutrizes')) {
    blocks.push(
      [
        csvRow(['nome', 'cpf', 'cidade', 'uf', 'status', 'doações', 'última coleta']),
        ...nutrizRows.map((n) =>
          csvRow([n.nome, n.cpf, n.cidade, n.uf, n.status, n.doacoes, n.ultimaColeta ?? '—']),
        ),
      ].join('\n'),
    );
  }

  return '﻿' + blocks.join('\n\n');
}

export function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function buildPdf(
  range: DateRange,
  formato: RelatorioFormato,
  sections: Set<ReportSectionId>,
  summary: ReportSummary,
  nutrizRows: NutrizRow[],
) {
  const doc = buildPdfDocument(range, formato, sections, summary, nutrizRows);
  doc.save(reportFilename(range, formato));
}

function reportFilename(range: DateRange, formato: RelatorioFormato) {
  const ext = formato === 'csv' ? 'csv' : 'pdf';
  return `relatorio-lactare-${range.start}-a-${range.end}.${ext}`;
}

export { reportFilename };
