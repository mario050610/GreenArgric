import { Router } from 'express';
import { config } from '../config.js';
import { store } from '../data/store.js';

const router = Router();

const normalizeVietnamese = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

export const isRecipeQuestion = (question) => {
  const normalized = normalizeVietnamese(question);
  const cookingContext = /(nau|lam mon|che bien|nguyen lieu|so che|hap|luoc|xao|chien|ran|nuong|kho|canh|mon an)/.test(normalized);
  return /(cach nau|cach lam mon|che bien)/.test(normalized)
    || (normalized.includes('cong thuc') && cookingContext);
};

export const isFarmingQuestion = (question) => {
  const normalized = normalizeVietnamese(question);
  return /(gieo|phan bon|cham soc|thu hoach|sau benh)/.test(normalized)
    || /\btrong\b.*\b(cay|rau|cu|qua|hoa|lua|dat|vuon)\b/.test(normalized);
};

export const isInternalSystemQuestion = (question) => {
  const normalized = normalizeVietnamese(question);
  // Trong GREEN ARGRIC, "vườn", "khu vườn" và "khu" đều là cách gọi
  // ngắn của cùng một thực thể: khu vực trồng.
  const gardenAliasContext = /\b(vuon|khu)\b/.test(normalized);
  const explicitSystemContext = /(green argric|trong he thong|tren giao dien|du lieu noi bo|cua toi|vuon toi|tai khoan toi|tai khoan cua toi)/.test(normalized);
  const areaContext = /\bkhu\s*[a-l]\b|khu vuc trong|khu trong|vuon hom nay|tinh hinh.*vuon|tinh trang.*vuon|tong quan.*vuon/.test(normalized);
  const operationalContext = /(trang thai|chi so|dang bat|dang tat|canh bao|nguong|lich hen|bao tri|nhiem vu|lich lam)/.test(normalized)
    && /(thiet bi|cam bien|may bom|den|quat|vuon|khu|cong viec)/.test(normalized);
  const assignedServiceContext = /(ky thuat vien|ktv|ai).*(se den sua|den sua|sua chua|bao tri|se thuc hien)/.test(normalized);
  const directoryContext = /(can lien he ai|thong tin lien he|danh sach|co nhung ai|gom nhung ai|bao nhieu|ten gi|ai quan ly)/.test(normalized)
    && /(quan tri vien|admin|chu vuon|owner|ky thuat vien|technician|ktv|khu)/.test(normalized);
  const cropEntityContext = store.areas.some((area) => normalized.includes(normalizeVietnamese(area.crop_type)));
  return gardenAliasContext || cropEntityContext || explicitSystemContext || areaContext || operationalContext || assignedServiceContext || directoryContext;
};

