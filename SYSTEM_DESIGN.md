# System Design Document
## Society Maintenance Tracker

**Author:** Mohd Ashhar Khan  
**Date:** January 2024  
**Word Count:** ~790 words

---

## Overview

The Society Maintenance Tracker is a full-stack web application built to manage apartment society complaints, notices, and resident communications. The system prioritizes data integrity, audit trails, and real-time responsiveness while maintaining simplicity and scalability.

---

## 1. Complaint History Model

### Design Rationale

The complaint lifecycle tracking system uses an **append-only audit log pattern** implemented through the `ComplaintStatusHistory` table. Every status transition creates a new immutable record rather than updating existing data.

### Implementation Details

**Database Schema:**
- `Complaint` table stores current state (status, priority, resolvedAt)
- `ComplaintStatusHistory` table maintains complete audit trail
- Foreign key cascade deletion ensures referential integrity

**Status Flow:**
```
Open → InProgress → Resolved (terminal state)
```

Once a complaint reaches `Resolved` status, the API enforces immutability by returning HTTP 403 on any status update attempts. This prevents data tampering and maintains historical accuracy.

**Key Benefits:**
- Complete audit trail for compliance and dispute resolution
- Temporal queries possible (state at any point in time)
- Admin accountability through actor_id tracking
- Optional notes provide context for each transition

### Timeline Visualization

The frontend renders status history as a vertical timeline with:
- Color-coded status indicators (blue=Open, amber=InProgress, green=Resolved)
- Timestamps in local timezone
- Admin notes displayed as quoted blocks
- Chronological ordering (oldest to newest)

---

## 2. Overdue Detection

### Architectural Decision: Computed vs Stored

Overdue status is **computed at query time** rather than stored as a database column. This design avoids data staleness and eliminates the need for scheduled jobs.

### Implementation

**SQL Query Pattern:**
```sql
SELECT *, 
  CASE WHEN status != 'Resolved' 
       AND NOW() - created_at > INTERVAL '7 days'
  THEN true ELSE false END as is_overdue
FROM complaints
```

**Configuration:**
The threshold is environment-configurable via `OVERDUE_THRESHOLD_DAYS`, defaulting to 7 days. Changes take effect on server restart without requiring database migrations.

**Performance Optimization:**
- Indexed `created_at` column for efficient range queries
- Overdue complaints pinned to top of admin list via `ORDER BY is_overdue DESC`
- Dashboard aggregates overdue count using same calculation

**Benefits:**
- Always accurate (no stale data)
- No background jobs required
- Easily configurable per deployment
- Minimal database storage overhead

---

## 3. Photo Handling

### Upload Architecture

The system uses **client-side direct upload to Cloudinary** to avoid server bandwidth constraints and improve upload speeds.

**Upload Flow:**

1. **Client requests signature:**
   ```
   GET /api/cloudinary-signature
   → Returns signed upload parameters
   ```

2. **Client uploads directly to Cloudinary:**
   ```
   POST https://api.cloudinary.com/v1_1/{cloud_name}/image/upload
   → Returns secure URL
   ```

3. **Client submits complaint with URL:**
   ```
   POST /api/complaints
   Body: { ..., photoUrl: "https://res.cloudinary.com/..." }
   ```

### Security Considerations

- **Signed uploads:** Server generates HMAC-SHA1 signature to prevent unauthorized uploads
- **Upload restrictions:** Cloudinary configured with file type and size limits
- **URL validation:** Server validates Cloudinary domain before accepting photoUrl
- **No temp storage:** Files never touch server disk

### Display Optimization

- Cloudinary transformations applied via URL parameters
- Thumbnail generation for list views: `w_400,h_300,c_fill`
- Full resolution for detail views
- Lazy loading implemented for performance

---

## 4. Notification Flow

### Email Service Integration

The system uses **Resend API** for transactional emails, triggered synchronously on two events:

**Event 1: Status Change**
```
Admin updates complaint status
→ API creates history record
→ Email sent to complaint owner
→ Response returned to admin
```

**Event 2: Important Notice**
```
Admin posts notice with isImportant=true
→ API creates notice record
→ Email sent to all residents (batch)
→ Response returned to admin
```

### Email Template Design

**Status Update Email:**
- Subject: "Complaint Update: [Category]"
- Body includes:
  - Complaint description
  - Old status → New status
  - Admin note (if provided)
  - Link to view full details

**Important Notice Email:**
- Subject: "Important: [Notice Title]"
- Body includes notice content
- "IMPORTANT" badge in header
- Link to view on notice board

### Failure Handling

- Email failures logged to console but don't block API response
- Graceful degradation: complaint/notice still created even if email fails
- Resend provides retry mechanism automatically
- Admin can view delivery status in Resend dashboard

### Performance Considerations

- Synchronous sending keeps implementation simple
- Resend API responds in <500ms typically
- Batch sending for multiple recipients
- Future enhancement: Move to background queue for scale

---

## 5. Technology Choices

**Next.js 16 with App Router:**
- Unified frontend/backend codebase
- API routes as serverless functions
- Automatic code splitting and optimization
- Built-in deployment optimization for Vercel

**Prisma ORM:**
- Type-safe database queries
- Automatic migrations
- Connection pooling via Neon
- Prevents SQL injection

**PostgreSQL (Neon):**
- Relational data with foreign keys
- ACID compliance for data integrity
- Serverless auto-scaling
- Generous free tier

**JWT Authentication:**
- Stateless authentication
- No session storage required
- Easily scalable horizontally
- Tokens include role for RBAC

---

## Conclusion

The system balances simplicity with robust features through careful architectural decisions: append-only audit logs ensure data integrity, computed overdue detection eliminates staleness, direct Cloudinary uploads optimize bandwidth, and synchronous email keeps complexity low. The tech stack enables rapid development while maintaining production-grade quality and scalability.
