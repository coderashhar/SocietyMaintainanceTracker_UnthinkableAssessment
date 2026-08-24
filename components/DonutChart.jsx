'use client';
/**
 * Donut chart for priority/status distribution
 */
export default function DonutChart({ data, size = 120 }) {
  if (!data || data.length === 0) {
    return <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No data</div>;
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    return <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No data</div>;
  }

  const radius = 40;
  const strokeWidth = 12;
  const center = 50;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="donut-chart">
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={strokeWidth}
        />
        {data.map((d, i) => {
          const percent = d.value / total;
          const strokeDasharray = `${percent * circumference} ${circumference}`;
          const rotation = accumulatedPercent * 360 - 90;
          accumulatedPercent += percent;

          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              transform={`rotate(${rotation} ${center} ${center})`}
              style={{ transition: 'stroke-dasharray 0.3s ease' }}
            />
          );
        })}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: '20px', fontWeight: '700', fill: 'var(--text)' }}
        >
          {total}
        </text>
      </svg>
      <div className="donut-legend">
        {data.map((d, i) => (
          <div key={i} className="donut-legend-item">
            <span className="donut-legend-dot" style={{ backgroundColor: d.color }} />
            <span className="donut-legend-label">{d.label}</span>
            <span className="donut-legend-value">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
