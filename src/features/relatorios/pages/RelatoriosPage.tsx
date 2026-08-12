import { AdminTopbar } from '../../../shared/layout/AdminTopbar';

export function RelatoriosPage() {
  return (
    <>
      <AdminTopbar title="Relatórios" subtitle="Exporte o dashboard em PDF por período" />
      <div className="flex-1 overflow-auto p-7">
        <p className="text-sm text-muted">Geração e histórico de relatórios entram aqui na próxima etapa.</p>
      </div>
    </>
  );
}
