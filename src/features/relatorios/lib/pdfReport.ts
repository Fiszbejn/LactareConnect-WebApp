import { jsPDF } from 'jspdf';
import type { RelatorioFormato } from '../../../shared/api/types';
import type { FunnelStep, Kpi, RegionBar, StatusSlice } from '../../../shared/lib/metrics';
import { type DateRange, formatRangeLabel } from './period';
import type { ReportSectionId, ReportSummary } from './reportData';
import type { NutrizRow } from './reportExport';

const THEME = {
  brand: [0, 69, 139],
  brandLight: [84, 178, 227],
  brandTint: [234, 244, 251],
  ink: [26, 26, 26],
  muted: [107, 107, 107],
  faint: [154, 154, 154],
  lineSoft: [232, 232, 229],
  ok: [27, 127, 121],
  okBg: [232, 244, 242],
  pending: [160, 116, 24],
  pendingBg: [255, 247, 232],
  amber: [242, 179, 61],
  white: [255, 255, 255],
  rowAlt: [250, 250, 247],
} as const;

const STATUS_BADGE: Record<string, { bg: readonly number[]; fg: readonly number[]; label: string }> = {
  aprovada: { bg: THEME.okBg, fg: THEME.ok, label: 'Ativa' },
  pendente: { bg: THEME.pendingBg, fg: THEME.pending, label: 'Pendente' },
  inativa: { bg: THEME.lineSoft, fg: THEME.muted, label: 'Inativa' },
};

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 14;
const CONTENT_W = PAGE_W - MARGIN * 2;

type Ctx = { doc: jsPDF; y: number };

function fill(doc: jsPDF, rgb: readonly number[]) {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
}
function stroke(doc: jsPDF, rgb: readonly number[]) {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
}
function ink(doc: jsPDF, rgb: readonly number[]) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}

function newPage(ctx: Ctx) {
  ctx.doc.addPage();
  ctx.y = MARGIN;
}

function ensureSpace(ctx: Ctx, height: number) {
  if (ctx.y + height > PAGE_H - MARGIN - 8) newPage(ctx);
}

