import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { store } from '../data/store.js';
import { updatePersistedUser } from '../db.js';

const router = Router();
const loginFailureMessage = 'Thông tin không tồn tại, không chính xác hoặc bạn đã chọn sai vai trò của bạn.';
const loginEmailAliases = new Map([
  ['quan.hmq@greenargric.edu.vn', 'owner@greenargric.edu.vn'],
  ['nguyen.ppn@greenargric.edu.vn', 'admin@greenargric.edu.vn'],
  ['khoa.thdk@greenargric.edu.vn', 'tech@greenargric.edu.vn'],
]);
router.post('/login', async (req, res) => {
  const { email, password, role: selectedRole } = req.body || {};
  if (!email || !password || !selectedRole) return res.status(400).json({ message: loginFailureMessage });
  const normalizedRole = String(selectedRole).trim().toLowerCase();
  if (!['admin', 'owner', 'technician'].includes(normalizedRole)) return res.status(401).json({ message: loginFailureMessage });
  const submittedEmail = String(email).trim().toLowerCase();
  const accountEmail = loginEmailAliases.get(submittedEmail) || submittedEmail;
  const user = store.users.find((item) => item.email.toLowerCase() === accountEmail);
  if (!user) return res.status(401).json({ message: loginFailureMessage });
  const valid = user.password_hash.startsWith('plain:') ? password === user.password_hash.slice(6) : await bcrypt.compare(password, user.password_hash);
  const role = store.roles.find((item) => item.role_id === user.role_id)?.role_name || 'owner';
  if (!valid || role !== normalizedRole) return res.status(401).json({ message: loginFailureMessage });
  if (user.status !== 'active') return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
  user.last_login_at = new Date().toISOString();
  await updatePersistedUser(user);
  const token = jwt.sign({ id: user.user_id, email: user.email, role, name: user.full_name }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  res.json({ message: 'Đăng nhập thành công', token, user: { id: user.user_id, full_name: user.full_name, email: user.email, role } });
});
export default router;
