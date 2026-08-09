const now = Date.now();
const iso = (offsetMinutes = 0) => new Date(now + offsetMinutes * 60_000).toISOString();

const sensorDefinitions = [
  ['TEMP-A1', 'temperature', '°C', 1, 'ga-temperature'],
  ['HUM-A1', 'humidity', '%', 1, 'ga-humidity'],
  ['PH-A1', 'ph', 'pH', 1, 'ga-ph'],
  ['EC-A1', 'ec', 'mS/cm', 1, 'ga-ec'],
  ['LIGHT-A1', 'light', 'lux', 1, 'ga-light'],
  ['WATER-A1', 'water_level', '%', 1, 'ga-water-level'],
  ['TEMP-B1', 'temperature', '°C', 2, ''],
  ['PH-B1', 'ph', 'pH', 2, ''],
  ['EC-B1', 'ec', 'mS/cm', 2, ''],
  ['WATER-B1', 'water_level', '%', 2, ''],
  ['HUM-B1', 'humidity', '%', 2, ''],
  ['LIGHT-B1', 'light', 'lux', 2, ''],
  ...['C', 'D', 'E', 'F'].flatMap((code, index) => {
    const areaId = index + 3;
    return [
      [`TEMP-${code}1`, 'temperature', '°C', areaId, ''],
      [`HUM-${code}1`, 'humidity', '%', areaId, ''],
      [`PH-${code}1`, 'ph', 'pH', areaId, ''],
      [`EC-${code}1`, 'ec', 'mS/cm', areaId, ''],
      [`LIGHT-${code}1`, 'light', 'lux', areaId, ''],
      [`WATER-${code}1`, 'water_level', '%', areaId, ''],
    ];
  }),
];

