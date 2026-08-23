import StatusBadge from './StatusBadge.jsx';

/**
 * Displays the full status-change audit trail for a complaint.
 * Each history entry = one row in complaint_status_history.
 */
export default function StatusTimeline({ history = [] }) {
  if (!history.length) {
    return <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>No history yet.</p>;
  }

  return (
    <div className="timeline">
      {history.map((item, idx) => {
        const dotClass =
          item.toStatus === 'Resolved' ? 'resolved' :
          item.toStatus === 'Open'     ? 'open' :
          idx === 0                    ? 'initial' : '';

        const date = new Date(item.changedAt).toLocaleString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        });

        return (
          <div key={item.id} className="timeline-item">
            <div className={`timeline-dot ${dotClass}`} />
            <div className="timeline-body">
              <div className="timeline-header">
                <div className="timeline-status-change">
                  {item.fromStatus ? (
                    <>
                      <StatusBadge status={item.fromStatus} />
                      <span style={{ margin: '0 6px', color: 'var(--color-text-faint)' }}>→</span>
                      <StatusBadge status={item.toStatus} />
                    </>
                  ) : (
                    <><span style={{ color: 'var(--color-text-faint)', fontSize: '13px' }}>Complaint raised as </span><StatusBadge status={item.toStatus} /></>
                  )}
                </div>
                <span className="timeline-time">{date}</span>
              </div>
              {item.actor && (
                <div className="timeline-actor">
                  by <strong>{item.actor.name}</strong>{' '}
                  <span style={{ textTransform: 'capitalize', fontSize: '12px', color: 'var(--color-text-faint)' }}>
                    ({item.actor.role})
                  </span>
                </div>
              )}
              {item.note && <div className="timeline-note">💬 {item.note}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
