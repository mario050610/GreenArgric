import { Router } from 'express';
import { store, nextId } from '../data/store.js';
import { persistThreshold } from '../db.js';
import { allowRoles } from '../middleware/auth.js';

const router = Router();

router.get('/:areaId', (req, res) => {
  res.json(store.thresholds.filter((item) => item.area_id === Number(req.params.areaId)));
});

router.post('/', allowRoles('admin', 'owner'), async (req, res) => {
  const areaId = Number(req.body.area_id);
  const sensorType = String(req.body.sensor_type || '').trim();
  const minValue = Number(req.body.min_value);
  const maxValue = Number(req.body.max_value);
  const area = store.areas.find((item) => item.area_id === areaId);
  if (!area) return res.status(404).json({ message: 'Không tìm thấy khu vực' });
  if (req.user.role === 'owner' && area.owner_id !== req.user.id) {
    return res.status(403).json({ message: 'Bạn chỉ có thể cấu hình khu vực của mình' });
  }
  if (!sensorType || !Number.isFinite(minValue) || !Number.isFinite(maxValue) || minValue > maxValue) {
    return res.status(400).json({ message: 'Ngưỡng không hợp lệ' });
  }
  let item = store.thresholds.find((row) => row.area_id === areaId && row.sensor_type === sensorType);
  if (item) {
    Object.assign(item, {
      min_value: minValue,
      max_value: maxValue,
      warning_level: req.body.warning_level || item.warning_level,
      is_activated: req.body.is_activated ?? true,
    });
  } else {
    item = {
      threshold_id: nextId(store.thresholds, 'threshold_id'),
      area_id: areaId,
      sensor_type: sensorType,
      min_value: minValue,
      max_value: maxValue,
      warning_level: req.body.warning_level || 'medium',
      is_activated: req.body.is_activated ?? true,
    };
    store.thresholds.push(item);
  }
  await persistThreshold(item);
  return res.json(item);
});

export default router;
