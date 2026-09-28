/*
 * 用 Vditor 替换 Decap CMS 内置的 markdown 编辑器（零构建，纯浏览器脚本）。
 *
 * 为什么这样做：
 *   Decap 内置的 markdown widget 观感和功能都比较基础。Vditor 提供即时渲染(ir) /
 *   分屏预览(sv) / 所见即所得(wysiwyg) 三种模式，以及完整工具栏、代码高亮、表格、
 *   任务列表、大纲、字数统计、拖拽粘贴上传图片等能力。
 *
 * 两点关键取舍：
 *   1. 用「同名覆盖」的方式注册 'markdown' widget，好处是 admin/config.yml 一行都不用改，
 *      且 Decap 内部按 widget === 'markdown' 判断正文的序列化逻辑继续成立。
 *      若将来某个版本不再允许覆盖，会退回注册 'vditor'，此时只需把 config.yml 里
 *      body 字段的 widget 改成 vditor 即可（控制台会给出提示）。
 *   2. 自定义 widget 拿不到 Decap 内置媒体库（redux action），所以图片上传直接调用
 *      decap-server 的 HTTP 接口：POST /api/v1 {action:'persistMedia', params:{...}}，
 *      文件以 base64 传输（decap-server 用 express.json，body 上限 50mb）。
 *      media_folder / branch 从 /config.yml 读取，读不到时用下面的兜底值。
 */
