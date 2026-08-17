import { Router } from 'express';
import { store, nextId } from '../data/store.js';
import { publishDeviceCommand } from '../mqtt.js';
import { allowRoles } from '../middleware/auth.js';
import { persistCommand, persistDevice, updatePersistedCommand, updatePersistedDevice } from '../db.js';

const router = Router();
const offTimers = new Map();

const assignedAreaIds = (user) => new Set(store.tasks.filter((task) => task.assigned_to === user.id).map((task) => task.area_id));
const canAccessArea = (user, areaId) => {
  if (user.role === 'admin') return true;
  if (user.role === 'owner') return store.areas.some((area) => area.area_id === areaId && area.owner_id === user.id);
  return assignedAreaIds(user).has(areaId);
};

async function sendCommand(device, state, userId, source, payload = {}) {
  const command = {
    command_id: nextId(store.commands, 'command_id'), device_id: device.device_id,
    user_id: userId, command_type: state, source, payload: JSON.stringify(payload),
    result_status: 'pending', sent_at: new Date().toISOString(),
  };
  store.commands.unshift(command);
  await persistCommand(command);
  const result = await publishDeviceCommand(device, state, { source });
  command.request_id = result.requestId || null;
  command.result_status = result.sent ? 'sent' : 'not_sent';
  await updatePersistedCommand(command);
  if (!result.sent) {
    device.status = state;
    device.last_seen = new Date().toISOString();
    await updatePersistedDevice(device);
  }
  return { command, result };
}

function clearOffTimer(device) {
  const timer = offTimers.get(device.device_id);
  if (timer) clearTimeout(timer);
  offTimers.delete(device.device_id);
  device.scheduled_off_at = null;
}

function scheduleOff(device, seconds, userId) {
  clearOffTimer(device);
  device.scheduled_off_at = new Date(Date.now() + seconds * 1000).toISOString();
  const timer = setTimeout(async () => {
    offTimers.delete(device.device_id);
    device.scheduled_off_at = null;
    try {
      await sendCommand(device, 'OFF', userId, 'timer', { auto_off_seconds: seconds });
    } catch (error) {
      console.error(`[device-timer] ${device.device_code}:`, error.message);
    }
  }, seconds * 1000);
  timer.unref?.();
  offTimers.set(device.device_id, timer);
}

router.get('/', allowRoles('admin', 'owner', 'technician'), (req, res) => res.json(
  store.devices.filter((device) => canAccessArea(req.user, device.area_id)).map((device) => ({
    ...device, area_name: store.areas.find((area) => area.area_id === device.area_id)?.area_name,
  })),
));

router.post('/override', allowRoles('admin', 'owner', 'technician'), async (req, res) => {
  const device = store.devices.find((item) => item.device_id === Number(req.body.device_id));
  if (!device) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
  if (!canAccessArea(req.user, device.area_id)) return res.status(403).json({ message: 'Bạn không được điều khiển thiết bị tại khu vực này' });
  const state = String(req.body.state || req.body.mode || '').toUpperCase();
  if (!['ON', 'OFF'].includes(state)) return res.status(400).json({ message: 'Trạng thái phải là ON hoặc OFF' });
  const autoOffSeconds = Number(req.body.auto_off_seconds || 0);
  if (!Number.isInteger(autoOffSeconds) || autoOffSeconds < 0 || autoOffSeconds > 86400) {
    return res.status(400).json({ message: 'Thời gian tự tắt phải từ 0 đến 86400 giây' });
  }
  if (state === 'OFF' && autoOffSeconds) return res.status(400).json({ message: 'Chỉ có thể hẹn giờ khi bật thiết bị' });

  device.mode = req.body.control_mode || 'MANUAL';
  clearOffTimer(device);
  const { command, result } = await sendCommand(device, state, req.user.id, 'manual', req.body);
  if (state === 'ON' && autoOffSeconds) scheduleOff(device, autoOffSeconds, req.user.id);
  return res.json({
    message: result.sent ? 'Đã gửi lệnh đến IoT Gateway' : 'Đã cập nhật chế độ demo; MQTT chưa kết nối',
    device, command, mqtt: result, scheduled_off_at: device.scheduled_off_at,
  });
});

router.post('/', allowRoles('admin', 'technician'), async (req, res) => {
  const areaId = Number(req.body.area_id);
  const deviceCode = String(req.body.device_code || '').trim();
  const deviceName = String(req.body.device_name || '').trim();
  const deviceType = String(req.body.device_type || '').trim();
  if (!store.areas.some((area) => area.area_id === areaId)) return res.status(400).json({ message: 'Khu vực không hợp lệ' });
  if (!deviceCode || !deviceName || !deviceType) return res.status(400).json({ message: 'Mã, tên và loại thiết bị là bắt buộc' });
  if (store.devices.some((device) => device.device_code.toLowerCase() === deviceCode.toLowerCase())) return res.status(409).json({ message: 'Mã thiết bị đã tồn tại' });
  const item = {
    device_id: nextId(store.devices, 'device_id'), area_id: areaId, device_code: deviceCode,
    device_name: deviceName, device_type: deviceType,
    adafruit_device_key: req.body.adafruit_device_key || req.body.device_type,
    status: req.body.status || 'OFF', mode: req.body.mode || 'MANUAL',
    command_topic: req.body.command_topic || '', status_topic: req.body.status_topic || '', last_seen: null,
  };
  await persistDevice(item);
  store.devices.push(item);
  return res.status(201).json(item);
});

router.put('/:id', allowRoles('admin', 'technician'), (req, res) => {
  const item = store.devices.find((device) => device.device_id === Number(req.params.id));
  if (!item) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
  Object.assign(item, req.body, { device_id: item.device_id });
  return res.json(item);
});

router.delete('/:id', allowRoles('admin'), (req, res) => {
  const index = store.devices.findIndex((device) => device.device_id === Number(req.params.id));
  if (index < 0) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
  clearOffTimer(store.devices[index]);
  store.devices.splice(index, 1);
  return res.json({ message: 'Xóa thiết bị thành công' });
});

export default router;
