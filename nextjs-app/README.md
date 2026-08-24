# Society Maintenance Tracker

A comprehensive web application for managing society maintenance complaints, notices, and resident communications. Built with Next.js 16, Prisma ORM, and PostgreSQL.

## 🚀 Live Demo

**Hosted Application:** [Your Vercel URL will be here]

**Test Credentials:**
- **Admin:** admin@society.com / admin123
- **Resident:** rajesh@example.com / resident123

## 📋 Features

### Complaint Management System
- Raise complaints with photo attachments (Cloudinary integration)
- Priority-based categorization (Low, Medium, High)
- Status tracking (Open, In Progress, Resolved)
- Complete status history timeline with admin notes
- Automatic overdue detection and alerts
- Email notifications on status updates

### Admin Dashboard
- Real-time analytics and performance metrics
- Weekly complaint trends (last 6 weeks)
- Priority distribution visualization
- Recent activity feed (last 10 status changes)
- Category-wise breakdown with percentages
- Resolution rate and average response time tracking

### Notice Board
- Post society announcements with cork board aesthetic
- Mark notices as important (highlighted with red pin)
- Email notifications for important notices to all residents
- Professional design without emojis

### User Management
- Role-based access control (Admin/Resident)
- JWT-based authentication with secure tokens
- bcrypt password hashing (10 salt rounds)

## 🛠️ Tech Stack

- **Frontend:** Next.js 16.3.2 (App Router), React 19
- **Backend:** Next.js API Routes (serverless functions)
- **Database:** PostgreSQL (Neon serverless)
- **ORM:** Prisma 5.22.0
- **Authentication:** JWT with bcryptjs
- **File Upload:** Cloudinary
- **Email Service:** Resend API
- **Styling:** Custom CSS with light/dark theme support

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon account recommended)
- Cloudinary account (free tier)
- Resend account (free tier: 3000 emails/month)

### Step 1: Clone the Repository

```bash
git clone https://github.com/coderashhar/SocietyMaintainanceTracker_UnthinkableAssessment.git
cd SocietyMaintainanceTracker_UnthinkableAssessment/nextjs-app
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Configuration

Create a `.env.local` file in the `nextjs-app` directory (see `.env.example` for reference):

```env
# Database (Neon PostgreSQL)
# Get from: https://neon.tech → Create Project → Connection Details
DATABASE_URL="postgresql://user:password@ep-xxx.aws.neon.tech:5432/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxx.aws.neon.tech:5432/dbname?sslmode=require"

# JWT Authentication
# Generate: openssl rand -base64 64
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-change-in-production"
JWT_EXPIRES_IN="7d"

# Cloudinary (Image Upload)
# Get from: https://cloudinary.com → Dashboard
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="your-api-secret"

# Resend (Email Service)
# Get from: https://resend.com → API Keys
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxx"
EMAIL_FROM="noreply@yourdomain.com"

# Overdue Threshold (configurable)
OVERDUE_THRESHOLD_DAYS=7
```

### Step 4: Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed database with sample data (optional but recommended)
npm run seed
```

The seed script creates:
- 1 Admin user (admin@society.com / admin123)
- 5 Resident users (password: resident123)
- 12 Complaints with images
- 6 Notices
- Status history entries

### Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 6: Build for Production

```bash
npm run build
npm start
```

## 📊 Database Schema

```prisma
// User model with role-based access
model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String   @map("password_hash")
  role         Role     @default(resident)  // resident | admin
  apartmentNo  String   @map("apartment_no")
  createdAt    DateTime @default(now()) @map("created_at")
  
  complaints        Complaint[]
  statusChanges     ComplaintStatusHistory[]
  notices           Notice[]
}

// Complaint with priority and status tracking
model Complaint {
  id          String    @id @default(cuid())
  residentId  String    @map("resident_id")
  category    String    // Plumbing, Electrical, Cleaning, Security, etc.
  description String
  photoUrl    String?   @map("photo_url")
  priority    Priority  @default(Low)   // Low | Medium | High
  status      Status    @default(Open)  // Open | InProgress | Resolved
  createdAt   DateTime  @default(now()) @map("created_at")
  resolvedAt  DateTime? @map("resolved_at")
  
  resident User
  history  ComplaintStatusHistory[]
}

// Complete audit trail for status changes
model ComplaintStatusHistory {
  id          String   @id @default(cuid())
  complaintId String   @map("complaint_id")
  fromStatus  Status?  @map("from_status")
  toStatus    Status   @map("to_status")
  actorId     String   @map("actor_id")
  note        String?
  changedAt   DateTime @default(now()) @map("changed_at")
  
  complaint Complaint @relation(fields: [complaintId], references: [id], onDelete: Cascade)
  actor     User      @relation(fields: [actorId], references: [id])
}

// Notice board for society announcements
model Notice {
  id          String   @id @default(cuid())
  title       String
  body        String
  isImportant Boolean  @default(false) @map("is_important")
  createdAt   DateTime @default(now()) @map("created_at")
  createdBy   String   @map("created_by")
  
  author User @relation(fields: [createdBy], references: [id])
}
```

