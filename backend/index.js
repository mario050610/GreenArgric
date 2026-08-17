import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { config } from './config.js';
import { connectDatabase, hydrateStoreFromDatabase } from './db.js';
import { startMqtt, getMqttStatus } from './mqtt.js';
import { authRequired } from './middleware/auth.js';
import { errorHandler, notFound } from './middleware/error.js';
import swaggerDocument from './config/swagger.json' with { type: 'json' };
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import areaRoutes from './routes/area.js';
import sensorRoutes from './routes/sensor.js';
import deviceRoutes from './routes/device.js';
import thresholdRoutes from './routes/threshold.js';
import alertRoutes from './routes/alert.js';
import activityRoutes from './routes/activity.js';
import taskRoutes from './routes/task.js';
import userRoutes from './routes/user.js';
import integrationRoutes from './routes/integration.js';
import messageRoutes from './routes/message.js';
import aiRoutes from './routes/ai.js';
import weatherRoutes from './routes/weather.js';

const app = express();
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.get('/health', (req, res) => res.json({
  status: 'ok',
  service: 'GREEN ARGRIC API',
  dataMode: config.dataMode,
  mqtt: getMqttStatus(),
}));
app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/auth', authRoutes);
app.use('/dashboard', authRequired, dashboardRoutes);
app.use('/area', authRequired, areaRoutes);
app.use('/sensor', authRequired, sensorRoutes);
app.use('/device', authRequired, deviceRoutes);
app.use('/threshold', authRequired, thresholdRoutes);
app.use('/alert', authRequired, alertRoutes);
app.use('/activity', authRequired, activityRoutes);
app.use('/task', authRequired, taskRoutes);
app.use('/user', authRequired, userRoutes);
app.use('/integration', authRequired, integrationRoutes);
app.use('/message', authRequired, messageRoutes);
app.use('/ai', authRequired, aiRoutes);
app.use('/weather', authRequired, weatherRoutes);
app.use(notFound);
app.use(errorHandler);

await connectDatabase().catch((error) => {
  console.error('[database]', error.message);
  process.exitCode = 1;
});
await hydrateStoreFromDatabase().catch((error) => {
  console.error('[database] Hydration failed:', error.message);
  process.exitCode = 1;
});
startMqtt();

async function warmOllama() {
  if (config.ai.provider !== 'ollama') return;
  try {
    const response = await fetch(`${config.ai.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model: config.ai.ollamaModel, prompt: '', stream: false, keep_alive: '30m' }),
      signal: AbortSignal.timeout(120_000),
    });
    if (!response.ok) throw new Error(`Ollama phản hồi ${response.status}`);
    console.log(`[ai] ${config.ai.ollamaModel} đã sẵn sàng và được giữ trong bộ nhớ 30 phút`);
  } catch (error) {
    console.warn(`[ai] Chưa thể làm nóng ${config.ai.ollamaModel}: ${error.message}`);
  }
}

app.listen(config.port, () => {
  console.log(`GREEN ARGRIC API: http://localhost:${config.port} | Swagger: /api`);
  void warmOllama();
});
