import http from 'node:http';

http.createServer((req, res) => {
  if (req.method !== 'POST' || req.url !== '/api/chat') { res.writeHead(404).end(); return; }
  let body = '';
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', () => {
    const payload = JSON.parse(body || '{}');
    res.setHeader('content-type', 'application/json');
    const systemPrompt = payload.messages?.find((message) => message.role === 'system')?.content || '';
    if (!systemPrompt.includes('trợ lý thông minh đa năng') || !systemPrompt.includes('"users"')) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Missing general assistant prompt or system users context' }));
      return;
    }
    const isEditing = payload.messages?.at(-1)?.content?.includes('biên tập lại câu trả lời');
    const content = isEditing ? '* **Phản hồi Ollama kiểm thử**' : '* **Phản hồi Ollama kiểm thử 漢**';
    res.end(JSON.stringify({ model: payload.model, message: { role: 'assistant', content }, done: true }));
  });
}).listen(11435, '127.0.0.1');
