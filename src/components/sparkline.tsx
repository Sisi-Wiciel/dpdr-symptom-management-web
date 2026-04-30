type SparklineProps = {
  values: number[];
};

export function Sparkline({ values }: SparklineProps) {
  const width = 280;
  const height = 96;

  if (values.length === 0) {
    return null;
  }

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = width / Math.max(values.length - 1, 1);
  const points = values
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * (height - 12) - 6;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-24 w-full overflow-visible">
      <defs>
        <linearGradient id="trend-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="rgba(11,125,118,1)" />
          <stop offset="100%" stopColor="rgba(191,111,63,1)" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke="url(#trend-gradient)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}