# astrofu

> Raye's Journey — 基于 **Astro + Vue Islands + UnoCSS** 构建的个人博客站点。

## 常用命令

```bash
pnpm install           # 安装依赖
pnpm dev               # 开发服务器 http://localhost:3333
pnpm build             # 构建生产版本 → dist/
pnpm preview           # 预览生产版本
pnpm new post "标题"   # 创建新文章
```

## 创建新文章

使用 `pnpm new post` 命令快速创建文章，自动填充 frontmatter：

```bash
# 基本用法
pnpm new post "我的新文章"

# 指定分类和标签
pnpm new post "JS代理与原型链" -c 编程 -t JavaScript -t 前端

# 创建草稿
pnpm new post "未完成的想法" -d

# 查看帮助
pnpm new post -h
```

### 命令选项

| 选项 | 缩写 | 默认值 | 说明 |
|---|---|---|---|
| `--category` | `-c` | `未分类` | 文章分类 |
| `--tag` | `-t` | `[]` | 标签，可多次使用 |
| `--lang` | `-l` | `zh` | 语言代码 |
| `--draft` | `-d` | `false` | 草稿标记，不会出现在网站中 |

### Frontmatter 完整字段

```yaml
---
# ===== 必填 =====
title: '文章标题'                # 文章标题
date: 2026-06-07                # 发布日期

# ===== 可选 =====
category: '未分类'               # 文章分类，决定 Categories 页展示
tags:                           # 标签列表，决定 Tags 页展示
  - 'JavaScript'
  - '编程'
lang: 'zh'                      # 语言代码，'zh' 显示中文标签
draft: false                    # true 则不会出现在网站中
image: 'https://...'            # 封面图 URL（也可用文章正文首图代替）
description: '文章简介'          # SEO 描述
type: 'blog'                    # 文章类型
redirect: ''                    # 重定向 URL
duration: '5 min'               # 阅读时间
updated: 2026-06-07             # 更新日期
customSlug: 'my-custom-url'     # 自定义 URL slug
---
```

### 封面图规则

文章封面图有两种来源（优先级从高到低）：

1. **Frontmatter `image` 字段** — 直接作为封面渲染
2. **正文首图** — 无 `image` 时自动提取正文第一个 `<img>` 提升为封面

```markdown
---
title: '有首图的文章'
---
![封面](./attachments/cover.png)   ← 自动提升为封面

正文内容...
```

## 项目结构

```
src/
├── components/       # UI 组件（.astro 静态 + .vue 交互式岛屿）
├── content/
│   └── posts/        # 所有文章（扁平结构，无子文件夹）
│       └── attachments/  # 文章图片资源
├── data/
│   ├── friends.json  # 友链数据
│   └── projects.json # 项目数据
├── layouts/
│   ├── Default.astro # 全站布局
│   └── PostLayout.astro # 文章页布局（封面、标签、大纲）
├── pages/
│   ├── index.astro   # 首页
│   ├── posts/
│   │   ├── index.astro      # Blog 列表
│   │   └── [...slug].astro  # 文章详情
│   ├── categories.astro     # 分类页（VSCode 树状结构）
│   ├── tags.astro           # 标签页（标签云 + 标签列表）
│   └── friends.astro        # 友链页
├── styles/
│   ├── main.css      # 全局样式 + 主题变量
│   └── markdown.css  # Markdown 排版 + Shiki 高亮 + 图片错误占位
└── logics/
    └── index.ts      # 工具函数（日期格式化等）
```

## 文章分类

分类由 frontmatter `category` 字段驱动，不依赖文件夹结构。所有 `.md` 文件均放在 `src/content/posts/` 根目录。

## 页面功能

| 页面 | URL | 功能 |
|---|---|---|
| Blog | `/posts` | 按年份分组文章列表，年份描边背景标签 |
| Categories | `/categories` | VSCode 风格可折叠文件夹树，默认折叠 |
| Tags | `/tags` | 标签云（字号∝频率）+ 可折叠标签列表 |
| Friends | `/friends` | 友链卡片，头像 `object-contain` 展示 |
| RSS | `/feed` | RSS 订阅（同时保留 `/feed.xml` 兼容） |

### 文章页特性

- 自动封面图（frontmatter image 或正文首图）
- 标签徽章（点击跳转 Tags 页筛选）
- 交互大纲（仅 h1/h2，点击跳转，滚动高亮）
- Shiki 双主题语法高亮（light/dark）
- 图片加载失败友好占位：「这里有一张图片的，但是加载失败了」

## 主题配色

采用极简主义配色方案：

- **亮色模式**：白底 `#fff`，文字 `#222`，边框 `#8884`
- **暗色模式**：黑底 `#000`，文字 `#ddd`，边框 `#8884`
- 所有装饰元素（文件夹图标、标签符号、大纲高亮）使用 opacity 梯度 + font-weight 建立层次，不引入额外色彩

## Credits

Original design © Anthony Fu ([@antfu](https://github.com/antfu)).
Customized and maintained by Raye.

## License

MIT
