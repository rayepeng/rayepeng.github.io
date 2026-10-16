#!/usr/bin/env node
/**
 * 微信读书数据同步 —— 拉取阅读统计并生成 src/data/weread.json
 *
 * 数据来源：微信读书 Agent API Gateway（weread-skills）
 *   POST https://i.weread.qq.com/api/agent/gateway
 *   鉴权：Authorization: Bearer $WEREAD_API_KEY（格式 wrk-xxxxxxxx）
 *
 * 用法：
 *   WEREAD_API_KEY=wrk-xxx node scripts/fetch-weread.mjs
 *   或把 key 写进 .env（仓库已 gitignore）后直接 node scripts/fetch-weread.mjs
 *
 * 由 deploy/weread-sync.sh 在服务器上定时调用，产出文件提交后触发 GitHub Pages 重建。
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT_FILE = resolve(ROOT, 'src/data/weread.json')

const GATEWAY = 'https://i.weread.qq.com/api/agent/gateway'
/** 与 weread-skills 的 SKILL.md 顶部 version 保持一致；不匹配时服务端会回 upgrade_info */
const SKILL_VERSION = '1.0.5'
const TIMEOUT_MS = 20_000

// ── 环境变量：支持从 .env 读取（node --env-file 之外的手动兜底）──────────
function loadDotEnv() {
  const file = resolve(ROOT, '.env')
  if (!existsSync(file))
    return
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m)
      continue
    const key = m[1]
    let value = m[2].trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\'')))
      value = value.slice(1, -1)
    if (!(key in process.env))
      process.env[key] = value
  }
}

const log = (...a) => console.log('[weread]', ...a)

