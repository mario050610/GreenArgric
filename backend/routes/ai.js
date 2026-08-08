import { Router } from 'express';
import { config } from '../config.js';
import { store } from '../data/store.js';

const router = Router();

const normalizeVietnamese = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

async function findReferenceLink(question) {
  const normalized = normalizeVietnamese(question);
  if (/green argric|quan tri|chu vuon|ky thuat|thiet bi|khu vuc/.test(normalized)) return 'https://github.com/mario050610/GreenArgric';
  let searchQuery = `bài viết hướng dẫn ${question} -site:wikipedia.org`;
  if (/nau|mon an|cong thuc|xao|luoc|chien|hap|am thuc|rau/.test(normalized)) {
    searchQuery = `site:dienmayxanh.com/vao-bep ${question}`;
  } else if (/suc khoe|benh|dinh duong|thuoc|trieu chung/.test(normalized)) {
    searchQuery = `site:vinmec.com ${question}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
}

const containsCjkCharacters = (value) => /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/u.test(String(value || ''));

async function requestOllama(messages) {
  const call = async (requestMessages) => {
    const response = await fetch(`${config.ai.ollamaUrl}/api/chat`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model: config.ai.ollamaModel, messages: requestMessages, stream: false, keep_alive: '10m', options: { temperature: 0.25, top_p: 0.9, repeat_penalty: 1.1 } }) });
    const result = await response.json();
    return { response, result };
  };
  let output = await call(messages);
  if (output.response.ok && containsCjkCharacters(output.result.message?.content)) {
    output = await call([...messages, { role: 'assistant', content: output.result.message.content }, { role: 'user', content: 'Hãy viết lại toàn bộ câu trả lời bằng tiếng Việt tự nhiên, chỉ dùng chữ Quốc ngữ; loại bỏ mọi chữ Hán, chữ Trung Quốc và từ bị lỗi mã hóa.' }]);
  }
  return output;
}

const formatPlainAnswer = (answer) => String(answer || '')
  .replace(/\*\*(.*?)\*\*/g, '$1')
  .replace(/^\s*\*\s+/gm, '- ')
  .replace(/^\s*#{1,6}\s+/gm, '')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

const appendReference = (answer, link) => `${formatPlainAnswer(answer)}\n\nTham khảo thêm tại link: ${link}`;

function answerDirectoryQuestion(question) {
  const normalized = normalizeVietnamese(question);
  const asksIdentity = /(ten gi|la ai|thong tin|danh sach|co nhung ai|bao nhieu)/.test(normalized);
  if (!asksIdentity) return null;
  const requestedRole = normalized.includes('quan tri') || normalized.includes('admin')
    ? 'admin'
    : normalized.includes('chu vuon') || normalized.includes('owner')
      ? 'owner'
      : normalized.includes('ky thuat') || normalized.includes('technician') || normalized.includes('ktv')
        ? 'technician'
        : null;
  if (!requestedRole) return null;
  const role = store.roles.find((item) => item.role_name === requestedRole);
  const users = store.users.filter((user) => user.role_id === role?.role_id).map((user) => ({ name: user.full_name, email: user.email, status: user.status }));
  const roleLabel = requestedRole === 'admin' ? 'Quản trị viên' : requestedRole === 'owner' ? 'Chủ vườn' : 'Kỹ thuật viên';
  if (!users.length) return `Hiện hệ thống chưa có tài khoản ${roleLabel}.`;
  if (users.length === 1) return `${roleLabel} là ${users[0].name} (${users[0].email}), trạng thái ${users[0].status === 'active' ? 'đang hoạt động' : users[0].status}.`;
  return `Hệ thống có ${users.length} ${roleLabel.toLowerCase()}: ${users.map((user) => `${user.name} (${user.email}, ${user.status === 'active' ? 'đang hoạt động' : user.status})`).join('; ')}.`;
}

router.post('/chat', async (req, res) => {
  const message = String(req.body.message || '').trim();
  const history = Array.isArray(req.body.history) ? req.body.history.slice(-10) : [];
  if (!message) return res.status(400).json({ message: 'Nội dung câu hỏi là bắt buộc' });
  const directoryAnswer = answerDirectoryQuestion(message);
  if (directoryAnswer) return res.json({ reply: appendReference(directoryAnswer, await findReferenceLink(message)), provider: 'system', source: 'users' });
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
  const system = `Bạn là trợ lý thông minh đa năng GREEN ARGRIC. Bạn có thể trả lời toàn diện các câu hỏi thông thường như học tập, công nghệ, viết nội dung, giải thích khái niệm, lập kế hoạch và kiến thức phổ thông; không giới hạn câu trả lời vào cây trồng hay nông nghiệp. Khi người dùng hỏi về GREEN ARGRIC, hãy ưu tiên dữ liệu hệ thống được cung cấp bên dưới. Phân biệt rõ dữ liệu hệ thống với kiến thức chung, không bịa dữ liệu nội bộ chưa có. Không tiết lộ mật khẩu, token, khóa bí mật hoặc hướng dẫn nguy hiểm. Trả lời tự nhiên bằng tiếng Việt trừ khi người dùng yêu cầu ngôn ngữ khác. Nếu trả lời tiếng Việt, chỉ dùng chữ Quốc ngữ và thuật ngữ phổ biến; tuyệt đối không chèn chữ Hán, chữ Trung Quốc hoặc ký tự bị lỗi mã hóa. Trình bày bằng văn bản thuần, không dùng Markdown, không dùng dấu **, # hoặc bảng. Khi câu trả lời có nhiều ý, tách mỗi ý xuống một dòng và dùng dấu gạch đầu dòng đơn; không viết thành một đoạn dài, không tự tạo URL. Backend sẽ tự thêm nguồn tham khảo. Dữ liệu GREEN ARGRIC hiện tại: ${JSON.stringify(systemContext)}`;
  const messages = [{ role: 'system', content: system }, ...history.map((item) => ({ role: item.role === 'assistant' ? 'assistant' : 'user', content: String(item.content || '') })), { role: 'user', content: message }];
  try {
    if (config.ai.provider === 'ollama') {
      const { response, result } = await requestOllama(messages);
      if (!response.ok) return res.status(502).json({ message: result.error || 'Ollama không phản hồi', code: 'OLLAMA_ERROR' });
      const reply = result.message?.content || 'AI chưa tạo được nội dung trả lời.';
      return res.json({ reply: appendReference(reply, await findReferenceLink(message)), model: config.ai.ollamaModel, provider: 'ollama' });
    }
    if (!config.openai.apiKey) return res.status(503).json({ message: 'Chưa cấu hình OPENAI_API_KEY', code: 'AI_NOT_CONFIGURED' });
    const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { authorization: `Bearer ${config.openai.apiKey}`, 'content-type': 'application/json' }, body: JSON.stringify({ model: config.openai.model, instructions: system, input: messages.slice(1) }) });
    const result = await response.json();
    if (!response.ok) return res.status(response.status).json({ message: result.error?.message || 'Dịch vụ AI không phản hồi', code: 'OPENAI_ERROR' });
    const output = result.output_text || result.output?.flatMap((item) => item.content || []).find((item) => item.type === 'output_text')?.text;
    return res.json({ reply: appendReference(output || 'AI chưa tạo được nội dung trả lời.', await findReferenceLink(message)), model: config.openai.model, provider: 'openai' });
  } catch (error) {
    const usingOllama = config.ai.provider === 'ollama';
    return res.status(503).json({ message: usingOllama ? 'Không kết nối được Ollama. Hãy chạy ollama serve và tải model đã cấu hình.' : 'Không kết nối được OpenAI.', code: usingOllama ? 'OLLAMA_UNAVAILABLE' : 'OPENAI_UNAVAILABLE', detail: error.message });
  }
});

export default router;
