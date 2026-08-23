import jwt from 'jsonwebtoken';

/**
 * Middleware: verify JWT Bearer token and attach decoded user to req.user
 */
export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role, name, apartmentNo }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid or expired' });
  }
}

/**
 * Middleware factory: restrict access to specific roles.
 * Usage: requireRole('admin') or requireRole('admin', 'resident')
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
}
