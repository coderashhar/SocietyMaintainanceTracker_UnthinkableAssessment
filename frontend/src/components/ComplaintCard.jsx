import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';
import PriorityBadge from './PriorityBadge.jsx';

/**
 * Reusable complaint card for the resident dashboard and admin list.
 */
export default function ComplaintCard({ complaint, showResident = false }) {
  const navigate = useNavigate();

  const handleClick = () => {
    const base = showResident ? '/admin/complaints' : '/complaints';
    navigate(`${base}/${complaint.id}`);
  };

  const createdDate = new Date(complaint.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <div
      className={`complaint-card${complaint.isOverdue ? ' overdue' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`Complaint: ${complaint.category}`}
    >
      <div className="complaint-card-header">
        <div>
          <div className="complaint-category">{complaint.category}</div>
          {showResident && complaint.resident && (
            <div className="complaint-meta">
              {complaint.resident.name} · Apt {complaint.resident.apartmentNo}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap' }}>
          {complaint.isOverdue && (
            <span className="badge badge-overdue">⚠ Overdue</span>
          )}
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      <p className="complaint-desc">{complaint.description}</p>

      <div className="complaint-footer">
        <PriorityBadge priority={complaint.priority} />
        <span style={{ color: 'var(--color-text-faint)', fontSize: '12px' }}>
          #{complaint.id.slice(-6).toUpperCase()} · {createdDate}
        </span>
        {complaint.photoUrl && (
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>📷 Photo</span>
        )}
      </div>
    </div>
  );
}
