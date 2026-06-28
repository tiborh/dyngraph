#!/usr/bin/env node
// Simple static file server for local LAN testing (hardened)
// Usage: node tools/run-local-server.js [port]

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const port = parseInt(process.argv[2] || process.env.PORT || '8000', 10);
const root = path.resolve(process.cwd());

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.wasm': 'application/wasm',
};

function getLocalIPs() {
  const nets = os.networkInterfaces();
  const results = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address);
      }
    }
  }
  return results;
}

const server = http.createServer((req, res) => {
  // sanitize url and prevent directory traversal by resolving to absolute path
  try {
    // decode safely
    const decoded = decodeURIComponent(req.url || '/');
    // remove NULs
    const clean = decoded.replace(/\0/g, '');
    // normalize and remove leading ../ or / segments
    const safeSuffix = path.posix.normalize(clean).replace(/^(\.{1,2}\/|\/)+/, '');
    let filePath = path.resolve(root, safeSuffix);

    // Default to index.html for root
    if (req.url === '/' || req.url === '') {
      filePath = path.join(root, 'dyngraph.html');
      if (!fs.existsSync(filePath)) filePath = path.join(root, 'index.html');
    }

    // If path points to a directory, serve index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    // Ensure the resolved file is inside the project root
    const relative = path.relative(root, filePath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const type = mime[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
      stream.on('error', () => {
        res.writeHead(500);
        res.end('Internal Server Error');
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  } catch (err) {
    res.writeHead(500);
    res.end('Server Error');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Serving ${root} on 0.0.0.0:${port}`);
  const ips = getLocalIPs();
  if (ips.length) {
    console.log('Connect from your mobile device using one of:');
    for (const ip of ips) {
      console.log(`  http://${ip}:${port}/dyngraph.html`);
    }
  } else {
    console.log('No non-internal network interfaces found. If you are using Docker or a VM, ensure port forwarding or correct network mode.');
  }
  console.log('\nPress CTRL+C to stop.');
});
