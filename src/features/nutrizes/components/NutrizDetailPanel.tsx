import type {
  Agendamento,
  Doacao,
  Endereco,
  ExamePreDoacao,
  Nutriz,
  Recompensa,
  RegiaoAtendimento,
  Resgate,
} from '../../../shared/api/types';
import {
  computeActivityFeed,
  computeAge,
  computeExameChecklist,
  computeNutrizStats,
  computeUltimaRegiao,
  formatDate,
  initials,
} from '../lib/nutrizDetail';

const STATUS_LABEL: Record<Nutriz['status'], string> = {
  aprovada: 'ativa',
  pendente: 'pendente',
  inativa: 'inativa',
};

type Props = {
  nutriz: Nutriz | null;
  enderecos: Endereco[];
  doacoes: Doacao[];
  agendamentos: Agendamento[];
  regioes: RegiaoAtendimento[];
  exames: ExamePreDoacao[];
  resgates: Resgate[];
  recompensas: Recompensa[];
};

export function NutrizDetailPanel({
  nutriz,
  enderecos,
  doacoes,
  agendamentos,
  regioes,
  exames,
  resgates,
  recompensas,
}: Props) {
  if (!nutriz) {
    return (
      <div className="flex w-[360px] shrink-0 items-center justify-center bg-white p-8 text-center font-sans text-[12px] text-muted">
        Selecione uma nutriz na lista pra ver os detalhes.
      </div>
    );
  }

  const endereco = enderecos.find((e) => e.nutrizId === nutriz.id);
  const stats = computeNutrizStats(nutriz.id, doacoes);
  const checklist = computeExameChecklist(nutriz.id, exames);
  const okCount = checklist.filter((c) => c.status === 'ok').length;
  const ultimaRegiao = computeUltimaRegiao(nutriz.id, agendamentos, regioes);
  const atividade = computeActivityFeed(nutriz, doacoes, resgates, exames, recompensas);

  const info: [string, string][] = [
    ['CPF', nutriz.cpf],
    ['Idade', `${computeAge(nutriz.dataNascimento)} anos`],
    ['Telefone', nutriz.telefone],
    ['Endereço', endereco ? `${endereco.rua}, ${endereco.numero} · ${endereco.bairro}` : 'Não informado'],
    ['Última coleta em', ultimaRegiao ?? 'Sem agendamentos registrados'],
  ];

  return (
    <div className="w-[360px] shrink-0 overflow-auto bg-white">
      <div className="bg-gradient-to-br from-brand to-brand-light px-[22px] py-6 text-white">
        <div className="flex items-center gap-3.5">
          <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full border-2 border-white/60 bg-white/20 font-sans text-lg font-extrabold">
            {initials(nutriz.nome)}
          </div>
          <div>
            <div className="font-sans text-[17px] font-extrabold">{nutriz.nome}</div>
            <div className="mt-0.5 font-sans text-[11.5px] opacity-90">
              Doadora {STATUS_LABEL[nutriz.status]} · cadastrada em {formatDate(nutriz.dataCadastro)}
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-white/15 p-2.5">
            <div className="font-sans text-[17px] font-extrabold">{stats.coletas}</div>
            <div className="mt-0.5 font-sans text-[10px] opacity-85">coletas</div>
          </div>
          <div className="rounded-lg bg-white/15 p-2.5">
            <div className="font-sans text-[17px] font-extrabold">
              {stats.volumeLitros.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}L
            </div>
            <div className="mt-0.5 font-sans text-[10px] opacity-85">doados</div>
          </div>
          <div className="rounded-lg bg-white/15 p-2.5">
            <div className="font-sans text-[17px] font-extrabold">
              {nutriz.saldoGotinhas.toLocaleString('pt-BR')}
            </div>
            <div className="mt-0.5 font-sans text-[10px] opacity-85">gotinhas</div>
          </div>
        </div>
      </div>

      <div className="border-b border-line-soft px-[22px] py-[18px]">
        {info.map(([k, v], i) => (
          <div
            key={k}
            className={`flex items-start justify-between gap-3 py-2 ${i < info.length - 1 ? 'border-b border-line-soft' : ''}`}
          >
            <span className="shrink-0 font-sans text-[11.5px] text-muted">{k}</span>
            <span className="text-right font-sans text-[11.5px] font-semibold text-ink">{v}</span>
          </div>
        ))}
      </div>

      <div className="border-b border-line-soft px-[22px] py-[18px]">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="font-sans text-[11px] font-bold uppercase tracking-wide text-muted">
            Exames pré-doação
          </span>
          <span className="font-sans text-[11px] font-bold text-ok">
            {okCount}/{checklist.length} OK
          </span>
        </div>
        {checklist.map((c) => (
          <div key={c.tipo} className="flex items-center gap-2 py-1">
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full font-sans text-[9px] font-extrabold ${
                c.status === 'ok' ? 'bg-ok-bg text-ok' : 'bg-pending-bg text-pending'
              }`}
            >
              {c.status === 'ok' ? '✓' : '◷'}
            </span>
            <span className="font-sans text-[11.5px] text-ink">{c.label}</span>
          </div>
        ))}
      </div>

      <div className="px-[22px] py-[18px]">
        <div className="mb-3 font-sans text-[11px] font-bold uppercase tracking-wide text-muted">
          Atividade recente
        </div>
        {atividade.length === 0 && (
          <p className="font-sans text-[11.5px] text-muted">Nenhuma atividade registrada ainda.</p>
        )}
        {atividade.map((a, i) => (
          <div
            key={`${a.title}-${a.date}-${i}`}
            className={`flex gap-2.5 py-2 ${i < atividade.length - 1 ? 'border-b border-line-soft' : ''}`}
          >
            <span className={`mt-1.5 h-[7px] w-[7px] shrink-0 rounded-full ${i === 0 ? 'bg-brand' : 'bg-line'}`} />
            <div className="flex-1">
              <div className="font-sans text-[12px] font-semibold text-ink">{a.title}</div>
              <div className="mt-0.5 font-sans text-[10.5px] text-muted">
                {a.detail} · {formatDate(a.date)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
