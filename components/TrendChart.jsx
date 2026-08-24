'use client';
/**
 * Line chart showing complaint trends over time
 */
export default function TrendChart({ data, height = 180 }) {
  if (!data || data.length === 0) {
    return <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No trend data available</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (d.value / maxValue) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="trend-chart" style={{ height: `${height}px` }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - (d.value / maxValue) * 100;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="var(--accent)"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      <div className="trend-chart-labels">
        {data.map((d, i) => (
          <div key={i} className="trend-chart-label">
            <span className="trend-label-text">{d.label}</span>
            <span className="trend-label-value">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
