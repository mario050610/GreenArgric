import { Router } from 'express';
import { store, nextId } from '../data/store.js';
import { evaluateReading } from '../core/automation.js';
import { allowRoles } from '../middleware/auth.js';
import { persistReading } from '../db.js';

const router = Router();
router.get('/', (req, res) => res.json(store.sensors.map((sensor) => ({
  ...sensor,
  area_name: store.areas.find((area) => area.area_id === sensor.area_id)?.area_name,
}))));

router.get('/area/:areaId/latest', (req, res) => {
  const areaId = Number(req.params.areaId);
  const result = store.sensors.filter((sensor) => sensor.area_id === areaId).map((sensor) => {
    const reading = store.readings
      .filter((item) => item.sensor_id === sensor.sensor_id)
      .sort((a, b) => new Date(b.reading_time) - new Date(a.reading_time))[0];
    return { ...sensor, value: reading?.value ?? null, reading_time: reading?.reading_time ?? null };
  });
  res.json(result);
});

router.get('/area/:areaId/history/:type', (req, res) => {
  const areaId = Number(req.params.areaId);
  const ids = store.sensors
    .filter((sensor) => sensor.area_id === areaId && sensor.sensor_type === req.params.type)
    .map((sensor) => sensor.sensor_id);
  const from = req.query.from ? new Date(String(req.query.from)) : null;
  const to = req.query.to ? new Date(String(req.query.to)) : null;
  const rows = store.readings
    .filter((reading) => ids.includes(reading.sensor_id)
      && (!from || new Date(reading.reading_time) >= from)
      && (!to || new Date(reading.reading_time) <= to))
    .sort((a, b) => new Date(a.reading_time) - new Date(b.reading_time));
  res.json(rows);
});

router.post('/data', async (req, res) => {
  const sensor = store.sensors.find((item) =>
    item.sensor_id === Number(req.body.sensor_id) || item.sensor_code === req.body.sensor_code,
  );
  if (!sensor) return res.status(404).json({ message: 'Không tìm thấy cảm biến' });
  const value = Number(req.body.value);
  if (!Number.isFinite(value)) return res.status(400).json({ message: 'Giá trị cảm biến không hợp lệ' });

  const reading = {
    reading_id: nextId(store.readings, 'reading_id'),
    sensor_id: sensor.sensor_id,
    area_id: sensor.area_id,
    value,
    unit: req.body.unit || sensor.unit,
    reading_time: req.body.reading_time || new Date().toISOString(),
    quality_flag: req.body.quality_flag || 'good',
  };
  store.readings.push(reading);
  sensor.last_seen = reading.reading_time;
  sensor.status = 'online';
  await persistReading(reading);
  await evaluateReading(reading, sensor);
  return res.status(201).json(reading);
});

router.post('/', allowRoles('admin', 'technician'), (req, res) => {
  const item = {
    sensor_id: nextId(store.sensors, 'sensor_id'),
    area_id: Number(req.body.area_id),
    sensor_code: req.body.sensor_code,
    sensor_type: req.body.sensor_type,
    unit: req.body.unit || '',
    adafruit_feed_key: req.body.adafruit_feed_key || '',
    mqtt_topic: req.body.mqtt_topic || '',
    status: 'online',
    last_seen: null,
  };
  if (!item.sensor_code || !item.sensor_type) {
    return res.status(400).json({ message: 'Thiếu mã hoặc loại cảm biến' });
  }
  store.sensors.push(item);
  return res.status(201).json(item);
});

router.put('/:id', allowRoles('admin', 'technician'), (req, res) => {
  const item = store.sensors.find((sensor) => sensor.sensor_id === Number(req.params.id));
  if (!item) return res.status(404).json({ message: 'Không tìm thấy cảm biến' });
  Object.assign(item, req.body, { sensor_id: item.sensor_id });
  return res.json(item);
});

router.delete('/:id', allowRoles('admin'), (req, res) => {
  const index = store.sensors.findIndex((sensor) => sensor.sensor_id === Number(req.params.id));
  if (index < 0) return res.status(404).json({ message: 'Không tìm thấy cảm biến' });
  store.sensors.splice(index, 1);
  return res.json({ message: 'Xóa cảm biến thành công' });
});

export default router;
