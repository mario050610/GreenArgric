import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { store } from '../data/store.js';

export function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Thiếu access token' });
  try {
    req.user = jwt.verify(token, config.jwtSecret);
    const activeUser = store.users.find((user) => user.user_id === req.user.id);
    if (activeUser) activeUser.last_active_at = new Date().toISOString();
    next();
  } catch {
    return res.status(401).json({ message: 'Access token không hợp lệ hoặc đã hết hạn' });
  }
}

export const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này' });
  next();
};
