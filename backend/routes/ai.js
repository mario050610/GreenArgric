import { Router } from 'express';
import { config } from '../config.js';
import { store } from '../data/store.js';

const router = Router();

router.post('/chat', async (req, res) => {
  const message = String(req.body.message || '').trim();
  const history = Array.isArray(req.body.history) ? req.body.history.slice(-10) : [];
  if (!message) return res.status(400).json({ message: 'Nội dung câu hỏi là bắt buộc' });
  const gardenContext = {
    readings: Object.fromEntries(['temperature', 'humidity', 'ph', 'ec', 'water_level'].map((type) => [type, store.readings.filter((item) => store.sensors.find((sensor) => sensor.sensor_id === item.sensor_id)?.sensor_type === type).at(-1)?.value])),
    openAlerts: store.alerts.filter((alert) => alert.status === 'open').map((alert) => ({ title: alert.title, severity: alert.severity })),
    devices: store.devices.map((device) => ({ name: device.device_name, status: device.status, mode: device.mode })),
  };
  const system = `Bạn là trợ lý GREEN ARGRIC. Trả lời tự nhiên bằng tiếng Việt, rõ ràng và an toàn. Dùng dữ liệu vườn khi liên quan, không bịa trạng thái thiết bị. Dữ liệu hiện tại: ${JSON.stringify(gardenContext)}`;
  const messages = [{ role: 'system', content: system }, ...history.map((item) => ({ role: item.role === 'assistant' ? 'assistant' : 'user', content: String(item.content || '') })), { role: 'user', content: message }];
  try {
    if (config.ai.provider === 'ollama') {
      const response = await fetch(`${config.ai.ollamaUrl}/api/chat`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model: config.ai.ollamaModel, messages, stream: false }) });
      const result = await response.json();
      if (!response.ok) return res.status(502).json({ message: result.error || 'Ollama không phản hồi', code: 'OLLAMA_ERROR' });
      return res.json({ reply: result.message?.content || 'AI chưa tạo được nội dung trả lời.', model: config.ai.ollamaModel, provider: 'ollama' });
    }
    if (!config.openai.apiKey) return res.status(503).json({ message: 'Chưa cấu hình OPENAI_API_KEY', code: 'AI_NOT_CONFIGURED' });
    const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { authorization: `Bearer ${config.openai.apiKey}`, 'content-type': 'application/json' }, body: JSON.stringify({ model: config.openai.model, instructions: system, input: messages.slice(1) }) });
    const result = await response.json();
    if (!response.ok) return res.status(response.status).json({ message: result.error?.message || 'Dịch vụ AI không phản hồi', code: 'OPENAI_ERROR' });
    const output = result.output_text || result.output?.flatMap((item) => item.content || []).find((item) => item.type === 'output_text')?.text;
    return res.json({ reply: output || 'AI chưa tạo được nội dung trả lời.', model: config.openai.model, provider: 'openai' });
  } catch (error) {
    const usingOllama = config.ai.provider === 'ollama';
    return res.status(503).json({ message: usingOllama ? 'Không kết nối được Ollama. Hãy chạy ollama serve và tải model đã cấu hình.' : 'Không kết nối được OpenAI.', code: usingOllama ? 'OLLAMA_UNAVAILABLE' : 'OPENAI_UNAVAILABLE', detail: error.message });
  }
});

export default router;
