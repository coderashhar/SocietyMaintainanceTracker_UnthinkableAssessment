import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';

const router = Router();

// ─── POST /api/auth/register ─────────────────────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role, apartmentNo } = req.body;

    // Validate required fields
    if (!name || !email || !password || !apartmentNo) {
      return res.status(400).json({ error: 'name, email, password, and apartmentNo are required' });
    }

    // Only allow 'resident' role on self-registration
    // Admins must be created directly in the DB or by another admin
    const assignedRole = role === 'admin' ? 'resident' : (role || 'resident');

    // Check for duplicate email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: assignedRole, apartmentNo },
      select: { id: true, name: true, email: true, role: true, apartmentNo: true },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, apartmentNo: user.apartmentNo },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, apartmentNo: user.apartmentNo },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        apartmentNo: user.apartmentNo,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
// Convenience endpoint — validate token and return current user profile
import { authenticateJWT } from '../middleware/auth.js';

router.get('/me', authenticateJWT, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, apartmentNo: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
