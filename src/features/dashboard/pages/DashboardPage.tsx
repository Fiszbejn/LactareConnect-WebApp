import { AdminTopbar } from '../../../shared/layout/AdminTopbar';

export function DashboardPage() {
  return (
    <>
      <AdminTopbar title="Dashboard" subtitle="Indicadores gerais do Lactare Connect" />
      <div className="flex-1 overflow-auto p-7">
        <p className="text-sm text-muted">KPIs e gráficos entram aqui na próxima etapa.</p>
      </div>
    </>
  );
}
