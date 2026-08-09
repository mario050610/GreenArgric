import sql from 'mssql';
import { readFile, rename, writeFile } from 'node:fs/promises';
import { config } from './config.js';
import { store } from './data/store.js';

let pool;
const memoryUsersFile = new URL(process.env.USER_DATA_FILE || './data/runtime-users.json', import.meta.url);

async function saveMemoryUsers(users) {
  const temporaryFile = new URL(`${memoryUsersFile.href}.tmp`);
  await writeFile(temporaryFile, `${JSON.stringify(users, null, 2)}\n`, 'utf8');
  await rename(temporaryFile, memoryUsersFile);
}

export const isSqlMode = () => config.dataMode.toLowerCase() === 'mssql';

export async function connectDatabase() {
  if (!isSqlMode()) return null;
  if (pool?.connected) return pool;
  pool = await sql.connect(config.db);
  console.log(`[database] Connected to ${config.db.database}`);
  return pool;
}

export async function query(text, params = {}) {
  const db = await connectDatabase();
  const request = db.request();
  for (const [name, value] of Object.entries(params)) request.input(name, value);
  return request.query(text);
}

const tableLoads = {
  roles: 'SELECT * FROM Role',
  users: 'SELECT * FROM [User]',
  areas: 'SELECT * FROM HydroponicArea',
  sensors: 'SELECT * FROM Sensor',
  devices: 'SELECT * FROM Device',
  readings: 'SELECT TOP (5000) * FROM HydroponicReading ORDER BY reading_time',
  thresholds: 'SELECT * FROM ThresholdConfig',
  alerts: 'SELECT TOP (1000) * FROM Alert ORDER BY created_at DESC',
  commands: 'SELECT TOP (1000) * FROM DeviceCommand ORDER BY sent_at DESC',
  tasks: 'SELECT * FROM Task',
};

export async function hydrateStoreFromDatabase() {
  if (!isSqlMode()) {
    try {
      const users = JSON.parse(await readFile(memoryUsersFile, 'utf8'));
      if (Array.isArray(users) && users.length) store.users.splice(0, store.users.length, ...users);
      console.log(`[database] Loaded ${store.users.length} users from persistent memory file`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    return;
  }
  for (const [key, statement] of Object.entries(tableLoads)) {
    const result = await query(statement);
    store[key].splice(0, store[key].length, ...result.recordset);
  }
  console.log('[database] Loaded application state from SQL Server');
}

export async function persistReading(reading) {
  if (!isSqlMode()) return;
  const result = await query(`INSERT INTO HydroponicReading(sensor_id,area_id,value,unit,reading_time,quality_flag)
    OUTPUT INSERTED.reading_id VALUES(@sensor_id,@area_id,@value,@unit,@reading_time,@quality_flag)`, reading);
  reading.reading_id = Number(result.recordset[0].reading_id);
  await query('UPDATE Sensor SET last_seen=@reading_time,status=\'online\' WHERE sensor_id=@sensor_id', reading);
}

export async function persistAlert(alert) {
  if (!isSqlMode()) return;
  const result = await query(`INSERT INTO Alert(area_id,sensor_id,title,message,alert_type,severity,status,created_at)
    OUTPUT INSERTED.alert_id VALUES(@area_id,@sensor_id,@title,@message,@sensor_type,@severity,@status,@created_at)`, alert);
  alert.alert_id = Number(result.recordset[0].alert_id);
}

export async function persistCommand(command) {
  if (!isSqlMode()) return;
  const result = await query(`INSERT INTO DeviceCommand(device_id,user_id,command_type,source,payload,result_status,sent_at)
    OUTPUT INSERTED.command_id VALUES(@device_id,@user_id,@command_type,@source,@payload,@result_status,@sent_at)`, command);
  command.command_id = Number(result.recordset[0].command_id);
}

export async function updatePersistedCommand(command) {
  if (!isSqlMode()) return;
  await query('UPDATE DeviceCommand SET result_status=@result_status WHERE command_id=@command_id', command);
}

export async function updatePersistedDevice(device) {
  if (!isSqlMode()) return;
  await query('UPDATE Device SET status=@status,mode=@mode,last_seen=@last_seen WHERE device_id=@device_id', device);
}

export async function persistDevice(device) {
  if (!isSqlMode()) return;
  const result = await query(`INSERT INTO Device(area_id,device_code,device_name,device_type,adafruit_device_key,command_topic,status_topic,status,mode)
    OUTPUT INSERTED.device_id VALUES(@area_id,@device_code,@device_name,@device_type,@adafruit_device_key,@command_topic,@status_topic,@status,@mode)`, device);
  device.device_id = Number(result.recordset[0].device_id);
}

export async function persistUser(user) {
  if (!isSqlMode()) {
    await saveMemoryUsers([...store.users.filter((item) => item.user_id !== user.user_id), user]);
    return;
  }
  const result = await query(`INSERT INTO [User](role_id,full_name,email,password_hash,status)
    OUTPUT INSERTED.user_id VALUES(@role_id,@full_name,@email,@password_hash,@status)`, user);
  user.user_id = Number(result.recordset[0].user_id);
}

export async function updatePersistedUser(user) {
  if (!isSqlMode()) {
    await saveMemoryUsers(store.users);
    return;
  }
  await query(`UPDATE [User] SET role_id=@role_id,full_name=@full_name,email=@email,
    password_hash=@password_hash,status=@status WHERE user_id=@user_id`, user);
}

export { sql };
