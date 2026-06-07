#!/usr/bin/env node

/**
 * 创建新文章
 * 用法：
 *   pnpm new post "文章标题"
 *   pnpm new post "文章标题" -c 编程
 *   pnpm new post "文章标题" -c 编程 -t JavaScript -t 前端
 *   pnpm new post "文章标题" -l zh
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const POSTS_DIR = path.join(__dirname, '..', 'src', 'content', 'posts')

// Parse args — skip "post" subcommand if present
let argv = process.argv.slice(2)
if (argv[0] === 'post') argv = argv.slice(1)

if (!argv.length || argv[0] === '-h' || argv[0] === '--help') {
  console.log(`
使用方法:
  pnpm new post "文章标题" [选项]

选项:
  -c, --category <分类>    文章分类 (默认: 未分类)
  -t, --tag <标签>         文章标签，可多次使用
  -l, --lang <语言>        语言代码 (默认: zh)
  -d, --draft              标记为草稿

示例:
  pnpm new post "My New Post"
  pnpm new post "新文章" -c 编程 -t JavaScript -t 前端
  pnpm new post "Draft" -d
`)
  process.exit(0)
}

const title = argv[0]
let category = '未分类'
let lang = 'zh'
let tags = []
let draft = false

for (let i = 1; i < argv.length; i++) {
  switch (argv[i]) {
    case '-c':
    case '--category':
      category = argv[++i]
      break
    case '-t':
    case '--tag':
      tags.push(argv[++i])
      break
    case '-l':
    case '--lang':
      lang = argv[++i]
      break
    case '-d':
    case '--draft':
      draft = true
      break
  }
}

// Generate filename from title (sanitize)
const now = new Date()
const dateStr = now.toISOString().slice(0, 10)
const slugBase = title
  .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
  .replace(/\s+/g, '-')
  .slice(0, 60)
const filename = `${slugBase}.md`
const filepath = path.join(POSTS_DIR, filename)

// Check if file already exists
if (fs.existsSync(filepath)) {
  console.error(`文件已存在: ${filename}`)
  process.exit(1)
}

// Build frontmatter
const tagsStr = tags.length
  ? '\n' + tags.map(t => `  - '${t}'`).join('\n')
  : '[]'

const frontmatter = `---
title: '${title.replace(/'/g, "\\'")}'
date: ${dateStr}
category: '${category}'
tags:
${tagsStr}
lang: '${lang}'
draft: ${draft}
---

`

fs.writeFileSync(filepath, frontmatter)

const relPath = path.relative(path.join(__dirname, '..'), filepath)
console.log(`\n文章已创建: ${relPath}`)
console.log(`\nFrontmatter:`)
console.log(frontmatter)

if (draft) {
  console.log(`注意: 文章标记为草稿，不会出现在网站中。`)
  console.log(`发布时请将 draft: true 改为 draft: false`)
}
