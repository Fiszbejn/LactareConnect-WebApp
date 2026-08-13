type SparklineProps = {
  data: number[];
  color?: string;
  height?: number;
};

export function Sparkline({ data, color = 'var(--color-brand)', height = 36 }: SparklineProps) {
  const width = 200;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data.map((value, i) => [
    (i / Math.max(data.length - 1, 1)) * width,
    height - ((value - min) / range) * (height - 4) - 2,
  ]);
  const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
  const area = `${path} L ${width} ${height} L 0 ${height} Z`;
  const gradientId = `spark-${color.replace(/[^a-z0-9]/gi, '')}`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
