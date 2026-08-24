'use client';
/**
 * Single notice card — important notices get a red left border.
 */
export default function NoticeCard({ notice }) {
  const date = new Date(notice.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <article className={`notice-card${notice.isImportant ? ' important' : ''}`}>
      <div className="notice-card-badge-row">
        {notice.isImportant
          ? <span className="badge badge-overdue">Important</span>
          : <span className="badge badge-open">Notice</span>
        }
      </div>
      <h2 className="notice-card-title">{notice.title}</h2>
      <p className="notice-card-body">{notice.body}</p>
      <div className="notice-card-footer">
        <span>Posted by {notice.author?.name || 'Admin'}</span>
        <span>·</span>
        <time dateTime={notice.createdAt}>{date}</time>
      </div>
    </article>
  );
}
