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
  ...['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].flatMap((code, index) => {
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
    { area_id: 1, owner_id: 2, area_name: 'Khu A', location: 'Nhà màng phía Đông', crop_type: 'Rau muống', description: 'Khu trồng rau ăn lá và mô hình Micro:bit', status: 'active', ui_status: 'good', health_score: 92, planted_date: '15/05', harvest_date: '30/06' },
    { area_id: 2, owner_id: 2, area_name: 'Khu B', location: 'Nhà màng trung tâm', crop_type: 'Xà lách xanh', description: 'Khu trồng xà lách', status: 'active', ui_status: 'good', health_score: 87, planted_date: '01/06', harvest_date: '15/07' },
    { area_id: 3, owner_id: 2, area_name: 'Khu C', location: 'Nhà màng phía Tây', crop_type: 'Cải bó xôi', description: 'Khu thử nghiệm', status: 'maintenance', ui_status: 'warning', health_score: 74, planted_date: '20/05', harvest_date: '04/07' },
    { area_id: 4, owner_id: 2, area_name: 'Khu D', location: 'Nhà màng phía Bắc', crop_type: 'Húng quế', description: 'Khu trồng rau gia vị', status: 'active' },
    { area_id: 5, owner_id: 4, area_name: 'Khu E', location: 'Nhà màng mở rộng 1', crop_type: 'Cà chua bi', description: 'Khu trồng cây ăn quả thủy canh', status: 'active', ui_status: 'danger', health_score: 63, planted_date: '01/05', harvest_date: '15/07' },
    { area_id: 6, owner_id: 4, area_name: 'Khu F', location: 'Nhà màng mở rộng 2', crop_type: 'Dưa leo', description: 'Khu trồng dây leo', status: 'active' },
    { area_id: 7, owner_id: 4, area_name: 'Khu G', location: 'Nhà màng mở rộng 3', crop_type: 'Cải thìa', description: 'Khu rau ăn lá', status: 'active' },
    { area_id: 8, owner_id: 4, area_name: 'Khu H', location: 'Nhà màng mở rộng 4', crop_type: 'Dâu tây', description: 'Khu cây ăn quả', status: 'active' },
    { area_id: 9, owner_id: 7, area_name: 'Khu I', location: 'Nhà màng phía Nam 1', crop_type: 'Cải kale', description: 'Khu rau dinh dưỡng', status: 'active' },
    { area_id: 10, owner_id: 7, area_name: 'Khu J', location: 'Nhà màng phía Nam 2', crop_type: 'Bạc hà', description: 'Khu rau gia vị', status: 'active' },
    { area_id: 11, owner_id: 7, area_name: 'Khu K', location: 'Nhà màng phía Nam 3', crop_type: 'Ớt chuông', description: 'Khu cây ăn quả', status: 'active', ui_status: 'warning', health_score: 79, planted_date: '18/05', harvest_date: '05/08' },
    { area_id: 12, owner_id: 7, area_name: 'Khu L', location: 'Nhà màng phía Nam 4', crop_type: 'Xà lách tím', description: 'Khu rau ăn lá', status: 'active' },
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
    ...['G', 'H', 'I', 'J', 'K', 'L'].flatMap((code, index) => {
      const areaId = index + 7;
      const firstId = 17 + index * 2;
      return [
        { device_id: firstId, area_id: areaId, device_code: `PUMP-${code}`, device_name: `Bơm tuần hoàn ${code}`, device_type: 'circulation_pump', status: index % 2 ? 'OFF' : 'ON', mode: 'AUTO', last_seen: iso(-2) },
        { device_id: firstId + 1, area_id: areaId, device_code: `LED-${code}`, device_name: `Đèn LED sinh trưởng ${code}`, device_type: 'grow_light', status: 'ON', mode: 'AUTO', last_seen: iso(-2) },
      ];
    }),
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
  tasks: ['A','B','C','D','E','F','G','H','I','J','K','L'].flatMap((code, index) => ([
    {
      task_id: index * 2 + 1,
      area_id: index + 1,
      assigned_to: [3, 6, 8][index % 3],
      title: index % 3 === 0 ? `Kiểm tra cảm biến pH Khu ${code}` : index % 3 === 1 ? `Bảo trì bơm tuần hoàn Khu ${code}` : `Kiểm tra đèn LED Khu ${code}`,
      description: index % 3 === 0 ? 'Hiệu chuẩn và kiểm tra đầu dò pH' : index % 3 === 1 ? 'Vệ sinh bộ lọc và kiểm tra lưu lượng' : 'Đo cường độ và kiểm tra lịch chiếu sáng',
      task_type: 'maintenance', scheduled_at: iso((index + 1) * 1440), status: 'pending',
    },
    {
      task_id: index * 2 + 2,
      area_id: index + 1,
      assigned_to: [6, 8, 3][index % 3],
      title: index % 3 === 0 ? `Lắp đặt cảm biến mực nước Khu ${code}` : index % 3 === 1 ? `Sửa chữa máy bơm tưới Khu ${code}` : `Lắp đặt quạt thông gió Khu ${code}`,
      description: index % 3 === 0 ? 'Đi dây, cố định cảm biến và kiểm tra tín hiệu' : index % 3 === 1 ? 'Kiểm tra động cơ, đường ống và thay linh kiện hỏng' : 'Lắp giá đỡ, đấu relay và chạy thử thiết bị',
      task_type: index % 3 === 1 ? 'repair' : 'installation', scheduled_at: iso((index + 2) * 1440 + 240), status: 'pending',
    },
  ])),
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
  7: { temperature: 25.1, humidity: 66, ph: 6.0, ec: 1.76, light: 610, water_level: 75 },
  8: { temperature: 23.9, humidity: 69, ph: 5.9, ec: 1.68, light: 730, water_level: 78 },
  9: { temperature: 24.8, humidity: 65, ph: 6.4, ec: 1.91, light: 660, water_level: 73 },
  10: { temperature: 26.0, humidity: 60, ph: 6.1, ec: 1.73, light: 690, water_level: 71 },
  11: { temperature: 27.0, humidity: 58, ph: 6.5, ec: 2.02, light: 750, water_level: 69 },
  12: { temperature: 24.3, humidity: 68, ph: 6.2, ec: 1.79, light: 600, water_level: 77 },
};

const thresholdDefaults = {
  temperature: [22, 30, 'medium'], humidity: [60, 85, 'low'], ph: [5.8, 6.5, 'high'],
  ec: [1.2, 2.2, 'high'], water_level: [40, 100, 'high'], light: [500, 1200, 'low'],
  co2: [400, 1200, 'medium'], dissolved_oxygen: [5, 10, 'high'], solution_temperature: [18, 26, 'medium'],
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
