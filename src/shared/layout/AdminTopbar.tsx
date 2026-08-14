type AdminTopbarProps = {
  title: string;
  subtitle?: string;
};

export function AdminTopbar({ title, subtitle }: AdminTopbarProps) {
  return (
    <div className="flex h-16 shrink-0 items-center gap-4 border-b border-line-soft bg-white px-7">
      <div className="flex-1">
        <div className="font-sans text-xl font-extrabold leading-tight text-ink">{title}</div>
        {subtitle && <div className="mt-0.5 text-[11.5px] text-muted">{subtitle}</div>}
      </div>
    </div>
  );
}
