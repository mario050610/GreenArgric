import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { store, nextId } from '../data/store.js';
import { persistUser, updatePersistedUser } from '../db.js';
import { allowRoles } from '../middleware/auth.js';

const router = Router();
const roles = new Set(['admin', 'owner', 'technician']);
const creatableRoles = new Set(['owner', 'technician']);
const statuses = new Set(['active', 'locked', 'inactive']);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const publicUser = (user) => ({
  id: user.user_id,
  user_id: user.user_id,
  full_name: user.full_name,
  email: user.email,
  status: user.status,
  created_at: user.created_at || null,
  role: store.roles.find((role) => role.role_id === user.role_id)?.role_name,
});

router.get('/profile', (req, res) => {
  const user = store.users.find((item) => item.user_id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  return res.json(publicUser(user));
});

router.get('/', allowRoles('admin'), (_req, res) => res.json(store.users.map(publicUser)));

router.put('/password', async (req, res) => {
  const item = store.users.find((user) => user.user_id === req.user.id);
  if (!item) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  const currentPassword = String(req.body.current_password || '');
  const newPassword = String(req.body.new_password || '');
  const valid = item.password_hash.startsWith('plain:')
    ? currentPassword === item.password_hash.slice(6)
    : await bcrypt.compare(currentPassword, item.password_hash);
  if (!valid) return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
  if (newPassword.length < 6) return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
  item.password_hash = await bcrypt.hash(newPassword, 10);
  await updatePersistedUser(item);
  return res.json({ message: 'Cập nhật mật khẩu thành công' });
});

router.post('/', allowRoles('admin'), async (req, res) => {
  const fullName = String(req.body.full_name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const roleName = String(req.body.role || 'owner').toLowerCase();
  const status = String(req.body.status || 'active').toLowerCase();

  if (fullName.length < 2) return res.status(400).json({ message: 'Họ tên phải có ít nhất 2 ký tự' });
  if (!emailPattern.test(email)) return res.status(400).json({ message: 'Email không hợp lệ' });
  if (password.length < 6) return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
  if (!creatableRoles.has(roleName)) return res.status(400).json({ message: 'Chỉ được tạo tài khoản chủ vườn hoặc kỹ thuật viên' });
  if (!statuses.has(status)) return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
  if (store.users.some((item) => item.email.toLowerCase() === email)) {
    return res.status(409).json({ message: 'Email đã tồn tại' });
  }
  if (store.users.some((item) => item.full_name.trim().toLowerCase() === fullName.toLowerCase())) {
    return res.status(409).json({ message: 'Tên tài khoản đã tồn tại' });
  }

  const role = store.roles.find((item) => item.role_name === roleName);
  const item = {
    user_id: nextId(store.users, 'user_id'),
    role_id: role.role_id,
    full_name: fullName,
    email,
    password_hash: await bcrypt.hash(password, 10),
    status,
    created_at: new Date().toISOString(),
  };
  await persistUser(item);
  store.users.push(item);
  return res.status(201).json(publicUser(item));
});

router.put('/:id', allowRoles('admin'), async (req, res) => {
  const item = store.users.find((user) => user.user_id === Number(req.params.id));
  if (!item) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  if (req.body.role) {
    const roleName = String(req.body.role).toLowerCase();
    if (!roles.has(roleName)) return res.status(400).json({ message: 'Vai trò không hợp lệ' });
    item.role_id = store.roles.find((role) => role.role_name === roleName).role_id;
  }
  if (req.body.email) {
    const email = String(req.body.email).trim().toLowerCase();
    if (!emailPattern.test(email)) return res.status(400).json({ message: 'Email không hợp lệ' });
    if (store.users.some((user) => user.user_id !== item.user_id && user.email.toLowerCase() === email)) {
      return res.status(409).json({ message: 'Email đã tồn tại' });
    }
    item.email = email;
  }
  if (req.body.full_name) item.full_name = String(req.body.full_name).trim();
  if (req.body.status && statuses.has(req.body.status)) item.status = req.body.status;
  if (req.body.password) {
    if (String(req.body.password).length < 6) return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    item.password_hash = await bcrypt.hash(String(req.body.password), 10);
  }
  await updatePersistedUser(item);
  return res.json(publicUser(item));
});

router.post('/:id/toggle', allowRoles('admin'), async (req, res) => {
  const item = store.users.find((user) => user.user_id === Number(req.params.id));
  if (!item) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  if (item.user_id === req.user.id) return res.status(400).json({ message: 'Không thể tự khóa tài khoản đang đăng nhập' });
  item.status = item.status === 'active' ? 'locked' : 'active';
  await updatePersistedUser(item);
  return res.json(publicUser(item));
});

export default router;
