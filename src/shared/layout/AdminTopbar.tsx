import { useAdministradores } from '../api/queries';
import { getAdminId, getAdminNome } from '../api/auth';
import { PERIOD_PRESETS, type PeriodPreset } from '../lib/period';

type PeriodControl = {
  value: PeriodPreset;
  onChange: (preset: PeriodPreset) => void;
};

type AdminTopbarProps = {
  title: string;
  subtitle?: string;
  period?: PeriodControl;
};

function capitalize(s: string) {
  return s.length > 0 ? s[0].toUpperCase() + s.slice(1) : s;
}

export function AdminTopbar({ title, subtitle, period }: AdminTopbarProps) {
  const administradores = useAdministradores();
  const adminId = getAdminId();
  const admin = administradores.data?.find((a) => a.id === adminId);
  const nome = admin?.nome ?? getAdminNome() ?? 'Administrador';
  const iniciais = nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  return (
    <div className="mt-3 flex h-16 shrink-0 items-center gap-4 border-b border-line-soft bg-white px-7">
      <div className="flex-1">
        <div className="font-sans text-xl font-extrabold leading-tight text-ink">{title}</div>
        {subtitle && <div className="mt-0.5 text-[11.5px] text-muted">{subtitle}</div>}
      </div>

      {period && (
        <select
          value={period.value}
          onChange={(e) => period.onChange(e.target.value as PeriodPreset)}
          className="h-[34px] shrink-0 rounded-lg border border-line bg-white px-2.5 font-sans text-[12px] font-semibold text-ink"
        >
          {PERIOD_PRESETS.filter((p) => p.value !== 'personalizado').map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      )}

      <div className="ml-4 flex shrink-0 items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand font-sans text-[12px] font-extrabold text-white">
          {iniciais || 'A'}
        </div>
        <div className="leading-tight">
          <div className="font-sans text-[12px] font-bold text-ink">{nome}</div>
          <div className="text-[10px] text-muted">{admin ? capitalize(admin.papel) : 'Administrador'}</div>
        </div>
      </div>
    </div>
  );
}
