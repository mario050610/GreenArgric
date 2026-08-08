const apiUrl = process.env.TEST_API_URL || 'http://127.0.0.1:3103';
const phase = process.env.TEST_PHASE || 'write';
const marker = Number(process.env.TEST_READING_VALUE || '29.876');

const loginResponse = await fetch(`${apiUrl}/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'admin@greenargric.edu.vn', password: 'greenargric2026' }) });
if (!loginResponse.ok) throw new Error(`MSSQL login failed: ${loginResponse.status} ${await loginResponse.text()}`);
const { token } = await loginResponse.json();
const headers = { 'content-type': 'application/json', authorization: `Bearer ${token}` };

if (phase === 'write') {
  const response = await fetch(`${apiUrl}/sensor/data`, { method: 'POST', headers, body: JSON.stringify({ sensor_code: 'TEMP-A1', value: marker, unit: '°C', quality_flag: 'test' }) });
  if (response.status !== 201) throw new Error(`MSSQL reading insert failed: ${response.status} ${await response.text()}`);
  console.log('MSSQL write phase: PASS');
} else {
  const response = await fetch(`${apiUrl}/sensor/area/1/history/temperature`, { headers });
  if (!response.ok) throw new Error(`MSSQL history failed: ${response.status}`);
  const rows = await response.json();
  if (!rows.some((row) => Number(row.value) === marker)) throw new Error(`Persisted marker ${marker} not found after restart`);
  console.log('MSSQL restart/read phase: PASS');
}