**Note:** Overdue status is **computed at query time**, not stored. A complaint is overdue if:
```sql
status != 'Resolved' AND NOW() - created_at > INTERVAL '7 days'
```

## 🔌 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user (defaults to resident role).

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "apartmentNo": "A-101"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxx...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "resident",
    "apartmentNo": "A-101"
  }
}
```

#### POST `/api/auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### GET `/api/auth/me`
Get current user details (requires authentication).

**Headers:** `Authorization: Bearer <token>`

---

### Complaint Endpoints

#### GET `/api/complaints`
Get all complaints for the logged-in resident.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "data": [
    {
      "id": "clxxx...",
      "category": "Plumbing",
      "description": "Leaking tap in bathroom",
      "priority": "Medium",
      "status": "Open",
      "photoUrl": "https://res.cloudinary.com/...",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "isOverdue": false,
      "resident": {
        "name": "John Doe",
        "apartmentNo": "A-101"
      }
    }
  ]
}
```

#### POST `/api/complaints`
Create a new complaint.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "category": "Plumbing",
  "description": "Leaking tap in bathroom needs urgent repair",
  "photoUrl": "https://res.cloudinary.com/...",
  "priority": "Medium"
}
```

#### GET `/api/complaints/:id`
Get complaint details with complete status history.

**Response includes:**
- Complaint details
- Resident information
- Complete status history timeline
- Admin notes for each status change

#### PATCH `/api/complaints/:id/status`
Update complaint status (admin only).

**Request:**
```json
{
  "status": "InProgress",
  "note": "Plumber assigned. Will visit tomorrow at 10 AM."
}
```

**Note:** Returns 403 if complaint is already resolved (immutable).

#### PATCH `/api/complaints/:id/priority`
Update complaint priority (admin only).

**Request:**
```json
{
  "priority": "High"
}
```

---

### Admin Endpoints

#### GET `/api/admin/complaints`
Get all complaints with filtering (admin only).

**Query Parameters:**
- `category` - Filter by category
- `status` - Filter by status
- `dateFrom` - Filter from date (YYYY-MM-DD)
- `dateTo` - Filter to date (YYYY-MM-DD)

**Example:**
```
GET /api/admin/complaints?category=Plumbing&status=Open&dateFrom=2024-01-01
```

#### GET `/api/admin/dashboard`
Get dashboard statistics.

**Response:**
```json
{
  "totalComplaints": 50,
  "totalResidents": 25,
  "byStatus": {
    "Open": 10,
    "InProgress": 15,
    "Resolved": 25
  },
  "byCategory": [
    { "category": "Plumbing", "count": 20 },
    { "category": "Electrical", "count": 15 }
  ],
  "overdueCount": 5,
  "overdueThresholdDays": 7
}
```

#### GET `/api/admin/dashboard/trends`
Get weekly trends and analytics.

**Response:**
```json
{
  "weeklyTrend": [
    { "label": "W1", "value": 8, "resolved": 5 },
    { "label": "W2", "value": 12, "resolved": 8 }
  ],
  "avgResolutionDays": 3,
  "avgResponseHours": 4,
  "resolutionRate": 78,
  "priorityData": [
    { "label": "High", "value": 5, "color": "#EF4444" },
    { "label": "Medium", "value": 8, "color": "#F59E0B" },
    { "label": "Low", "value": 3, "color": "#10B981" }
  ]
}
```

#### GET `/api/admin/dashboard/activity`
Get recent status changes (last 10).

**Response:**
```json
{
  "activities": [
    {
      "fromStatus": "Open",
      "toStatus": "InProgress",
      "note": "Plumber assigned",
      "changedAt": "2024-01-15T14:30:00.000Z",
      "actor": { "name": "Admin User" },
      "complaint": { "category": "Plumbing" }
    }
  ]
}
```

---

### Notice Endpoints

#### GET `/api/notices`
Get all notices (important notices first).

**Response:**
```json
{
  "data": [
    {
      "id": "clxxx...",
      "title": "Water Supply Interruption",
      "body": "Water supply will be interrupted this Sunday...",
      "isImportant": true,
      "createdAt": "2024-01-15T09:00:00.000Z",
      "author": { "name": "Admin User" }
    }
  ]
}
```

#### POST `/api/notices`
Create a new notice (admin only).

**Request:**
```json
{
  "title": "Water Supply Interruption - This Sunday",
  "body": "Dear Residents, Please note that water supply will be interrupted...",
  "isImportant": true
}
```

**Note:** If `isImportant` is true, emails are sent to all residents.

---

### Cloudinary Integration

#### GET `/api/cloudinary-signature`
Get signature for direct Cloudinary upload (client-side).

