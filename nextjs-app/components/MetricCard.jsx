'use client';
/**
 * Enhanced metric card with trend indicator
 */
export default function MetricCard({
  label,
  value,
  trend,
  trendLabel,
  icon,
  color = 'total',
  subtitle
}) {
  return (
    <div className={`metric-card ${color}`}>
      {icon && <div className="metric-icon">{icon}</div>}
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
      {subtitle && <div className="metric-subtitle">{subtitle}</div>}
      {trend !== undefined && (
        <div className={`metric-trend ${trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral'}`}>
          {trend > 0 && '↑'}
          {trend < 0 && '↓'}
          {trend === 0 && '→'}
          {' '}{Math.abs(trend)}%
          {trendLabel && <span className="metric-trend-label">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
