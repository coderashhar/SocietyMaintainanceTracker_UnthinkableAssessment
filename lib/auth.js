import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/** Sign a JWT with user payload */
export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

/** Verify a JWT — returns decoded payload or throws */
export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

/**
 * Extract and verify the Bearer token from a Next.js Request.
 * Returns the decoded user payload.
 * Throws a Response with 401/403 on failure.
 *
 * @param {Request} request
 * @param {string}  [requiredRole] - 'admin' | 'resident' | undefined (any role)
 * @returns {object} decoded JWT payload
 */
export function requireAuth(request, requiredRole) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    throw new Response(JSON.stringify({ error: 'No token provided' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    throw new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (requiredRole && decoded.role !== requiredRole) {
    throw new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return decoded;
}
