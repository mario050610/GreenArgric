import { Router } from 'express';
import { allowRoles } from '../middleware/auth.js';
import { getMqttStatus } from '../mqtt.js';
import { config } from '../config.js';

const router = Router();

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