;(function () {
  'use strict'

  // 依赖全部走同源 vendor/（见 admin/vendor），不再从外部 CDN 拉取
  const VDITOR_BASE = './vendor/vditor'
  const VDITOR_VERSION = '3.11.3'
  const API_URL = '/api/v1'
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024

  let vditorPromise = null

  /**
   * 按需加载 Vditor。
   * 后台是 SPA，列表页根本用不到编辑器；把 Vditor 的 JS/CSS 推迟到真正要渲染编辑器
   * 或预览时再加载，列表页就能少下载几百 KB。
   */
  function ensureVditor() {
    if (window.Vditor)
      return Promise.resolve(window.Vditor)
    if (vditorPromise)
      return vditorPromise

    vditorPromise = new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = `${VDITOR_BASE}/dist/index.css?v=${VDITOR_VERSION}`
      document.head.appendChild(link)

      const script = document.createElement('script')
      script.src = `${VDITOR_BASE}/dist/index.min.js?v=${VDITOR_VERSION}`
      script.onload = () => (window.Vditor
        ? resolve(window.Vditor)
        : reject(new Error('Vditor 未挂载到 window')))
      script.onerror = () => reject(new Error('Vditor 脚本加载失败'))
      document.head.appendChild(script)
    })

    return vditorPromise
  }

  // 预览面板跑在独立的 iframe 里（Decap 用 srcdoc 隔离预览），主文档的样式带不进去，
  // 所以这里的样式需要通过 registerPreviewStyle 单独注入。
  const PREVIEW_CSS = `
    .post-preview { padding: 8px 12px 48px; color: #323f4b; }
    .post-preview__title { margin: 0 0 8px; font-size: 30px; line-height: 1.25; font-weight: 700; color: #1f2933; }
    .post-preview__meta { margin: 0 0 4px; font-size: 13px; color: #7b8794; }
    .post-preview__tags { margin: 0 0 20px; font-size: 12px; color: #9aa5b1; }
    .post-preview__body { font-size: 15px; line-height: 1.75; }
    .post-preview__body img { max-width: 100%; }
  `

  // 兜底配置，正常情况下会从 /config.yml 里读取真实值
  const FALLBACK_CONFIG = { branch: 'main', mediaFolder: 'src/content/posts' }

  let configPromise = null

  function pick(text, re, fallback) {
    const matched = text.match(re)
    return (matched && matched[1]) || fallback
  }

  /** 读取 admin/config.yml 里的 backend.branch 与 media_folder（只取第一个，够用） */
  function readConfig() {
    if (configPromise)
      return configPromise

    configPromise = fetch(`config.yml?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.text())
      .then(text => ({
        branch: pick(text, /^\s*branch:\s*['"]?([^'"\s#]+)/m, FALLBACK_CONFIG.branch),
        mediaFolder: pick(text, /^\s*media_folder:\s*['"]?([^'"\s#]+)/m, FALLBACK_CONFIG.mediaFolder),
      }))
      .catch(() => FALLBACK_CONFIG)

    return configPromise
  }

  function toBase64(file) {
    return file.arrayBuffer().then((buffer) => {
      const bytes = new Uint8Array(buffer)
      const CHUNK = 0x8000
      let binary = ''
      for (let i = 0; i < bytes.length; i += CHUNK)
        binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
      return btoa(binary)
    })
  }

  /** 文件名安全化：保留中英文数字与连字符，其余替换成 - */
  function safeFileName(name) {
    const ext = (name.match(/\.[A-Za-z0-9]+$/) || [''])[0].toLowerCase()
    const base = name.slice(0, name.length - ext.length)
      .replace(/[^\w\u4e00-\u9fa5-]+/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '')
    return `${base || 'image'}${ext || '.png'}`
  }

  /** 上传单张图片，返回 { file, url }，url 为可直接写进正文的相对路径 */
  function uploadImage(file, config) {
    if (file.size > MAX_IMAGE_SIZE)
      return Promise.reject(new Error(`${file.name} 超过 10MB，已跳过`))

    const fileName = safeFileName(file.name || 'image.png')
    const path = `${config.mediaFolder.replace(/\/+$/, '')}/${fileName}`

    return toBase64(file)
      .then(content => fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'persistMedia',
          params: {
            branch: config.branch,
            asset: { path, content, encoding: 'base64' },
            options: { commitMessage: `img: 上传 ${path}` },
          },
        }),
      }))
      .then((res) => {
        if (!res.ok)
          throw new Error(`图片上传失败（HTTP ${res.status}）`)
        return res.json().catch(() => ({}))
      })
      .then((data) => {
        const savedPath = (data && data.path) || path
        return { file: fileName, url: `./${savedPath.split('/').pop()}` }
      })
  }

  /** 编辑器控件：包一层 Vditor，与 Decap 的 value / onChange 双向同步 */
  function createVditorControl() {
    const { createClass, h } = window

    return createClass({
      componentDidMount() {
        // Decap 会管页面滚动，给个视口相关的高度比写死像素更实用
        const height = Math.max(480, (window.innerHeight || 900) - 320)
        this.syncing = false

        // Vditor 只有进编辑器才用得上，按需加载
        ensureVditor()
          .then(Vditor => this.mountEditor(Vditor, height))
          .catch((err) => {
            console.error('[vditor] 编辑器加载失败', err)
            if (this.mount)
              this.mount.textContent = '编辑器加载失败，请刷新页面重试'
          })
      },

      mountEditor(Vditor, height) {
        // 加载是异步的，期间组件可能已经卸载
        if (this.unmounted || !this.mount)
          return
        // 兜底：脚本没加载成功（比如命中旧缓存）时给出可操作的提示，而不是整页崩溃
        if (typeof Vditor !== 'function') {
          this.mount.textContent = '编辑器未能加载，请强制刷新页面（Ctrl/Cmd + Shift + R）'
          return
        }

        this.vditor = new Vditor(this.mount, {
          cdn: VDITOR_BASE,
          mode: 'ir',
          height,
          value: this.props.value || '',
          placeholder: '在这里写正文，图片可直接拖拽或粘贴……',
          cache: { enable: false },
          counter: { enable: true, type: 'markdown' },
          outline: { enable: true, position: 'right' },
          resize: { enable: true },
          preview: {
            hljs: { style: 'github', lineNumber: true },
            math: { engine: 'KaTeX' },
          },
          upload: {
            accept: 'image/*',
            multiple: true,
            handler: files => this.handleUpload(files),
          },
          input: (value) => {
            if (!this.syncing)
              this.props.onChange(value)
          },
          // 兜底：个别版本对 value 选项处理不一致，初始化后内容为空时再补一次
          after: () => {
            if (!this.vditor || this.vditor.getValue() || !this.props.value)
              return
            this.syncing = true
            this.vditor.setValue(this.props.value, true)
            this.syncing = false
          },
        })
      },

      // Decap 切换文章时会推入新的 value，这里同步回编辑器
      componentDidUpdate(prevProps) {
        if (!this.vditor || prevProps.value === this.props.value)
          return

        const next = this.props.value || ''
        if (this.vditor.getValue() === next)
          return

        this.syncing = true
        this.vditor.setValue(next, true)
        this.syncing = false
      },

      componentWillUnmount() {
        this.unmounted = true
        if (this.vditor) {
          this.vditor.destroy()
          this.vditor = null
        }
      },

      // Vditor 配置了 upload.handler 后不会自动插入内容，需要自己 insertValue；
      // 返回 string 会被 Vditor 当作错误提示显示，返回 null 表示静默完成。
      handleUpload(files) {
        const list = Array.from(files || [])
        if (!list.length)
          return null

        return readConfig()
          .then(config => Promise.all(list.map(file => uploadImage(file, config))))
          .then((results) => {
            const markdown = results
              .map(r => `![${r.file.replace(/\.[^.]+$/, '')}](${r.url})`)
              .join('\n')
            this.vditor.insertValue(`${markdown}\n`)
            return null
          })
          .catch(err => (err && err.message) || '图片上传失败')
      },

      render() {
        return h(
          'div',
          { className: `vditor-widget ${this.props.classNameWrapper || ''}` },
          h('div', {
            className: 'vditor-widget-mount',
            ref: (el) => { this.mount = el },
          }),
        )
      },
    })
  }

  /** Decap 的预览面板：直接复用 Vditor 的静态渲染 */
  function createVditorPreview() {
    const { createClass, h } = window

    return createClass({
      componentDidMount() { this.renderPreview() },
      componentDidUpdate() { this.renderPreview() },
      componentWillUnmount() { this.unmounted = true },

      renderPreview() {
        if (!this.el)
          return
        ensureVditor().then((Vditor) => {
          if (!this.el || this.unmounted)
            return
          Vditor.preview(this.el, this.props.value || '', {
            cdn: VDITOR_BASE,
            mode: 'light',
            hljs: { style: 'github', lineNumber: true },
          })
        }).catch(() => {})
      },

      render() {
        return h('div', {
          className: 'vditor-preview',
          ref: (el) => { this.el = el },
        })
      },
    })
  }

  /**
   * 右侧预览面板的模板。
   * Decap 默认的 EditorPreview 只是把每个字段按原样堆出来，观感和后台列表一样朴素；
   * 这里接管整篇帖子的预览，让它按博客文章的排版呈现。
   */
  function createPostsPreview() {
    const { createClass, h } = window

    return createClass({
      componentDidMount() { this.renderBody() },
      componentDidUpdate() { this.renderBody() },
      componentWillUnmount() {
        this.unmounted = true
        clearTimeout(this.timer)
      },

      // 正文跟随输入实时重渲染，长文有开销，压一压频率
      renderBody() {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          if (!this.bodyEl || this.unmounted)
            return
          ensureVditor().then((Vditor) => {
            if (!this.bodyEl || this.unmounted)
              return
            Vditor.preview(this.bodyEl, this.props.entry.getIn(['data', 'body']) || '', {
              cdn: VDITOR_BASE,
              mode: 'light',
              hljs: { style: 'github', lineNumber: true },
            })
          }).catch(() => {})
        }, 200)
      },

      render() {
        const data = this.props.entry.getIn(['data'])
        const meta = [data.get('date'), data.get('category')].filter(Boolean)
        const tags = data.get('tags')
        const tagText = tags && tags.size ? tags.join(' / ') : ''

        return h('div', { className: 'post-preview' },
          h('h1', { className: 'post-preview__title' }, data.get('title') || '（未命名）'),
          meta.length ? h('p', { className: 'post-preview__meta' }, meta.join(' · ')) : null,
          tagText ? h('p', { className: 'post-preview__tags' }, tagText) : null,
          h('div', { className: 'post-preview__body', ref: (el) => { this.bodyEl = el } }),
        )
      },
    })
  }

  const Control = createVditorControl()
  const Preview = createVditorPreview()

  try {
    window.CMS.registerWidget('markdown', Control, Preview)
  }
  catch (err) {
    console.warn('[vditor] 覆盖内置 markdown widget 失败；把 admin/config.yml 里 body 字段的 widget 改成 vditor 即可', err)
  }

  // 备用名，覆盖失败时用它兜底
  window.CMS.registerWidget('vditor', Control, Preview)

  // 预览面板跑在独立 iframe 里，主文档的样式不会带进去，需要单独注入
  try {
    window.CMS.registerPreviewStyle(`${VDITOR_BASE}/dist/index.css`)
    window.CMS.registerPreviewStyle(PREVIEW_CSS, { raw: true })
  }
  catch (err) {
    console.warn('[vditor] 注入预览样式失败', err)
  }

  // 接管右侧预览面板
  try {
    window.CMS.registerPreviewTemplate('posts', createPostsPreview())
  }
  catch (err) {
    console.warn('[vditor] 注册自定义预览模板失败', err)
  }

  window.CMS.init()
})()
