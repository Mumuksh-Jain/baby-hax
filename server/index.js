import http from 'node:http';
import { readFile, writeFile, mkdir, rename, stat } from 'node:fs/promises';
import { join, resolve, extname, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import { gzipSync } from 'node:zlib';

const port = Number(process.env.PORT || 4173);
const root = resolve('dist');
const dataDir = resolve(process.env.PIP_DATA_DIR || 'data');
await mkdir(dataDir, { recursive: true });
const database = join(dataDir, 'wishes.json');
let wishes;
try { wishes = JSON.parse(await readFile(database, 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; wishes = []; }
if (!Array.isArray(wishes)) throw new Error('Invalid guestbook database');
let writing = Promise.resolve();
const listeners = new Set();
const compressed = new Map();
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.woff2': 'font/woff2', '.json': 'application/json' };
const json = (res, code, body) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); res.end(JSON.stringify(body)); };
const publicWishes = () => wishes.slice(-100).reverse();

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/wishes/events' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
      res.write('data: connected\n\n'); listeners.add(res);
      const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 20000);
      req.on('close', () => { clearInterval(heartbeat); listeners.delete(res); });
      return;
    }
    if (url.pathname === '/api/wishes' && req.method === 'GET') return json(res, 200, { wishes: publicWishes() });
    if (url.pathname === '/api/wishes' && req.method === 'POST') {
      if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}` && req.headers.origin !== `https://${req.headers.host}` && req.headers.origin !== process.env.PIP_DEV_ORIGIN) return json(res, 403, { error: 'This wish must be sent from the nursery.' });
      if (!req.headers['content-type']?.startsWith('application/json')) return json(res, 415, { error: 'Please send a JSON wish.' });
      const chunks = [];
      let bytesReceived = 0;
      for await (const chunk of req) { bytesReceived += chunk.length; if (bytesReceived > 4096) return json(res, 413, { error: 'That wish is too long.' }); chunks.push(chunk); }
      let body; try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return json(res, 400, { error: 'Please try that wish again.' }); }
      if (!body || typeof body !== 'object' || Array.isArray(body)) return json(res, 400, { error: 'Please include your name and wish.' });
      const clean = (value) => typeof value === 'string' ? value.trim().replace(/[\u0000-\u001f\u007f]/g, ' ') : '';
      const name = clean(body.name), message = clean(body.message);
      if (!name || name.length > 30 || message.length < 3 || message.length > 240) return json(res, 400, { error: 'Use a name up to 30 letters and a wish of 3–240 characters.' });
      const wish = { id: randomUUID(), name, message, createdAt: new Date().toISOString() };
      const operation = writing.then(async () => {
        const next = [...wishes, wish].slice(-1000);
        await writeFile(`${database}.tmp`, JSON.stringify(next, null, 2), 'utf8');
        await rename(`${database}.tmp`, database);
        wishes = next;
      });
      writing = operation.catch(() => {});
      await operation;
      for (const listener of listeners) listener.write('data: wish\n\n');
      return json(res, 201, { wish });
    }
    if (url.pathname.startsWith('/api/')) return json(res, 404, { error: 'Not found.' });
    if (!['GET', 'HEAD'].includes(req.method)) return json(res, 405, { error: 'Method not allowed.' });
    const path = resolve(root, `.${decodeURIComponent(url.pathname)}`);
    if (path !== root && !path.startsWith(root + sep)) return json(res, 403, { error: 'Not found.' });
    let file = path;
    try { if (!(await stat(file)).isFile()) file = join(root, 'index.html'); }
    catch { if (extname(path)) return json(res, 404, { error: 'Not found.' }); file = join(root, 'index.html'); }
    let bytes = await readFile(file);
    const headers = { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': file.includes(`${sep}assets${sep}`) ? 'public, max-age=31536000' : 'no-cache', 'X-Content-Type-Options': 'nosniff', Vary: 'Accept-Encoding' };
    if (/\btext\/|application\/json|image\/svg/.test(headers['Content-Type']) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
      const modified = (await stat(file)).mtimeMs;
      const cached = compressed.get(file);
      if (cached?.modified === modified) bytes = cached.bytes;
      else { bytes = gzipSync(bytes); compressed.set(file, { modified, bytes }); }
      headers['Content-Encoding'] = 'gzip';
    }
    headers['Content-Length'] = bytes.length;
    res.writeHead(200, headers);
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch (error) { console.error(error); if (!res.headersSent) json(res, 500, { error: 'The wish could not be saved. Please try again.' }); else res.end(); }
});
server.listen(port, process.env.HOST || '127.0.0.1', () => console.log(`Pip's nursery and persistent guestbook: http://127.0.0.1:${port}`));