export const store = {
  roles: [
    { role_id: 1, role_name: 'admin' },
    { role_id: 2, role_name: 'owner' },
    { role_id: 3, role_name: 'technician' },
  ],
  users: [
    { user_id: 1, role_id: 1, full_name: 'Phạm Phước Nguyên', email: 'admin@greenargric.edu.vn', password_hash: 'plain:greenargric2026', status: 'active' },
    { user_id: 2, role_id: 2, full_name: 'Huỳnh Minh Quân', email: 'owner@greenargric.edu.vn', password_hash: 'plain:greenargric2026', status: 'active' },
    { user_id: 3, role_id: 3, full_name: 'Trần Huỳnh Đăng Khoa', email: 'tech@greenargric.edu.vn', password_hash: 'plain:greenargric2026', status: 'active' },
    { user_id: 4, role_id: 2, full_name: 'Nguyễn Thúy Ái', email: 'ai.nta@greenargric.edu.vn', password_hash: 'plain:greenargric2026', status: 'active' },
    { user_id: 5, role_id: 3, full_name: 'Phạm Đình Duy Thái', email: 'thai.pdd@greenargric.edu.vn', password_hash: 'plain:greenargric2026', status: 'locked' },
    { user_id: 6, role_id: 3, full_name: 'Nguyễn Thanh Tâm', email: 'tam.nt@greenargric.edu.vn', password_hash: 'plain:greenargric2026', status: 'active' },
    { user_id: 7, role_id: 2, full_name: 'Trần Thị Nhi', email: 'nhi.tt@greenargric.edu.vn', password_hash: 'plain:greenargric2026', status: 'active' },
    { user_id: 8, role_id: 3, full_name: 'Nguyễn Văn Đức', email: 'duc.nv@greenargric.edu.vn', password_hash: 'plain:greenargric2026', status: 'active' },
  ],
  areas: [
    { area_id: 1, owner_id: 2, area_name: 'Khu A', location: 'Nhà màng phía Đông', crop_type: 'Rau muống', description: 'Khu trồng rau ăn lá và mô hình Micro:bit', status: 'active' },
    { area_id: 2, owner_id: 2, area_name: 'Khu B', location: 'Nhà màng trung tâm', crop_type: 'Xà lách xanh', description: 'Khu trồng xà lách', status: 'active' },
    { area_id: 3, owner_id: 4, area_name: 'Khu C', location: 'Nhà màng phía Tây', crop_type: 'Cải bó xôi', description: 'Khu thử nghiệm', status: 'maintenance' },
    { area_id: 4, owner_id: 4, area_name: 'Khu D', location: 'Nhà màng phía Bắc', crop_type: 'Húng quế', description: 'Khu trồng rau gia vị', status: 'active' },
    { area_id: 5, owner_id: 7, area_name: 'Khu E', location: 'Nhà màng mở rộng 1', crop_type: 'Cà chua bi', description: 'Khu trồng cây ăn quả thủy canh', status: 'active' },
    { area_id: 6, owner_id: 7, area_name: 'Khu F', location: 'Nhà màng mở rộng 2', crop_type: 'Dưa leo', description: 'Khu trồng dây leo', status: 'active' },
  ],
  sensors: sensorDefinitions.map((sensor, index) => ({
    sensor_id: index + 1,
    sensor_code: sensor[0],
    sensor_type: sensor[1],
    unit: sensor[2],
    area_id: sensor[3],
    adafruit_feed_key: sensor[4],
    mqtt_topic: `greenargric/area/${sensor[3]}/sensor/${sensor[0]}/data`,
    status: 'online',
    last_seen: iso(-2),
  })),
  readings: [],
  devices: [
    {
      device_id: 1, area_id: 1, device_code: 'PUMP-CIRC-A', device_name: 'Máy bơm tuần hoàn A',
      device_type: 'circulation_pump', adafruit_device_key: 'pump', status: 'ON', mode: 'AUTO',
      command_topic: 'greenargric/area/1/device/PUMP-CIRC-A/set',
      status_topic: 'greenargric/area/1/device/PUMP-CIRC-A/status', last_seen: iso(-1),
    },
    {
      device_id: 2, area_id: 1, device_code: 'LED-A', device_name: 'Đèn LED A',
      device_type: 'grow_light', adafruit_device_key: 'grow_light', status: 'OFF', mode: 'AUTO',
      command_topic: 'greenargric/area/1/device/LED-A/set',
      status_topic: 'greenargric/area/1/device/LED-A/status', last_seen: iso(-1),
    },
    {
      device_id: 3, area_id: 1, device_code: 'FAN-A', device_name: 'Quạt thông gió A',
      device_type: 'fan', adafruit_device_key: 'fan', status: 'ON', mode: 'AUTO',
      command_topic: 'greenargric/area/1/device/FAN-A/set',
      status_topic: 'greenargric/area/1/device/FAN-A/status', last_seen: iso(-1),
    },
    {
      device_id: 4, area_id: 1, device_code: 'DOSING-A', device_name: 'Bơm châm dinh dưỡng A',
      device_type: 'dosing_pump', adafruit_device_key: 'dosing_pump', status: 'OFF', mode: 'MANUAL',
      command_topic: 'greenargric/area/1/device/DOSING-A/set',
      status_topic: 'greenargric/area/1/device/DOSING-A/status', last_seen: iso(-1),
    },
    { device_id: 5, area_id: 2, device_code: 'PUMP-B', device_name: 'Máy bơm tưới B', device_type: 'circulation_pump', status: 'OFF', mode: 'AUTO', last_seen: iso(-2) },
    { device_id: 6, area_id: 2, device_code: 'LED-B', device_name: 'Hệ thống đèn LED B', device_type: 'grow_light', status: 'ON', mode: 'AUTO', last_seen: iso(-2) },
    { device_id: 7, area_id: 3, device_code: 'FAN-C', device_name: 'Quạt thông gió C', device_type: 'fan', status: 'ON', mode: 'AUTO', last_seen: iso(-2) },
    { device_id: 8, area_id: 3, device_code: 'OXY-C', device_name: 'Bơm oxy hòa tan C', device_type: 'circulation_pump', status: 'ON', mode: 'AUTO', last_seen: iso(-2) },
    { device_id: 9, area_id: 4, device_code: 'OXY-D', device_name: 'Bơm oxy hòa tan D', device_type: 'circulation_pump', status: 'ON', mode: 'AUTO', last_seen: iso(-2) },
    { device_id: 10, area_id: 4, device_code: 'FAN-D', device_name: 'Quạt làm mát D', device_type: 'fan', status: 'OFF', mode: 'AUTO', last_seen: iso(-2) },
    { device_id: 11, area_id: 5, device_code: 'PUMP-E', device_name: 'Bơm tuần hoàn E', device_type: 'circulation_pump', status: 'ON', mode: 'AUTO', last_seen: iso(-2) },
    { device_id: 12, area_id: 5, device_code: 'LED-E', device_name: 'Đèn LED sinh trưởng E', device_type: 'grow_light', status: 'ON', mode: 'AUTO', last_seen: iso(-2) },
    { device_id: 13, area_id: 5, device_code: 'FAN-E', device_name: 'Quạt đối lưu E', device_type: 'fan', status: 'ON', mode: 'AUTO', last_seen: iso(-2) },
    { device_id: 14, area_id: 6, device_code: 'DOSING-F', device_name: 'Bơm dinh dưỡng F', device_type: 'dosing_pump', status: 'OFF', mode: 'AUTO', last_seen: iso(-2) },
    { device_id: 15, area_id: 6, device_code: 'PUMP-F', device_name: 'Bơm tuần hoàn F', device_type: 'circulation_pump', status: 'ON', mode: 'AUTO', last_seen: iso(-2) },
    { device_id: 16, area_id: 6, device_code: 'LED-F', device_name: 'Đèn LED sinh trưởng F', device_type: 'grow_light', status: 'ON', mode: 'AUTO', last_seen: iso(-2) },
  ],
  thresholds: [
    { threshold_id: 1, area_id: 1, sensor_type: 'temperature', min_value: 22, max_value: 30, warning_level: 'medium', is_activated: true },
    { threshold_id: 2, area_id: 1, sensor_type: 'humidity', min_value: 60, max_value: 85, warning_level: 'low', is_activated: true },
    { threshold_id: 3, area_id: 1, sensor_type: 'ph', min_value: 5.8, max_value: 6.5, warning_level: 'high', is_activated: true },
    { threshold_id: 4, area_id: 1, sensor_type: 'ec', min_value: 1.2, max_value: 2.2, warning_level: 'high', is_activated: true },
    { threshold_id: 5, area_id: 1, sensor_type: 'water_level', min_value: 40, max_value: 100, warning_level: 'high', is_activated: true },
    { threshold_id: 6, area_id: 1, sensor_type: 'light', min_value: 500, max_value: 1200, warning_level: 'low', is_activated: true },
  ],
  alerts: [
    { alert_id: 1, area_id: 1, sensor_type: 'ph', title: 'pH vượt ngưỡng trên', message: 'pH hiện tại 7.1, ngưỡng tối đa 6.5', severity: 'high', status: 'open', created_at: iso(-120) },
    { alert_id: 2, area_id: 2, sensor_type: 'temperature', title: 'Nhiệt độ cao bất thường', message: 'Nhiệt độ hiện tại 29.5°C', severity: 'medium', status: 'open', created_at: iso(-180) },
    { alert_id: 3, area_id: 1, sensor_type: 'ec', title: 'EC thấp', message: 'EC hiện tại 1.1 mS/cm', severity: 'high', status: 'resolved', created_at: iso(-240), resolved_at: iso(-200), resolved_by: 3 },
  ],
  commands: [],
  tasks: [
    { task_id: 1, area_id: 1, assigned_to: 3, title: 'Kiểm tra đầu dò pH', description: 'Hiệu chuẩn lại cảm biến pH khu A', task_type: 'maintenance', scheduled_at: iso(1440), status: 'pending' },
    { task_id: 2, area_id: 2, assigned_to: 6, title: 'Thay dung dịch dinh dưỡng', description: 'Thay dung dịch theo lịch', task_type: 'care', scheduled_at: iso(2880), status: 'pending' },
    { task_id: 3, area_id: 1, assigned_to: 8, title: 'Kiểm tra hệ thống đèn LED A', description: 'Đo cường độ và kiểm tra lịch chiếu sáng', task_type: 'maintenance', scheduled_at: iso(4320), status: 'pending' },
    { task_id: 4, area_id: 1, assigned_to: 3, title: 'Kiểm tra máy điều chỉnh pH', description: 'Kiểm tra van và đường ống bơm châm', task_type: 'maintenance', scheduled_at: iso(5760), status: 'pending' },
    { task_id: 5, area_id: 3, assigned_to: 6, title: 'Vệ sinh quạt thông gió C', description: 'Vệ sinh cánh quạt và kiểm tra độ rung', task_type: 'maintenance', scheduled_at: iso(7200), status: 'pending' },
    { task_id: 6, area_id: 4, assigned_to: 8, title: 'Kiểm tra bơm oxy hòa tan D', description: 'Đo áp suất và kiểm tra lưu lượng khí', task_type: 'maintenance', scheduled_at: iso(8640), status: 'pending' },
    { task_id: 7, area_id: 5, assigned_to: 3, title: 'Kiểm tra bơm tuần hoàn E', description: 'Kiểm tra lưu lượng và vệ sinh bộ lọc', task_type: 'maintenance', scheduled_at: iso(10080), status: 'pending' },
    { task_id: 8, area_id: 5, assigned_to: 6, title: 'Vệ sinh đèn LED sinh trưởng E', description: 'Vệ sinh bề mặt và đo cường độ sáng', task_type: 'maintenance', scheduled_at: iso(11520), status: 'pending' },
    { task_id: 9, area_id: 6, assigned_to: 8, title: 'Kiểm tra bơm dinh dưỡng F', description: 'Kiểm tra ống châm và định lượng dung dịch', task_type: 'maintenance', scheduled_at: iso(12960), status: 'pending' },
    { task_id: 10, area_id: 6, assigned_to: 3, title: 'Bảo trì bơm tuần hoàn F', description: 'Vệ sinh và kiểm tra lưu lượng tuần hoàn', task_type: 'maintenance', scheduled_at: iso(14400), status: 'pending' },
  ],
  messages: [
    { message_id: 1, sender_id: 2, receiver_id: 1, content: 'Nhờ quản trị viên kiểm tra kết nối gateway Khu A giúp tôi.', created_at: iso(-75), read_at: iso(-65) },
    { message_id: 2, sender_id: 1, receiver_id: 2, content: 'Đã nhận. Tôi đang kiểm tra nhật ký hệ thống.', created_at: iso(-60), read_at: iso(-55) },
    { message_id: 3, sender_id: 2, receiver_id: 3, content: 'Khoa kiểm tra giúp máy điều chỉnh pH tại Khu A nhé.', created_at: iso(-45), read_at: null },
    { message_id: 4, sender_id: 3, receiver_id: 2, content: 'Dạ, em sẽ kiểm tra lúc 14:00 và cập nhật lại.', created_at: iso(-35), read_at: null },
    { message_id: 5, sender_id: 1, receiver_id: 3, content: 'Khoa cập nhật giúp tình trạng cảm biến EC Khu C nhé.', created_at: iso(-30), read_at: iso(-28) },
    { message_id: 6, sender_id: 3, receiver_id: 1, content: 'Cảm biến EC đang lệch 0.23 mS/cm, em đã lên lịch hiệu chỉnh.', created_at: iso(-25), read_at: null },
    { message_id: 7, sender_id: 2, receiver_id: 1, content: 'Gateway Khu A đã kết nối ổn định lại chưa?', created_at: iso(-20), read_at: null },
    { message_id: 8, sender_id: 1, receiver_id: 2, content: 'Đã ổn định rồi anh. Dữ liệu cảm biến đang cập nhật bình thường.', created_at: iso(-15), read_at: null },
    { message_id: 9, sender_id: 2, receiver_id: 3, content: 'Sau khi hiệu chỉnh EC, nhắn lại kết quả cho tôi nhé.', created_at: iso(-10), read_at: null },
    { message_id: 10, sender_id: 3, receiver_id: 2, content: 'Dạ được, em sẽ gửi kết quả ngay khi hoàn thành.', created_at: iso(-5), read_at: null },
  ],
};

