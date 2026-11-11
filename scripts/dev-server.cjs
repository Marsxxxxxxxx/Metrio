'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { hasDevtools, saveStyles } = require('./style-store.cjs');
const root = path.resolve(__dirname, '..');
const port = Number(process.env.PORT || process.argv[2] || 4173);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('PORT must be between 1024 and 65535.');
const clients = new Set();
const files = new Set(['index.html', 'src/engine.js', 'src/app.js', 'src/styles.css', 'src/user-styles.css', 'assets/icon.svg', 'devtools/style-panel.js', 'devtools/style-panel.css', 'devtools/style-schema.json']);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8' };
function reply(res, status, data) {
  res.writeHead(status, { 'Content-Type': mime['.json'], 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}
function saveRequest(req, res) {
  if (req.method !== 'POST') { reply(res, 405, { ok: false, error: '请使用保存按钮提交样式。' }); return; }
  const hosts = [`127.0.0.1:${port}`, `localhost:${port}`];
  if (!hosts.includes(req.headers.host) || req.headers.origin !== `http://${req.headers.host}`) { reply(res, 403, { ok: false, error: '仅接受本地开发页面的保存请求。' }); return; }
  if (!hasDevtools(root)) { reply(res, 404, { ok: false, error: '样式调试工具已移除。' }); return; }
  if (req.headers['content-type']?.split(';')[0].trim() !== 'application/json') { reply(res, 415, { ok: false, error: '需要 JSON 样式参数。' }); return; }
  let size = 0;
  const chunks = [];
  req.on('data', chunk => {
    size += chunk.length;
    if (size > 16384) { if (!res.writableEnded) reply(res, 413, { ok: false, error: '样式参数过大。' }); return; }
    chunks.push(chunk);
  });
  req.on('end', () => {
    if (res.writableEnded) return;
    try {
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if (!body || Object.keys(body).length !== 1 || !Object.hasOwn(body, 'values')) throw new Error('无效的保存请求。');
      reply(res, 200, { ok: true, ...saveStyles(root, body.values) });
    } catch (error) { reply(res, 400, { ok: false, error: error.message }); }
  });
  req.on('error', () => { if (!res.writableEnded) reply(res, 400, { ok: false, error: '保存请求中断。' }); });
}
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${port}`);
  if (url.pathname === '/__styles') { saveRequest(req, res); return; }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
  if (url.pathname === '/__health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ app: 'metrio-local', version: '0.4.0' }));
    return;
  }
  if (url.pathname === '/__events') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write(': connected\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }
  let file;
  try { file = decodeURIComponent(url.pathname).replace(/^\//, '') || 'index.html'; }
  catch { res.writeHead(400); res.end(); return; }
  if (!files.has(file)) { res.writeHead(404); res.end('Not found'); return; }
  fs.readFile(path.join(root, file), (error, data) => {
    if (error) { res.writeHead(error.code === 'ENOENT' ? 404 : 500); res.end(error.code === 'ENOENT' ? 'Not found' : 'Could not read application file'); return; }
    // Optional development UI. The application entry and release assets have no dependency on it.
    if (file === 'index.html' && url.searchParams.get('debug') !== '0'
      && hasDevtools(root)) {
      try {
        const schema = JSON.stringify(JSON.parse(fs.readFileSync(path.join(root, 'devtools/style-schema.json'), 'utf8'))).replaceAll('<', '\\u003c');
        data = Buffer.from(data.toString('utf8').replace('</head>', `<script type="application/json" id="metrio-style-schema">${schema}</script>\n<script defer src="devtools/style-panel.js"></script>\n</head>`));
      } catch { /* Optional tools must never prevent the application from loading. */ }
    }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
});
let debounce;
const watcher = fs.watch(root, { recursive: true }, (_event, filename) => {
  if (!filename || filename.replaceAll('\\', '/') === 'src/user-styles.css' || !files.has(filename.replaceAll('\\', '/'))) return;
  clearTimeout(debounce);
  debounce = setTimeout(() => { for (const client of clients) client.write('event: reload\ndata: changed\n\n'); }, 90);
});
const heartbeat = setInterval(() => { for (const client of clients) client.write(': keepalive\n\n'); }, 20000);
heartbeat.unref();
function shutdown() {
  watcher.close(); clearInterval(heartbeat); clearTimeout(debounce);
  for (const client of clients) client.end();
  server.close();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `Port ${port} is already in use. Try: node scripts/dev-server.cjs 4174` : error.message);
  watcher.close(); clearInterval(heartbeat); process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => {
  console.log(`Metrio v0.4.0\nLocal: http://127.0.0.1:${port}\nLive reload enabled. Press Ctrl+C to stop.`);
});
