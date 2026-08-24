import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';
import PriorityBadge from './PriorityBadge.jsx';

/**
 * Reusable complaint card — resident dashboard and admin list.
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
      <div className="complaint-card-top">
        <div style={{ minWidth: 0 }}>
          <div className="complaint-card-category">{complaint.category}</div>
          {showResident && complaint.resident && (
            <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '2px' }}>
              {complaint.resident.name} · Apt {complaint.resident.apartmentNo}
            </div>
          )}
        </div>
        <div className="complaint-card-badges">
          {complaint.isOverdue && (
            <span className="badge badge-overdue">Overdue</span>
          )}
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
        </div>
      </div>

      <p className="complaint-card-desc">{complaint.description}</p>

      <div className="complaint-card-footer">
        <span className="complaint-id">#{complaint.id.slice(-8).toUpperCase()}</span>
        <span>{createdDate}</span>
        {complaint.photoUrl && <span>Photo attached</span>}
      </div>
    </div>
  );
}
