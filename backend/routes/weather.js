import { Router } from 'express';

const router = Router();

const LOCATIONS = [
  { id: 'hcm', name: 'TP.HCM', latitude: 10.8231, longitude: 106.6297 },
  { id: 'da-lat', name: 'Đà Lạt', latitude: 11.9404, longitude: 108.4583 },
  { id: 'can-tho', name: 'Cần Thơ', latitude: 10.0452, longitude: 105.7469 },
];

const WEATHER_LABELS = new Map([
  [0, 'Trời quang'], [1, 'Ít mây'], [2, 'Có mây'], [3, 'Nhiều mây'],
  [45, 'Có sương mù'], [48, 'Sương mù dày'], [51, 'Mưa phùn nhẹ'],
  [53, 'Mưa phùn'], [55, 'Mưa phùn dày'], [61, 'Mưa nhẹ'],
  [63, 'Có mưa'], [65, 'Mưa lớn'], [80, 'Mưa rào nhẹ'],
  [81, 'Mưa rào'], [82, 'Mưa rào lớn'], [95, 'Có dông'],
  [96, 'Dông kèm mưa đá'], [99, 'Dông mạnh kèm mưa đá'],
]);

let weatherCache = null;
let weatherCacheUntil = 0;

const valueAt = (values, index, fallback = 0) => Number(values?.[index] ?? fallback);

function buildTips(location, today) {
  const tips = [];
  if (today.precipitationProbability >= 60 || today.precipitation >= 8) {
    tips.push('Giảm lịch tưới ngoài trời, kiểm tra thoát nước và che cây non trước mưa.');
  } else if (today.temperatureMax >= 34) {
    tips.push('Ưu tiên tưới sáng sớm, che nắng trưa và kiểm tra mực nước thường xuyên.');
  } else {
    tips.push('Duy trì lịch tưới hiện tại và kiểm tra độ ẩm giá thể trước mỗi lần tưới.');
  }
  if (today.windMax >= 25) tips.push('Gia cố giàn leo và hạn chế phun tưới khi gió mạnh.');
  if (today.temperatureMin <= 18) tips.push('Theo dõi cây ưa ấm vào sáng sớm và tránh tưới nước quá lạnh.');
  if (today.sunshineHours >= 8) tips.push('Theo dõi cháy lá, bổ sung che lưới cho rau ăn lá vào giữa trưa.');
  return tips.slice(0, 2).map((text) => ({ location: location.name, text }));
}

async function loadLocationWeather(location) {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    timezone: 'Asia/Ho_Chi_Minh',
    forecast_days: '3',
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunshine_duration',
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Open-Meteo phản hồi ${response.status}`);
  const result = await response.json();
  const forecast = result.daily.time.map((date, index) => ({
    date,
    weatherCode: valueAt(result.daily.weather_code, index),
    condition: WEATHER_LABELS.get(valueAt(result.daily.weather_code, index)) || 'Thời tiết thay đổi',
    temperatureMax: valueAt(result.daily.temperature_2m_max, index),
    temperatureMin: valueAt(result.daily.temperature_2m_min, index),
    precipitation: valueAt(result.daily.precipitation_sum, index),
    precipitationProbability: valueAt(result.daily.precipitation_probability_max, index),
    windMax: valueAt(result.daily.wind_speed_10m_max, index),
    sunshineHours: Number((valueAt(result.daily.sunshine_duration, index) / 3600).toFixed(1)),
  }));
  return {
    ...location,
    current: {
      temperature: Number(result.current.temperature_2m),
      apparentTemperature: Number(result.current.apparent_temperature),
      humidity: Number(result.current.relative_humidity_2m),
      windSpeed: Number(result.current.wind_speed_10m),
      weatherCode: Number(result.current.weather_code),
      condition: WEATHER_LABELS.get(Number(result.current.weather_code)) || 'Thời tiết thay đổi',
    },
    forecast,
    tips: buildTips(location, forecast[0]),
  };
}

router.get('/daily', async (_req, res) => {
  try {
    if (weatherCache && Date.now() < weatherCacheUntil) return res.json(weatherCache);
    const locations = await Promise.all(LOCATIONS.map(loadLocationWeather));
    weatherCache = {
      date: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date()),
      updatedAt: new Date().toISOString(),
      source: 'Open-Meteo',
      locations,
    };
    weatherCacheUntil = Date.now() + 30 * 60_000;
    return res.json(weatherCache);
  } catch (error) {
    return res.status(503).json({ message: 'Chưa thể tải dữ liệu thời tiết. Vui lòng thử lại sau.', detail: error.message });
  }
});

export default router;
