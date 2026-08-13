type DonutSlice = {
  label: string;
  value: number;
  color: string;
};

type DonutProps = {
  segments: DonutSlice[];
  centerLabel: string;
  centerValue: string;
};

export function Donut({ segments, centerLabel, centerValue }: DonutProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const R = 48;
  const r = 30;
  const cx = 56;
  const cy = 56;
  let start = 0;

  const arcs = segments.map((s) => {
    const a0 = (start / total) * Math.PI * 2 - Math.PI / 2;
    start += s.value;
    const a1 = (start / total) * Math.PI * 2 - Math.PI / 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const x0 = cx + R * Math.cos(a0);
    const y0 = cy + R * Math.sin(a0);
    const x1 = cx + R * Math.cos(a1);
    const y1 = cy + R * Math.sin(a1);
    const xi0 = cx + r * Math.cos(a0);
    const yi0 = cy + r * Math.sin(a0);
    const xi1 = cx + r * Math.cos(a1);
    const yi1 = cy + r * Math.sin(a1);
    return {
      d: `M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} L ${xi1} ${yi1} A ${r} ${r} 0 ${large} 0 ${xi0} ${yi0} Z`,
      color: s.color,
    };
  });

  return (
    <div className="flex items-center gap-5">
      <svg width="112" height="112" viewBox="0 0 112 112" className="shrink-0">
        {arcs.map((a, i) => (
          <path key={i} d={a.d} fill={a.color} />
        ))}
        <text x="56" y="53" textAnchor="middle" className="fill-ink text-[18px] font-extrabold">
          {centerValue}
        </text>
        <text x="56" y="68" textAnchor="middle" className="fill-muted text-[9px]">
          {centerLabel}
        </text>
      </svg>
      <div className="flex flex-1 flex-col gap-2">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
            <span className="flex-1 text-[11.5px] text-ink">{s.label}</span>
            <span className="text-[11.5px] font-semibold text-muted">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
