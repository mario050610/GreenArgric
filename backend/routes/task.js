import { Router } from 'express';
import { store, nextId } from '../data/store.js';
import { allowRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', allowRoles('admin', 'owner', 'technician'), (req, res) => {
  const visibleTasks = req.user.role === 'technician'
    ? store.tasks.filter((task) => task.assigned_to === req.user.id)
    : req.user.role === 'owner'
      ? store.tasks.filter((task) => store.areas.some((area) => area.area_id === task.area_id && area.owner_id === req.user.id))
      : store.tasks;
  const rows = visibleTasks.map((task) => ({
    ...task,
    area_name: store.areas.find((area) => area.area_id === task.area_id)?.area_name,
    assignee: store.users.find((user) => user.user_id === task.assigned_to)?.full_name,
  }));
  res.json(rows);
});

router.post('/', allowRoles('admin', 'technician'), (req, res) => {
  const item = {
    task_id: nextId(store.tasks, 'task_id'),
    area_id: Number(req.body.area_id),
    assigned_to: req.user.role === 'technician' ? req.user.id : Number(req.body.assigned_to || req.user.id),
    title: req.body.title,
    description: req.body.description || '',
    task_type: req.body.task_type || 'care',
    scheduled_at: req.body.scheduled_at,
    status: 'pending',
  };

  if (!item.title || !item.scheduled_at) {
    return res.status(400).json({ message: 'Thiếu tiêu đề hoặc thời gian' });
  }

  store.tasks.push(item);
  return res.status(201).json(item);
});

router.put('/:id/status', allowRoles('admin', 'technician'), (req, res) => {
  const item = store.tasks.find((task) => task.task_id === Number(req.params.id));
  if (!item) return res.status(404).json({ message: 'Không tìm thấy công việc' });
  if (req.user.role === 'technician' && item.assigned_to !== req.user.id) return res.status(403).json({ message: 'Bạn chỉ có thể cập nhật công việc được giao cho chính mình' });

  item.status = req.body.status;
  if (item.status === 'completed') item.completed_at = new Date().toISOString();
  return res.json(item);
});

export default router;
