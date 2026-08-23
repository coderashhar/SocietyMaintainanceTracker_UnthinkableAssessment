# Society Maintenance Tracker

A full-stack, role-based apartment complaint management platform built with Node.js/Express, PostgreSQL (Prisma), and React/Vite.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)  
2. [Prerequisites](#prerequisites)  
3. [Setup Steps](#setup-steps)  
4. [Environment Variables](#environment-variables)  
5. [Database Schema](#database-schema)  
6. [API Endpoint Reference](#api-endpoint-reference)  
7. [Deployment](#deployment)  

---

## Architecture Overview

```
society-maintenance-tracker/
├── backend/       Node.js + Express REST API (port 4000)
├── frontend/      React + Vite SPA (port 5173)
├── .env.example   Master env reference (no real secrets)
└── README.md
```

**Key design decisions:**
- Overdue is **never stored** — computed at query time via `NOW() - created_at > interval`
- Every status change writes a row to `complaint_status_history` — this is the audit trail
- Once status = `Resolved`, the API returns **403** on any further status update
- Important notices sort first in the notice board (`ORDER BY is_important DESC, created_at DESC`)
- Email is a **synchronous side-effect** of two events only: status change and important notice creation

---

## Prerequisites

- Node.js ≥ 18
- PostgreSQL (local instance, or a hosted service like Render's managed Postgres)
- A [Cloudinary](https://cloudinary.com) account (free tier)
- A [Resend](https://resend.com) account (free tier: 100 emails/day)

---

## Setup Steps

### 1. Clone the repository

```bash
git clone <repo-url>
cd society-maintenance-tracker
```

### 2. Configure environment variables

**Backend:**
```bash
cp .env.example backend/.env
# Edit backend/.env with your real values
```

**Frontend:**
```bash
cp .env.example frontend/.env
# Only VITE_API_BASE_URL is needed for the frontend
# In local dev with Vite proxy, this can be left empty
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Set up the database

```bash
# Run migrations (creates all tables)
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 5. Create an admin user

After running migrations, create an admin user directly in the database:

```bash
npx prisma studio
```

Or run a quick seed script:

```bash
# In backend/, create a one-off seed:
node -e "
import('dotenv/config').then(async () => {
  const { PrismaClient } = await import('@prisma/client');
  const bcrypt = await import('bcryptjs');
  const prisma = new PrismaClient();
  const hash = await bcrypt.default.hash('AdminPass123', 12);
  await prisma.user.create({ data: { name: 'Admin', email: 'admin@society.com', passwordHash: hash, role: 'admin', apartmentNo: 'OFFICE' } });
  console.log('Admin created');
  await prisma.\$disconnect();
});
"
```

### 6. Start the backend

```bash
cd backend
npm run dev
# API running at http://localhost:4000
```

### 7. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 8. Start the frontend

```bash
npm run dev
# App running at http://localhost:5173
```

The Vite dev server proxies `/api/*` requests to `http://localhost:4000` automatically.

---

## Environment Variables

> ⚠ **Never commit your `.env` file.** Only `.env.example` should be in version control.

All variables are documented in [`.env.example`](./.env.example).

### Critical variables explained:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Random string for JWT signing. Generate: `openssl rand -base64 64` |
| `JWT_EXPIRES_IN` | ✅ | Token expiry e.g. `7d`, `24h` |
| `CLOUDINARY_CLOUD_NAME` | ✅ | From your Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | ✅ | From your Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | ✅ | From your Cloudinary dashboard |
| `RESEND_API_KEY` | ✅ | From [resend.com](https://resend.com) — starts with `re_` |
| `EMAIL_FROM` | ✅ | Verified sender email in Resend. Use `onboarding@resend.dev` for testing |
| `OVERDUE_THRESHOLD_DAYS` | ⚙️ | **Configurable overdue threshold** — see below |
| `PORT` | optional | Backend port (default: 4000) |
| `FRONTEND_URL` | optional | For CORS (default: `http://localhost:5173`) |

### OVERDUE_THRESHOLD_DAYS (Grading Criterion)

This variable controls **how many days** an unresolved complaint must be open before it is considered **overdue**.

```env
# Default: 7 days
OVERDUE_THRESHOLD_DAYS=7
```

**To change the threshold:**

1. Open `backend/.env`
2. Set `OVERDUE_THRESHOLD_DAYS=<number>` (any positive integer)
3. Restart the backend server

**Effect:**
- Overdue complaints appear **pinned to the top** of the admin complaint list
- The admin dashboard stat card shows the overdue count
- The calculation is performed **entirely at query time** using PostgreSQL's `INTERVAL`:
  ```sql
  WHERE status != 'Resolved' AND NOW() - created_at > INTERVAL '<N> days'
  ```
- Changing this value does **not** require a database migration — it takes effect immediately on restart.

### Resend Setup

1. Sign up at [resend.com](https://resend.com)
2. Create an API key under **API Keys**
3. Set `RESEND_API_KEY=re_...` in your `.env`
4. Verify a sending domain under **Domains** (for production)
5. For quick testing, use `EMAIL_FROM=onboarding@resend.dev` (Resend's sandbox address — can only send to your account email)

---

## Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| name | String | |
| email | String | Unique |
| password_hash | String | bcrypt, cost factor 12 |
| role | Enum | `resident` or `admin` |
| apartment_no | String | |
| created_at | DateTime | |

### `complaints`
| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| resident_id | String | FK → users.id |
| category | String | Plumbing, Electrical, Cleaning, Security, Elevator, Parking, Noise, Other |
| description | String | |
| photo_url | String? | Optional Cloudinary URL |
| priority | Enum | `Low`, `Medium`, `High` |
| status | Enum | `Open`, `InProgress`, `Resolved` |
| created_at | DateTime | |
| resolved_at | DateTime? | Set when status → Resolved |

> ℹ `overdue` is **not a stored column** — it is computed at query time.

### `complaint_status_history`
| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| complaint_id | String | FK → complaints.id (CASCADE delete) |
| from_status | Enum? | Null for the initial creation entry |
| to_status | Enum | The new status |
| actor_id | String | FK → users.id (who made the change) |
| note | String? | Optional admin note |
| changed_at | DateTime | |

> ⚠ **Never update this table in place.** Every status transition is an **insert**. This table is the source of truth for the audit trail.

### `notices`
| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| title | String | |
| body | String | |
| is_important | Boolean | Important notices sort first |
| created_at | DateTime | |
| created_by | String | FK → users.id |

---

## API Endpoint Reference

Base URL: `http://localhost:4000/api`

All protected endpoints require `Authorization: Bearer <token>` header.

### Auth

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new resident |
| `POST` | `/auth/login` | Public | Login, returns JWT |
| `GET` | `/auth/me` | Any | Get current user profile |

**Register body:**
```json
{ "name": "Rahul Sharma", "email": "rahul@example.com", "password": "Secure123", "apartmentNo": "A-101" }
```

**Login body:**
```json
{ "email": "rahul@example.com", "password": "Secure123" }
```

---

### Complaints

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/complaints` | Resident | Raise complaint (multipart/form-data for photo) |
| `GET` | `/complaints` | Resident | List own complaints |
| `GET` | `/complaints/:id` | Resident/Admin | Get complaint detail + full history |
| `GET` | `/complaints/admin/all` | Admin | All complaints with filters + overdue pinned |
| `PATCH` | `/complaints/:id/priority` | Admin | Update priority |
| `PATCH` | `/complaints/:id/status` | Admin | Update status (writes history, sends email) |

**Raise complaint (multipart/form-data):**
```
category=Plumbing&description=Leak under sink&priority=High&photo=<file>
```

**Admin all complaints query params:**
```
?category=Plumbing&status=Open&dateFrom=2024-01-01&dateTo=2024-12-31
```

**Update status body:**
```json
{ "status": "InProgress", "note": "Plumber assigned, will visit tomorrow" }
```

> ⚠ Returns **403** if current status is already `Resolved`.

**Update priority body:**
```json
{ "priority": "High" }
```

---

### Notices

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/notices` | Any (auth) | List all notices (important first) |
| `GET` | `/notices/:id` | Any (auth) | Get notice by ID |
| `POST` | `/notices` | Admin | Create notice; emails all residents if important |

**Create notice body:**
```json
{ "title": "Water Cut Tomorrow", "body": "Water supply will be cut from 10AM to 2PM", "isImportant": true }
```

---

### Dashboard

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/dashboard` | Admin | Aggregated stats: by-status, by-category, overdue count |

**Response shape:**
```json
{
  "totalComplaints": 42,
  "totalResidents": 18,
  "byStatus": { "Open": 10, "InProgress": 8, "Resolved": 24 },
  "byCategory": [{ "category": "Plumbing", "count": 12 }, ...],
  "overdueCount": 3,
  "overdueThresholdDays": 7
}
```

---

### Health

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Server liveness check |

---

## Deployment

### Render (Backend) + Vercel (Frontend)

**Backend on Render:**
1. Create a new **Web Service** pointing to the `backend/` directory
2. Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
3. Start command: `npm start`
4. Add all environment variables from `.env.example` in Render's dashboard
5. Create a **PostgreSQL** database service on Render and copy its `DATABASE_URL`

**Frontend on Vercel:**
1. Create a new project pointing to the `frontend/` directory
2. Set `VITE_API_BASE_URL=https://your-backend.onrender.com/api`
3. Deploy — Vercel will auto-detect Vite

### Single Render Full-Stack Deploy

Serve the Vite build from Express by:
1. Building the frontend: `npm run build` in `frontend/`
2. Copying `frontend/dist/` to `backend/public/`
3. Adding `app.use(express.static('public'))` and catch-all in Express
4. Deploy the entire repo as one Render service

---

## License

MIT
