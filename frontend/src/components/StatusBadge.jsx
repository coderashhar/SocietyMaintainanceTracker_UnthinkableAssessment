/**
 * Status badge — maps status string to CSS class
 */
export default function StatusBadge({ status }) {
  const classMap = {
    Open:       'badge badge-open',
    InProgress: 'badge badge-inprogress',
    Resolved:   'badge badge-resolved',
  };
  const cls = classMap[status] || 'badge';
  return <span className={cls}>{status === 'InProgress' ? 'In Progress' : status}</span>;
}
