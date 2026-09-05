import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.wasm':'application/wasm','.litertlm':'application/octet-stream'};
const port = Number(process.env.DHR_PORT || 4173);

http.createServer((request, response) => {
  const urlPath = request.url === '/' ? '/index.html' : request.url.split('?')[0];
  const safePath = path.normalize(urlPath).replace(/^([.][.][\\/])+/, '');
  const filePath = path.join(root, safePath);
  if (!filePath.startsWith(root)) { response.writeHead(403); return response.end('Forbidden'); }
  fs.readFile(filePath, (error, file) => {
    if (error) { response.writeHead(error.code === 'ENOENT' ? 404 : 500); return response.end('Not found'); }
    response.writeHead(200, {'Content-Type':types[path.extname(filePath)] || 'application/octet-stream','Cache-Control':'no-cache'});
    response.end(file);
  });
}).listen(port, () => console.log(`DHR Companion ready at http://localhost:${port}`));
