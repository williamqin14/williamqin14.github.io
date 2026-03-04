const http = require('http');
const fs = require('fs');
const path = require('path');
const { calculate } = require('./app');

const publicDir = path.join(__dirname, 'public');

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function serveStatic(req, res) {
  let targetPath = req.url === '/' ? '/index.html' : req.url;
  targetPath = path.normalize(targetPath).replace(/^\/+/, '');
  const absolutePath = path.join(publicDir, targetPath);

  if (!absolutePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(absolutePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    const extension = path.extname(absolutePath);
    const contentType = extension === '.css'
      ? 'text/css'
      : extension === '.js'
        ? 'application/javascript'
        : 'text/html';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (error) {
        reject(new Error('Request body must be valid JSON.'));
      }
    });

    req.on('error', reject);
  });
}

function requestHandler(req, res) {
  if (req.method === 'POST' && req.url === '/api/calculate') {
    parseRequestBody(req)
      .then(payload => {
        const result = calculate(payload);
        sendJson(res, 200, { result });
      })
      .catch(error => {
        sendJson(res, 400, { error: error.message });
      });
    return;
  }

  if (req.method === 'GET') {
    serveStatic(req, res);
    return;
  }

  res.writeHead(405);
  res.end('Method Not Allowed');
}

function createServer() {
  return http.createServer(requestHandler);
}

if (require.main === module) {
  const port = process.env.PORT || 3000;
  createServer().listen(port, () => {
    console.log(`Calculator app running at http://localhost:${port}`);
  });
}

module.exports = {
  createServer
};
