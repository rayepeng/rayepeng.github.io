#!/usr/bin/env node

/**
 * 一键发布：提交所有改动并推送到 GitHub，由 Actions 自动构建上线。
 * 用法：
 *   pnpm pub
 *   pnpm pub "写完了某篇文章"
 */

import { execSync } from 'node:child_process'

const message = process.argv.slice(2).join(' ').trim()
  || `post: ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`

execSync('git add -A', { stdio: 'inherit' })

try {
  execSync('git diff --cached --quiet')
  console.log('没有需要提交的改动。')
  process.exit(0)
}
catch {
  // 有暂存改动，继续提交
}

execSync(`git commit -m ${JSON.stringify(message)}`, { stdio: 'inherit' })
execSync('git push', { stdio: 'inherit' })

console.log(`\n已推送：${message}`)
console.log('GitHub Actions 正在构建，约 1-2 分钟后上线。')
