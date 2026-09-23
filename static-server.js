import fs from 'node:fs';
import path from 'node:path';

const TYPES = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg','.wav':'audio/wav','.mp4':'video/mp4'};

export function byteRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2])) return null;
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  return Number.isSafeInteger(start) && Number.isSafeInteger(end) && start <= end && start < size ? {start, end} : null;
}

export function serveStatic(req, res, root) {
  try {
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405, {Allow:'GET, HEAD'}).end(); return; }
    const requested = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (requested !== root && !requested.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    const file = fs.statSync(requested).isDirectory() ? path.join(requested, 'index.html') : requested;
    const size = fs.statSync(file).size;
    const headers = {'Content-Type':TYPES[path.extname(file)] || 'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache'};
    let range;
    if (req.headers.range) {
      range = byteRange(req.headers.range, size);
      if (!range) { res.writeHead(416, {...headers,'Content-Range':`bytes */${size}`}).end(); return; }
      headers['Content-Range'] = `bytes ${range.start}-${range.end}/${size}`;
    }
    headers['Content-Length'] = range ? range.end - range.start + 1 : size;
    res.writeHead(range ? 206 : 200, headers);
    if (req.method === 'HEAD') { res.end(); return; }
    const stream = fs.createReadStream(file, range);
    stream.on('error', () => res.destroy());
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  } catch { res.writeHead(404).end('Not found'); }
}
