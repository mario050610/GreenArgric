import { Router } from 'express';
import { allowRoles } from '../middleware/auth.js';
import { getMqttStatus, publishLcdSelection } from '../mqtt.js';
import { config } from '../config.js';

const router = Router();
const lcdSensors = ['auto', 'light', 'motion'];

router.post('/lcd', allowRoles('admin', 'owner', 'technician'), (req, res) => {
  const sensor = String(req.body.sensor || 'auto');
  if (!lcdSensors.includes(sensor)) return res.status(400).json({ message: 'Cảm biến LCD không hợp lệ' });
  const result = publishLcdSelection(Number(req.body.area_id || 1), sensor);
  if (!result.sent) return res.status(503).json({ message: 'MQTT chưa kết nối', mqtt: result });
  return res.json({ message: 'Đã gửi lựa chọn đến LCD', mqtt: result });
});

router.get('/status', allowRoles('admin', 'owner', 'technician'), (req, res) => {
  const mqtt = getMqttStatus();
  const gatewayTimestamp = mqtt.gateway && typeof mqtt.gateway === 'object'
    ? mqtt.gateway.timestamp
    : null;
  const gatewayAgeMs = gatewayTimestamp
    ? Date.now() - new Date(gatewayTimestamp).getTime()
    : null;
  const gatewayOnline = Boolean(
    mqtt.connected
    && mqtt.gateway
    && mqtt.gateway.status === 'online'
    && Number.isFinite(gatewayAgeMs)
    && gatewayAgeMs <= 90_000,
  );
  res.json({
    backend: { status: 'online', data_mode: config.dataMode },
    mqtt,
    gateway: {
      online: gatewayOnline,
      last_seen: gatewayTimestamp,
      age_ms: Number.isFinite(gatewayAgeMs) ? gatewayAgeMs : null,
      details: mqtt.gateway,
    },
    adafruit: {
      configured: Boolean(config.mqtt.adafruit.username && config.mqtt.adafruit.key),
      username: config.mqtt.adafruit.username || null,
      device_command_feeds: config.mqtt.adafruit.deviceCommandFeeds,
      device_status_feeds: config.mqtt.adafruit.deviceStatusFeeds,
      gateway_status_feed: config.mqtt.adafruit.gatewayStatusFeed,
    },
  });
});

export default router;