async function api(apiName, params = {}) {
  const key = process.env.WEREAD_API_KEY
  if (!key)
    throw new Error('缺少 WEREAD_API_KEY。请设置环境变量或在 .env 中填写（格式 wrk-xxxxxxxx）')

  const body = { api_name: apiName, ...params, skill_version: SKILL_VERSION }
  let res
  try {
    res = await fetch(GATEWAY, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  }
  catch (err) {
    throw new Error(`请求 ${apiName} 失败：${err.message}`)
  }

  if (!res.ok)
    throw new Error(`请求 ${apiName} 失败：HTTP ${res.status}`)

  const json = await res.json()
  if (json.upgrade_info)
    console.warn(`[weread] 提示：技能有新版本 ${json.upgrade_info.latest_version}（当前 ${SKILL_VERSION}）`)
  if (json.errcode && json.errcode !== 0)
    throw new Error(`接口 ${apiName} 返回错误 ${json.errcode}：${json.errmsg || ''}`)
  return json
}

// ── 工具 ────────────────────────────────────────────────────────────────
/** 把 readStat 里的 "12本" / "2.4万条" / "2669天" 解析成数字 */
function parseCount(text) {
  if (typeof text === 'number')
    return text
  if (!text)
    return 0
  const m = String(text).match(/([\d.]+)\s*(万)?/)
  if (!m)
    return 0
  return Math.round(Number.parseFloat(m[1]) * (m[2] ? 10000 : 1))
}

function statValue(readStat, name) {
  const hit = (readStat || []).find(s => s.stat === name)
  return hit ? parseCount(hit.counts) : 0
}

const pad2 = n => String(n).padStart(2, '0')

function yearStart(ts) {
  const d = new Date((ts + 8 * 3600) * 1000) // 归一化到北京时间
  return Date.UTC(d.getUTCFullYear(), 0, 1) / 1000 - 8 * 3600
}

function toDateText(ts) {
  if (!ts)
    return ''
  const d = new Date((ts + 8 * 3600) * 1000)
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`
}

const nowSec = () => Math.floor(Date.now() / 1000)

// ── 主流程 ──────────────────────────────────────────────────────────────
async function main() {
  loadDotEnv()
  log('开始同步微信读书数据…')

  const overall = await api('/readdata/detail', { mode: 'overall' })
  log('已获取总计数据')

  // 逐自然年拉取，用于「年度成长轨迹」表格与图表
  const firstYear = new Date((overall.registTime + 8 * 3600) * 1000).getUTCFullYear()
  const currentYear = new Date((nowSec() + 8 * 3600) * 1000).getUTCFullYear()
  const years = []
  for (let y = firstYear; y <= currentYear; y++) {
    const baseTime = Math.floor(Date.UTC(y, 5, 1) / 1000) - 8 * 3600 // 该年 6 月 1 日
    const data = await api('/readdata/detail', { mode: 'annually', baseTime })
    const readStat = data.readStat || []
    years.push({
      year: y,
      readTime: data.totalReadTime || 0,
      readDays: data.readDays || 0,
      books: statValue(readStat, '读过'),
      finished: statValue(readStat, '读完'),
      notes: statValue(readStat, '笔记'),
    })
    log(`  ${y}: ${Math.round((data.totalReadTime || 0) / 3600)}h / ${data.readDays || 0}天`)
  }

  // 当前年份快照（分类雷达 + 时长 Top）
  const cur = years.find(y => y.year === currentYear)
  const curDetail = await api('/readdata/detail', { mode: 'annually', baseTime: Math.floor(Date.UTC(currentYear, 5, 1) / 1000) - 8 * 3600 })

  // 笔记本：分页拉全，取笔记最多的 Top 30
  log('拉取笔记本…')
  let lastSort
  const noteBooks = []
  let noteMeta = { totalNoteCount: 0, totalBookCount: 0 }
  for (let page = 0; page < 200; page++) {
    const data = await api('/user/notebooks', lastSort ? { count: 100, lastSort } : { count: 100 })
    noteMeta = {
      totalNoteCount: data.totalNoteCount || noteMeta.totalNoteCount,
      totalBookCount: data.totalBookCount || noteMeta.totalBookCount,
    }
    for (const b of data.books || []) {
      noteBooks.push({
        bookId: b.bookId,
        title: b.book?.title || '',
        author: b.book?.author || '',
        cover: b.book?.cover || '',
        reviewCount: b.reviewCount || 0,
        noteCount: b.noteCount || 0,
        bookmarkCount: b.bookmarkCount || 0,
        total: (b.reviewCount || 0) + (b.noteCount || 0) + (b.bookmarkCount || 0),
      })
    }
    if (data.hasMore !== 1)
      break
    lastSort = data.books?.[data.books.length - 1]?.sort
    if (!lastSort)
      break
  }
  noteBooks.sort((a, b) => b.total - a.total)
  log(`笔记本共 ${noteBooks.length} 本，笔记总数 ${noteMeta.totalNoteCount}`)

  const readStat = overall.readStat || []

  const out = {
    generatedAt: nowSec(),
    generatedAtText: toDateText(nowSec()),
    skillVersion: SKILL_VERSION,
    user: {
      registTime: overall.registTime || 0,
      registDate: toDateText(overall.registTime),
      name: 'raye',
    },
    summary: {
      totalReadTime: overall.totalReadTime || 0,
      readDays: overall.readDays || 0,
      readRate: overall.readRate ?? null,
      textReadTime: overall.wrReadTime || 0,
      listenTime: overall.wrListenTime || 0,
      booksRead: statValue(readStat, '读过'),
      booksFinished: statValue(readStat, '读完'),
      noteCount: noteMeta.totalNoteCount,
      noteBookCount: noteMeta.totalBookCount,
      authorCount: overall.authorCount || 0,
      preferTimeWord: overall.preferTimeWord || '',
      preferCategoryWord: overall.preferCategoryWord || '',
    },
    // 从 6 点开始，依次到次日 5 点
    preferTime: (overall.preferTime || []).map((seconds, i) => ({ hour: pad2((6 + i) % 24), seconds })),
    preferCategory: (overall.preferCategory || []).map(c => ({
      name: c.categoryTitle,
      readingTime: c.readingTime || 0,
      readingCount: c.readingCount || 0,
    })),
    preferAuthor: (overall.preferAuthor || []).map(a => ({
      name: a.name,
      count: a.count || 0,
      readTime: a.readTime || '',
    })),
    preferPublisher: (overall.preferPublisher || []).map(p => ({ name: p.name, count: p.count || 0 })),
    readLongest: (overall.readLongest || []).map(r => ({
      bookId: r.book?.bookId || '',
      title: r.book?.title || r.albumInfo?.name || '',
      author: r.book?.author || r.albumInfo?.authorName || '',
      cover: r.book?.cover || r.albumInfo?.cover || '',
      readTime: r.readTime || 0,
      tags: r.tags || [],
    })),
    notesTop: noteBooks.slice(0, 30),
    years,
    currentYear: currentYear,
    currentYearSnapshot: {
      readTime: curDetail.totalReadTime || 0,
      readDays: curDetail.readDays || 0,
      compare: curDetail.compare ?? null,
      preferCategory: (curDetail.preferCategory || []).map(c => ({
        name: c.categoryTitle,
        readingTime: c.readingTime || 0,
      })),
      readLongest: (curDetail.readLongest || []).map(r => ({
        title: r.book?.title || r.albumInfo?.name || '',
        readTime: r.readTime || 0,
      })),
    },
  }

  writeFileSync(OUT_FILE, `${JSON.stringify(out, null, 2)}\n`, 'utf8')
  log(`已写入 ${OUT_FILE}`)
  log(`总时长 ${(out.summary.totalReadTime / 3600).toFixed(0)}h · 读过 ${out.summary.booksRead} 本 · 笔记 ${out.summary.noteCount} 条`)
}

main().catch((err) => {
  console.error('[weread] 同步失败：', err.message)
  process.exit(1)
})
