/* This is a script to create a new post markdown file with front-matter */

import fs from "fs"
import path from "path"

function getDate() {
  // 获取当前时间并转换为东八区（UTC+8）
  const now = new Date()
  // 获取当前 UTC 时间戳，然后加上 8 小时得到东八区时间戳
  const utcTimestamp = now.getTime() + now.getTimezoneOffset() * 60 * 1000
  const utc8Timestamp = utcTimestamp + 8 * 60 * 60 * 1000
  const utc8Date = new Date(utc8Timestamp)
  
  const year = utc8Date.getUTCFullYear()
  const month = String(utc8Date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(utc8Date.getUTCDate()).padStart(2, "0")
  const hours = String(utc8Date.getUTCHours()).padStart(2, "0")
  const minutes = String(utc8Date.getUTCMinutes()).padStart(2, "0")
  const seconds = String(utc8Date.getUTCSeconds()).padStart(2, "0")

  // 返回 ISO 8601 格式: YYYY-MM-DDTHH:mm:ss+08:00 (东八区，兼容 Astro 的 z.date() 解析)
  // 注意：这里格式化的时间已经是东八区的时间，+08:00 只是标识时区
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+08:00`
}

const args = process.argv.slice(2)

if (args.length === 0) {
  console.error(`Error: No filename argument provided
Usage: npm run new-post -- <filename>`)
  process.exit(1) // Terminate the script and return error code 1
}

let fileName = args[0]

// Add .md extension if not present
const fileExtensionRegex = /\.(md|mdx)$/i
if (!fileExtensionRegex.test(fileName)) {
  fileName += ".md"
}

const targetDir = "./src/content/posts/"
const fullPath = path.join(targetDir, fileName)

if (fs.existsSync(fullPath)) {
  console.error(`Error: File ${fullPath} already exists `)
  process.exit(1)
}

// recursive mode creates multi-level directories
const dirPath = path.dirname(fullPath)
if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
}

const content = `---
title: ${args[0]}
published: ${getDate()}
description: ''
customSlug: ''
image: ''
tags: []
category: ''
draft: true 
lang: ''
---
`

fs.writeFileSync(path.join(targetDir, fileName), content)

console.log(`Post ${fullPath} created`)
