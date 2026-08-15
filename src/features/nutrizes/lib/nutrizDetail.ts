import type {
  Agendamento,
  Doacao,
  ExamePreDoacao,
  ExameTipo,
  Nutriz,
  Recompensa,
  RegiaoAtendimento,
  Resgate,
} from '../../../shared/api/types';

export const EXAME_LABELS: Record<ExameTipo, string> = {
  carteira_pre_natal: 'Carteira de pré-natal',
  hemograma: 'Hemograma',
  sorologias: 'Sorologias',
  htlv: 'HTLV',
  sorologia_hiv: 'Sorologia HIV',
  vdrl: 'VDRL',
  sorologia_hepatites_b_c: 'Sorologia Hepatites B/C',
};

// Únicos exigidos pelo backend pra liberar agendamento (AgendamentoService.EXAMES_OBRIGATORIOS)
const EXAME_ORDER: ExameTipo[] = ['hemograma', 'sorologia_hiv', 'vdrl', 'sorologia_hepatites_b_c'];

export function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR');
}

export function initials(nome: string) {
  return nome
    .split(' ')
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function computeAge(dataNascimento: string) {
  const birth = new Date(dataNascimento);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

export function computeNutrizStats(nutrizId: number, doacoes: Doacao[]) {
  const minhas = doacoes.filter((d) => d.nutrizId === nutrizId);
  const volumeMl = minhas.reduce((sum, d) => sum + d.volumeMl, 0);
  return { coletas: minhas.length, volumeLitros: volumeMl / 1000 };
}

export type ExameChecklistItem = { tipo: ExameTipo; label: string; status: ExamePreDoacao['status'] };

export function computeExameChecklist(nutrizId: number, exames: ExamePreDoacao[]): ExameChecklistItem[] {
  const byTipo = new Map(exames.filter((e) => e.nutrizId === nutrizId).map((e) => [e.tipoExame, e]));
  return EXAME_ORDER.map((tipo) => ({
    tipo,
    label: EXAME_LABELS[tipo],
    status: byTipo.get(tipo)?.status ?? 'faltando',
  }));
}

export function computeUltimaRegiao(
  nutrizId: number,
  agendamentos: Agendamento[],
  regioes: RegiaoAtendimento[],
) {
  const meus = agendamentos
    .filter((a) => a.nutrizId === nutrizId)
    .sort((a, b) => b.dataColeta.localeCompare(a.dataColeta));
  if (meus.length === 0) return null;
  const regiao = regioes.find((r) => r.id === meus[0].regiaoAtendimentoId);
  return regiao?.nome ?? null;
}

export type ActivityItem = { title: string; detail: string; date: string };

export function computeActivityFeed(
  nutriz: Nutriz,
  doacoes: Doacao[],
  resgates: Resgate[],
  exames: ExamePreDoacao[],
  recompensas: Recompensa[],
): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const d of doacoes.filter((x) => x.nutrizId === nutriz.id)) {
    items.push({
      title: 'Coleta realizada',
      detail: `${d.volumeMl} ml`,
      date: d.dataColeta,
    });
  }

  for (const r of resgates.filter((x) => x.nutrizId === nutriz.id)) {
    const recompensa = recompensas.find((rc) => rc.id === r.recompensaId);
    items.push({
      title: `Resgate: ${recompensa?.nome ?? 'Recompensa'}`,
      detail: r.status,
      date: r.data,
    });
  }

  for (const e of exames.filter((x) => x.nutrizId === nutriz.id && x.dataEnvio)) {
    items.push({
      title: `Exame enviado: ${EXAME_LABELS[e.tipoExame]}`,
      detail: e.status,
      date: e.dataEnvio as string,
    });
  }

  items.push({ title: 'Cadastro realizado', detail: nutriz.status, date: nutriz.dataCadastro });

  return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
}
