import { useState } from 'react';
import { AdminTopbar } from '../../../shared/layout/AdminTopbar';
import {
  useAgendamentos,
  useDoacoes,
  useEnderecos,
  useExamesPreDoacao,
  useNutrizes,
  useRecompensas,
  useRegioesAtendimento,
  useResgates,
} from '../../../shared/api/queries';
import { NutrizListPanel } from '../components/NutrizListPanel';
import { NutrizDetailPanel } from '../components/NutrizDetailPanel';

export function NutrizesPage() {
  const nutrizes = useNutrizes();
  const enderecos = useEnderecos();
  const doacoes = useDoacoes();
  const agendamentos = useAgendamentos();
  const regioes = useRegioesAtendimento();
  const exames = useExamesPreDoacao();
  const resgates = useResgates();
  const recompensas = useRecompensas();

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const queries = [nutrizes, enderecos, doacoes, agendamentos, regioes, exames, resgates, recompensas];
  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);

  if (isLoading) {
    return (
      <>
        <AdminTopbar title="Nutrizes" subtitle="Carregando doadoras…" />
        <div className="flex-1 p-7 text-sm text-muted">Carregando…</div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <AdminTopbar title="Nutrizes" subtitle="Não foi possível carregar os dados" />
        <div className="flex-1 p-7 text-sm text-error">
          Erro ao consultar o backend. Confirme se a API está rodando em{' '}
          <code>{import.meta.env.VITE_API_URL}</code>.
        </div>
      </>
    );
  }

  const totalNutrizes = nutrizes.data!.length;
  const totalAprovadas = nutrizes.data!.filter((n) => n.status === 'aprovada').length;
  const selected = nutrizes.data!.find((n) => n.id === selectedId) ?? nutrizes.data![0] ?? null;

  return (
    <>
      <AdminTopbar
        title="Nutrizes"
        subtitle={`${totalNutrizes} nutrizes cadastradas · ${totalAprovadas} aprovadas`}
      />
      <div className="flex flex-1 overflow-hidden">
        <NutrizListPanel
          nutrizes={nutrizes.data!}
          enderecos={enderecos.data!}
          doacoes={doacoes.data!}
          selectedId={selected?.id ?? null}
          onSelect={setSelectedId}
        />
        <NutrizDetailPanel
          nutriz={selected}
          enderecos={enderecos.data!}
          doacoes={doacoes.data!}
          agendamentos={agendamentos.data!}
          regioes={regioes.data!}
          exames={exames.data!}
          resgates={resgates.data!}
          recompensas={recompensas.data!}
        />
      </div>
    </>
  );
}
