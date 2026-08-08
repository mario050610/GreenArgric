import { Router } from 'express';
import { config } from '../config.js';
import { store } from '../data/store.js';

const router = Router();

router.post('/chat', async (req, res) => {
  const message = String(req.body.message || '').trim();
  const history = Array.isArray(req.body.history) ? req.body.history.slice(-10) : [];
  if (!message) return res.status(400).json({ message: 'Nội dung câu hỏi là bắt buộc' });
  const systemContext = {
    currentUser: { id: req.user.id, name: req.user.name, role: req.user.role },
    users: store.users.map((user) => ({
      id: user.user_id,
      name: user.full_name,
      email: user.email,
      role: store.roles.find((role) => role.role_id === user.role_id)?.role_name,
      status: user.status,
    })),
    areas: store.areas.map((area) => ({ id: area.area_id, name: area.area_name, crop: area.crop_type, status: area.status })),
    readings: Object.fromEntries(['temperature', 'humidity', 'ph', 'ec', 'water_level'].map((type) => [type, store.readings.filter((item) => store.sensors.find((sensor) => sensor.sensor_id === item.sensor_id)?.sensor_type === type).at(-1)?.value])),
    openAlerts: store.alerts.filter((alert) => alert.status === 'open').map((alert) => ({ title: alert.title, severity: alert.severity })),
    devices: store.devices.map((device) => ({ name: device.device_name, status: device.status, mode: device.mode })),
    tasks: store.tasks.map((task) => ({ title: task.title, type: task.task_type, status: task.status, assignedTo: task.assigned_to })),
  };
  const system = `Bạn là trợ lý thông minh đa năng GREEN ARGRIC. Bạn có thể trả lời toàn diện các câu hỏi thông thường như học tập, công nghệ, viết nội dung, giải thích khái niệm, lập kế hoạch và kiến thức phổ thông; không giới hạn câu trả lời vào cây trồng hay nông nghiệp. Khi người dùng hỏi về GREEN ARGRIC, hãy ưu tiên dữ liệu hệ thống được cung cấp bên dưới. Phân biệt rõ dữ liệu hệ thống với kiến thức chung, không bịa dữ liệu nội bộ chưa có. Không tiết lộ mật khẩu, token, khóa bí mật hoặc hướng dẫn nguy hiểm. Trả lời tự nhiên bằng tiếng Việt trừ khi người dùng yêu cầu ngôn ngữ khác. Dữ liệu GREEN ARGRIC hiện tại: ${JSON.stringify(systemContext)}`;
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
