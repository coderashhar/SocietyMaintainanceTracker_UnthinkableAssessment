/**
 * Priority badge — maps Low/Medium/High to CSS class
 */
export default function PriorityBadge({ priority }) {
  const classMap = {
    Low:    'badge badge-low',
    Medium: 'badge badge-medium',
    High:   'badge badge-high',
  };
  const iconMap = { Low: '▽', Medium: '◇', High: '▲' };
  const cls = classMap[priority] || 'badge';
  return (
    <span className={cls}>
      {iconMap[priority] || ''} {priority}
    </span>
  );
}
