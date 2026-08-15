import { jsPDF } from 'jspdf';
import type { Doacao, Endereco, Nutriz, RelatorioFormato } from '../../../shared/api/types';
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
  const doc = new jsPDF();
  const marginX = 14;
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 20;

  function ensureSpace(lines = 1) {
    if (y + lines * 6 > pageHeight - 16) {
      doc.addPage();
      y = 20;
    }
  }

  function heading(text: string) {
    ensureSpace(2);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(text, marginX, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
  }

  function line(text: string) {
    ensureSpace();
    doc.text(text, marginX, y);
    y += 6;
  }

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório LactareConnect', marginX, y);
  y += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Período: ${formatRangeLabel(range)}`, marginX, y);
  y += 6;
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, marginX, y);
  y += 12;

  if (sections.has('kpis')) {
    heading('Indicadores principais');
    for (const k of summary.kpis) line(`${k.label}: ${k.value}  (${k.hint})`);
    y += 4;
  }

  if (formato === 'pdf_resumo') {
    doc.save(reportFilename(range, formato));
    return;
  }

  if (sections.has('funnel')) {
    heading('Funil de conversão');
    for (const f of summary.funnel) line(`${f.label}: ${f.value.toLocaleString('pt-BR')}`);
    y += 4;
  }

  if (sections.has('region')) {
    heading('Segmentação por região');
    if (summary.region.length === 0) line('Nenhuma nutriz com endereço cadastrado no período.');
    for (const r of summary.region) line(`${r.name}: ${r.active} ativas de ${r.total} cadastradas`);
    y += 4;
  }

  if (sections.has('status')) {
    heading('Nutrizes por status de cadastro');
    for (const s of summary.status) line(`${s.label}: ${s.value}`);
    y += 4;
  }

  if (sections.has('nutrizes')) {
    heading('Lista detalhada de nutrizes');
    if (nutrizRows.length === 0) line('Nenhuma nutriz cadastrada no período.');
    for (const n of nutrizRows) {
      ensureSpace();
      line(`${n.nome} · ${n.cidade}/${n.uf} · ${n.status} · ${n.doacoes} doações · última: ${n.ultimaColeta ?? '—'}`);
    }
  }

  doc.save(reportFilename(range, formato));
}

function reportFilename(range: DateRange, formato: RelatorioFormato) {
  const ext = formato === 'csv' ? 'csv' : 'pdf';
  return `relatorio-lactare-${range.start}-a-${range.end}.${ext}`;
}

export { reportFilename };