**Response:**
```json
{
  "signature": "abc123...",
  "timestamp": 1704801234,
  "cloudName": "your-cloud-name",
  "apiKey": "123456789012345"
}
```

## 🎨 Design System

### Color Palette
- **Accent:** Blue (#2563EB / #6366F1)
- **Success:** Green (#10B981)
- **Warning:** Amber (#F59E0B)
- **Danger:** Red (#EF4444)
- **Neutral:** Slate grays

### Typography
- **Font:** Inter (400, 500, 600, 700)
- **Monospace:** JetBrains Mono (for complaint IDs)

### Theme Support
- Light mode (default)
- Dark mode (toggle in sidebar)
- Smooth transitions between themes
- Persistent theme preference

## 🔒 Security Features

- **Authentication:** JWT tokens with configurable expiry
- **Password Security:** bcrypt hashing with 10 salt rounds
- **Authorization:** Role-based access control (RBAC)
- **API Protection:** All routes require valid JWT except auth endpoints
- **SQL Injection Prevention:** Prisma ORM with parameterized queries
- **XSS Protection:** React's built-in escaping
- **CORS:** Configurable for production deployment

## 🚀 Deployment Guide

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select `nextjs-app` as the root directory

3. **Configure Environment Variables**
   - Add all variables from `.env.local`
   - Settings → Environment Variables
   - Add for Production, Preview, and Development

4. **Deploy**
   - Click Deploy
   - Wait for build to complete
   - Get your live URL

### Environment Variables on Vercel

Add these in Vercel dashboard:
- `DATABASE_URL` - Your Neon PostgreSQL URL
- `DIRECT_URL` - Same as DATABASE_URL for Neon
- `JWT_SECRET` - Your JWT secret
- `JWT_EXPIRES_IN` - Token expiry (e.g., "7d")
- `CLOUDINARY_CLOUD_NAME` - From Cloudinary
- `CLOUDINARY_API_KEY` - From Cloudinary
- `CLOUDINARY_API_SECRET` - From Cloudinary
- `RESEND_API_KEY` - From Resend
- `EMAIL_FROM` - Verified sender email
- `OVERDUE_THRESHOLD_DAYS` - Default: 7

## 📝 Seed Data

Run `npm run seed` to populate with test data:

**Users Created:**
- Admin: admin@society.com / admin123
- Residents (all use password: resident123):
  - rajesh@example.com
  - priya@example.com
  - amit@example.com
  - sneha@example.com
  - vikram@example.com

**Data Created:**
- 12 complaints with realistic images
- 6 society notices
- Multiple status history entries
- Mix of open, in-progress, and resolved complaints

## 📱 Responsive Design

Fully responsive across all devices:
- **Desktop:** 1920px+ (full dashboard with charts)
- **Laptop:** 1024px - 1919px
- **Tablet:** 768px - 1023px
- **Mobile:** < 768px (optimized mobile UI)

## 🧪 Testing

### Manual Testing
1. Register as a new resident
2. Raise a complaint with photo
3. Login as admin (admin@society.com / admin123)
4. View admin dashboard
5. Update complaint status
6. Check email notifications
7. Post notice from admin
8. View notice board

### API Testing with curl

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123","apartmentNo":"A-101"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## 📂 Project Structure

```
nextjs-app/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── complaints/        # Complaint endpoints
│   │   ├── notices/           # Notice endpoints
│   │   └── admin/             # Admin endpoints
│   ├── (pages)/               # Next.js pages
│   ├── globals.css            # Global styles
│   └── layout.jsx             # Root layout
├── components/                 # React components
│   ├── ActivityFeed.jsx
│   ├── DonutChart.jsx
│   ├── MetricCard.jsx
│   ├── TrendChart.jsx
│   └── ...
├── context/                    # React contexts
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── lib/                        # Utilities
│   ├── api.js                 # API client
│   ├── auth.js                # Auth helpers
│   ├── email.js               # Email service
│   └── prisma.js              # Prisma client
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.js                # Seed script
├── views/                      # Page components
│   ├── AdminDashboard.jsx
│   ├── ResidentDashboard.jsx
│   ├── NoticeBoard.jsx
│   └── ...
├── .env.local                  # Environment variables (not in repo)
├── .env.example               # Example env file
├── package.json
└── next.config.mjs
```

## 🐛 Troubleshooting

### Database Connection Issues
- Check if Neon database is active (free tier sleeps after inactivity)
- Verify DATABASE_URL is correct
- Ensure SSL mode is included: `?sslmode=require`

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Run `npx prisma generate` to regenerate Prisma client
- Check Node.js version (requires 18+)

### Email Not Sending
- Verify RESEND_API_KEY is correct
- Check EMAIL_FROM is verified in Resend
- Use `onboarding@resend.dev` for testing

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Author

**Mohd Ashhar Khan**
- GitHub: [@coderashhar](https://github.com/coderashhar)
- Email: Contact via GitHub

---

**Built with ❤️ using Next.js 16, Prisma, and PostgreSQL**
