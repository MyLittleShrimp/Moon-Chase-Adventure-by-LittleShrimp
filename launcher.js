import http from 'node:http';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { serveStatic } from './static-server.js';

const directory = fileURLToPath(new URL('./dist/', import.meta.url));
const healthPath = '/__moon_chase_launcher__';
const app = 'moon-chase-adventure';

function probe(port, project) {
  return new Promise(resolve => {
    const request = http.get({ hostname: '127.0.0.1', port, path: healthPath, agent: false }, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => {
        body += chunk;
        if (body.length > 1024) response.destroy();
      });
      response.on('end', () => {
        try {
          const value = JSON.parse(body);
          resolve(response.statusCode === 200 && value.app === app && value.project === project);
        } catch { resolve(false); }
      });
      response.on('error', () => resolve(false));
    });
    const deadline = setTimeout(() => request.destroy(), 400);
    request.on('close', () => clearTimeout(deadline));
    request.on('error', () => resolve(false));
  });
}

export async function startGameServer({ root = directory, port = 4188, attempts = 32 } = {}) {
  root = path.resolve(root);
  if (!Number.isInteger(port) || port < 1 || !Number.isInteger(attempts) || attempts < 1 || port + attempts > 65536) {
    throw new Error('Invalid local port range.');
  }
  const project = createHash('sha256').update(path.resolve(root)).digest('hex').slice(0, 24);
  const ports = Array.from({ length: attempts }, (_, i) => port + i);
  // Check every candidate first: an earlier port may have become free since the last launch.
  const running = await Promise.all(ports.map(candidate => probe(candidate, project)));
  const previous = running.indexOf(true);
  if (previous !== -1) return { url: `http://localhost:${ports[previous]}/`, reused: true, server: null };

  for (const candidate of ports) {
    const server = http.createServer((request, response) => {
      if (request.url === healthPath && request.method === 'GET') {
        response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        response.end(JSON.stringify({ app, project }));
        return;
      }
      serveStatic(request, response, root);
    });
    try {
      await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(candidate, '0.0.0.0', () => {
          server.removeListener('error', reject);
          resolve();
        });
      });
      return { server, reused: false, url: `http://localhost:${candidate}/` };
    } catch (error) {
      if (error.code !== 'EADDRINUSE') throw error;
      // A second double-click may have started this copy while we were probing.
      if (await probe(candidate, project)) {
        return { server: null, reused: true, url: `http://localhost:${candidate}/` };
      }
    }
  }
  throw new Error(`Ports ${port}–${port + attempts - 1} are busy. Close unused local servers and try again.`);
}

function openBrowser(url) {
  const command = process.platform === 'win32' ? 'cmd.exe' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  const args = process.platform === 'win32' ? ['/d', '/s', '/c', `start "" "${url}"`] : [url];
  const child = spawn(command, args, { windowsHide: true, stdio: 'ignore' });
  child.on('error', () => console.log(`请手动打开：${url}`));
  child.unref();
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const result = await startGameServer();
    console.log('\n追月行动 · 月下奇遇\n');
    console.log(`游戏地址：${result.url}`);
    if (result.reused) {
      console.log('游戏服务已经在运行，正在重新打开浏览器。');
    } else {
      console.log('浏览器将自动打开。游玩时保留此窗口，可以将它最小化。');
      console.log('结束游玩后关闭此窗口，或按 Ctrl+C 停止服务。');
      console.log('进度保存在当前浏览器。端口变化时，存档会分开保存。');
      result.server.on('error', error => { console.error(error.message); process.exitCode = 1; });
      process.once('SIGINT', () => { result.server.close(); result.server.closeAllConnections(); });
      process.once('SIGTERM', () => { result.server.close(); result.server.closeAllConnections(); });
    }
    openBrowser(result.url);
  } catch (error) {
    console.error(`启动失败：${error.message}`);
    process.exitCode = 1;
  }
}
