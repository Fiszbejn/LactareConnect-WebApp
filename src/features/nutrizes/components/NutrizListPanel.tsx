import { useMemo, useState } from 'react';
import type { Doacao, Endereco, Nutriz, NutrizStatus } from '../../../shared/api/types';
import { formatDate, initials } from '../lib/nutrizDetail';

const STATUS_TAG: Record<NutrizStatus, { className: string; label: string }> = {
  aprovada: { className: 'bg-ok-bg text-ok', label: 'Ativa' },
  pendente: { className: 'bg-pending-bg text-pending', label: 'Pendente' },
  inativa: { className: 'bg-line-soft text-muted', label: 'Inativa' },
};

const PAGE_SIZE = 12;

type Props = {
  nutrizes: Nutriz[];
  enderecos: Endereco[];
  doacoes: Doacao[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

export function NutrizListPanel({ nutrizes, enderecos, doacoes, selectedId, onSelect }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todas' | NutrizStatus>('todas');
  const [ufFilter, setUfFilter] = useState('todas');
  const [onlyWithDoacoes, setOnlyWithDoacoes] = useState(false);
  const [page, setPage] = useState(1);

  const enderecoByNutriz = useMemo(() => new Map(enderecos.map((e) => [e.nutrizId, e])), [enderecos]);

  const doacoesByNutriz = useMemo(() => {
    const map = new Map<number, Doacao[]>();
    for (const d of doacoes) {
      const list = map.get(d.nutrizId) ?? [];
      list.push(d);
      map.set(d.nutrizId, list);
    }
    return map;
  }, [doacoes]);

  const allUfs = useMemo(() => [...new Set(enderecos.map((e) => e.uf))].sort(), [enderecos]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return nutrizes.filter((n) => {
      const endereco = enderecoByNutriz.get(n.id);
      if (term) {
        const haystack = `${n.nome} ${n.cpf} ${n.telefone} ${endereco?.cidade ?? ''}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (statusFilter !== 'todas' && n.status !== statusFilter) return false;
      if (ufFilter !== 'todas' && endereco?.uf !== ufFilter) return false;
      if (onlyWithDoacoes && (doacoesByNutriz.get(n.id)?.length ?? 0) === 0) return false;
      return true;
    });
  }, [nutrizes, enderecoByNutriz, doacoesByNutriz, search, statusFilter, ufFilter, onlyWithDoacoes]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function updateFilter<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  return (
    <div className="flex flex-[1.3] flex-col overflow-hidden border-r border-line-soft">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line-soft bg-white px-6 py-4">
        <div className="flex h-[38px] min-w-[220px] flex-1 items-center gap-2 rounded-lg bg-bg px-3">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--color-faint)" strokeWidth="1.6">
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11l4 4" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={(e) => updateFilter(setSearch)(e.target.value)}
            placeholder="Buscar por nome, CPF, telefone ou cidade…"
            className="w-full bg-transparent font-sans text-[12.5px] text-ink placeholder:text-faint focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => updateFilter(setStatusFilter)(e.target.value as 'todas' | NutrizStatus)}
          className="h-[38px] rounded-lg border border-line bg-white px-2.5 font-sans text-[11.5px] font-semibold text-ink"
        >
          <option value="todas">Status: Todas</option>
          <option value="aprovada">Ativa</option>
          <option value="pendente">Pendente</option>
          <option value="inativa">Inativa</option>
        </select>
        <select
          value={ufFilter}
          onChange={(e) => updateFilter(setUfFilter)(e.target.value)}
          className="h-[38px] rounded-lg border border-line bg-white px-2.5 font-sans text-[11.5px] font-semibold text-ink"
        >
          <option value="todas">Região: Todas</option>
          {allUfs.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </select>
        <label className="flex h-[38px] items-center gap-2 rounded-lg border border-line px-3 font-sans text-[11.5px] text-muted">
          <input
            type="checkbox"
            checked={onlyWithDoacoes}
            onChange={(e) => updateFilter(setOnlyWithDoacoes)(e.target.checked)}
          />
          Só com doações
        </label>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-bg">
            <tr>
              {['Nutriz', 'Cidade · UF', 'Status', 'Doações', 'Última coleta'].map((h, i) => (
                <th
                  key={h}
                  className={`border-b border-line px-4 py-2.5 font-sans text-[10px] font-bold uppercase tracking-wide text-muted ${
                    i >= 3 ? 'text-right' : 'text-left'
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageItems.map((n) => {
              const endereco = enderecoByNutriz.get(n.id);
              const nDoacoes = doacoesByNutriz.get(n.id) ?? [];
              const ultima =
                nDoacoes.length > 0
                  ? nDoacoes.reduce((a, b) => (a.dataColeta > b.dataColeta ? a : b))
                  : null;
              const active = n.id === selectedId;
              const tag = STATUS_TAG[n.status];
              return (
                <tr
                  key={n.id}
                  onClick={() => onSelect(n.id)}
                  className={`cursor-pointer border-b border-line-soft ${active ? 'bg-brand-tint' : 'bg-white hover:bg-bg'}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full font-sans text-[11px] font-extrabold ${
                          active ? 'bg-brand text-white' : 'bg-brand-tint text-brand'
                        }`}
                      >
                        {initials(n.nome)}
                      </div>
                      <span
                        className={`font-sans text-[12.5px] text-ink ${active ? 'font-bold' : 'font-semibold'}`}
                      >
                        {n.nome}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-sans text-[12px] text-muted">
                    {endereco ? `${endereco.cidade} · ${endereco.uf}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-lg px-2 py-0.5 font-sans text-[10px] font-bold ${tag.className}`}>
                      {tag.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-sans text-[12px] font-semibold text-ink">
                    {nDoacoes.length}
                  </td>
                  <td className="px-4 py-3 text-right font-sans text-[12px] text-muted">
                    {ultima ? formatDate(ultima.dataColeta) : '—'}
                  </td>
                </tr>
              );
            })}
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center font-sans text-[12px] text-muted">
                  Nenhuma nutriz encontrada com esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-line-soft bg-white px-6 py-2.5 font-sans text-[11.5px] text-muted">
        <span>
          {filtered.length > 0
            ? `Mostrando ${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)} de ${filtered.length} nutrizes`
            : '0 nutrizes'}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={safePage <= 1}
            className="flex h-[26px] w-[26px] items-center justify-center rounded-md text-ink disabled:text-faint"
          >
            ‹
          </button>
          <span className="px-2 font-semibold text-ink">
            {safePage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={safePage >= totalPages}
            className="flex h-[26px] w-[26px] items-center justify-center rounded-md text-ink disabled:text-faint"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
