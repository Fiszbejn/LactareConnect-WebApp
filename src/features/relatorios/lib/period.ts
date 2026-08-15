export type PeriodPreset =
  | 'ultimos-7-dias'
  | 'ultimos-30-dias'
  | 'este-mes'
  | 'mes-passado'
  | 'trimestre-atual'
  | 'personalizado';

export const PERIOD_PRESETS: { value: PeriodPreset; label: string }[] = [
  { value: 'ultimos-7-dias', label: 'Últimos 7 dias' },
  { value: 'ultimos-30-dias', label: 'Últimos 30 dias' },
  { value: 'este-mes', label: 'Este mês' },
  { value: 'mes-passado', label: 'Mês passado' },
  { value: 'trimestre-atual', label: 'Trimestre atual' },
  { value: 'personalizado', label: 'Personalizado' },
];

export type DateRange = { start: string; end: string };

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function resolvePeriod(preset: PeriodPreset, custom?: DateRange): DateRange {
  const today = startOfDay(new Date());

  if (preset === 'personalizado') {
    return custom ?? { start: toIsoDate(today), end: toIsoDate(today) };
  }

  if (preset === 'ultimos-7-dias') {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    return { start: toIsoDate(start), end: toIsoDate(today) };
  }

  if (preset === 'ultimos-30-dias') {
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    return { start: toIsoDate(start), end: toIsoDate(today) };
  }

  if (preset === 'este-mes') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { start: toIsoDate(start), end: toIsoDate(today) };
  }

  if (preset === 'mes-passado') {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 0);
    return { start: toIsoDate(start), end: toIsoDate(end) };
  }

  const quarter = Math.floor(today.getMonth() / 3);
  const start = new Date(today.getFullYear(), quarter * 3, 1);
  return { start: toIsoDate(start), end: toIsoDate(today) };
}

export function previousPeriod({ start, end }: DateRange): DateRange {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  const lengthDays = Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1;

  const prevEnd = new Date(startDate);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - (lengthDays - 1));

  return { start: toIsoDate(prevStart), end: toIsoDate(prevEnd) };
}

export function inRange(iso: string, range: DateRange) {
  const day = iso.slice(0, 10);
  return day >= range.start && day <= range.end;
}

export function formatRangeLabel(range: DateRange) {
  const fmt = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('pt-BR');
  return `${fmt(range.start)} – ${fmt(range.end)}`;
}
