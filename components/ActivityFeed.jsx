'use client';
/**
 * Activity feed showing recent complaint status changes
 */
export default function ActivityFeed({ activities }) {
  if (!activities || activities.length === 0) {
    return <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No recent activity</div>;
  }

  return (
    <div className="activity-feed">
      {activities.map((activity, i) => {
        const date = new Date(activity.changedAt);
        const timeAgo = getTimeAgo(date);

        return (
          <div key={i} className="activity-item">
            <div className="activity-dot" data-status={activity.toStatus.toLowerCase()} />
            <div className="activity-content">
              <div className="activity-text">
                <strong>{activity.actor?.name || 'Admin'}</strong> changed complaint{' '}
                <span className="activity-category">{activity.complaint?.category}</span>
                {activity.fromStatus && (
                  <> from <span className="activity-status">{formatStatus(activity.fromStatus)}</span></>
                )}
                {' '}to <span className="activity-status">{formatStatus(activity.toStatus)}</span>
              </div>
              <div className="activity-meta">{timeAgo}</div>
              {activity.note && (
                <div className="activity-note">"{activity.note}"</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatStatus(status) {
  return status === 'InProgress' ? 'In Progress' : status;
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}
