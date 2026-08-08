import mqtt from 'mqtt';

const apiUrl = process.env.TEST_API_URL || 'http://127.0.0.1:3102';
const broker = process.env.TEST_MQTT_BROKER || 'mqtt://127.0.0.1:1883';
const client = mqtt.connect(broker);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const waitFor = async (check, timeout = 5000) => {
  const started = Date.now();
  while (Date.now() - started < timeout) { const result = await check(); if (result) return result; await wait(100); }
  throw new Error('Timeout waiting for MQTT/API state');
};

await new Promise((resolve, reject) => { client.once('connect', resolve); client.once('error', reject); });

const loginResponse = await fetch(`${apiUrl}/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'admin@greenargric.edu.vn', password: 'greenargric2026' }) });
if (!loginResponse.ok) throw new Error(`Login failed: ${loginResponse.status}`);
const { token } = await loginResponse.json();
const headers = { 'content-type': 'application/json', authorization: `Bearer ${token}` };

client.publish('greenargric/area/1/sensor/TEMP-A1/data', JSON.stringify({ value: 31.5, unit: '°C', quality: 'good', timestamp: new Date().toISOString() }));
await waitFor(async () => {
  const response = await fetch(`${apiUrl}/sensor/area/1/latest`, { headers });
  if (!response.ok) return false;
  const rows = await response.json();
  return rows.some((row) => row.sensor_code === 'TEMP-A1' && row.value === 31.5);
});

const commandTopic = 'greenargric/area/1/device/FAN-A/set';
await new Promise((resolve, reject) => client.subscribe(commandTopic, (error) => error ? reject(error) : resolve()));
const commandPromise = new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('Device command not received')), 5000);
  client.on('message', (topic, payload) => {
    if (topic !== commandTopic) return;
    clearTimeout(timer);
    resolve(JSON.parse(payload.toString()));
  });
});
const overrideResponse = await fetch(`${apiUrl}/device/override`, { method: 'POST', headers, body: JSON.stringify({ device_id: 3, state: 'OFF', control_mode: 'MANUAL' }) });
if (!overrideResponse.ok) throw new Error(`Device override failed: ${overrideResponse.status} ${await overrideResponse.text()}`);
const command = await commandPromise;
if (command.state !== 'OFF' || !command.request_id) throw new Error(`Invalid command: ${JSON.stringify(command)}`);

client.publish('greenargric/area/1/device/FAN-A/status', JSON.stringify({ state: 'OFF', request_id: command.request_id, ok: true, timestamp: new Date().toISOString() }));
await waitFor(async () => {
  const response = await fetch(`${apiUrl}/device`, { headers });
  if (!response.ok) return false;
  const devices = await response.json();
  return devices.some((device) => device.device_code === 'FAN-A' && device.status === 'OFF');
});

client.end(true);
console.log('MQTT local sensor -> backend -> command -> device status: PASS');
