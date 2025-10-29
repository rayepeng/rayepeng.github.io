---
title: astro配置笔记
published: 2025-10-29
description: ''
image: 'https://picgo-1258058044.cos.ap-chengdu.myqcloud.com/img/astroconfig.png'
tags: ['博客','折腾']
category: '折腾'
draft: false 
lang: ''
customSlug: 'astro-config-notes'
---


由于xlog已经年久失修，于是在 [@niracler](https://niracler.com/) 的推荐下，将博客迁移到了 astro，最终还是回归到了静态网页，期间增加了一些自定义的功能，如保持和xlog rss订阅链接的兼容，自定义文章url等，代码都是在cursor上使用claude写的

## url trailingSlash配置 + 适配xlog rss

参考了[官方文档](https://docs.astro.build/zh-cn/reference/configuration-reference/#trailingslash) 修改配置文件： `astro.config.mjs`，将 `trailingSlash` 选项修改为 `ignore`

```ts
export default defineConfig({
	site: "https://raye.ink/",
	base: "/",
	trailingSlash: "ignore",
```

然后复制原有的 `rss.xml.ts` 为 `feed.ts`

这样就可以实现自定义rss的源变成了 `https://raye.ink/feed` 

而不再是强制匹配  `https://raye.ink/feed/`，这样folo上订阅我的用户们就不用再操作一遍了

[代码commit 链接](https://github.com/rayepeng/rayepeng.github.io/commit/fd4028122269aadd709a051c313ad5b97797b946)

## 文章url 自定义

主要是默认的文章url 是带上文章标题的，这样复制分享给别人都很不方便，于是还是想自定义文章url

直接看[修改记录](https://github.com/rayepeng/rayepeng.github.io/commit/999613e1a53b51b667cffa3e3918a907ab7a1c42#diff-544dcd1cb4d05890db2dcf497052df475216a57683c346216e43133407b7ea58)吧

要改的地方有几个：
- 首页文章链接
- 文章下一篇链接
- rss生成链接

同时要修改`scripts/new-post.js` 这个文件，这样 `pnpm new-post xxx` 新建文章的时候，也就自动在 frontmatter 上增加了配置项

> ps 目前文章url都是在posts下，和原有的文章url没法兼容，等我找到办法再修改吧

```js
const content = `---
title: ${args[0]}
published: ${getDate()}
description: ''
customSlug: ''
image: ''
tags: []
category: ''
draft: false 
lang: ''
---
`
```

## 首页文章图片显示位置

因为我的文章首页图都是有文字的，而默认的是居中显示缩略图导致文字被遮盖挺难受的

修改 `src/components/PostCard.astro`

```html
<ImageWrapper src={image} basePath={path.join("content/posts/", getDir(entry.id))} alt="Cover Image of the Post"
		  position="left center" 
		  class="w-full h-full">
</ImageWrapper>
```

添加 `position` 属性， `left center` 即可

## 定义rss的返回content-type

因为我修改了 `/feed` 为我的rss订阅，但是部署到静态网页上会变成文件下载，比较奇怪

[代码修改](https://github.com/rayepeng/rayepeng.github.io/commit/72b6553c1e2f99255b91605cffe70d5a48ae77e2)

```ts
	return new Response(rssResponse.body, {
		status: 200,
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
		},
	});
```


本地测试确实通过 `pnpm dev` 是可以的，但是部署到静态网页上就有点问题了

> 经验证，本地静态网页生成之后也是不行的，不过目前的folo上订阅rss好像也没啥问题，那就先这样吧🤣


## 配置github action发布


目前还是用的github pages，但 [@niracler](https://niracler.com/) 说cloudfare pages体验更好，等后面再折腾吧

github发布就非常简单，参考[官方文档](https://docs.astro.build/zh-cn/guides/deploy/github/) 只要在 `.github/workflows` 目录新建 `deploy.yml` 即可，这样再也不需要像 hexo 一样，本地build再deploy了，非常方便，也不会出现我在机器A写的文章，因为忘记push，而导致机器B无法继续写的尴尬了😅

