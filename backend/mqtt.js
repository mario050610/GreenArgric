import crypto from 'node:crypto';
import mqtt from 'mqtt';
import { config } from './config.js';
import { store, nextId } from './data/store.js';
import { evaluateReading } from './core/automation.js';
import { persistReading, updatePersistedDevice } from './db.js';

let client;
const state = {
  enabled: config.mqtt.enabled,
  provider: config.mqtt.provider,
  connected: false,
  broker: null,
  subscriptions: [],
  lastMessageAt: null,
  lastError: null,
  gateway: null,
};

const safeBrokerName = (url) => {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.hostname}:${parsed.port || ''}`.replace(/:$/, '');
  } catch {
    return String(url || '');
  }
};

const adafruitTopic = (feedKey) => `${config.mqtt.adafruit.username}/feeds/${feedKey}`;

function localSensorTopic() {
  return `${config.mqtt.local.baseTopic}/area/+/sensor/+/data`;
}

function localDeviceStatusTopic() {
  return `${config.mqtt.local.baseTopic}/area/+/device/+/status`;
}

function parsePayload(buffer) {
  const raw = buffer.toString().trim();
  if (!raw) return { raw, parsed: null };
  try {
    return { raw, parsed: JSON.parse(raw) };
  } catch {
    return { raw, parsed: raw };
  }
}

function numericValue(parsed) {
  if (typeof parsed === 'number') return parsed;
  if (typeof parsed === 'string') return Number(parsed);
  if (parsed && typeof parsed === 'object') return Number(parsed.value);
  return Number.NaN;
}

function normalizeSwitchState(parsed) {
  let value = parsed;
  if (parsed && typeof parsed === 'object') {
    value = parsed.state ?? parsed.status ?? parsed.value;
  }
  if (typeof value === 'boolean') return value ? 'ON' : 'OFF';
  if (typeof value === 'number') {
    if (value === 1) return 'ON';
    if (value === 0) return 'OFF';
  }
  const normalized = String(value ?? '').trim().toUpperCase();
  if (['1', 'ON', 'TRUE', 'YES'].includes(normalized)) return 'ON';
  if (['0', 'OFF', 'FALSE', 'NO'].includes(normalized)) return 'OFF';
  return null;
}

function deviceKeyByFeed(feedMap, feedKey) {
  return Object.entries(feedMap).find(([, value]) => value === feedKey)?.[0] || null;
}

async function saveSensorReading(sensor, parsed) {
  const value = numericValue(parsed);
  if (!Number.isFinite(value)) {
    throw new Error(`Giá trị feed ${sensor.adafruit_feed_key || sensor.sensor_code} không phải số`);
  }

  const payload = parsed && typeof parsed === 'object' ? parsed : {};
  const now = new Date().toISOString();
  sensor.last_seen = now;
  sensor.status = 'online';
  const reading = {
    reading_id: nextId(store.readings, 'reading_id'),
    sensor_id: sensor.sensor_id,
    area_id: sensor.area_id,
    value,
    unit: payload.unit || sensor.unit,
    reading_time: payload.timestamp || now,
    quality_flag: payload.quality || 'good',
  };
  store.readings.push(reading);
  await persistReading(reading);
  await evaluateReading(reading, sensor);
}

async function updateDeviceStatus(deviceKey, parsed) {
  const status = normalizeSwitchState(parsed);
  if (!deviceKey || !status) return;

  const device = store.devices.find((item) =>
    item.adafruit_device_key === deviceKey || item.device_code === deviceKey,
  );
  if (!device) return;

  const payload = parsed && typeof parsed === 'object' ? parsed : {};
  device.status = status;
  device.last_seen = payload.timestamp || new Date().toISOString();
  await updatePersistedDevice(device);

  const requestId = payload.request_id || null;
  let command = requestId
    ? store.commands.find((item) => item.request_id === requestId)
    : null;
  if (!command) {
    command = store.commands.find((item) =>
      item.device_id === device.device_id
      && ['pending', 'sent'].includes(item.result_status),
    );
  }
  if (command) {
    command.result_status = payload.ok === false ? 'failed' : 'acknowledged';
    command.acknowledged_at = device.last_seen;
  }
}

async function handleAdafruitMessage(topic, buffer) {
  const feedKey = topic.split('/').at(-1);
  const { parsed, raw } = parsePayload(buffer);

  if (feedKey === config.mqtt.adafruit.gatewayStatusFeed) {
    state.gateway = parsed ?? raw;
    return;
  }

  const statusDeviceKey = deviceKeyByFeed(config.mqtt.adafruit.deviceStatusFeeds, feedKey);
  if (statusDeviceKey) {
    await updateDeviceStatus(statusDeviceKey, parsed);
    return;
  }

  const sensor = store.sensors.find((item) => item.adafruit_feed_key === feedKey);
  if (sensor) await saveSensorReading(sensor, parsed);
}

async function handleLocalMessage(topic, buffer) {
  const { parsed } = parsePayload(buffer);
  const parts = topic.split('/');

  if (parts.at(-1) === 'data') {
    const sensorCode = parts[4];
    const sensor = store.sensors.find((item) => item.sensor_code === sensorCode);
    if (sensor) await saveSensorReading(sensor, parsed);
    return;
  }

  if (parts.at(-1) === 'status') {
    const deviceCode = parts[4];
    const device = store.devices.find((item) => item.device_code === deviceCode);
    const status = normalizeSwitchState(parsed);
    if (device && status) {
      device.status = status;
      device.last_seen = new Date().toISOString();
    }
  }
}

function validateAdafruitConfig() {
  if (!config.mqtt.adafruit.username || !config.mqtt.adafruit.key) {
    throw new Error('Thiếu AIO_USERNAME hoặc AIO_KEY trong backend/.env');
  }
}

function buildConnection() {
  if (config.mqtt.provider === 'adafruit') {
    validateAdafruitConfig();
    return {
      broker: config.mqtt.adafruit.broker,
      options: {
        username: config.mqtt.adafruit.username,
        password: config.mqtt.adafruit.key,
        clientId: `green-argric-backend-${crypto.randomBytes(4).toString('hex')}`,
        reconnectPeriod: 5000,
        connectTimeout: 30_000,
        clean: true,
        protocolVersion: 4,
      },
    };
  }

  return {
    broker: config.mqtt.local.broker,
    options: {
      username: config.mqtt.local.username,
      password: config.mqtt.local.password,
      reconnectPeriod: 3000,
    },
  };
}

function subscriptionTopics() {
  if (config.mqtt.provider === 'adafruit') {
    const sensorFeeds = store.sensors
      .map((item) => item.adafruit_feed_key)
      .filter(Boolean)
      .map(adafruitTopic);
    const statusFeeds = Object.values(config.mqtt.adafruit.deviceStatusFeeds).map(adafruitTopic);
    return [
      ...new Set([...sensorFeeds, ...statusFeeds]),
      adafruitTopic(config.mqtt.adafruit.gatewayStatusFeed),
      `${config.mqtt.adafruit.username}/throttle`,
      `${config.mqtt.adafruit.username}/errors`,
    ];
  }
  return [localSensorTopic(), localDeviceStatusTopic()];
}

export function startMqtt() {
  if (!config.mqtt.enabled) {
    console.log('[mqtt] Disabled (set MQTT_ENABLED=true to enable)');
    return null;
  }

  try {
    const connection = buildConnection();
    state.broker = safeBrokerName(connection.broker);
    client = mqtt.connect(connection.broker, connection.options);
  } catch (error) {
    state.lastError = error.message;
    console.error('[mqtt]', error.message);
    return null;
  }

  client.on('connect', () => {
    const topics = subscriptionTopics();
    client.subscribe(topics, { qos: 0 }, (error) => {
      if (error) {
        state.lastError = error.message;
        console.error('[mqtt] Subscribe failed:', error.message);
        return;
      }
      state.connected = true;
      state.subscriptions = topics;
      state.lastError = null;
      console.log(`[mqtt] Connected (${config.mqtt.provider}) and subscribed to ${topics.length} topic(s)`);
    });
  });

  client.on('message', async (topic, buffer) => {
    state.lastMessageAt = new Date().toISOString();
    try {
      if (topic === `${config.mqtt.adafruit.username}/throttle`) {
        console.warn('[adafruit] Throttle:', buffer.toString());
        return;
      }
      if (topic === `${config.mqtt.adafruit.username}/errors`) {
        console.error('[adafruit] Error topic:', buffer.toString());
        return;
      }
      if (config.mqtt.provider === 'adafruit') {
        await handleAdafruitMessage(topic, buffer);
      } else {
        await handleLocalMessage(topic, buffer);
      }
    } catch (error) {
      state.lastError = error.message;
      console.error('[mqtt] Invalid message:', error.message);
    }
  });

  client.on('reconnect', () => {
    state.connected = false;
    console.log('[mqtt] Reconnecting...');
  });
  client.on('close', () => {
    state.connected = false;
  });
  client.on('error', (error) => {
    state.connected = false;
    state.lastError = error.message;
    console.error('[mqtt]', error.message);
  });

  return client;
}

export async function publishDeviceCommand(device, requestedState, metadata = {}) {
  if (!client?.connected) return { sent: false, reason: 'mqtt_not_connected' };

  const stateValue = normalizeSwitchState(requestedState);
  if (!stateValue) return { sent: false, reason: 'invalid_state' };

  const requestId = metadata.requestId || crypto.randomUUID();
  const timestamp = new Date().toISOString();

  if (config.mqtt.provider === 'adafruit') {
    const deviceKey = device.adafruit_device_key || device.device_code;
    const feedKey = config.mqtt.adafruit.deviceCommandFeeds[deviceKey];
    if (!feedKey) return { sent: false, reason: `missing_command_feed:${deviceKey}` };

    const topic = adafruitTopic(feedKey);
    // Giá trị 1/0 tương thích trực tiếp với Toggle Button trên Adafruit Dashboard.
    const payload = stateValue === 'ON' ? '1' : '0';
    client.publish(topic, payload, { qos: 0, retain: false });
    return { sent: true, requestId, topic, feedKey, payload, timestamp };
  }

  const topic = device.command_topic;
  client.publish(topic, JSON.stringify({ state: stateValue, request_id: requestId, timestamp }), { qos: 1 });
  return { sent: true, requestId, topic };
}

export function getMqttStatus() {
  return { ...state, subscriptions: [...state.subscriptions] };
}
