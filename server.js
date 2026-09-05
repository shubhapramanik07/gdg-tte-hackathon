const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webmanifest':'application/manifest+json'};

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
}).listen(4173, () => console.log('DHR Companion ready at http://localhost:4173'));
