#!/usr/bin/env node

/**
 * 本地写作后台开发服务器（零依赖）。
 * 静态托管 admin/，并把 /api/v1 代理到 decap-server —— 与线上 nginx 的行为一致。
 *
 * 用法：
 *   终端 A：MODE=git npx --yes decap-server
 *   终端 B：pnpm admin
 *   浏览器：http://localhost:4444
 */

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ADMIN_DIR = path.join(__dirname, '..', 'admin')

const PORT = Number(process.env.ADMIN_PORT || 4444)
const API_PORT = Number(process.env.DECAP_PORT || 8081)
const API_HOST = process.env.DECAP_HOST || '127.0.0.1'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.yml': 'text/yaml; charset=utf-8',
  '.yaml': 'text/yaml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
}

function proxy(req, res) {
  const headers = { ...req.headers, host: `${API_HOST}:${API_PORT}` }
  const upstream = http.request(
    { host: API_HOST, port: API_PORT, method: req.method, path: req.url, headers },
    (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode || 502, upstreamRes.headers)
      upstreamRes.pipe(res)
    },
  )

  upstream.on('error', (err) => {
    res.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' })
    res.end(`连不上 decap-server（${API_HOST}:${API_PORT}）：${err.message}\n先跑：MODE=git npx --yes decap-server\n`)
  })

  req.pipe(upstream)
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  const filePath = path.join(ADMIN_DIR, urlPath === '/' ? 'index.html' : urlPath)

  // 防目录穿越
  if (!filePath.startsWith(ADMIN_DIR)) {
    res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('forbidden')
    return
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
      res.end('not found')
      return
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(filePath)] || 'application/octet-stream' })
    res.end(data)
  })
}

http
  .createServer((req, res) => {
    if (req.url.startsWith('/api/v1')) {
      proxy(req, res)
      return
    }
    serveStatic(req, res)
  })
  .listen(PORT, () => {
    console.log(`写作后台  http://localhost:${PORT}`)
    console.log(`API 代理   /api/v1 -> http://${API_HOST}:${API_PORT}`)
  })