const defaults = {
  temperature: 27.8,
  humidity: 72,
  ph: 6.3,
  ec: 1.95,
  light: 680,
  water_level: 72,
};

// Đồng bộ với số liệu riêng trên màn hình chi tiết của từng khu, tránh dùng
// một bộ giá trị mẫu cho toàn bộ sáu khu.
const areaDefaults = {
  1: { temperature: 25.8, humidity: 63, ph: 6.2, ec: 1.88, light: 680, water_level: 72 },
  2: { temperature: 24.7, humidity: 67, ph: 6.1, ec: 1.82, light: 620, water_level: 76 },
  3: { temperature: 26.3, humidity: 62, ph: 6.3, ec: 1.62, light: 590, water_level: 38 },
  4: { temperature: 25.5, humidity: 64, ph: 6.0, ec: 1.84, light: 480, water_level: 74 },
  5: { temperature: 27.2, humidity: 59, ph: 6.8, ec: 1.1, light: 710, water_level: 68 },
  6: { temperature: 26.5, humidity: 61, ph: 6.2, ec: 1.89, light: 640, water_level: 70 },
};

const thresholdDefaults = {
  temperature: [22, 30, 'medium'], humidity: [60, 85, 'low'], ph: [5.8, 6.5, 'high'],
  ec: [1.2, 2.2, 'high'], water_level: [40, 100, 'high'], light: [500, 1200, 'low'],
};

