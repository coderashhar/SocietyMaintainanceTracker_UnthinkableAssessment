/**
 * Vertical status-change timeline for a complaint's audit history.
 */
export default function StatusTimeline({ history = [] }) {
  if (!history.length) {
    return <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No history yet.</p>;
  }

  const dotStatus = (toStatus) => {
    if (toStatus === 'Resolved') return 'resolved';
    if (toStatus === 'InProgress') return 'inprogress';
    return 'open';
  };

  return (
    <div className="timeline">
      {history.map((item) => {
        const date = new Date(item.changedAt).toLocaleString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        });

        const transition = item.fromStatus
          ? `${item.fromStatus === 'InProgress' ? 'In Progress' : item.fromStatus} → ${item.toStatus === 'InProgress' ? 'In Progress' : item.toStatus}`
          : `Complaint raised as ${item.toStatus}`;

        return (
          <div key={item.id} className="timeline-entry">
            <div className="timeline-left">
              <div className={`timeline-dot ${dotStatus(item.toStatus)}`} />
              <div className="timeline-line" />
            </div>
            <div className="timeline-body">
              <div className="timeline-transition">{transition}</div>
              <div className="timeline-meta">
                {date}
                {item.actor && (
                  <> · by <strong>{item.actor.name}</strong>{' '}
                    <span style={{ textTransform: 'capitalize' }}>({item.actor.role})</span>
                  </>
                )}
              </div>
              {item.note && (
                <div className="timeline-note">{item.note}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
