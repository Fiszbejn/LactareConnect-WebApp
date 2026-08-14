import { NavLink } from 'react-router-dom';
import { Logo } from '../brand/Logo';

const iconProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const icons = {
  grid: (
    <svg width="18" height="18" viewBox="0 0 20 20">
      <rect x="3" y="3" width="6" height="6" rx="1" {...iconProps} />
      <rect x="11" y="3" width="6" height="6" rx="1" {...iconProps} />
      <rect x="3" y="11" width="6" height="6" rx="1" {...iconProps} />
      <rect x="11" y="11" width="6" height="6" rx="1" {...iconProps} />
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 20 20">
      <circle cx="7" cy="7" r="3" {...iconProps} />
      <path d="M2 17c0-3 2-5 5-5s5 2 5 5" {...iconProps} />
      <circle cx="14" cy="6" r="2.5" {...iconProps} />
      <path d="M13 12c3 0 5 2 5 5" {...iconProps} />
    </svg>
  ),
  doc: (
    <svg width="18" height="18" viewBox="0 0 20 20">
      <path d="M5 2h7l4 4v12H5z" {...iconProps} />
      <path d="M12 2v4h4M7 10h6M7 13h6M7 16h4" {...iconProps} />
    </svg>
  ),
};

const items: { to: string; label: string; icon: keyof typeof icons }[] = [
  { to: '/', label: 'Dashboard', icon: 'grid' },
  { to: '/nutrizes', label: 'Nutrizes', icon: 'users' },
  { to: '/relatorios', label: 'Relatórios', icon: 'doc' },
];

export function AdminSidebar() {
  return (
    <div className="flex h-full w-[220px] shrink-0 flex-col border-r border-line bg-white">
      <div className="flex flex-col items-start gap-3 border-b border-line-soft px-[18px] pb-[22px] pt-5">
        <Logo size={30} />
        <div className="inline-flex items-center gap-[5px] rounded-lg bg-brand-tint px-2 py-0.5 text-[11px] font-bold tracking-[0.4px] text-brand">
          <span className="h-[5px] w-[5px] rounded-full bg-brand" />
          ADMIN
        </div>
      </div>
      <nav className="flex flex-col gap-0.5 p-2.5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[14px] ${
                isActive
                  ? 'bg-brand-tint font-bold text-brand'
                  : 'font-medium text-muted hover:bg-bg'
              }`
            }
          >
            {icons[item.icon]}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