for (const area of store.areas) {
  for (const [sensorType, [minValue, maxValue, warningLevel]] of Object.entries(thresholdDefaults)) {
    if (!store.thresholds.some((item) => item.area_id === area.area_id && item.sensor_type === sensorType)) {
      store.thresholds.push({
        threshold_id: Math.max(0, ...store.thresholds.map((item) => item.threshold_id)) + 1, area_id: area.area_id, sensor_type: sensorType,
        min_value: minValue, max_value: maxValue, warning_level: warningLevel, is_activated: true,
      });
    }
  }
}

for (const sensor of store.sensors) {
  for (let i = 24; i >= 0; i -= 1) {
    const base = areaDefaults[sensor.area_id]?.[sensor.sensor_type] ?? defaults[sensor.sensor_type] ?? 0;
    const scale = sensor.sensor_type === 'light'
      ? 80
      : sensor.sensor_type === 'water_level'
        ? 5
        : sensor.sensor_type === 'humidity'
          ? 4
          : 0.4;
    store.readings.push({
      reading_id: store.readings.length + 1,
      sensor_id: sensor.sensor_id,
      area_id: sensor.area_id,
      value: Number((base + Math.sin(i / 3) * scale).toFixed(2)),
      unit: sensor.unit,
      reading_time: iso(-i * 60),
      quality_flag: 'good',
    });
  }
}

export const nextId = (items, key) => Math.max(0, ...items.map((item) => Number(item[key]) || 0)) + 1;
