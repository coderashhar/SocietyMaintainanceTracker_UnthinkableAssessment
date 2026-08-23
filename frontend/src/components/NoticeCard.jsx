/**
 * Renders a single notice card. Important notices get a red-tinted style.
 */
export default function NoticeCard({ notice }) {
  const date = new Date(notice.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <article className={`notice-card${notice.isImportant ? ' important' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
        {notice.isImportant && <span className="badge badge-important">📌 Important</span>}
        {!notice.isImportant && <span className="badge badge-notice">📋 Notice</span>}
      </div>
      <h2 className="notice-card-title">{notice.title}</h2>
      <p className="notice-card-body">{notice.body}</p>
      <div className="notice-card-meta">
        <span>Posted by {notice.author?.name || 'Admin'}</span>
        <span>·</span>
        <time dateTime={notice.createdAt}>{date}</time>
      </div>
    </article>
  );
}
