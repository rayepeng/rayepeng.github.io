# 自定义文章 URL 使用指南

## 功能说明

现在你可以为每篇文章自定义 URL 地址了！只需在文章的 frontmatter 中添加 `customSlug` 字段即可。

## 使用方法

### 基本用法

在文章的 frontmatter 中添加 `customSlug` 字段：

```yaml
---
title: 周报33 立冬
published: 2024-11-11
customSlug: week-33-winter  # 自定义 URL
description: ''
tags: ['post', '周报']
category: '周报'
draft: false
---
```

这样文章的 URL 就会从：
- `/posts/weekpost/周报33 立冬/`

变成：
- `/posts/week-33-winter/`

### 不设置 customSlug

如果不设置 `customSlug` 字段，将使用默认的文件路径作为 URL，与之前的行为保持一致。

```yaml
---
title: 我的文章
published: 2024-11-11
# 不设置 customSlug
---
```

URL 仍然是：`/posts/文件夹名称/文件名/`

## 使用建议

### 推荐的 customSlug 格式

1. **使用英文和连字符**：`my-awesome-post`
2. **使用日期前缀**：`2024-11-11-winter-is-coming`
3. **使用分类前缀**：`tech-rust-learning`
4. **保持简短**：`rust-tips` 比 `rust-programming-language-tips-and-tricks` 更好

### 注意事项

- ✅ customSlug 应该是唯一的，避免重复
- ✅ 建议使用英文、数字和连字符 `-`
- ✅ 避免使用特殊字符和空格
- ✅ 保持简短且有意义
- ⚠️ 修改 customSlug 会改变文章的 URL，可能影响已分享的链接

## 示例

### 示例 1：周报文章

```yaml
---
title: 周报33 立冬
published: 2024-11-11
customSlug: weekly/2024-week-33
tags: ['post', '周报']
category: '周报'
---
```

URL: `/posts/weekly/2024-week-33/`

### 示例 2：技术文章

```yaml
---
title: WASM内存访问研究
published: 2024-10-15
customSlug: tech/wasm-memory-research
tags: ['技术', 'WASM']
category: '技术'
---
```

URL: `/posts/tech/wasm-memory-research/`

### 示例 3：简短 slug

```yaml
---
title: PHP反序列化入门
published: 2024-09-20
customSlug: php-unserialize
tags: ['PHP', '安全']
---
```

URL: `/posts/php-unserialize/`

## 技术实现

本功能通过以下修改实现：

1. **src/content/config.ts**：在 schema 中添加 `customSlug` 字段
2. **src/pages/posts/[...slug].astro**：路由生成时优先使用 `customSlug`
3. **src/utils/content-utils.ts**：文章列表和上一篇/下一篇文章链接也使用 `customSlug`
4. **src/components/PostPage.astro**：首页文章卡片链接使用 `customSlug`
5. **src/pages/rss.xml.ts & feed.ts**：RSS feed 链接使用 `customSlug`

所有生成文章链接的地方都已更新，包括：
- 首页文章列表
- 归档页面
- 文章详情页的上一篇/下一篇导航
- RSS/Atom feed

## 迁移现有文章

你不需要为所有文章添加 `customSlug`。只需要在需要自定义 URL 的文章中添加即可，其他文章会继续使用默认的文件路径。

## 问题排查

如果遇到问题，请检查：

1. `customSlug` 是否唯一（不要和其他文章重复）
2. `customSlug` 中是否包含特殊字符
3. 重新构建项目：`pnpm build`

