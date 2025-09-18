import asyncHandler from 'express-async-handler';
import { TokenUtils } from '../utils/tokenUtils.js';

export const verifyToken = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; 
  if (!token) return res.status(401).json({ error: 'Access token required' });

  try {
    const decoded = TokenUtils.verify(token);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
});

export const requireRole = (allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};