export function compactRecipeSource(value) {
  let text = String(value || '').normalize('NFC').replace(/\r/g, '');
  text = text
    .replace(/^#{1,6}\s*(?:\d+(?:\.\d+)*\.?\s*)?(?:Nguyên\s*Liệu|Chuẩn\s*Bị\s*Nguyên\s*Liệu|Thành\s*Phần)[^\n]*$/gimu, '#### Nguyên Liệu:')
    .replace(/^#{1,6}\s*(?:\d+(?:\.\d+)*\.?\s*)?(?:Sơ\s*Chế|Chuẩn\s*Bị)(?!\s*Nguyên\s*Liệu)[^\n]*$/gimu, '#### Sơ Chế:')
    .replace(/^#{1,6}\s*(?:\d+(?:\.\d+)*\.?\s*)?(?:Thực\s*Hiện|Cách\s*Làm|Cách\s*Chế\s*Biến|Cách\s*Chế\s*Biến|Các\s*Bước)[^\n]*$/gimu, '#### Thực Hiện:')
    .replace(/^#{1,6}\s*(?:\d+(?:\.\d+)*\.?\s*)?(?:Cách\s*Dùng|Thành\s*Phẩm|Thưởng\s*Thức)[^\n]*$/gimu, '#### Cách Dùng:');
  let sawIngredientHeading = false;
  text = text.split('\n').map((line) => {
    if (!/^#{1,6}\s*/.test(line)) return line;
    const heading = normalizeVietnamese(line)
      .replace(/^#{1,6}\s*/, '')
      .replace(/^\d+(?:\.\d+)*\.?\s*/, '')
      .trim();
    if (/^(nguyen lieu|chuan bi nguyen lieu|thanh phan)\b/.test(heading)) {
      sawIngredientHeading = true;
      return '#### Nguyên Liệu:';
    }
    if (sawIngredientHeading && /^(so che|chuan bi)\b/.test(heading)) return '#### Sơ Chế:';
    if (sawIngredientHeading && /^(thuc hien|cach lam|cach che bien|cac buoc)\b/.test(heading)) return '#### Thực Hiện:';
    if (sawIngredientHeading && /^(cach dung|thanh pham|thuong thuc)\b/.test(heading)) return '#### Cách Dùng:';
    return line;
  }).join('\n');
  const start = text.search(/(?:#{1,6}\s*)?(?:Nguyên\s*Liệu|Chuẩn\s*Bị(?:\s*Nguyên\s*Liệu)?)\s*:/iu);
  if (start >= 0) text = text.slice(start);
  const end = text.search(/\n(?:#{1,6}\s*)?(?:Mách\s*Nhỏ|Lưu\s*Ý|Tags|Công thức bạn có thể thích|Bài viết liên quan)/iu);
  if (end > 0) text = text.slice(0, end);
  text = text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^(?:>\s*)+/gm, '')
    .replace(/\b(\d+(?:[.,/]\d+)?)M\b/g, '$1 muỗng canh')
    .replace(/\b(\d+(?:[.,/]\d+)?)m\b/g, '$1 muỗng cà phê')
    .replace(/\bcy\b/giu, 'cây')
    .replace(/\bngm\b/giu, 'ngâm')
    // Ranh giới \b của JavaScript không nhận diện đầy đủ chữ có dấu tiếng Việt.
    .replace(/đường nu/giu, 'đường nâu')
    .replace(/Khu này/gu, 'Khâu này')
    .replace(/chn giò/giu, 'chân giò')
    .replace(/riêu liu/giu, 'riu riu')
    .replace(/bao lu/giu, 'bao lâu')
    .replace(/Đy/gu, 'Đây')
    .replace(/cn bằng/giu, 'cân bằng')
    .replace(/hm nóng/giu, 'hâm nóng')
    .replace(/Để lừa vừa/giu, 'Để lửa vừa')
    .replace(/tỏi ngã vàng/giu, 'tỏi ngả vàng')
    .replace(/(\d)\s*(g|ml|cm)\b/giu, '$1 $2')
    .replace(/(\d)\s*\\?\*\s*(\d)/g, '$1 x $2')
    .replace(/\*{1,3}/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Một số trang lặp nguyên liệu hai lần cho giao diện desktop/mobile.
  const prepIndex = text.search(/\n(?:#{1,6}\s*)?(?:Sơ\s*Chế|Chuẩn\s*Bị)\s*:/iu);
  if (prepIndex > 0) {
    const ingredientBlock = text.slice(0, prepIndex);
    const lines = ingredientBlock.split('\n');
    const seen = new Set();
    const uniqueLines = lines.filter((line) => {
      const key = normalizeVietnamese(line).replace(/\s+/g, ' ').trim();
      if (!key || /(?:nguyen\s*lieu|chuan\s*bi)\s*:/.test(key)) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    text = `${uniqueLines.join('\n')}\n${text.slice(prepIndex + 1)}`;
  }
  return text.slice(0, 6500);
}

async function searchWebSources(question) {
  if (!config.ai.tavilyApiKey) return [];
  const normalized = normalizeVietnamese(question);
  const healthQuestion = /(suc khoe|benh|tao bon|tre em|em be|dinh duong|vitamin|thuoc|trieu chung)/.test(normalized);
  // "Công thức" cũng được dùng trong toán, hóa học... nên chỉ xem là món ăn
  // khi câu hỏi thực sự có ngữ cảnh nấu/chế biến hoặc nguyên liệu, món ăn.
  const recipeQuestion = isRecipeQuestion(question);
  const asksForExplanation = /(tai sao|vi sao|tu dau ma ra|nguyen nhan|do dau|hoat dong nhu the nao|bang cach nao|qua trinh|vai tro|su khac nhau)/.test(normalized);
  const howToQuestion = /^(cach|huong dan)\b/.test(normalized);
  // "trong" còn là giới từ (ví dụ: "trong một tuần"), không được tự động
  // xem mọi câu chứa từ này là câu hỏi canh tác.
  const farmingQuestion = isFarmingQuestion(question);
  const cropMatch = normalized.match(/\b(?:trong|gieo|cham soc|thu hoach)\s+([a-z0-9 ]{3,40})/);
  const cropSubject = cropMatch?.[1]?.replace(/\b(nhu the nao|ra sao|the nao|tai nha|ky thuat).*$/, '').trim();
  const recipeSynonyms = normalized.includes(' ran') ? ' chiên giòn' : '';
  const expandedQuery = recipeQuestion
    ? `"${question}"${recipeSynonyms} công thức nguyên liệu sơ chế các bước thực hiện trả lời bằng tiếng Việt`
    : healthQuestion
    ? `${question} tư vấn chuyên gia dinh dưỡng`
    : asksForExplanation
      ? `${question} giải thích cơ chế chính xác nguồn khoa học giáo dục`
      : farmingQuestion
        ? `"${question}" hướng dẫn kỹ thuật nông nghiệp`
        : /(khi nao|dieu kien|truong hop)/.test(normalized)
          ? `${question} điều kiện cần và đủ tất cả trường hợp`
          : /(la gi|cong thuc|ky hieu|ten khoa hoc|bao nhieu|ai la)/.test(normalized)
            ? `"${question}" định nghĩa chính xác trả lời bằng tiếng Việt`
          : question;
  const attempts = [
    { query: expandedQuery, search_depth: 'advanced' },
    ...(recipeQuestion ? [{ query: `${question} nguyên liệu sơ chế từng bước tiếng Việt`, search_depth: 'advanced', trustedRecipe: true }] : []),
    { query: farmingQuestion ? `"${question}"` : question, search_depth: 'basic' },
    ...(howToQuestion && !recipeQuestion ? [{ query: `${question} hướng dẫn từng bước chi tiết tiếng Việt`, search_depth: 'advanced' }] : []),
    ...(farmingQuestion ? [{ query: `${question} khuyến nông kỹ thuật canh tác`, search_depth: 'basic' }] : []),
  ];
  for (const attempt of attempts) {
    try {
      const requestBody = { ...attempt, max_results: 6, include_answer: true, include_raw_content: true };
      delete requestBody.trustedRecipe;
      if (recipeQuestion && attempt.trustedRecipe) requestBody.include_domains = ['dienmayxanh.com', 'cet.edu.vn', 'huongnghiepaau.com', 'daotaobeptruong.vn', 'monngonmoingay.com'];
      const response = await fetch(config.ai.tavilySearchUrl, {
        method: 'POST',
        headers: { authorization: `Bearer ${config.ai.tavilyApiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) continue;
      const result = await response.json();
      const searchSummary = String(result.answer || '').trim().slice(0, 1400);
      const sources = (result.results || []).map((source, index) => {
        const snippet = String(source.content || '').trim();
        const rawContent = String(source.raw_content || '').trim();
        // Đoạn trích của công cụ tìm kiếm thường chứa đúng phần trả lời, còn đầu
        // HTML thô có thể chỉ là menu. Giữ đoạn trích trước rồi mới bổ sung nội dung.
        const sourceText = recipeQuestion
          ? compactRecipeSource(rawContent || snippet)
          : `${snippet}${rawContent && rawContent !== snippet ? `\n${rawContent}` : ''}`.trim().slice(0, 2600);
        return { title: String(source.title || '').trim().slice(0, 240), url: String(source.url || '').trim(), description: sourceText, summary: index === 0 ? searchSummary : '', score: Number(source.score || 0) };
      }).filter((source) => {
        try {
          const parsed = new URL(source.url);
          const normalizedSourceIdentity = normalizeVietnamese(`${source.title} ${parsed.pathname.replace(/[-_/]+/g, ' ')}`);
          const cropTokens = String(cropSubject || '').split(/\s+/).filter((token) => token.length >= 3);
          const hasCropSubject = !farmingQuestion || !cropTokens.length || cropTokens.every((token) => normalizedSourceIdentity.includes(token));
          const recipeTokens = normalized.split(/\s+/).filter((token) => token.length >= 2 && !['cach', 'nau', 'lam', 'cong', 'thuc', 'che', 'bien'].includes(token));
          const recipeMatches = recipeTokens.filter((token) => token === 'ran'
            ? /\b(ran|chien)\b/.test(normalizedSourceIdentity)
            : normalizedSourceIdentity.includes(token)).length;
          const hasRecipeSubject = !recipeQuestion || recipeTokens.length === 0 || recipeMatches >= Math.min(3, recipeTokens.length);
          // Không loại bài chỉ vì trang dùng tiêu đề khác. Lớp dựng và kiểm
          // chứng phía sau vẫn bắt buộc đủ nguyên liệu, sơ chế và thực hiện.
          const hasRecipeDetail = !recipeQuestion || source.description.length >= 500;
          // Với hướng dẫn phổ thông, điểm liên quan Tavily đôi khi rất thấp dù
          // tiêu đề và nội dung khớp. Các điều kiện HTTPS, có nội dung và loại
          // Reddit vẫn được giữ; để lớp kiểm chứng phía sau quyết định nội dung.
          const minimumScore = howToQuestion && !recipeQuestion ? 0 : 0.15;
          return parsed.protocol === 'https:' && source.title && source.description && source.score >= minimumScore && hasCropSubject && hasRecipeSubject && hasRecipeDetail && !/(^|\.)reddit\.com$/i.test(parsed.hostname);
        } catch { return false; }
      }).sort((a, b) => b.score - a.score).slice(0, 5);
      if (sources.length) return sources;
    } catch { /* thử truy vấn dự phòng */ }
  }
  return [];
}

export function selectSourcesForQuestion(question, sources) {
  const normalized = normalizeVietnamese(question);
  const recipeQuestion = isRecipeQuestion(question);
  if (recipeQuestion) return sources.slice(0, 1);
  if (/(suc khoe|benh|tao bon|tre em|em be|dinh duong|vitamin|thuoc|trieu chung)/.test(normalized)) return sources.slice(0, 3);
  if (isFarmingQuestion(question)) return sources.slice(0, 1);
  return sources.slice(0, 3);
}

const foreignScriptPattern = /[\u0370-\u052F\u0590-\u0E7F\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF]/u;
const foreignScriptGlobalPattern = /[\u0370-\u052F\u0590-\u0E7F\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF]/gu;
const containsForeignScript = (value) => foreignScriptPattern.test(String(value || ''));
export const isPredominantlyEnglish = (value) => {
  const words = String(value || '').toLowerCase().match(/[a-z]+/g) || [];
  const englishMarkers = new Set(['the', 'is', 'are', 'of', 'to', 'and', 'in', 'for', 'with', 'from', 'that', 'this', 'when', 'which', 'can', 'will', 'has', 'have']);
  const vietnameseMarkers = new Set(['là', 'của', 'và', 'trong', 'cho', 'với', 'được', 'khi', 'có', 'không', 'này', 'những', 'từ']);
  const englishCount = words.filter((word) => englishMarkers.has(word)).length;
  const vietnameseCount = String(value || '').toLowerCase().split(/\s+/).filter((word) => vietnameseMarkers.has(word.replace(/[^\p{L}]/gu, ''))).length;
  return englishCount >= 3 && englishCount > vietnameseCount * 1.5;
};

async function requestOllama(messages, verificationContext = {}) {
  const call = async (requestMessages) => {
    const response = await fetch(`${config.ai.ollamaUrl}/api/chat`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model: config.ai.ollamaModel, messages: requestMessages, stream: false, think: false, keep_alive: '5m', options: { temperature: 0.05, top_p: 0.8, repeat_penalty: 1.08, num_ctx: 4096, num_predict: 400 } }), signal: AbortSignal.timeout(70000) });
    const result = await response.json();
    return { response, result };
  };
  let output = await call(messages);
  if (output.response.ok) {
    const draft = output.result.message?.content || '';
    // Tách bước biên tập khỏi lịch sử hội thoại. Model nhỏ thường trộn các câu
    // trả lời cũ vào bản nháp nếu toàn bộ lịch sử được gửi lại ở bước này.
    const normalizedQuestion = normalizeVietnamese(verificationContext.question || '');
    const needsEditorialPass = isRecipeQuestion(verificationContext.question || '')
      || /(suc khoe|benh|thuoc|trieu chung|tre em|em be|khi nao|dieu kien|truong hop|vai tro|hoat dong|bang cach|qua trinh|su khac nhau|dinh nghia|phat bieu)/.test(normalizedQuestion);
    const edited = needsEditorialPass ? await call([
      { role: 'system', content: 'Bạn là bộ phản biện và kiểm chứng câu trả lời tiếng Việt. Không được dùng kiến thức ngoài nguồn. Trước khi viết đáp án, hãy âm thầm đối chiếu từng biến số, giả thiết, điều kiện, lượng từ và yêu cầu trong câu hỏi với nguồn; kiểm tra điều kiện cần, điều kiện đủ, trường hợp biên và phản ví dụ có liên quan. Với câu hỏi mô tả cơ chế hoặc quá trình có hướng, phải kiểm tra riêng điểm bắt đầu, điểm kết thúc và chiều chuyển động ở từng trạng thái; nếu bản nháp đảo chiều so với nguồn thì bắt buộc sửa. Nếu bản nháp thiếu một điều kiện làm thay đổi kết luận, phải bổ sung từ nguồn. Nếu bản nháp khẳng định quá mức, phải thu hẹp đúng theo nguồn. Chỉ xuất câu trả lời cuối cùng; không xuất checklist, nhận xét, lời khen, điểm số hay quá trình suy luận.' },
      { role: 'user', content: `CÂU HỎI HIỆN TẠI:\n${verificationContext.question || ''}\n\nNGUỒN ĐƯỢC PHÉP DÙNG (nguồn đầu tiên là nguồn chính):\n${JSON.stringify(verificationContext.sources || [])}\n\nHãy sửa bản nháp bên dưới thành CÂU TRẢ LỜI CUỐI CÙNG. Phải trả lời đủ mọi vế của câu hỏi. Với câu hỏi hỏi khi nào, điều kiện hoặc phân loại: nêu điều kiện cần và đủ nếu nguồn cho phép; giữ đủ mọi biến số và giả thiết; xét trường hợp biên và các trường hợp đối lập trực tiếp để kết luận không mơ hồ. Không được biến điều kiện cần thành điều kiện đủ hoặc ngược lại. Nếu câu hỏi giới hạn một loại đối tượng, phải xóa mọi mục thuộc loại khác. Được phép diễn đạt lại trung thành với nguồn. Với công thức nấu ăn: chỉ dùng định lượng và quy trình của nguồn chính, không ghép nhiều bài; giữ nguyên con số và đơn vị; trình bày lần lượt Nguyên liệu, Sơ chế, Các bước thực hiện. Chỉ trả lời "Chưa có đủ nguồn phù hợp để trả lời chính xác câu hỏi này." khi nguồn thực sự thiếu dữ kiện. Chỉ dùng tiếng Việt tự nhiên, không dùng ký tự lỗi hoặc Markdown, không thêm thông tin ngoài nguồn. Chỉ xuất nội dung trả lời trực tiếp.\n\nBẢN NHÁP:\n${draft}` },
    ]) : { response: { ok: false }, result: {} };
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
    if (isPredominantlyEnglish(output.result.message?.content)) {
      const translated = await call([
        { role: 'system', content: 'Bạn là biên tập viên tiếng Việt. Chỉ xuất câu trả lời bằng tiếng Việt tự nhiên. Giữ nguyên công thức, ký hiệu, số liệu, tên riêng và thuật ngữ không có bản dịch phù hợp. Không thêm dữ kiện, không dùng Markdown và không giải thích quá trình dịch.' },
        { role: 'user', content: `Câu hỏi: ${verificationContext.question || ''}\n\nNguồn kiểm chứng:\n${JSON.stringify(verificationContext.sources || [])}\n\nHãy chuyển câu trả lời sau sang tiếng Việt, giữ nguyên ý nghĩa và dữ kiện:\n${output.result.message?.content || ''}` },
      ]);
      const translatedText = String(translated.result?.message?.content || '').trim();
      if (translated.response.ok && translatedText && !isPredominantlyEnglish(translatedText)) output = translated;
      else output.result.message.content = 'Chưa thể tạo câu trả lời hoàn toàn bằng tiếng Việt từ các nguồn hiện có.';
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
      think: false,
      keep_alive: '5m',
      options: { temperature: 0.1, top_p: 0.85, num_ctx: 4096 },
      messages: [
        { role: 'system', content: 'Trả lời trực tiếp bằng tiếng Việt, chỉ dùng dữ kiện trong nguồn. Không nhận xét nguồn, không đoán và không dùng Markdown.' },
        { role: 'user', content: `Câu hỏi: ${question}\n\nNguồn đã kiểm chứng:\n${sources.map((source) => `${source.title}\n${source.description}`).join('\n\n')}\n\nHãy trả lời đúng trọng tâm và đầy đủ. Nếu câu hỏi hỏi "khi nào", "điều kiện" hoặc phân loại trường hợp, phải nêu điều kiện cần và đủ, không bỏ sót biến số hay trường hợp biên; nêu ngắn gọn các trường hợp đối lập liên quan để kiểm tra kết luận. Nếu là công thức, chỉ dùng nguồn đầu tiên; trình bày đủ Nguyên liệu, Sơ chế và Các bước thực hiện theo đúng thứ tự của bài; không tự thêm định lượng hoặc thao tác.` },
      ],
    }),
    signal: AbortSignal.timeout(60000),
  });
  const result = await response.json();
  return response.ok ? String(result.message?.content || '').trim() : '';
}

const needsCompletenessExpansion = (question, answer) => {
  const normalized = normalizeVietnamese(question);
  if (!/(khi nao|dieu kien|truong hop|phan loai|so sanh|tai sao|vi sao)/.test(normalized)) return false;
  const substantiveWords = formatPlainAnswer(answer).split(/\s+/).filter(Boolean);
  return substantiveWords.length < 50;
};

async function requestCompleteGroundedAnswer(question, sources) {
  const response = await fetch(`${config.ai.ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: config.ai.ollamaModel,
      stream: false,
      think: false,
      keep_alive: '5m',
      options: { temperature: 0.05, top_p: 0.8, num_ctx: 4096, num_predict: 400 },
      messages: [
        { role: 'system', content: 'Bạn là chuyên gia tổng hợp câu trả lời có kiểm chứng. Chỉ dùng nguồn được cung cấp. Không được bỏ sót giả thiết, biến số, điều kiện cần, điều kiện đủ hoặc trường hợp biên làm thay đổi kết luận. Không xuất suy luận nội bộ, lời khen hay nhận xét nguồn.' },
        { role: 'user', content: `Câu hỏi: ${question}\n\nNguồn:\n${sources.map((source) => `${source.title}\n${source.description}`).join('\n\n')}\n\nHãy trả lời bằng tiếng Việt theo đúng ba phần sau:\nKết quả: trả lời chính xác câu hỏi.\nGiải thích: giải thích vì sao dựa trên nguồn.\nCác trường hợp liên quan: liệt kê các trường hợp đối lập hoặc trường hợp biên trực tiếp để chứng minh kết luận là đầy đủ.\nNếu nguồn không đủ cho một phần, ghi rõ phần đó chưa đủ nguồn; tuyệt đối không tự đoán.` },
      ],
    }),
    signal: AbortSignal.timeout(60000),
  });
  const result = await response.json();
  return response.ok ? formatPlainAnswer(result.message?.content || '') : '';
}

const formatPlainAnswer = (answer) => String(answer || '')
  .replace(/\*\*(.*?)\*\*/g, '$1')
  .replace(/\$([^$\n]+)\$/g, '$1')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/(?:Các bước này được thực hiện )?(?:dựa trên|theo) (?:hướng dẫn từ )?nguồn:\s*https?:\/\/\S+\.?/giu, '')
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
  const recipeQuestion = isRecipeQuestion(question);
  let keptLines = repairVietnameseExtraction(answer).split('\n');
  const recipeHeadingCount = keptLines.filter((line) => /^(?:-\s*)?(nguyên liệu|sơ chế|các bước thực hiện)\s*:/iu.test(line.trim())).length;
  if (!recipeQuestion && recipeHeadingCount >= 2) return 'Chưa có đủ nguồn phù hợp để trả lời chính xác câu hỏi này.';
  if (scope) keptLines = keptLines.filter((line) => !scopeExclusions[scope].test(line));
  if (recipeQuestion) keptLines = keptLines.filter((line) => !/\b\d+(?:[.,/]\d+)?\s*m\b/iu.test(line));
  const meaningfulLines = keptLines.filter((line) => line.replace(/^\s*-\s*/, '').trim().length > 12);
  return meaningfulLines.length ? meaningfulLines.join('\n').trim() : 'Chưa có đủ nguồn phù hợp để trả lời chính xác câu hỏi này.';
}

export function validateRecipeAgainstSource(question, answer, source) {
  if (!isRecipeQuestion(question)) return answer;
  const sourceText = normalizeVietnamese(`${source?.title || ''}\n${source?.description || ''}`);
  if (sourceText.length < 500) return 'Chưa có đủ nguồn phù hợp để trả lời chính xác câu hỏi này.';

  let section = '';
  const actionVerbs = ['hap', 'xao', 'chien', 'nuong', 'luoc', 'kho', 'rang', 'phi', 'tron', 'uop', 'so che', 'rua', 'cat', 'thai'];
  const sourceNumbers = new Set(sourceText.match(/\d+(?:[.,/]\d+)?/g) || []);
  const kept = [];
  let ingredientLines = 0;
  let procedureLines = 0;

  for (const originalLine of repairVietnameseExtraction(answer).split('\n')) {
    let line = originalLine.trim();
    if (!line) { kept.push(''); continue; }
    if (/^(?:-\s*)?nguyên liệu\s*:/iu.test(line)) section = 'ingredients';
    else if (/^(?:-\s*)?sơ chế\s*:/iu.test(line)) section = 'prep';
    else if (/^(?:-\s*)?(?:các bước thực hiện|thực hiện)\s*:/iu.test(line)) {
      section = 'steps';
      line = 'Các bước thực hiện:';
    }

    if (/\b\d+(?:[.,/]\d+)?\s*m\b/iu.test(line)) continue;
    const contentWithoutIndex = line.replace(/^\s*[-–]?\s*\d+[.)]\s*/, '');
    const unsupportedNumber = (contentWithoutIndex.match(/\d+(?:[.,/]\d+)?/g) || [])
      .some((number) => !sourceNumbers.has(normalizeVietnamese(number)));
    if (unsupportedNumber) continue;

    if (section === 'steps' && !/^Các bước thực hiện:/u.test(line)) {
      const normalizedLine = normalizeVietnamese(line);
      const unsupportedAction = actionVerbs.some((verb) => normalizedLine.includes(verb) && !sourceText.includes(verb));
      if (unsupportedAction) continue;
      if (normalizedLine.includes('bac chao') && /^\s*[-–]?\s*hap\b/.test(normalizedLine)) {
        line = line.replace(/^\s*[-–]?\s*Hấp[^:]*:/iu, '- Làm nước sốt:');
      }
      procedureLines += 1;
    } else if (section === 'ingredients' && !/nguyên liệu\s*:/iu.test(line)) ingredientLines += 1;
    else if (section === 'prep' && !/sơ chế\s*:/iu.test(line)) procedureLines += 1;
    kept.push(line);
  }

  const output = kept.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  const hasRequiredSections = /nguyên liệu\s*:/iu.test(output)
    && /sơ chế\s*:/iu.test(output)
    && /các bước thực hiện\s*:/iu.test(output);
  return hasRequiredSections && ingredientLines >= 2 && procedureLines >= 2
    ? output
    : 'Chưa có đủ nguồn phù hợp để trả lời chính xác câu hỏi này.';
}

export function answerStructuredRecipe(question, source) {
  if (!isRecipeQuestion(question)) return null;
  const text = String(source?.description || '');
  const section = (startPattern, endPattern) => {
    const start = text.search(startPattern);
    if (start < 0) return [];
    const bodyStart = text.indexOf('\n', start);
    if (bodyStart < 0) return [];
    const rest = text.slice(bodyStart + 1);
    const end = rest.search(endPattern);
    return (end >= 0 ? rest.slice(0, end) : rest)
      .split('\n')
      .map((line) => /^\s*[-–]{3,}\s*$/.test(line) ? '' : line.replace(/^\s*[-*]\s*/, '').trim())
      .filter((line) => line
        && !/^(?:muỗng|gram|m\s*:\s*muỗng)/iu.test(line)
        && !/^#{1,6}/.test(line));
  };
  const ingredientHeading = /#{1,6}\s*(?:Nguyên\s*Liệu|Chuẩn\s*Bị\s*Nguyên\s*Liệu|Thành\s*Phần)\s*:/iu;
  const preparationHeading = /\n#{1,6}\s*(?:Sơ\s*Chế|Chuẩn\s*Bị)\s*:/iu;
  const stepsHeading = /\n#{1,6}\s*(?:Thực\s*Hiện|Cách\s*Làm|Cách\s*Chế\s*Biến|Các\s*Bước\s*Thực\s*Hiện)\s*:/iu;
  const servingHeading = /\n#{1,6}\s*(?:Cách\s*Dùng|Thành\s*Phẩm|Thưởng\s*Thức)\s*:/iu;
  const ingredients = section(ingredientHeading, preparationHeading.test(text) ? preparationHeading : stepsHeading);
  let preparation = section(/#{1,6}\s*(?:Sơ\s*Chế|Chuẩn\s*Bị)\s*:/iu, stepsHeading);
  let steps = section(/#{1,6}\s*(?:Thực\s*Hiện|Cách\s*Làm|Cách\s*Chế\s*Biến|Các\s*Bước\s*Thực\s*Hiện)\s*:/iu, servingHeading);
  const serving = section(/#{1,6}\s*(?:Cách\s*Dùng|Thành\s*Phẩm|Thưởng\s*Thức)\s*:/iu, /\n#{1,6}/iu);
  const numberedSteps = [];
  let currentStep = null;
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    const stepMatch = line.match(/^(?:#{1,6}\s*)?Bước\s*(\d+)\s*:\s*(.*)$/iu);
    if (stepMatch) {
      if (currentStep) numberedSteps.push(currentStep);
      const stepNumber = Number(stepMatch[1]);
      if (numberedSteps.length && stepNumber <= numberedSteps.at(-1).number) {
        currentStep = null;
        break;
      }
      currentStep = { number: stepNumber, title: stepMatch[2].trim(), body: [] };
      continue;
    }
    if (currentStep && /^#{1,6}\s*/.test(line)) {
      numberedSteps.push(currentStep);
      currentStep = null;
      break;
    }
    if (currentStep && /^(xem them|quan tri|tim hieu ngay)\b/.test(normalizeVietnamese(line))) {
      numberedSteps.push(currentStep);
      currentStep = null;
      break;
    }
    if (currentStep && line) currentStep.body.push(line.replace(/^[-*]\s*/, '').trim());
  }
  if (currentStep) numberedSteps.push(currentStep);
  let preparationStepNumber = null;
  if (!preparation.length && numberedSteps.length) {
    const explicitPrepStep = numberedSteps.find((item) => /^(so che|chuan bi)(?: nguyen lieu)?[.:]?$/i.test(normalizeVietnamese(item.title).trim()));
    const prepStep = explicitPrepStep || numberedSteps[0];
    preparation = explicitPrepStep ? prepStep.body : [prepStep.title, ...prepStep.body].filter(Boolean);
    preparationStepNumber = prepStep.number;
  }
  if (numberedSteps.length) {
    steps = numberedSteps
      .filter((item) => item.number !== preparationStepNumber)
      .sort((a, b) => a.number - b.number)
      .map((item) => item.body.length ? `${item.title}: ${item.body.join(' ')}` : item.title);
  }
  if (ingredients.length < 2 || preparation.length < 1 || steps.length < 1) return null;
  return [
    'Nguyên liệu:', ...ingredients.map((line) => `- ${line}`), '',
    'Sơ chế:', ...preparation.map((line) => `- ${line}`), '',
    'Các bước thực hiện:', ...steps.map((line) => `- ${line}`),
    ...(serving.length ? ['', 'Cách dùng:', ...serving.map((line) => `- ${line}`)] : []),
  ].join('\n').trim();
}

export function isFollowUpQuestion(question) {
  const normalized = normalizeVietnamese(question).trim();
  return /^(con|con lai|the con|vay con|nguoi do|cai do|no thi|y tren|truong hop do|trong so do|khu vua neu|chi so|thiet bi tai do|ai la chu vuon|co lich bao tri)\b/.test(normalized)
    || /\b(nhu tren|vua noi|vua neu|noi tiep|them nua|khu do|tai do|noi do|trong so do)\b/.test(normalized);
}

const appendVerifiedSources = (answer, sources) => {
  const formatted = formatPlainAnswer(answer);
  if (/^Chưa có đủ nguồn phù hợp/i.test(formatted)) return formatted;
  const resultMatch = formatted.match(/^(?:Kết quả|Kết luận trực tiếp|Kết luận)\s*:\s*([\s\S]*?)(?=\n(?:Giải thích|Các trường hợp liên quan)\s*:|$)/iu);
  const explanationMatch = formatted.match(/\nGiải thích\s*:\s*([\s\S]*?)(?=\nCác trường hợp liên quan\s*:|$)/iu);
  const relatedMatch = formatted.match(/\nCác trường hợp liên quan\s*:\s*([\s\S]*)$/iu);
  const result = resultMatch?.[1]?.trim() || formatted;
  const explanationParts = [explanationMatch?.[1]?.trim(), relatedMatch?.[1]?.trim()].filter(Boolean);
  const details = explanationParts.length ? `\n${explanationParts.join('\n')}` : '';
  const sourceBlock = sources.length
    ? `\n\nNguồn tham khảo đã đối chiếu:\n${sources.map((source) => {
      let title = String(source.title || '').trim();
      if (!title || containsForeignScript(title) || isPredominantlyEnglish(title)) {
        try { title = `Bài viết từ ${new URL(source.url).hostname.replace(/^www\./, '')}`; } catch { title = 'Bài viết tham khảo'; }
      }
      return `- ${title}: ${source.url}`;
    }).join('\n')}`
    : '';
  return `${result}${details}${sourceBlock}`;
};

// Loại câu mô tả hướng chuyển động nếu cặp điểm đầu-cuối không xuất hiện theo
// đúng thứ tự trong bất kỳ nguồn nào. Đây là kiểm tra căn cứ chung, không phụ
// thuộc vào một câu hỏi hay lĩnh vực cụ thể.
export const removeUnsupportedDirectionalDetails = (answer, sources) => {
  const evidenceParts = sources.flatMap((source) => String(`${source.description || ''}\n${source.summary || ''}`)
    .split(/(?<=[.!?;\n])/u)
    .map(normalizeVietnamese));
  const endpoint = (value) => normalizeVietnamese(value)
    .replace(/\([^)]*\)/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 2 && !['mot', 'cac', 'qua', 'bang', 'thuong', 'la'].includes(word))
    .slice(0, 2)
    .join(' ');
  const supported = (sentence) => {
    const normalized = normalizeVietnamese(sentence);
    const state = normalized.match(/\bkhi\s+([^,.;]{2,30})/)?.[1]
      ?.split(/\s+/)
      .filter((word) => word.length >= 2)
      .slice(0, 2)
      .join(' ');
    const matches = [...normalized.matchAll(/\btu\s+([^,.;]{2,70}?)\s+(?:sang|den|ve)\s+([^,.;]{2,70})(?=,|\.|;|$)/g)];
    if (!matches.length) return true;
    return matches.every((match) => {
      const start = endpoint(match[1]);
      const finish = endpoint(match[2]);
      if (!start || !finish) return false;
      return evidenceParts.some((part) => {
        if (state && !part.includes(`khi ${state}`)) return false;
        const startAt = part.indexOf(start);
        const finishAt = part.indexOf(finish, startAt + start.length);
        return startAt >= 0 && finishAt > startAt;
      });
    });
  };
  return String(answer || '').split(/(?<=[.!?])\s+/u).filter(supported).join(' ').trim();
};

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

const areaHealthValue = (area) => {
  if (area.health_score !== null && area.health_score !== undefined && Number.isFinite(Number(area.health_score))) return Number(area.health_score);
  if (area.ui_status === 'danger') return 0;
  if (area.ui_status === 'warning' || area.status === 'maintenance') return 50;
  return 100;
};

export function answerSystemDataQuestion(question, currentUser) {
  const normalized = normalizeVietnamese(question);
  // Chỉ xem "Khu A/B/C" là mã khu; không nhầm chữ đầu của "khu vực" thành mã.
  const areaCodes = [...new Set([...normalized.matchAll(/\bkhu\s*([a-l])\b/gi)].map((match) => match[1]))];
  const areaMatch = areaCodes.length > 0;
  const selectedAreas = areaMatch
    ? store.areas.filter((area) => areaCodes.includes(normalizeVietnamese(area.area_name).replace(/^khu\s*/, '')))
    : store.areas;

  if (/(bao nhieu|so luong|tong so).*(khu vuon|khu vuc|khu trong)|(?:khu vuon|khu vuc|khu trong).*(bao nhieu|so luong|tong so)/.test(normalized)) {
    const areaNames = store.areas.map((area) => area.area_name).join(', ');
    return `Hệ thống hiện có ${store.areas.length} khu vực trồng${areaNames ? `: ${areaNames}.` : '.'}`;
  }

  if (/(van de nhat|nguy hiem nhat|suc khoe kem nhat|te nhat|can chu y nhat)/.test(normalized)) {
    if (!selectedAreas.length) return 'Chưa có dữ liệu khu vực trồng.';
    const lowestHealth = Math.min(...selectedAreas.map(areaHealthValue));
    const problemAreas = selectedAreas.filter((area) => areaHealthValue(area) === lowestHealth);
    return problemAreas.map((area) => {
      const alerts = store.alerts.filter((alert) => alert.area_id === area.area_id && alert.status === 'open');
      const status = area.ui_status === 'danger' ? 'nguy hiểm' : area.ui_status === 'warning' || area.status === 'maintenance' ? 'cần chú ý' : 'tốt';
      return `${area.area_name} đang trồng ${area.crop_type} có tình trạng đáng chú ý nhất: sức khỏe ${areaHealthValue(area)}%, trạng thái ${status}${alerts.length ? `, ${alerts.length} cảnh báo đang mở (${alerts.map((alert) => alert.title).join(', ')})` : ''}.`;
    }).join('\n');
  }

  const asksCropByArea = /(dang trong gi|trong gi|trong cay gi|loai cay (gi|nao)|cay gi dang trong|dang trong cay)/.test(normalized);
  if (asksCropByArea && (areaMatch || !/(khu nao|o khu nao|thuoc khu nao)/.test(normalized))) {
    return selectedAreas.map((area) => `- ${area.area_name}: đang trồng ${area.crop_type}.`).join('\n');
  }

  const asksAreaByCrop = /(trong o khu nao|o khu nao|thuoc khu nao|khu nao.*trong|duoc trong tai dau|trong tai dau|tai dau)/.test(normalized);
  if (asksAreaByCrop) {
    const matchingAreas = store.areas.filter((area) => normalized.includes(normalizeVietnamese(area.crop_type)));
    if (matchingAreas.length) return matchingAreas.map((area) => `- ${area.crop_type} đang được trồng tại ${area.area_name}.`).join('\n');
  }

  if (/(trang thai.*(can chu y|nguy hiem|tot)|khu nao.*(can chu y|nguy hiem|bao tri))/.test(normalized)) {
    const wantedStatus = normalized.includes('nguy hiem') ? 'danger' : normalized.includes('can chu y') || normalized.includes('bao tri') ? 'warning' : 'good';
    const matches = store.areas.filter((area) => area.ui_status === wantedStatus || (wantedStatus === 'warning' && area.status === 'maintenance'));
    return matches.length ? matches.map((area) => `- ${area.area_name}: trồng ${area.crop_type}, sức khỏe ${areaHealthValue(area)}%, trạng thái ${wantedStatus === 'danger' ? 'nguy hiểm' : wantedStatus === 'warning' ? 'cần chú ý' : 'tốt'}.`).join('\n') : 'Không có khu vực trồng phù hợp với trạng thái được hỏi.';
  }

  if (/(ai.*quan ly.*khu|quan ly.*khu nao|khu.*do ai.*quan ly|nguoi quan ly|chu vuon.*phu trach.*khu|chu vuon nao.*khu)/.test(normalized)) {
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
    const mentionedOwners = store.users.filter((user) => roleOfUser(user) === 'owner' && normalized.includes(normalizeVietnamese(user.full_name)));
    const managerAreas = mentionedOwners.length ? store.areas.filter((area) => mentionedOwners.some((owner) => owner.user_id === area.owner_id)) : selectedAreas;
    return managerAreas.map((area) => {
      const owner = store.users.find((user) => user.user_id === area.owner_id);
      return `- ${area.area_name}: chủ vườn quản lý là ${owner?.full_name || 'chưa phân công'}.`;
    }).join('\n');
  }

  const thresholdQuestion = /(nguong|cau hinh nguong)/.test(normalized);
  const sensorQuestion = !thresholdQuestion && /(cam bien|nhiet do|do am|muc nuoc|anh sang|\bph\b|\bec\b|chi so moi truong)/.test(normalized);
  if (!sensorQuestion && !thresholdQuestion && /(khu vuc|khu trong|vuon hom nay|tinh hinh.*vuon|tinh trang.*vuon|tong quan.*vuon|tong quan.*khu)/.test(normalized)) {
    return selectedAreas.map((area) => {
      const readings = ['temperature', 'humidity', 'ph', 'ec', 'water_level']
        .map((type) => latestReading(area.area_id, type))
        .filter(Boolean)
        .map((reading) => `${sensorLabels[store.sensors.find((sensor) => sensor.sensor_id === reading.sensor_id)?.sensor_type] || 'Chỉ số'} ${reading.value} ${reading.unit}`);
      const openAlerts = store.alerts.filter((alert) => alert.area_id === area.area_id && alert.status === 'open');
      return `- ${area.area_name}: trồng ${area.crop_type}, trạng thái ${area.status === 'active' ? 'đang hoạt động' : 'đang bảo trì'}; ${readings.length ? readings.join(', ') : 'chưa có dữ liệu cảm biến'}; ${openAlerts.length ? `${openAlerts.length} cảnh báo đang mở (${openAlerts.map((alert) => alert.title).join(', ')})` : 'không có cảnh báo đang mở'}.`;
    }).join('\n');
  }

  if (sensorQuestion) {
    const requestedTypes = Object.keys(sensorLabels).filter((type) => {
      const aliases = { temperature: 'nhiet do', humidity: 'do am', water_level: 'muc nuoc', light: 'anh sang', ph: 'ph', ec: 'ec' };
      return normalized.includes(aliases[type]);
    });
    const types = requestedTypes.length ? requestedTypes : Object.keys(sensorLabels);
    if (/(bao nhieu|so luong|tong so).*cam bien|cam bien.*(bao nhieu|so luong|tong so)/.test(normalized)) {
      return selectedAreas.map((area) => `- ${area.area_name}: có ${store.sensors.filter((sensor) => sensor.area_id === area.area_id).length} cảm biến.`).join('\n');
    }
    const asksHighest = /(cao nhat|lon nhat|max|toi da)/.test(normalized);
    const asksLowest = /(thap nhat|nho nhat|min|toi thieu)/.test(normalized);
    if ((asksHighest || asksLowest) && types.length === 1) {
      const comparable = selectedAreas.map((area) => ({ area, reading: latestReading(area.area_id, types[0]) }))
        .filter((item) => item.reading && Number.isFinite(Number(item.reading.value)));
      if (!comparable.length) return `Chưa có dữ liệu ${sensorLabels[types[0]].toLowerCase()} của các khu vực trồng.`;
      const targetValue = (asksHighest ? Math.max : Math.min)(...comparable.map((item) => Number(item.reading.value)));
      const matches = comparable.filter((item) => Number(item.reading.value) === targetValue);
      return `${matches.map((item) => `${item.area.area_name} đang trồng ${item.area.crop_type}`).join(' và ')} có ${sensorLabels[types[0]].toLowerCase()} ${asksHighest ? 'cao nhất' : 'thấp nhất'}: ${matches[0].reading.value} ${matches[0].reading.unit}.`;
    }
    return selectedAreas.map((area) => {
      const values = types.map((type) => latestReading(area.area_id, type)).filter(Boolean)
        .map((reading) => `${sensorLabels[store.sensors.find((sensor) => sensor.sensor_id === reading.sensor_id)?.sensor_type]} ${reading.value} ${reading.unit}`);
      return `- ${area.area_name}: ${values.length ? values.join(', ') : 'chưa có dữ liệu phù hợp'}.`;
    }).join('\n');
  }

  if (/(thiet bi|may bom|den led|quat|bom cham)/.test(normalized)) {
    const rows = selectedAreas.map((area) => {
      let devices = store.devices.filter((device) => device.area_id === area.area_id);
      if (normalized.includes('dang tat')) devices = devices.filter((device) => device.status === 'OFF');
      else if (normalized.includes('dang bat')) devices = devices.filter((device) => device.status === 'ON');
      if (normalized.includes('quat')) devices = devices.filter((device) => normalizeVietnamese(device.device_name).includes('quat'));
      else if (normalized.includes('den')) devices = devices.filter((device) => normalizeVietnamese(device.device_name).includes('den'));
      else if (normalized.includes('bom')) devices = devices.filter((device) => normalizeVietnamese(device.device_name).includes('bom'));
      if (/(bao nhieu|so luong|tong so)/.test(normalized)) return `- ${area.area_name}: có ${devices.length} thiết bị phù hợp.`;
      return devices.length ? `- ${area.area_name}: ${devices.map((device) => `${device.device_name} ${device.status === 'ON' ? 'đang bật' : 'đang tắt'} (${device.mode === 'AUTO' ? 'tự động' : 'thủ công'})`).join(', ')}.` : null;
    }).filter(Boolean);
    return rows.length ? rows.join('\n') : 'Không có thiết bị phù hợp với yêu cầu.';
  }

  if (/(canh bao|bat thuong|su co)/.test(normalized)) {
    return selectedAreas.map((area) => {
      const alerts = store.alerts.filter((alert) => alert.area_id === area.area_id && alert.status === 'open');
      return `- ${area.area_name}: ${alerts.length ? alerts.map((alert) => `${alert.title}; ${alert.message}; mức ${alert.severity === 'high' ? 'cao' : alert.severity === 'medium' ? 'trung bình' : 'thấp'}`).join(', ') : 'không có cảnh báo đang mở'}.`;
    }).join('\n');
  }

  if (/(cong viec|bao tri|nhiem vu|lich lam|lich hen|se lam.*vuon|ky thuat vien.*(den sua|sua|thuc hien)|ai.*(den sua|sua chua|bao tri))/.test(normalized)) {
    const tasks = store.tasks.filter((task) => (!areaMatch || selectedAreas.some((area) => area.area_id === task.area_id)) && (currentUser.role === 'admin'
      || (currentUser.role === 'technician' && task.assigned_to === currentUser.id)
      || (currentUser.role === 'owner' && store.areas.find((area) => area.area_id === task.area_id)?.owner_id === currentUser.id)));
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
    const requestedThresholdTypes = Object.keys(sensorLabels).filter((type) => {
      const aliases = { temperature: 'nhiet do', humidity: 'do am', water_level: 'muc nuoc', light: 'anh sang', ph: 'ph', ec: 'ec' };
      return normalized.includes(aliases[type]);
    });
    const thresholds = store.thresholds.filter((item) => (!areaMatch || selectedAreas.some((area) => area.area_id === item.area_id))
      && (!requestedThresholdTypes.length || requestedThresholdTypes.includes(item.sensor_type)));
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
  const continuesInternalConversation = isFollowUpQuestion(message)
    && history.some((item) => isInternalSystemQuestion(item.content));
  if (isInternalSystemQuestion(message) || continuesInternalConversation) {
    const latestAssistantContext = [...history].reverse().find((item) => item.role === 'assistant')?.content || '';
    const referencedAreas = [...new Set([...normalizeVietnamese(latestAssistantContext).matchAll(/\bkhu\s*([a-l])\b/gi)].map((match) => `Khu ${match[1].toUpperCase()}`))];
    const internalQuestion = continuesInternalConversation && referencedAreas.length ? `${message} Khu liên quan: ${referencedAreas.join(', ')}` : message;
    const directoryAnswer = answerDirectoryQuestion(internalQuestion, req.user);
    // Danh bạ là dữ liệu nội bộ của GREEN ARGRIC, không gắn nguồn web không liên quan.
    if (directoryAnswer) return res.json({ reply: formatPlainAnswer(directoryAnswer), provider: 'system', source: 'users', sources: [] });
    const systemDataAnswer = answerSystemDataQuestion(internalQuestion, req.user);
    if (systemDataAnswer) return res.json({ reply: formatPlainAnswer(systemDataAnswer), provider: 'system', source: 'green-argric-data', sources: [] });
    return res.json({ reply: 'Chưa có dữ liệu nội bộ phù hợp để trả lời câu hỏi này.', provider: 'system', source: 'green-argric-data', sources: [] });
  }
  const webSources = selectSourcesForQuestion(message, await searchWebSources(message));
  if (!webSources.length) return res.status(503).json({ message: config.ai.tavilyApiKey ? 'Chưa tìm được bài viết phù hợp để kiểm chứng câu trả lời. Bạn hãy mô tả câu hỏi cụ thể hơn.' : 'Chưa cấu hình TAVILY_API_KEY nên trợ lý không thể tìm nguồn kiểm chứng.', code: 'VERIFIED_SOURCE_UNAVAILABLE' });
  const structuredRecipe = answerStructuredRecipe(message, webSources[0]);
  if (structuredRecipe) return res.json({ reply: appendVerifiedSources(structuredRecipe, webSources), provider: 'system', source: 'verified-recipe', sources: webSources });
  const system = `Bạn là trợ lý GREEN ARGRIC. Trả lời trực tiếp câu hỏi cuối cùng bằng tiếng Việt rõ ràng.
Chỉ dùng dữ kiện trong verifiedWebSources bên dưới; không đoán và không thêm số liệu. Được phép dịch hoặc diễn đạt lại trung thành với nguồn.
Chỉ lấy ý liên quan đúng đối tượng được hỏi. Nếu nguồn có đủ dữ kiện thì phải trả lời, không nhận xét bản nháp hoặc quá trình tìm kiếm.
Với câu hỏi "khi nào", "điều kiện" hoặc yêu cầu phân loại, phải nêu điều kiện cần và đủ, giữ đủ mọi biến số, kiểm tra trường hợp biên và nêu các trường hợp đối lập liên quan trước khi kết luận.
Với câu hỏi hướng dẫn, sắp xếp thành các bước theo đúng thứ tự trong nguồn. Với công thức nấu ăn, chỉ dùng nguồn đầu tiên và không trộn định lượng.
Dùng văn bản thuần, mỗi ý một dòng, không dùng Markdown và không tự tạo URL.
Trình bày câu trả lời trực tiếp cùng các căn cứ, điều kiện và chi tiết cần thiết. Không tạo tiêu đề "Kết quả" hoặc "Giải thích". Không tự viết phần nguồn vì hệ thống sẽ gắn nguồn sau.
verifiedWebSources: ${JSON.stringify(webSources)}`;
  const messages = [{ role: 'system', content: system }, ...history.map((item) => ({ role: item.role === 'assistant' ? 'assistant' : 'user', content: String(item.content || '') })), { role: 'user', content: message }];
  try {
    if (config.ai.provider === 'ollama') {
      const { response, result } = await requestOllama(messages, { question: message, sources: webSources });
      if (!response.ok) return res.status(502).json({ message: result.error || 'Ollama không phản hồi', code: 'OLLAMA_ERROR' });
      let reply = enforceQuestionScope(message, result.message?.content || 'AI chưa tạo được nội dung trả lời.');
      reply = validateRecipeAgainstSource(message, reply, webSources[0]);
      if (/^Chưa có đủ nguồn phù hợp/i.test(reply) && webSources.length) {
        const fallbackReply = await requestSimpleGroundedAnswer(message, webSources);
        if (fallbackReply) {
          reply = enforceQuestionScope(message, fallbackReply);
          reply = validateRecipeAgainstSource(message, reply, webSources[0]);
        }
      }
      if (/^Chưa có đủ nguồn phù hợp/i.test(reply) && webSources[0]?.summary) {
        const summaryReply = await requestSimpleGroundedAnswer(message, [{ ...webSources[0], description: webSources[0].summary }]);
        if (summaryReply && !/^Chưa có đủ nguồn phù hợp/i.test(summaryReply)) reply = enforceQuestionScope(message, summaryReply);
      }
      if (needsCompletenessExpansion(message, reply)) {
        const completeReply = await requestCompleteGroundedAnswer(message, webSources);
        if (completeReply && !/^Chưa có đủ nguồn phù hợp/i.test(completeReply)) reply = enforceQuestionScope(message, completeReply);
      }
      reply = removeUnsupportedDirectionalDetails(reply, webSources) || 'Nguồn hiện có chưa đủ để xác nhận chính xác chiều của quá trình được hỏi.';
      return res.json({ reply: appendVerifiedSources(reply, webSources), model: config.ai.ollamaModel, provider: 'ollama', sources: webSources });
    }
    if (!config.openai.apiKey) return res.status(503).json({ message: 'Chưa cấu hình OPENAI_API_KEY', code: 'AI_NOT_CONFIGURED' });
    const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { authorization: `Bearer ${config.openai.apiKey}`, 'content-type': 'application/json' }, body: JSON.stringify({ model: config.openai.model, instructions: system, input: messages.slice(1) }) });
    const result = await response.json();
    if (!response.ok) return res.status(response.status).json({ message: result.error?.message || 'Dịch vụ AI không phản hồi', code: 'OPENAI_ERROR' });
    const output = result.output_text || result.output?.flatMap((item) => item.content || []).find((item) => item.type === 'output_text')?.text;
    let reply = enforceQuestionScope(message, output || 'AI chưa tạo được nội dung trả lời.');
    reply = validateRecipeAgainstSource(message, reply, webSources[0]);
    reply = removeUnsupportedDirectionalDetails(reply, webSources) || 'Nguồn hiện có chưa đủ để xác nhận chính xác chiều của quá trình được hỏi.';
    return res.json({ reply: appendVerifiedSources(reply, webSources), model: config.openai.model, provider: 'openai', sources: webSources });
  } catch (error) {
    const usingOllama = config.ai.provider === 'ollama';
    const verifiedSummary = webSources.find((source) => source.summary)?.summary;
    if (verifiedSummary && !isPredominantlyEnglish(verifiedSummary)) return res.json({ reply: appendVerifiedSources(verifiedSummary, webSources), provider: 'tavily', source: 'verified-web-fallback', sources: webSources });
    return res.status(503).json({ message: usingOllama ? 'Không kết nối được Ollama. Hãy chạy ollama serve và tải model đã cấu hình.' : 'Không kết nối được OpenAI.', code: usingOllama ? 'OLLAMA_UNAVAILABLE' : 'OPENAI_UNAVAILABLE', detail: error.message });
  }
});

export default router;
