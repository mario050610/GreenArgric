import http from 'node:http';

http.createServer((req, res) => {
  if (req.method !== 'POST' || req.url !== '/api/chat') { res.writeHead(404).end(); return; }
  let body = '';
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', () => {
    const payload = JSON.parse(body || '{}');
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ model: payload.model, message: { role: 'assistant', content: 'Phản hồi Ollama kiểm thử' }, done: true }));
  });
}).listen(11435, '127.0.0.1');
