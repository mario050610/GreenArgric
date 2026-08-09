import { Router } from 'express';
import { config } from '../config.js';
import { store } from '../data/store.js';

const router = Router();

const normalizeVietnamese = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

async function searchWebSources(question) {
  if (!config.ai.tavilyApiKey) return [];
  const normalized = normalizeVietnamese(question);
  const healthQuestion = /(suc khoe|benh|tao bon|tre em|em be|dinh duong|vitamin|thuoc|trieu chung)/.test(normalized);
  const asksForExplanation = /(tai sao|vi sao|tu dau ma ra|nguyen nhan|do dau)/.test(normalized);
  const farmingQuestion = /(trong|gieo|phan bon|cham soc|thu hoach|sau benh)/.test(normalized);
  const cropMatch = normalized.match(/\b(?:trong|gieo|cham soc|thu hoach)\s+([a-z0-9 ]{3,40})/);
  const cropSubject = cropMatch?.[1]?.replace(/\b(nhu the nao|ra sao|the nao|tai nha|ky thuat).*$/, '').trim();
  const expandedQuery = healthQuestion
    ? `${question} tư vấn chuyên gia dinh dưỡng`
    : asksForExplanation
      ? `${question} giải thích nguyên nhân khoa học`
      : farmingQuestion
        ? `"${question}" hướng dẫn kỹ thuật nông nghiệp`
        : question;
  const attempts = [
    { query: expandedQuery, search_depth: 'advanced' },
    { query: farmingQuestion ? `"${question}"` : question, search_depth: 'basic' },
    ...(farmingQuestion ? [{ query: `${question} khuyến nông kỹ thuật canh tác`, search_depth: 'basic' }] : []),
  ];
  for (const attempt of attempts) {
    try {
      const requestBody = { ...attempt, max_results: 6, include_answer: true, include_raw_content: false };
      if (healthQuestion && attempt.search_depth === 'advanced') requestBody.include_domains = ['vinmec.com', 'medlatec.vn', 'tamanhhospital.vn', 'hellobacsi.com'];
      const response = await fetch(config.ai.tavilySearchUrl, {
        method: 'POST',
        headers: { authorization: `Bearer ${config.ai.tavilyApiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) continue;
      const result = await response.json();
      const searchSummary = String(result.answer || '').trim().slice(0, 700);
      const sources = (result.results || []).map((source, index) => ({ title: String(source.title || '').trim().slice(0, 240), url: String(source.url || '').trim(), description: `${index === 0 && searchSummary ? `Tóm tắt tìm kiếm đã đối chiếu: ${searchSummary}\n` : ''}${String(source.content || '').trim()}`.slice(0, 900), score: Number(source.score || 0) })).filter((source) => {
        try {
          const parsed = new URL(source.url);
          const normalizedSourceIdentity = normalizeVietnamese(`${source.title} ${parsed.pathname.replace(/[-_/]+/g, ' ')}`);
          const cropTokens = String(cropSubject || '').split(/\s+/).filter((token) => token.length >= 3);
          const hasCropSubject = !farmingQuestion || !cropTokens.length || cropTokens.every((token) => normalizedSourceIdentity.includes(token));
          return parsed.protocol === 'https:' && source.title && source.description && source.score >= 0.15 && hasCropSubject && !/(^|\.)reddit\.com$/i.test(parsed.hostname);
        } catch { return false; }
      }).sort((a, b) => b.score - a.score).slice(0, 5);
      if (sources.length) return sources;
    } catch { /* thử truy vấn dự phòng */ }
  }
  return [];
}

export function selectSourcesForQuestion(question, sources) {
  const normalized = normalizeVietnamese(question);
  if (/(cach nau|cach lam|cong thuc|che bien)/.test(normalized)) return sources.slice(0, 1);
  if (/(suc khoe|benh|tao bon|tre em|em be|dinh duong|vitamin|thuoc|trieu chung)/.test(normalized)) return sources.slice(0, 3);
  if (/(trong|gieo|phan bon|cham soc|thu hoach|sau benh)/.test(normalized)) return sources.slice(0, 1);
  return sources.slice(0, 3);
}

async function findReferenceLink(question) {
  const normalized = normalizeVietnamese(question);
  if (/green argric|quan tri|chu vuon|ky thuat|thiet bi|khu vuc/.test(normalized)) return 'https://github.com/mario050610/GreenArgric';
  if (normalized.includes('rau muong')) {
    if (normalized.includes('luoc')) return 'https://www.dienmayxanh.com/vao-bep/cach-luoc-rau-muong-xanh-muot-gion-ngon-khong-bi-tham-den-cuc-10244';
    if (normalized.includes('xao tom')) return 'https://www.dienmayxanh.com/vao-bep/cach-lam-rau-muong-xao-tom-tuoi-gion-ngon-doi-vi-cho-bua-com-11892';
    return 'https://www.dienmayxanh.com/vao-bep/tong-hop-cac-mon-an-tu-rau-muong-thom-ngon-don-gian-ai-cung-14385';
  }
  let searchQuery = `bài viết hướng dẫn ${question} -site:wikipedia.org`;
  if (/nau|mon an|cong thuc|xao|luoc|chien|hap|am thuc|rau/.test(normalized)) {
    searchQuery = `site:dienmayxanh.com/vao-bep ${question}`;
  } else if (/suc khoe|benh|dinh duong|thuoc|trieu chung/.test(normalized)) {
    searchQuery = `site:vinmec.com ${question}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
}

const foreignScriptPattern = /[\u0370-\u052F\u0590-\u0E7F\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF]/u;
const foreignScriptGlobalPattern = /[\u0370-\u052F\u0590-\u0E7F\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF]/gu;
const containsForeignScript = (value) => foreignScriptPattern.test(String(value || ''));

async function requestOllama(messages, verificationContext = {}) {
  const call = async (requestMessages) => {
    const response = await fetch(`${config.ai.ollamaUrl}/api/chat`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model: config.ai.ollamaModel, messages: requestMessages, stream: false, keep_alive: '5m', options: { temperature: 0.1, top_p: 0.85, repeat_penalty: 1.1, num_ctx: 2048 } }) });
    const result = await response.json();
    return { response, result };
  };
  let output = await call(messages);
  if (output.response.ok) {
    const draft = output.result.message?.content || '';
    // Tách bước biên tập khỏi lịch sử hội thoại. Model nhỏ thường trộn các câu
    // trả lời cũ vào bản nháp nếu toàn bộ lịch sử được gửi lại ở bước này.
    const edited = await call([
      { role: 'system', content: 'Bạn là bộ kiểm chứng câu trả lời tiếng Việt. Phải loại bỏ mọi ý không trả lời đúng loại đối tượng người dùng hỏi và mọi dữ kiện không được nguồn cung cấp. Không được bổ sung kiến thức riêng. Chỉ xuất câu trả lời cuối cùng dành cho người dùng; tuyệt đối không nhận xét, khen, chấm điểm hoặc nhắc đến bản nháp và quá trình kiểm chứng.' },
      { role: 'user', content: `CÂU HỎI HIỆN TẠI:\n${verificationContext.question || ''}\n\nNGUỒN ĐƯỢC PHÉP DÙNG (nguồn đầu tiên là nguồn chính):\n${JSON.stringify(verificationContext.sources || [])}\n\nHãy sửa bản nháp bên dưới thành CÂU TRẢ LỜI CUỐI CÙNG. Nếu câu hỏi giới hạn một loại đối tượng, phải xóa mọi mục thuộc loại khác. Được phép diễn đạt lại và tóm tắt bằng tiếng Việt tự nhiên, không yêu cầu trùng nguyên văn; chỉ cần ý nghĩa được ít nhất một nguồn hỗ trợ và trả lời đúng trọng tâm. Với công thức nấu ăn: chỉ dùng định lượng và quy trình của nguồn chính, tuyệt đối không ghép định lượng từ nhiều bài; giữ nguyên con số và đơn vị đầy đủ; xóa mọi định lượng viết tắt, mơ hồ hoặc không xuất hiện rõ trong nguồn; không tự đoán số lượng. Trình bày lần lượt "Nguyên liệu", "Sơ chế", "Các bước thực hiện"; mỗi thao tác là một bước riêng, rõ chủ ngữ và hành động. Chỉ trả lời "Chưa có đủ nguồn phù hợp để trả lời chính xác câu hỏi này." khi toàn bộ nguồn thực sự không chứa dữ kiện trả lời; không từ chối chỉ vì cách diễn đạt của bản nháp khác câu chữ trong nguồn. Chỉ dùng tiếng Việt tự nhiên, đúng chính tả; không viết dính từ; không dùng ký tự lỗi hoặc Markdown; không thêm thông tin mới. KHÔNG được nhận xét bản nháp. KHÔNG mở đầu bằng lời khen. Chỉ xuất nội dung trả lời trực tiếp câu hỏi.\n\nBẢN NHÁP:\n${draft}` },
    ]);
    const editedText = String(edited.result?.message?.content || '').trim();
    const verifierReturnedCommentary = /(bản nháp|điểm cộng|diễn đạt tự nhiên|đã tóm tắt chính xác|tuyệt vời|nội dung trình bày|không bị gò ép)/i.test(editedText);
    const verifierRejectedUsefulDraft = /^Chưa có đủ nguồn phù hợp/i.test(editedText)
      && String(draft).trim().length >= 100
      && Array.isArray(verificationContext.sources)
      && verificationContext.sources.length > 0;
    if (edited.response.ok && editedText && !verifierReturnedCommentary && !verifierRejectedUsefulDraft) output = edited;
    if (containsForeignScript(output.result.message?.content)) {
      output.result.message.content = String(output.result.message.content).replace(foreignScriptGlobalPattern, '').replace(/[ \t]{2,}/g, ' ');
    }
  }
  return output;
}

async function requestSimpleGroundedAnswer(question, sources) {
  const response = await fetch(`${config.ai.ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: config.ai.ollamaModel,
      stream: false,
      keep_alive: '5m',
      options: { temperature: 0.1, top_p: 0.85, num_ctx: 2048 },
      messages: [
        { role: 'system', content: 'Trả lời trực tiếp bằng tiếng Việt, chỉ dùng dữ kiện trong nguồn. Không nhận xét nguồn, không đoán và không dùng Markdown.' },
        { role: 'user', content: `Câu hỏi: ${question}\n\nNguồn đã kiểm chứng:\n${sources.map((source) => `${source.title}\n${source.description}`).join('\n\n')}\n\nHãy trả lời đúng trọng tâm. Nếu là hướng dẫn, trình bày thành các bước rõ ràng.` },
      ],
    }),
    signal: AbortSignal.timeout(60000),
  });
  const result = await response.json();
  return response.ok ? String(result.message?.content || '').trim() : '';
}

const formatPlainAnswer = (answer) => String(answer || '')
  .replace(/\*\*(.*?)\*\*/g, '$1')
  .replace(/^\s*\*\s+/gm, '- ')
  .replace(/^\s*#{1,6}\s+/gm, '')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

const repairVietnameseExtraction = (answer) => formatPlainAnswer(answer)
  .replace(/\bcy\b/giu, 'cây')
  .replace(/\bphn\b/giu, 'phân')
  .replace(/\bngm\b/giu, 'ngâm')
  .replace(/\bhưu cơ\b/giu, 'hữu cơ')
  .replace(/\bhành ty\b/giu, 'hành tây');

const scopeExclusions = {
  vegetable: /(lòng đỏ|trứng|thịt|cá|tôm|sữa|gan|hải sản|gia cầm|gia súc)/iu,
};

export function enforceQuestionScope(question, answer) {
  const normalizedQuestion = normalizeVietnamese(question);
  const scope = /\brau\s+(gi|nao|nào|gì|nhiều|chứa|có)\b/.test(normalizedQuestion) ? 'vegetable' : null;
  const recipeQuestion = /(cach nau|cach lam|cong thuc|che bien)/.test(normalizedQuestion);
  let keptLines = repairVietnameseExtraction(answer).split('\n');
  const recipeHeadingCount = keptLines.filter((line) => /^(?:-\s*)?(nguyên liệu|sơ chế|các bước thực hiện)\s*:/iu.test(line.trim())).length;
  if (!recipeQuestion && recipeHeadingCount >= 2) return 'Chưa có đủ nguồn phù hợp để trả lời chính xác câu hỏi này.';
  if (scope) keptLines = keptLines.filter((line) => !scopeExclusions[scope].test(line));
  if (recipeQuestion) keptLines = keptLines.filter((line) => !/\b\d+(?:[.,/]\d+)?\s*m\b/iu.test(line));
  const meaningfulLines = keptLines.filter((line) => line.replace(/^\s*-\s*/, '').trim().length > 12);
  return meaningfulLines.length ? meaningfulLines.join('\n').trim() : 'Chưa có đủ nguồn phù hợp để trả lời chính xác câu hỏi này.';
}

export function isFollowUpQuestion(question) {
  const normalized = normalizeVietnamese(question).trim();
  return /^(con|con lai|the con|vay con|nguoi do|cai do|no thi|y tren|truong hop do)\b/.test(normalized)
    || /\b(nhu tren|vua noi|vua neu|noi tiep|them nua)\b/.test(normalized);
}

const appendReference = (answer, link) => `${formatPlainAnswer(answer)}\n\nTham khảo thêm tại link: ${link}`;
const appendVerifiedSources = (answer, sources) => {
  const formatted = formatPlainAnswer(answer);
  if (/^Chưa có đủ nguồn phù hợp/i.test(formatted) || !sources.length) return formatted;
  return `${formatted}\n\nNguồn tham khảo đã đối chiếu:\n${sources.map((source) => `- ${source.title}: ${source.url}`).join('\n')}`;
};

function answerGroundedFoodQuestion(question) {
  const normalized = normalizeVietnamese(question);
  if (!normalized.includes('rau muong') || !/(mon|nau|che bien|lam gi|goi y|an ngon)/.test(normalized)) return null;
  return [
    'Một số món rau muống phổ biến, dễ chế biến:',
    '- Rau muống xào tỏi: rau được xào nhanh trên lửa lớn với tỏi phi, giữ màu xanh và độ giòn, có mùi tỏi thơm rõ và gia vị đậm vừa ăn.',
    '- Rau muống luộc: món đơn giản, cọng rau chín mềm nhưng vẫn giòn ngọt; có thể dùng cùng nước mắm để tăng vị đậm đà.',
    '- Canh rau muống tôm chua: nước canh có vị chua thanh từ me, vị ngọt dịu và tôm dai ngọt, phù hợp dùng trong bữa cơm ngày nóng.',
    '- Gỏi gà rau muống: rau muống giòn kết hợp với thịt gà mềm, được trộn cùng nước sốt chua ngọt và hơi cay để tạo vị hài hòa.',
    '- Rau muống xào thịt heo: rau xanh giòn xào cùng thịt heo, tỏi và dầu hào, tạo thành món mặn dễ ăn cùng cơm.',
  ].join('\n');
}

const roleOfUser = (user) => store.roles.find((role) => role.role_id === user.role_id)?.role_name;

function canViewContact(currentUser, targetUser) {
  if (targetUser.user_id === currentUser.id) return true;
  const targetRole = roleOfUser(targetUser);
  if (currentUser.role === 'owner') return ['admin', 'owner', 'technician'].includes(targetRole);
  if (currentUser.role === 'admin') return targetRole === 'owner' || targetRole === 'technician';
  return currentUser.role === 'technician' && ['admin', 'owner', 'technician'].includes(targetRole);
}

function answerDirectoryQuestion(question, currentUser) {
  const normalized = normalizeVietnamese(question);
  const asksContact = /(can lien he ai|lien he ai|ho tro lien he|thong tin lien he)/.test(normalized);
  if (asksContact && !/(chu vuon|owner|ky thuat|technician|ktv)/.test(normalized)) {
    const admins = store.users.filter((user) => roleOfUser(user) === 'admin' && user.status === 'active');
    return admins.length ? `Bạn có thể liên hệ quản trị viên: ${admins.map((user) => `${user.full_name} (${user.email})`).join('; ')}.` : 'Hiện chưa có quản trị viên đang hoạt động để liên hệ.';
  }
  const asksIdentity = /(ten gi|la ai|thong tin|danh sach|co nhung ai|bao nhieu)/.test(normalized)
    || /^(con\s+)?(quan tri vien|admin|chu vuon|owner|ky thuat vien|technician|ktv)\??$/.test(normalized.trim());
  if (!asksIdentity) return null;
  const requestedRole = normalized.includes('quan tri') || normalized.includes('admin')
    ? 'admin'
    : normalized.includes('chu vuon') || normalized.includes('owner')
      ? 'owner'
      : normalized.includes('ky thuat') || normalized.includes('technician') || normalized.includes('ktv')
        ? 'technician'
        : null;
  if (!requestedRole) return null;
  const roleLabel = requestedRole === 'admin' ? 'Quản trị viên' : requestedRole === 'owner' ? 'Chủ vườn' : 'Kỹ thuật viên';
  const users = store.users.filter((user) => user.status === 'active' && roleOfUser(user) === requestedRole && canViewContact(currentUser, user));
  if (!users.length) return `Bạn không có quyền xem thông tin ${roleLabel.toLowerCase()} khác.`;
  return `${roleLabel} có thể liên hệ: ${users.map((user) => `${user.full_name} (${user.email}), ${user.status === 'active' ? 'đang hoạt động' : user.status}`).join('; ')}.`;
}

const sensorLabels = {
  temperature: 'Nhiệt độ', humidity: 'Độ ẩm', ph: 'pH', ec: 'EC',
  light: 'Ánh sáng', water_level: 'Mực nước',
};

const latestReading = (areaId, sensorType) => store.readings
  .filter((item) => item.area_id === areaId && store.sensors.find((sensor) => sensor.sensor_id === item.sensor_id)?.sensor_type === sensorType)
  .sort((a, b) => new Date(b.reading_time) - new Date(a.reading_time))[0];

export function answerSystemDataQuestion(question, currentUser) {
  const normalized = normalizeVietnamese(question);
  // Chỉ xem "Khu A/B/C" là mã khu; không nhầm chữ đầu của "khu vực" thành mã.
  const areaMatch = normalized.match(/\bkhu\s*([a-z])\b/i);
  const selectedAreas = areaMatch
    ? store.areas.filter((area) => normalizeVietnamese(area.area_name) === `khu ${areaMatch[1]}`)
    : store.areas;

  if (/(dang trong gi|trong cay gi|loai cay gi|cay gi dang trong|dang trong cay)/.test(normalized)) {
    return selectedAreas.map((area) => `- ${area.area_name}: đang trồng ${area.crop_type}.`).join('\n');
  }

  if (/(ai.*quan ly.*khu|quan ly.*khu nao|khu.*do ai.*quan ly|nguoi quan ly)/.test(normalized)) {
    if (/(toi|cua toi)/.test(normalized)) {
      if (currentUser.role === 'owner') {
        const ownedAreas = store.areas.filter((area) => area.owner_id === currentUser.id);
        return ownedAreas.length ? `Bạn là chủ vườn quản lý: ${ownedAreas.map((area) => area.area_name).join(', ')}.` : 'Tài khoản chủ vườn của bạn hiện chưa được gán khu vực quản lý.';
      }
      if (currentUser.role === 'technician') {
        const areaIds = [...new Set(store.tasks.filter((task) => task.assigned_to === currentUser.id).map((task) => task.area_id))];
        const areaNames = areaIds.map((id) => store.areas.find((area) => area.area_id === id)?.area_name).filter(Boolean);
        return areaNames.length ? `Bạn là kỹ thuật viên được giao công việc tại: ${areaNames.join(', ')}. Đây là khu vực phụ trách kỹ thuật, không phải quyền sở hữu hoặc quản lý của chủ vườn.` : 'Bạn hiện chưa được giao công việc tại khu vực nào.';
      }
      return `Bạn là quản trị viên quản trị hệ thống gồm: ${store.areas.map((area) => area.area_name).join(', ')}.`;
    }
    return store.areas.map((area) => {
      const owner = store.users.find((user) => user.user_id === area.owner_id);
      return `- ${area.area_name}: chủ vườn quản lý là ${owner?.full_name || 'chưa phân công'}.`;
    }).join('\n');
  }

  if (/(khu vuc|khu trong|vuon hom nay|tinh hinh.*vuon|tong quan.*vuon)/.test(normalized)) {
    return selectedAreas.map((area) => {
      const readings = ['temperature', 'humidity', 'ph', 'ec', 'water_level']
        .map((type) => latestReading(area.area_id, type))
        .filter(Boolean)
        .map((reading) => `${sensorLabels[store.sensors.find((sensor) => sensor.sensor_id === reading.sensor_id)?.sensor_type] || 'Chỉ số'} ${reading.value} ${reading.unit}`);
      const openAlerts = store.alerts.filter((alert) => alert.area_id === area.area_id && alert.status === 'open');
      return `- ${area.area_name}: trồng ${area.crop_type}, trạng thái ${area.status === 'active' ? 'đang hoạt động' : 'đang bảo trì'}; ${readings.length ? readings.join(', ') : 'chưa có dữ liệu cảm biến'}; ${openAlerts.length ? `${openAlerts.length} cảnh báo đang mở (${openAlerts.map((alert) => alert.title).join(', ')})` : 'không có cảnh báo đang mở'}.`;
    }).join('\n');
  }

  if (/(cam bien|nhiet do|do am|muc nuoc|anh sang|\bph\b|\bec\b|chi so moi truong)/.test(normalized)) {
    const requestedTypes = Object.keys(sensorLabels).filter((type) => {
      const aliases = { temperature: 'nhiet do', humidity: 'do am', water_level: 'muc nuoc', light: 'anh sang', ph: 'ph', ec: 'ec' };
      return normalized.includes(aliases[type]);
    });
    const types = requestedTypes.length ? requestedTypes : Object.keys(sensorLabels);
    return selectedAreas.map((area) => {
      const values = types.map((type) => latestReading(area.area_id, type)).filter(Boolean)
        .map((reading) => `${sensorLabels[store.sensors.find((sensor) => sensor.sensor_id === reading.sensor_id)?.sensor_type]} ${reading.value} ${reading.unit}`);
      return `- ${area.area_name}: ${values.length ? values.join(', ') : 'chưa có dữ liệu phù hợp'}.`;
    }).join('\n');
  }

  if (/(thiet bi|may bom|den led|quat|bom cham)/.test(normalized)) {
    return selectedAreas.map((area) => {
      const devices = store.devices.filter((device) => device.area_id === area.area_id);
      return `- ${area.area_name}: ${devices.length ? devices.map((device) => `${device.device_name} ${device.status === 'ON' ? 'đang bật' : 'đang tắt'} (${device.mode === 'AUTO' ? 'tự động' : 'thủ công'})`).join(', ') : 'chưa có thiết bị'}.`;
    }).join('\n');
  }

  if (/(canh bao|bat thuong|su co)/.test(normalized)) {
    return selectedAreas.map((area) => {
      const alerts = store.alerts.filter((alert) => alert.area_id === area.area_id && alert.status === 'open');
      return `- ${area.area_name}: ${alerts.length ? alerts.map((alert) => `${alert.title}; ${alert.message}; mức ${alert.severity === 'high' ? 'cao' : alert.severity === 'medium' ? 'trung bình' : 'thấp'}`).join(', ') : 'không có cảnh báo đang mở'}.`;
    }).join('\n');
  }

  if (/(cong viec|bao tri|nhiem vu|lich lam|lich hen|se lam.*vuon|ky thuat vien.*(den sua|sua|thuc hien)|ai.*(den sua|sua chua|bao tri))/.test(normalized)) {
    const tasks = store.tasks.filter((task) => currentUser.role === 'admin'
      || (currentUser.role === 'technician' && task.assigned_to === currentUser.id)
      || (currentUser.role === 'owner' && store.areas.find((area) => area.area_id === task.area_id)?.owner_id === currentUser.id));
    if (!tasks.length) return 'Tài khoản của bạn hiện không có công việc hoặc lịch hẹn liên quan.';
    if (/ky thuat vien.*(nao|den sua|sua|thuc hien)|ai.*(den sua|sua chua|bao tri)/.test(normalized)) {
      const grouped = new Map();
      for (const task of tasks) {
        const technician = store.users.find((user) => user.user_id === task.assigned_to)?.full_name || 'Chưa phân công';
        const rows = grouped.get(technician) || [];
        rows.push(`${task.title} (${store.areas.find((area) => area.area_id === task.area_id)?.area_name})`);
        grouped.set(technician, rows);
      }
      return [...grouped.entries()].map(([technician, rows]) => `- ${technician}: ${rows.join(', ')}.`).join('\n');
    }
    return tasks.map((task) => `- ${task.title}: ${store.areas.find((area) => area.area_id === task.area_id)?.area_name}, lịch ${new Date(task.scheduled_at).toLocaleString('vi-VN')}, ${store.users.find((user) => user.user_id === task.assigned_to)?.full_name}.`).join('\n');
  }

  if (/(nguong|cau hinh nguong)/.test(normalized)) {
    const thresholds = store.thresholds.filter((item) => !areaMatch || selectedAreas.some((area) => area.area_id === item.area_id));
    return thresholds.length ? thresholds.map((item) => `- ${store.areas.find((area) => area.area_id === item.area_id)?.area_name} - ${sensorLabels[item.sensor_type] || item.sensor_type}: từ ${item.min_value} đến ${item.max_value}, ${item.is_activated ? 'đang áp dụng' : 'đang tắt'}.`).join('\n') : 'Chưa có cấu hình ngưỡng phù hợp.';
  }

  if (/(tai khoan cua toi|thong tin cua toi|ho so cua toi|toi la ai)/.test(normalized)) {
    const user = store.users.find((item) => item.user_id === currentUser.id);
    return user ? `Tài khoản của bạn: ${user.full_name}, email ${user.email}, vai trò ${currentUser.role === 'admin' ? 'quản trị viên' : currentUser.role === 'owner' ? 'chủ vườn' : 'kỹ thuật viên'}, trạng thái ${user.status === 'active' ? 'đang hoạt động' : user.status}.` : null;
  }
  return null;
}

router.post('/chat', async (req, res) => {
  const message = String(req.body.message || '').trim();
  const history = (isFollowUpQuestion(message) && Array.isArray(req.body.history) ? req.body.history : [])
    .filter((item) => item && ['user', 'assistant'].includes(item.role) && String(item.content || '').trim())
    .slice(-4)
    .map((item) => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: String(item.content).replace(/\n+(?:Nguồn tham khảo đã đối chiếu|Tham khảo thêm tại link):[\s\S]*$/i, '').trim().slice(0, 1600),
    }));
  if (!message) return res.status(400).json({ message: 'Nội dung câu hỏi là bắt buộc' });
  const groundedFoodAnswer = answerGroundedFoodQuestion(message);
  if (groundedFoodAnswer) return res.json({ reply: appendReference(groundedFoodAnswer, await findReferenceLink(message)), provider: 'system', source: 'verified-food-guide' });
  const directoryAnswer = answerDirectoryQuestion(message, req.user);
  // Danh bạ là dữ liệu nội bộ của GREEN ARGRIC, không gắn nguồn web không liên quan.
  if (directoryAnswer) return res.json({ reply: formatPlainAnswer(directoryAnswer), provider: 'system', source: 'users', sources: [] });
  const systemDataAnswer = answerSystemDataQuestion(message, req.user);
  if (systemDataAnswer) return res.json({ reply: formatPlainAnswer(systemDataAnswer), provider: 'system', source: 'green-argric-data', sources: [] });
  const normalizedMessage = normalizeVietnamese(message);
  if (/(green argric|khu vuc|khu trong|chu vuon|ky thuat vien|quan tri vien|thiet bi|cam bien|canh bao|cong viec|bao tri|lich hen|tai khoan|nguong)/.test(normalizedMessage)) {
    return res.json({ reply: 'Chưa có dữ liệu nội bộ phù hợp để trả lời câu hỏi này.', provider: 'system', source: 'green-argric-data', sources: [] });
  }
  const webSources = selectSourcesForQuestion(message, await searchWebSources(message));
  if (!webSources.length) return res.status(503).json({ message: config.ai.tavilyApiKey ? 'Chưa tìm được bài viết phù hợp để kiểm chứng câu trả lời. Bạn hãy mô tả câu hỏi cụ thể hơn.' : 'Chưa cấu hình TAVILY_API_KEY nên trợ lý không thể tìm nguồn kiểm chứng.', code: 'VERIFIED_SOURCE_UNAVAILABLE' });
  const system = `Bạn là trợ lý GREEN ARGRIC. Trả lời trực tiếp câu hỏi cuối cùng bằng tiếng Việt rõ ràng.
Chỉ dùng dữ kiện trong verifiedWebSources bên dưới; không đoán và không thêm số liệu. Được phép dịch hoặc diễn đạt lại trung thành với nguồn.
Chỉ lấy ý liên quan đúng đối tượng được hỏi. Nếu nguồn có đủ dữ kiện thì phải trả lời, không nhận xét bản nháp hoặc quá trình tìm kiếm.
Với câu hỏi hướng dẫn, sắp xếp thành các bước theo đúng thứ tự trong nguồn. Với công thức nấu ăn, chỉ dùng nguồn đầu tiên và không trộn định lượng.
Dùng văn bản thuần, mỗi ý một dòng, không dùng Markdown và không tự tạo URL.
verifiedWebSources: ${JSON.stringify(webSources)}`;
  const messages = [{ role: 'system', content: system }, ...history.map((item) => ({ role: item.role === 'assistant' ? 'assistant' : 'user', content: String(item.content || '') })), { role: 'user', content: message }];
  try {
    if (config.ai.provider === 'ollama') {
      const { response, result } = await requestOllama(messages, { question: message, sources: webSources });
      if (!response.ok) return res.status(502).json({ message: result.error || 'Ollama không phản hồi', code: 'OLLAMA_ERROR' });
      let reply = enforceQuestionScope(message, result.message?.content || 'AI chưa tạo được nội dung trả lời.');
      if (/^Chưa có đủ nguồn phù hợp/i.test(reply) && webSources.length) {
        const fallbackReply = await requestSimpleGroundedAnswer(message, webSources);
        if (fallbackReply) reply = enforceQuestionScope(message, fallbackReply);
      }
      return res.json({ reply: appendVerifiedSources(reply, webSources), model: config.ai.ollamaModel, provider: 'ollama', sources: webSources });
    }
    if (!config.openai.apiKey) return res.status(503).json({ message: 'Chưa cấu hình OPENAI_API_KEY', code: 'AI_NOT_CONFIGURED' });
    const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { authorization: `Bearer ${config.openai.apiKey}`, 'content-type': 'application/json' }, body: JSON.stringify({ model: config.openai.model, instructions: system, input: messages.slice(1) }) });
    const result = await response.json();
    if (!response.ok) return res.status(response.status).json({ message: result.error?.message || 'Dịch vụ AI không phản hồi', code: 'OPENAI_ERROR' });
    const output = result.output_text || result.output?.flatMap((item) => item.content || []).find((item) => item.type === 'output_text')?.text;
    return res.json({ reply: appendVerifiedSources(enforceQuestionScope(message, output || 'AI chưa tạo được nội dung trả lời.'), webSources), model: config.openai.model, provider: 'openai', sources: webSources });
  } catch (error) {
    const usingOllama = config.ai.provider === 'ollama';
    return res.status(503).json({ message: usingOllama ? 'Không kết nối được Ollama. Hãy chạy ollama serve và tải model đã cấu hình.' : 'Không kết nối được OpenAI.', code: usingOllama ? 'OLLAMA_UNAVAILABLE' : 'OPENAI_UNAVAILABLE', detail: error.message });
  }
});

export default router;
