---
title: 'go相关笔记'
date: 2020-04-21
category: '代码审计'
tags:
  - 'go'
lang: 'zh'
draft: false
---
## go相关命令

### go env

```
go env -w GOPROXY=https://goproxy.io,direct
# Set environment variable allow bypassing the proxy for selected modules
go env -w GOPRIVATE=*.corp.example.com
go env -w GO111MODULE=on
```
