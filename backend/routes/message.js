import { Router } from 'express';
import { nextId, store } from '../data/store.js';

const router = Router();
const publicUser = (user) => ({
  id: user.user_id,
  full_name: user.full_name,
  role: store.roles.find((role) => role.role_id === user.role_id)?.role_name || 'owner',
  status: user.status,
});

const roleOf = (user) => store.roles.find((role) => role.role_id === user.role_id)?.role_name;
const canContact = (viewer, target) => {
  if (!target || target.user_id === viewer.id) return false;
  const targetRole = roleOf(target);
  if (viewer.role === 'owner') return ['admin', 'owner', 'technician'].includes(targetRole);
  if (viewer.role === 'admin') return targetRole === 'owner' || targetRole === 'technician';
  return viewer.role === 'technician' && ['admin', 'owner', 'technician'].includes(targetRole);
};

router.get('/contacts', (req, res) => {
  const contacts = store.users.filter((user) => user.status === 'active' && canContact(req.user, user)).map(publicUser);
  res.json(contacts);
});

router.get('/conversation/:userId', (req, res) => {
  const otherId = Number(req.params.userId);
  if (!canContact(req.user, store.users.find((user) => user.user_id === otherId))) return res.status(403).json({ message: 'Bạn không có quyền xem cuộc trò chuyện với tài khoản này' });
  if (!store.users.some((user) => user.user_id === otherId)) return res.status(404).json({ message: 'Không tìm thấy người nhận' });
  const rows = store.messages.filter((message) =>
    (message.sender_id === req.user.id && message.receiver_id === otherId) ||
    (message.sender_id === otherId && message.receiver_id === req.user.id));
  rows.forEach((message) => { if (message.receiver_id === req.user.id && !message.read_at) message.read_at = new Date().toISOString(); });
  res.json(rows.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
});

router.delete('/conversation/:userId', (req, res) => {
  const otherId = Number(req.params.userId);
  if (!canContact(req.user, store.users.find((user) => user.user_id === otherId))) return res.status(403).json({ message: 'Bạn không có quyền xóa cuộc trò chuyện với tài khoản này' });
  if (!store.users.some((user) => user.user_id === otherId)) return res.status(404).json({ message: 'Không tìm thấy người nhận' });
  const before = store.messages.length;
  store.messages = store.messages.filter((message) => !(
    (message.sender_id === req.user.id && message.receiver_id === otherId) ||
    (message.sender_id === otherId && message.receiver_id === req.user.id)
  ));
  return res.json({ message: 'Đã xóa cuộc trò chuyện', deleted: before - store.messages.length });
});

router.post('/', (req, res) => {
  const receiverId = Number(req.body.receiver_id);
  const content = String(req.body.content || '').trim();
  if (!canContact(req.user, store.users.find((user) => user.user_id === receiverId))) return res.status(403).json({ message: 'Bạn không có quyền nhắn tin cho tài khoản này' });
  if (!store.users.some((user) => user.user_id === receiverId && user.status === 'active')) return res.status(400).json({ message: 'Người nhận không hợp lệ' });
  if (!content || content.length > 2000) return res.status(400).json({ message: 'Tin nhắn phải có từ 1 đến 2000 ký tự' });
  const message = { message_id: nextId(store.messages, 'message_id'), sender_id: req.user.id, receiver_id: receiverId, content, created_at: new Date().toISOString(), read_at: null };
  store.messages.push(message);
  res.status(201).json(message);
});

export default router;
