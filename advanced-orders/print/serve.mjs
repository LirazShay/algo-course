#!/usr/bin/env node

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = resolve(fileURLToPath(new URL('.', import.meta.url)));
const REPO_ROOT = resolve(HERE, '..', '..');

function parsePort() {
  const arg = process.argv.find(value => value.startsWith('--port='));
  const raw = arg ? arg.slice('--port='.length) : (process.env.PORT || '4173');
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port: ${raw}`);
  }
  return port;
}

const MIME = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.md', 'text/markdown; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
]);

function safePath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const normalized = decoded === '/' ? '/advanced-orders/print/index.html' : decoded;
  const candidate = resolve(REPO_ROOT, `.${normalized}`);
  const rel = relative(REPO_ROOT, candidate);
  if (rel.startsWith('..') || rel === '..' || rel.split(sep).includes('..')) {
    throw new Error('Path escapes repository root');
  }
  return candidate;
}

async function resolveRequestPath(pathname) {
  let path = safePath(pathname);
  try {
    const info = await stat(path);
    if (info.isDirectory()) path = resolve(path, 'index.html');
  } catch {
    // readFile below will produce the canonical 404 path.
  }
  return path;
}

const port = parsePort();
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);
    const path = await resolveRequestPath(url.pathname);
    const body = await readFile(path);
    const type = MIME.get(extname(path).toLowerCase()) || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(body);
  } catch (error) {
    const status = error?.code === 'ENOENT' ? 404 : 400;
    res.writeHead(status, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(status === 404 ? 'Not found\n' : `Bad request: ${error.message}\n`);
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Advanced Order Mastery print viewer:`);
  console.log(`http://127.0.0.1:${port}/advanced-orders/print/`);
  console.log('Press Ctrl+C to stop.');
});
