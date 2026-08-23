import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import complaintRoutes from './routes/complaints.js';
import noticeRoutes from './routes/notices.js';
import dashboardRoutes from './routes/dashboard.js';

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Global error handler ────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`🏢 Society Maintenance Tracker API running on port ${PORT}`);
});

export default app;
