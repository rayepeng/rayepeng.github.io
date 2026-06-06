# astrofu 迁移工作计划（P0 – P9）

> 把 [antfu.me](https://github.com/antfu/antfu.me)（Vue 3 + Vite-SSG + UnoCSS）
> 1:1 移植到 **Astro + Vue Islands + UnoCSS**。
>
> **核心原则：垂直切片优先 / 横向扩展靠后**
> 先用 1-2 篇代表性文章端到端打通"内容 → 路由 → 布局 → 样式 → Markdown 管线 → 视觉与原站对照"的完整链路，
> 验证 OK 之后，再考虑大规模灌内容、补全所有页面、加重型组件。
> 这样**任何问题都在小样本上发现并修正**，避免迁完 80 篇文章后才发现要返工。
>
> 本文档是逐阶段的实施清单。每完成一项就把 `[ ]` 改成 `[x]`。

---

## ✅ P0 — Scaffold（已完成）

目标：项目能 `pnpm install / pnpm build` 通过，呈现一个占位首页。

- [x] 调研 antfu.me 源码结构（`pages/`, `src/components/`, `vite.config.ts`, `unocss.config.ts`）
- [x] 与用户确认改造方案：**1B 完整克隆 + UnoCSS + Vue Island**
- [x] 仓库命名 `astrofu`，目录 `/Users/raye/code/astrofu/`
- [x] 本机环境：`brew install node` → Node 26 + `npm i -g pnpm` → pnpm 9.14
- [x] `package.json` — Astro 4 + @astrojs/vue 4 + UnoCSS 66 + Shiki transformers + markdown 插件全家桶
- [x] `astro.config.ts` — UnoCSS / Vue 集成 + Shiki 双主题 + rehype-slug / autolink / external-links + remark-github-alerts
- [x] `uno.config.ts` — 与 antfu.me 1:1（含 `slide-enter-*` rule、Web Fonts 本地处理器）
- [x] `tsconfig.json` — strict + `~/*` 路径别名
- [x] `src/styles/main.css` — `--c-bg` 主题变量、暗色配色、slide-enter 动画、view-transition、自定义滚动条
- [x] `src/layouts/Default.astro` — 根布局 + SEO + OG/Twitter card + 防 FOUC 暗色 bootstrap
- [x] `src/pages/index.astro` — 占位首页
- [x] `src/vue-app-entrypoint.ts` — Vue island 入口（注册 floating-vue）
- [x] `pnpm install` + `pnpm build` 全绿 ✅

---

## 🚧 P1 — 单篇文章端到端打通（Vertical Slice）⭐ 关键里程碑

> **目标：选 1-2 篇原 antfu.me 文章，让它在 astrofu 里渲染出与原站视觉接近的效果。**
> 这一步要把"骨架 → 布局 → 样式 → Markdown 管线 → 路由"全链路串通，
> 但**只针对 1–2 篇文章**，不做内容全量迁移、不做专属页、不做炫技组件。
>
> 完成后跑 `pnpm dev`，浏览器打开 `/posts/<slug>`，能看到一篇排版正确的文章 = ✅。

### 1.1 选样本（决定后填上）

- [x] 样本 A — 一篇**纯文字 + 代码块**的技术文：`github-co-authors.md`（无任何自定义组件，验代码块/外链/`type: note`）
- [x] 样本 B — 一篇**含代码块 + 多链接**的技术文：`match-chinese-characters.md`（多个 inline code 与外链，验 Unicode 正则代码块）

### 1.2 内容接入（最小集）

- [x] `src/content/config.ts` — `zod` schema：title/date(union string|date 自动转 ISO)/lang/duration/description/image/draft/type/redirect
- [x] 复制 2 篇 md 到 `src/content/posts/`
- [x] 本轮样本无封面图，跳过 `public/og/`

### 1.3 路由（最小集）

- [x] `src/pages/posts/[...slug].astro` — `getStaticPaths` + `entry.render()` + `PostLayout`
- [x] `src/pages/posts/index.astro` — 列出全部已发布文章（含 lang 标签 + 日期）
- [x] 首页 `index.astro` 加链接跳到 `/posts`

### 1.4 布局（最小集）

- [x] `src/layouts/PostLayout.astro` — 标题 + 日期 + 正文 `<slot />` + `cd ..` 返回链接
- [x] `src/components/NavBar.astro` — 静态导航（Home / Blog）
- [x] `src/components/Footer.astro` — 极简版权

### 1.5 Markdown 管线（最小集）

- [x] **GitHub Alerts** (`> [!NOTE]`) — `remark-github-alerts` + 三套 css 在 Default.astro 导入
- [x] **代码高亮** — Shiki 双主题（`vitesse-light/dark`），验证为 `astro-code` class + 行内 `--shiki-light/--shiki-dark` 变量
- [ ] ⚠ **样式差异**：Astro 默认输出 `<pre class="astro-code ...">` + 行内 CSS 变量；antfu.me 的 markdown.css 是按 `.shiki` 类做暗色背景。**记入 P3 修复**：要么改 astro.config 的 `cssVariablePrefix: '--s-'` 并改写 css 选择器，要么把 `astro-code` 别名为 `shiki` 类
- [x] **Shiki Notation transformers**（diff/highlight/word-highlight）— astro.config 已配，等含 `// [!code highlight]` 文章验证
- [x] **标题锚点** — `rehype-slug` + `rehype-autolink-headings`（生成了 id="..."）
- [ ] ⚠ **autolink behavior 待校准**：当前 `behavior: 'wrap'` + `className: ['anchor']` 在样本中未观察到锚点链接的视觉效果，待 P3 改 `behavior: 'append'`+`<span>#</span>` 与原站一致
- [x] **外链 target="_blank"** — `rehype-external-links` 已生效
- [x] **暂不做**：MDX、magic-link、TOC、reading-time、excerpt、Twoslash（推到 P3）

### 1.6 样式（最小集 prose）

- [x] `src/styles/prose.css` — 直接复制原文件（505 行）
- [x] `src/styles/markdown.css` — 直接复制原文件（288 行），引入 `markdown-it-github-alerts` 三套 css
- [x] 在 `Default.astro` 顶部按序引入：`main.css` → `prose.css` → `markdown.css` → alerts css
- [x] 字体：UnoCSS WebFonts 本地处理器已存在生成产物（`public/assets/fonts/`）

### 1.7 验收（与原站浏览器并排对比）

- [x] `pnpm build` 通过 — 4 个静态页面生成成功
- [x] `pnpm preview` HTTP 200：`/`、`/posts`、`/posts/github-co-authors`、`/posts/match-chinese-characters`
- [x] Markdown 管线渲染验证：`astro-code` 双主题 CSS 变量、`target="_blank"` 外链、`id="..."` 锚点 id 均在 HTML 中
- [ ] **P3 待修**：`.shiki` 类与 `.astro-code` 命名对齐；autolink behavior 与原站对齐
- [ ] 浏览器并排视觉对比（标题层级、字距、配色、暗色双主题、列表/引用块/figcaption）— 留待你本地肉眼验收

**P1 已完成"管线打通"目标 ✅**。两个细节差异（Shiki 类名、锚点 behavior）非阻塞，已标记入 P3 收尾。

---

## 🏗 P2 — 核心骨架补完（App.vue → Default.astro + 顶级 island）

> 在 P1 单篇打通的基础上，把"导航 / 暗色切换 / Logo / 图片预览蒙层"全部加上，让整站有完整的"壳子"。

- [x] `ToggleTheme.vue` — 复制原文件，`client:load` island，含鼠标位置径向 clip-path 动画
- [x] `Logo.vue` / `LogoStroke.vue` — SVG hover 动画 island（1:1 从 antfu.me 复制）
- [x] `NavBar.astro` 升级 — 加 Logo + Blog + RSS + ToggleTheme；移动端汉堡留 P5 完整导航时再做
- [x] `Footer.astro` 升级 — CC BY-NC-SA 4.0 与原站一致
- [x] `BackToTop.vue` 小 island（独立组件，原放在 NavBar.vue 内）— `client:idle`
- [x] `ImageZoom.vue` — 图片预览蒙层（原 `App.vue` 里的 imageModel 逻辑），`client:idle`
- [x] `src/logics/index.ts` — `englishOnly` / `galleryView` / `isDark` / `toggleDark` / `formatDate`，全部 `useLocalStorage` 共享
- [x] Default.astro 集成 NavBar + Footer + ImageZoom，新增 `hideNav` / `hideFooter` props
- [x] PostLayout 移除独立 NavBar/Footer（避免与 Default 重复），只保留正文 + `cd ..` 链接
- [x] 复用 P1 的两篇文章再次验收：build 全绿；4 个 URL 200；HTML 中可见所有 island 已注入

---

## 🎨 P3 — Markdown 管线升级（MDX + 自定义插件）

> 这一阶段把 P1 暂时省略的"高级 markdown 特性"补齐，每加一个特性都在样本文章里立刻验证。

- [ ] 安装 `@astrojs/mdx`，决定策略：
  - 选项 A：所有 md 保持 `.md`，需要嵌组件的少数文章改 `.mdx`
  - 选项 B：全量 `.md` → `.mdx`（脚本批量改名）
- [ ] **TOC** — 用 Astro 的 `headings` API + 自定义 `Toc.astro` 渲染右侧浮动目录
- [ ] **Magic Link**（`{Vue}` → 带 logo 链接）：
  - 写自定义 rehype 插件扫描文本节点
  - 或：sed 把所有 md 里的 `{Foo}` 替换为 `<MagicLink to="foo" />`（MDX 路线）
- [ ] **Excerpt** — 用 `astro:content` 的 `body` 切第一段（用于列表页/RSS 摘要）
- [ ] **Reading time** — 自定义 remark 插件存到 frontmatter
- [ ] **Shiki Twoslash** — 启用 transformer + explicitTrigger
- [ ] **可嵌 MDX 组件**：`<Tweet />` / `<YouTubeEmbed />` / `<AppLink />` / `<TextCopy />`
- [ ] 找一篇含上面所有特性的代表文章（如某篇技术深文）端到端验证

---

## 📚 P4 — 内容全量迁移（Bulk Import）

> 前面 3 步已经把整套管线验证完毕，这里就是"体力活"。

- [ ] 写迁移脚本：扫描 `/Users/raye/code/antfu.me/pages/posts/`，全部复制到 `src/content/posts/`
- [ ] 脚本同时处理：frontmatter 字段补全（`description`、`image` 默认值 / 缺失 `date` 兜底）
- [ ] `{Foo}` magic-link 批量替换（保留 inline 写法 → `<MagicLink to="Foo" />`，MDX 路线）
- [ ] 嵌入组件清单扫描：grep `<script setup`、`v-bind=`、`<RouterLink`、`<ClientOnly` → 输出**"需手动改写"清单**（这是最大的语义差异风险，见 §风险登记 R1）
- [ ] 图片相对路径修复：`./foo.png` / `foo.png` → `/posts-assets/<slug>/foo.png`，并同步把图片复制到 `public/posts-assets/<slug>/`
- [ ] 中英对照处理：保留 `xxx.md` + `xxx-zh.md` 命名约定，`lang` frontmatter 不变（`englishOnly` 过滤在 P5 的 ListPosts 组件里做）
- [ ] `redirect` frontmatter 字段：在 `[...slug].astro` 中改为重定向到外部链接（`Astro.redirect()` 或在列表组件里渲染成外链）
- [ ] `draft: true` 文章：dev 下显示，build 时过滤
- [ ] 跑 `pnpm build`，检查全部文章可生成（失败的列入"需手动改写"清单）

---

## 📄 P5 — 专属页面迁移（Non-post Routes）

> 把 antfu.me [pages/](file:///Users/raye/code/antfu.me/pages/) 里所有非 posts 路由迁过来。
> 每个页面按 "路由 → 数据源 → 组件依赖 → 验收" 四步操作。

### 5.1 简单 Markdown 单页（直接复制）

- [ ] `/notes` ← [pages/notes.md](file:///Users/raye/code/antfu.me/pages/notes.md)
- [ ] `/bookmarks` ← [pages/bookmarks.md](file:///Users/raye/code/antfu.me/pages/bookmarks.md)
- [ ] `/use` ← [pages/use.md](file:///Users/raye/code/antfu.me/pages/use.md)
- [ ] `/chat` ← [pages/chat.md](file:///Users/raye/code/antfu.me/pages/chat.md)
- [ ] `/chat-zh` ← [pages/chat-zh.md](file:///Users/raye/code/antfu.me/pages/chat-zh.md)
- [ ] `/bar` ← [pages/bar.md](file:///Users/raye/code/antfu.me/pages/bar.md)
- [ ] `/giving-talks` ← [pages/giving-talks.md](file:///Users/raye/code/antfu.me/pages/giving-talks.md)
- [ ] `/streams` ← [pages/streams.md](file:///Users/raye/code/antfu.me/pages/streams.md)
- [ ] `/collective-sponsor-onetime` ← [pages/collective-sponsor-onetime.md](file:///Users/raye/code/antfu.me/pages/collective-sponsor-onetime.md)
- [ ] `/[...404]` ← [pages/[...404].md](file:///Users/raye/code/antfu.me/pages/[...404].md) → Astro 用 `src/pages/404.astro`

### 5.2 列表型页面（依赖数据源）

- [ ] `/posts/index.astro` 升级 — 按年份分组 + `slide-enter` 阶梯入场 + `englishOnly` 过滤（对应原 `ListPosts.vue`）
- [ ] `/projects` ← [pages/projects.md](file:///Users/raye/code/antfu.me/pages/projects.md) + `ListProjects.vue`
- [ ] `/talks` ← [pages/talks.md](file:///Users/raye/code/antfu.me/pages/talks.md) + [data/talks.ts](file:///Users/raye/code/antfu.me/data/talks.ts) + `ListTalks.vue` + `TalkDate.vue`
- [ ] `/podcasts` ← [pages/podcasts.md](file:///Users/raye/code/antfu.me/pages/podcasts.md)
- [ ] `/media` ← [pages/media.md](file:///Users/raye/code/antfu.me/pages/media.md) + [data/media.ts](file:///Users/raye/code/antfu.me/data/media.ts) + `MediaConsumption.vue`
- [ ] `/sponsors-list` ← [pages/sponsors-list.md](file:///Users/raye/code/antfu.me/pages/sponsors-list.md) + `SponsorsView.vue` / `SponsorsCircles.vue`
- [ ] `/demos` ← [pages/demos.md](file:///Users/raye/code/antfu.me/pages/demos.md) + [demo/data.ts](file:///Users/raye/code/antfu.me/demo/data.ts) + `ListDemos.vue` + `WrapperDemo`

### 5.3 数据源映射表

| 原路径 | 数据形态 | astrofu 落点 | 访问方式 |
|---|---|---|---|
| [data/talks.ts](file:///Users/raye/code/antfu.me/data/talks.ts) | TS export | `src/data/talks.ts` | `import { talks } from '~/data/talks'` |
| [data/media.ts](file:///Users/raye/code/antfu.me/data/media.ts) | TS export | `src/data/media.ts` | 同上 |
| [demo/data.ts](file:///Users/raye/code/antfu.me/demo/data.ts) | TS export | `src/data/demos.ts` | 同上；mp4 进 `public/demos/` |
| [photos/data.ts](file:///Users/raye/code/antfu.me/photos/data.ts) | TS + json | Content Collection `data` 类型 | `getCollection('photos')` |
| 文章 frontmatter | md 头 | `src/content/posts/*` | `getCollection('posts')` |

### 5.4 验收

- [ ] 每个页面与原站浏览器对比，视觉无明显偏差
- [ ] 路由全部能通过 `pnpm build` 生成静态 HTML
- [ ] `_redirects` / `netlify.toml` 同步：原站若用了任何 redirect，搬到 astrofu 的部署目录

---

## 📷 P6 — 媒体页面（重资源）

> antfu.me 最重的两个页面，单独拎出来做。

### 6.1 /photos

- [ ] 把 [photos/*.jpg](file:///Users/raye/code/antfu.me/photos/) 全量拷贝到 `public/photos/`（**不进 `src/assets/`，避免 build 时 sharp 大批量处理**）
- [ ] 把每张图对应的 `*.json`（含 blurhash、EXIF）合并成 `src/data/photos.ts` 或 Content Collection
- [ ] 迁移 `PhotoGalleryAll.vue` / `PhotoGrid.vue` / `PhotoSlide.vue` 为 Vue island（`client:visible`）
- [ ] 用 `@unpic/placeholder` + blurhash 生成首屏占位
- [ ] 实现 `galleryView` `cover/contain` 切换（复用 P2 logics）
- [ ] 迁移 `scripts/photos-manage.ts`（图片增删改 CLI）

### 6.2 /demos

- [ ] mp4 全量进 `public/demos/`，**不走 import**（防 Vite 内联）
- [ ] `<video>` 标签加 `preload="metadata"` + `loading="lazy"`（自定义 IntersectionObserver）
- [ ] `WrapperDemo` 改写为 Astro 组件（demo 内容是 md 描述 + 视频）

### 6.3 静态资源仓
- [ ] 原站 `pnpm run static` 跑 `degit antfu/static temp`，拉取额外静态资源
- [ ] 评估：是 fork 一份到 astrofu，还是只 cp 用到的几张图

---

## 🎭 P7 — 高级交互组件（Vue Islands）

> 这一阶段把"非通用、但视觉/交互很关键"的组件搬过来。**每个组件一个 commit，便于回滚。**

### 7.1 全局壳子相关
- [ ] `ArtPlum.vue` / `ArtDots.vue` — 背景艺术（PIXI + matter-attractors + simplex-noise），文章 frontmatter `art: plum|dots|random` 触发；`client:idle`，移动端禁用
- [ ] `SubNav.astro` — 子导航
- [ ] `StreamAnnouncement.vue` — 直播提示

### 7.2 文章内嵌组件（供 MDX 使用）
- [ ] `AppLink.vue`、`GitHubLink.vue`、`TextCopy.vue`、`Tweet.vue`、`YouTubeEmbed.vue`
- [ ] `MagicLink`（P3 写 rehype 插件 + 这里渲染图标）
- [ ] `TalkDate.vue`、`SponsorButtonCollective.vue`、`SponsorButtons.vue`、`CalCom.vue`
- [ ] `AsyncSyncQuantum.vue`、`MediaConsumption.vue`

### 7.3 文章专属组件目录（按需迁移，文章用到哪迁哪）
- [ ] `components/qrcode/*`（AI QR Code 系列文章用）
- [ ] `components/quansync/*`（Quansync 文章用）
- [ ] `components/shiki/*`（Shiki Magic Move 文章用，依赖 `shiki-magic-move` 包）
- [ ] `components/slides/*`（部分文章用，依赖 marker 组件）
- [ ] `components/photos/PhotoHelloTokyo*.vue`（`hello-tokyo.md` 文章专用）
- [ ] `components/icons/*.vue`（Logo 类 SVG 组件）

### 7.4 验收
- [ ] 找原站含特殊组件的文章（如 `ai-qrcode-101.md`、`quansync-from-my-2-years-of-exploration.md`、`shiki-magic-move.md`）逐篇视觉对比
- [ ] 在 Lighthouse 跑分中确保 PIXI/Matter 等重组件 hydrate 策略未拖累 LCP

---

## 🚀 P8 — SEO / Feed / OG / 性能

### 8.1 SEO & Feed
- [ ] `src/pages/feed.xml.ts` — 用 `@astrojs/rss` 重写原 `scripts/rss.ts`（含 OPML、按 lang 分组）
- [ ] `@astrojs/sitemap` 启用，配置 `filter` 排除 draft
- [ ] `robots.txt`（手写或用 `astro-robots-txt`）
- [ ] 每页 `<link rel="canonical">`、`og:type`、`twitter:card` 全量校验

### 8.2 OG 图自动生成
- [ ] 迁移原 [vite.config.ts `generateOg()`](file:///Users/raye/code/antfu.me/vite.config.ts#L195-L240) → astrofu integration：
  - 选项 A：自写 Astro integration，`astro:build:done` 钩子里跑 sharp + `og-template.svg`
  - 选项 B：用 `astro-og-canvas` / `@vercel/og`（Satori）
- [ ] 验证：所有文章 `<meta property="og:image">` 指向自动生成的 PNG

### 8.3 性能优化策略
- [ ] 图片：默认走 `astro:assets` 的 `<Image>`（自动生成 srcset）；photos 因数量大保留 `<img>` + blurhash
- [ ] Vue island hydrate 策略全局规则：
  - 首屏可见且交互：`client:load`（ToggleTheme、Logo）
  - 视口内：`client:visible`（PhotoGrid、ListProjects）
  - 空闲态：`client:idle`（ImageZoom、ArtPlum、ArtDots、Tweet）
- [ ] 视频：`<video loading="lazy" preload="metadata">` + IntersectionObserver 控制 `src` 注入
- [ ] 字体：验证 UnoCSS `createLocalFontProcessor` 生成的本地字体文件能正确 `font-display: swap`
- [ ] 评估 Astro 自带 `<ViewTransitions />` 是否替代原 `slide-enter` + `vue-router-better-scroller`
  - 决策：保留 `slide-enter` 动画（与 antfu.me 视觉一致），不引入 `<ViewTransitions />`（避免与 island 状态冲突）
- [ ] Lighthouse 4 项目标：Performance / Accessibility / Best Practices / SEO 均 ≥ 95

### 8.4 i18n 策略
- [ ] 维持 antfu.me 的"同 slug 双语"约定（`xxx.md` + `xxx-zh.md`）
- [ ] `ListPosts` 内通过 `englishOnly` localStorage 过滤
- [ ] 不做 Astro i18n 路由（避免改写所有 slug）

---

## 🌐 P9 — 部署 / 回归 / 上线

### 9.1 部署
- [ ] 选定平台：**Netlify**（复用原站 `_redirects` / `netlify.toml`，与 antfu.me 部署模式一致）
- [ ] `astro.config.ts` 确认 `output: 'static'`（不需要 adapter）
- [ ] CI：`.github/workflows/deploy.yml` 跑 `pnpm install --frozen-lockfile && pnpm build`，产物推 Netlify
- [ ] 域名 / DNS / HTTPS 配置（自定义域名 → CNAME）

### 9.2 回归测试
- [ ] 链接死链扫描：`lychee dist/ --no-progress`
- [ ] 构建产物对比：HTML 大小、JS 包大小与原站量级一致
- [ ] Pagespeed Insights：首页、典型文章、photos 三个页面跑分
- [ ] 暗色 FOUC 验证：禁网 + 慢 3G 下首屏不闪
- [ ] 暗色径向 clip-path 动画在 Safari/Firefox 回退正常
- [ ] 404 页面正常
- [ ] RSS 在 Feedly 中能订阅，文章封面图正确

### 9.3 文档与收尾
- [ ] 更新 [README.md](file:///Users/raye/code/astrofu/README.md)：项目简介、本地开发、内容贡献规范、与原站差异
- [ ] 维护 `MIGRATION_NOTES.md`：记录所有"手动改写"过的文章和改写规则
- [ ] 回滚预案：保留原站快照 / git tag `v0-pre-astro`

---

## ⚠️ 风险登记（Risk Register）

> 按"必踩" / "可能踩" / "依赖外部"分级，每项配缓解策略。

| ID | 风险 | 级别 | 触发阶段 | 缓解策略 |
|---|---|---|---|---|
| R1 | `unplugin-vue-markdown` → Astro MDX 语义差异：原站 md 可写 `<script setup>` / `v-bind:` / `<RouterLink>` / `useRoute()`，Astro MDX **不支持**这些 | 🔴 必踩 | P3/P4 | P4 扫描脚本统计含上述语法的文章数，逐篇手改：`<script setup>` 抽成 `.vue` island；`v-bind` 改成 MDX 表达式；`<RouterLink>` 改成 `<a>` |
| R2 | `vue-router/auto` API（`useRouter` / `router.getRoutes()`）在 island 内不可用 | 🔴 必踩 | P2/P5 | `ListPosts` 等改成 Astro 组件，数据通过 `getCollection('posts')` 拉，再以 props 传给 island |
| R3 | OG 图生成依赖 `sharp` + 自定义 SVG 模板，build 期 IO 重 | 🟡 可能踩 | P8 | 增量生成（已存在则跳过），CI 缓存 `public/og/` 目录 |
| R4 | photos/ 几百张图 + blurhash + EXIF，build 时如走 `astro:assets` 会爆 | 🟡 可能踩 | P6 | photos 走 `public/`，不进 assets 管线；缩略图离线脚本生成 |
| R5 | PIXI / matter-js / shiki-magic-move 体积大 | 🟡 可能踩 | P7 | 严格 `client:idle` + 路由级动态 import，禁止全局加载 |
| R6 | `floating-vue` SSR 报错 | 🟢 已规避 | — | astro.config 已 `ssr.noExternal: ['floating-vue']` |
| R7 | Markdown 中相对图片路径在 Content Collections 下解析规则与 vite-ssg 不同 | 🟡 可能踩 | P4 | 统一改为绝对路径 `/posts-assets/<slug>/xxx`，搬到 `public/` |
| R8 | `degit antfu/static` 拉取的资源若上游变更会构建失败 | 🟢 可控 | P6 | 一次性 cp 到本仓库，不依赖远端 |
| R9 | `view-transition` API 在非 Chromium 浏览器降级；原站做了 fallback | 🟢 已知 | P2 | 直接搬运 [toggleDark](file:///Users/raye/code/antfu.me/src/logics/index.ts#L11-L52) 的 isAppearanceTransition 判定 |
| R10 | Astro 4 与 Vue 3.5 + Pinia 2 在 SSR 阶段的状态丢失 | 🟡 可能踩 | P2 | 全局状态用 `useLocalStorage`（VueUse），不用 Pinia store；P2 验收明确这一点 |
| R11 | `slide-enter` 依赖 `--enter-stage` CSS 变量逐元素递增，Astro 静态渲染下无法用 v-for 索引 | 🟡 可能踩 | P5 | 在 Astro `.astro` 模板内手写 `style={{'--enter-stage': i}}`，或保留 island 实现列表 |
| R12 | 字体本地化由 UnoCSS Web Fonts 处理器在 build 时下载 → 离线 CI 会失败 | 🟢 已规避 | P9 | astrofu 已把生成产物 commit 到 `public/assets/fonts/` |

---

## 📋 全路由清单（Coverage Matrix）

> 与 [pages/](file:///Users/raye/code/antfu.me/pages/) 一一对应，确保零遗漏。

| 原路径 | astrofu 路径 | 归属阶段 | 备注 |
|---|---|---|---|
| `/` | `src/pages/index.astro` | P1（占位）→ P5（完整） | 含 magic-link、SponsorButtons |
| `/posts/*` | `src/pages/posts/[...slug].astro` | P1（样本）→ P4（全量） | 80+ 篇 |
| `/posts/` | `src/pages/posts/index.astro` | P1（简版）→ P5（分组） | ListPosts |
| `/projects` | `src/pages/projects.astro` | P5 | ListProjects |
| `/talks` | `src/pages/talks.astro` | P5 | data/talks.ts |
| `/podcasts` | `src/pages/podcasts.astro` | P5 | — |
| `/notes` | `src/pages/notes.astro` | P5 | — |
| `/bookmarks` | `src/pages/bookmarks.astro` | P5 | — |
| `/use` | `src/pages/use.astro` | P5 | — |
| `/media` | `src/pages/media.astro` | P5 | data/media.ts |
| `/streams` | `src/pages/streams.astro` | P5 | — |
| `/chat` | `src/pages/chat.astro` | P5 | — |
| `/chat-zh` | `src/pages/chat-zh.astro` | P5 | — |
| `/bar` | `src/pages/bar.astro` | P5 | — |
| `/giving-talks` | `src/pages/giving-talks.astro` | P5 | — |
| `/sponsors-list` | `src/pages/sponsors-list.astro` | P5 | SponsorsView |
| `/collective-sponsor-onetime` | `src/pages/collective-sponsor-onetime.astro` | P5 | — |
| `/demos` | `src/pages/demos.astro` | P6 | mp4 重资源 |
| `/photos` | `src/pages/photos.astro` | P6 | blurhash + EXIF |
| `/404` | `src/pages/404.astro` | P5 | catch-all |
| `/feed.xml` | `src/pages/feed.xml.ts` | P8 | endpoint |
| `/sitemap-*.xml` | `@astrojs/sitemap` | P8 | integration |
| `/og/*.png` | `public/og/` | P8 | 自动生成 |
| `/robots.txt` | `src/pages/robots.txt.ts` | P8 | endpoint |

---

## 🎯 设计原则回顾（对齐 antfu.me 哲学）

1. **静态优先**：默认 Astro（零 JS），只有真正需要交互才用 Vue island
2. **零硬编码**：所有外链 / 数据 / icon 名走配置或 `data/*`
3. **slide-enter / view-transition 必须保留**：这是原站"灵魂"
4. **暗色径向 clip-path 不能简化**：替换会肉眼可见地"降级"
5. **OG 图必须每篇都有**：自动化生成，不允许漏
6. **首屏 LCP / CLS 不能比原站差**：P8 强制 Lighthouse 95+
7. **i18n 用 frontmatter `lang` + localStorage 过滤**：不引入 Astro i18n 路由
8. **数据源以 TS / Content Collection 为主**：避免运行时 fetch
9. **第三方组件可关闭**：floating-vue、PIXI、shiki-magic-move 全部走按需 hydrate
10. **保留原站 `_redirects` / 部署平台**：迁移不影响外链可达性

---

> 本计划基于 antfu.me commit 当前 main 整理。每完成一个阶段，更新本文档对应 checkbox 并补一条"实际遇到的坑"到 `MIGRATION_NOTES.md`。