function drawHeader(ctx: Ctx, range: DateRange) {
  const { doc } = ctx;
  fill(doc, THEME.brand);
  doc.rect(0, 0, PAGE_W, 32, 'F');
  ink(doc, THEME.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.text('Relatório LactareConnect', MARGIN, 17);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(
    `Período: ${formatRangeLabel(range)}  ·  Gerado em ${new Date().toLocaleString('pt-BR')}`,
    MARGIN,
    25,
  );
  ctx.y = 42;
  ink(doc, THEME.ink);
}

function sectionHeading(ctx: Ctx, title: string) {
  ensureSpace(ctx, 14);
  const { doc } = ctx;
  ink(doc, THEME.ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(title, MARGIN, ctx.y);
  ctx.y += 3;
  stroke(doc, THEME.lineSoft);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, ctx.y, MARGIN + CONTENT_W, ctx.y);
  ctx.y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
}

function drawKpiCards(ctx: Ctx, kpis: Kpi[]) {
  sectionHeading(ctx, 'Indicadores principais');
  const { doc } = ctx;
  const gap = 5;
  const cardW = (CONTENT_W - gap * 2) / 3;
  const cardH = 28;
  ensureSpace(ctx, cardH + 4);
  const accents = [THEME.brand, THEME.brandLight, THEME.ok];

  kpis.slice(0, 3).forEach((kpi, i) => {
    const x = MARGIN + i * (cardW + gap);
    const y = ctx.y;
    stroke(doc, THEME.lineSoft);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, cardW, cardH, 2, 2, 'S');
    fill(doc, accents[i]);
    doc.rect(x, y, 1.4, cardH, 'F');

    ink(doc, THEME.muted);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(kpi.label.toUpperCase(), x + 5, y + 7, { maxWidth: cardW - 8 });

    ink(doc, THEME.ink);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(kpi.value, x + 5, y + 16);

    ink(doc, THEME.muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const hintLines = doc.splitTextToSize(kpi.hint, cardW - 8).slice(0, 2);
    doc.text(hintLines, x + 5, y + 21);
  });

  ctx.y += cardH + 10;
}

function drawFunnel(ctx: Ctx, steps: FunnelStep[]) {
  sectionHeading(ctx, 'Funil de conversão');
  const { doc } = ctx;
  const max = Math.max(...steps.map((s) => s.value), 1);
  const labelW = 50;
  const rateW = 12;
  const barW = CONTENT_W - labelW - rateW;
  const barH = 8;
  const colors = [THEME.brandLight, THEME.brandLight, THEME.ok, THEME.brand, THEME.amber];

  steps.forEach((step, i) => {
    ensureSpace(ctx, barH + 4);
    const y = ctx.y;

    ink(doc, THEME.muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const labelLines = doc.splitTextToSize(step.label, labelW - 2);
    doc.text(labelLines[0], MARGIN, y + barH / 2 + 1.3);

    fill(doc, THEME.lineSoft);
    doc.roundedRect(MARGIN + labelW, y, barW, barH, 1.5, 1.5, 'F');
    const pct = step.value / max;
    const fillW = Math.max(barW * pct, barH);
    fill(doc, colors[i % colors.length]);
    doc.roundedRect(MARGIN + labelW, y, Math.min(fillW, barW), barH, 1.5, 1.5, 'F');

    ink(doc, THEME.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(step.value.toLocaleString('pt-BR'), MARGIN + labelW + 3, y + barH / 2 + 1.5);

    const prev = i > 0 ? steps[i - 1].value : null;
    const rate = prev ? Math.round((step.value / prev) * 100) : null;
    ink(doc, THEME.muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(rate !== null ? `${rate}%` : '—', MARGIN + CONTENT_W, y + barH / 2 + 1.3, { align: 'right' });

    ctx.y += barH + 4;
  });

  ctx.y += 6;
}

function drawRegion(ctx: Ctx, regions: RegionBar[]) {
  sectionHeading(ctx, 'Segmentação por região');
  const { doc } = ctx;

  if (regions.length === 0) {
    ink(doc, THEME.muted);
    doc.setFontSize(9.5);
    doc.text('Nenhuma nutriz com endereço cadastrado no período.', MARGIN, ctx.y);
    ctx.y += 8;
    return;
  }

  const max = Math.max(...regions.map((r) => r.total), 1);
  const barH = 5;

  regions.forEach((r) => {
    ensureSpace(ctx, barH + 10);
    const pct = r.total > 0 ? Math.round((r.active / r.total) * 100) : 0;

    ink(doc, THEME.ink);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(r.name, MARGIN, ctx.y);

    ink(doc, THEME.muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`${r.active} ativas · ${pct}% aprovação`, MARGIN + CONTENT_W, ctx.y, { align: 'right' });

    ctx.y += 3;
    fill(doc, THEME.brandTint);
    doc.roundedRect(MARGIN, ctx.y, CONTENT_W, barH, 1, 1, 'F');
    const totalW = (r.total / max) * CONTENT_W;
    fill(doc, [200, 224, 242]);
    doc.roundedRect(MARGIN, ctx.y, Math.max(totalW, 2), barH, 1, 1, 'F');
    const activeW = (r.active / max) * CONTENT_W;
    fill(doc, THEME.brand);
    if (activeW > 0) doc.roundedRect(MARGIN, ctx.y, Math.max(activeW, 2), barH, 1, 1, 'F');

    ctx.y += barH + 6;
  });

  ctx.y += 2;
}

function drawStatus(ctx: Ctx, status: StatusSlice[]) {
  sectionHeading(ctx, 'Nutrizes por status de cadastro');
  const { doc } = ctx;
  const total = status.reduce((sum, s) => sum + s.value, 0) || 1;
  const colorFor: Record<string, readonly number[]> = {
    Aprovadas: THEME.ok,
    Pendentes: THEME.pending,
    Inativas: THEME.faint,
  };

  ensureSpace(ctx, 10 + status.length * 6);
  const barH = 8;
  let x = MARGIN;
  status.forEach((s) => {
    const w = (s.value / total) * CONTENT_W;
    fill(doc, colorFor[s.label] ?? THEME.muted);
    doc.rect(x, ctx.y, Math.max(w, 0), barH, 'F');
    x += w;
  });
  ctx.y += barH + 7;

  status.forEach((s) => {
    fill(doc, colorFor[s.label] ?? THEME.muted);
    doc.rect(MARGIN, ctx.y - 3, 3, 3, 'F');
    ink(doc, THEME.ink);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`${s.label}: ${s.value}`, MARGIN + 6, ctx.y);
    ctx.y += 6;
  });

  ctx.y += 3;
}

const NUTRIZ_COLS = [
  { label: 'NOME', w: 56 },
  { label: 'CIDADE · UF', w: 38 },
  { label: 'STATUS', w: 24 },
  { label: 'DOAÇÕES', w: 24 },
  { label: 'ÚLTIMA COLETA', w: CONTENT_W - 56 - 38 - 24 - 24 },
];

function drawNutrizTableHeader(ctx: Ctx) {
  const { doc } = ctx;
  const rowH = 7;
  fill(doc, THEME.brandTint);
  doc.rect(MARGIN, ctx.y, CONTENT_W, rowH, 'F');
  ink(doc, THEME.muted);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  let x = MARGIN + 3;
  for (const col of NUTRIZ_COLS) {
    doc.text(col.label, x, ctx.y + rowH / 2 + 1.3);
    x += col.w;
  }
  ctx.y += rowH;
}

function drawNutrizTable(ctx: Ctx, rows: NutrizRow[]) {
  sectionHeading(ctx, 'Lista detalhada de nutrizes');
  const { doc } = ctx;

  if (rows.length === 0) {
    ink(doc, THEME.muted);
    doc.setFontSize(9.5);
    doc.text('Nenhuma nutriz cadastrada no período.', MARGIN, ctx.y);
    ctx.y += 8;
    return;
  }

  const rowH = 7;
  ensureSpace(ctx, rowH * 2);
  drawNutrizTableHeader(ctx);

  rows.forEach((n, i) => {
    if (ctx.y + rowH > PAGE_H - MARGIN - 8) {
      newPage(ctx);
      drawNutrizTableHeader(ctx);
    }
    if (i % 2 === 1) {
      fill(doc, THEME.rowAlt);
      doc.rect(MARGIN, ctx.y, CONTENT_W, rowH, 'F');
    }

    let x = MARGIN + 3;
    ink(doc, THEME.ink);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(n.nome, x, ctx.y + rowH / 2 + 1.3, { maxWidth: NUTRIZ_COLS[0].w - 6 });
    x += NUTRIZ_COLS[0].w;

    ink(doc, THEME.muted);
    doc.text(`${n.cidade}/${n.uf}`, x, ctx.y + rowH / 2 + 1.3, { maxWidth: NUTRIZ_COLS[1].w - 6 });
    x += NUTRIZ_COLS[1].w;

    const badge = STATUS_BADGE[n.status] ?? STATUS_BADGE.pendente;
    const badgeW = NUTRIZ_COLS[2].w - 8;
    fill(doc, badge.bg);
    doc.roundedRect(x, ctx.y + 1.3, badgeW, rowH - 2.6, 1.2, 1.2, 'F');
    ink(doc, badge.fg);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text(badge.label, x + badgeW / 2, ctx.y + rowH / 2 + 1.1, { align: 'center' });
    x += NUTRIZ_COLS[2].w;

    ink(doc, THEME.ink);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(String(n.doacoes), x + NUTRIZ_COLS[3].w - 6, ctx.y + rowH / 2 + 1.3, { align: 'right' });
    x += NUTRIZ_COLS[3].w;

    ink(doc, THEME.muted);
    doc.text(
      n.ultimaColeta ? new Date(n.ultimaColeta).toLocaleDateString('pt-BR') : '—',
      x + NUTRIZ_COLS[4].w - 6,
      ctx.y + rowH / 2 + 1.3,
      { align: 'right' },
    );

    ctx.y += rowH;
    stroke(doc, THEME.lineSoft);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, ctx.y, MARGIN + CONTENT_W, ctx.y);
  });

  ctx.y += 8;
}

function drawFooters(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    stroke(doc, THEME.lineSoft);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, PAGE_H - 14, MARGIN + CONTENT_W, PAGE_H - 14);
    ink(doc, THEME.faint);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('LactareConnect · Painel administrativo', MARGIN, PAGE_H - 9);
    doc.text(`Página ${i} de ${pageCount}`, MARGIN + CONTENT_W, PAGE_H - 9, { align: 'right' });
  }
}

export function buildPdfDocument(
  range: DateRange,
  formato: RelatorioFormato,
  sections: Set<ReportSectionId>,
  summary: ReportSummary,
  nutrizRows: NutrizRow[],
) {
  const doc = new jsPDF();
  const ctx: Ctx = { doc, y: 42 };

  drawHeader(ctx, range);

  if (sections.has('kpis')) drawKpiCards(ctx, summary.kpis);

  if (formato !== 'pdf_resumo') {
    if (sections.has('funnel')) drawFunnel(ctx, summary.funnel);
    if (sections.has('region')) drawRegion(ctx, summary.region);
    if (sections.has('status')) drawStatus(ctx, summary.status);
    if (sections.has('nutrizes')) drawNutrizTable(ctx, nutrizRows);
  }

  drawFooters(doc);
  return doc;
}
