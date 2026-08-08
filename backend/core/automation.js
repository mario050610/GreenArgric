import { store, nextId } from '../data/store.js';
import { publishDeviceCommand } from '../mqtt.js';
import { persistAlert, persistCommand, updatePersistedCommand, updatePersistedDevice } from '../db.js';

const actions = {
  water_level: { below: 'circulation_pump', state: 'ON' },
  light: { below: 'grow_light', state: 'ON' },
  temperature: { above: 'fan', state: 'ON' },
  ec: { below: 'dosing_pump', state: 'ON' },
};

export async function evaluateReading(reading, sensor) {
  const threshold = store.thresholds.find((item) =>
    item.area_id === reading.area_id
    && item.sensor_type === sensor.sensor_type
    && item.is_activated,
  );
  if (!threshold) return;

  const tooLow = reading.value < threshold.min_value;
  const tooHigh = reading.value > threshold.max_value;
  if (!tooLow && !tooHigh) return;

  const duplicate = store.alerts.find((item) =>
    item.area_id === reading.area_id
    && item.sensor_type === sensor.sensor_type
    && item.status === 'open',
  );
  if (!duplicate) {
    const alert = {
      alert_id: nextId(store.alerts, 'alert_id'),
      area_id: reading.area_id,
      sensor_id: sensor.sensor_id,
      sensor_type: sensor.sensor_type,
      title: `${sensor.sensor_type} vượt ngưỡng`,
      message: `Giá trị ${reading.value} ${sensor.unit}; khoảng cho phép ${threshold.min_value}–${threshold.max_value}`,
      severity: threshold.warning_level,
      status: 'open',
      created_at: new Date().toISOString(),
    };
    store.alerts.unshift(alert);
    await persistAlert(alert);
  }

  const rule = actions[sensor.sensor_type];
  if (!rule || (tooLow && !rule.below) || (tooHigh && !rule.above)) return;

  const targetType = rule[tooLow ? 'below' : 'above'];
  const device = store.devices.find((item) =>
    item.area_id === reading.area_id
    && item.device_type === targetType
    && item.mode === 'AUTO',
  );
  if (!device || device.status === rule.state) return;

  const command = {
    command_id: nextId(store.commands, 'command_id'),
    device_id: device.device_id,
    user_id: null,
    command_type: rule.state,
    source: 'automation',
    result_status: 'pending',
    sent_at: new Date().toISOString(),
  };
  store.commands.unshift(command);
  await persistCommand(command);

  const result = await publishDeviceCommand(device, rule.state, { source: 'automation' });
  command.request_id = result.requestId || null;
  command.result_status = result.sent ? 'sent' : 'not_sent';
  await updatePersistedCommand(command);
  if (!result.sent) {
    device.status = rule.state;
    device.last_seen = new Date().toISOString();
    await updatePersistedDevice(device);
  }
}
