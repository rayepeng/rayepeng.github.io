---
title: astro配置笔记
published: 2025-10-29
description: ''
image: ''
tags: ['博客','折腾']
category: '折腾'
draft: false 
lang: ''
customSlug: 'astro-config-notes'
---


## url slash配置 + 适配xlog rss

配置文件： `astro.config.mjs`

```ts
export default defineConfig({
	site: "https://raye.ink/",
	base: "/",
	trailingSlash: "ignore",
```


这样就可以实现自定义rss的源变成了 `https://raye.ink/feed` 

而不再是强制匹配  `https://raye.ink/feed/`

[commit 链接](https://github.com/rayepeng/rayepeng.github.io/commit/fd4028122269aadd709a051c313ad5b97797b946)

## 文章url 自定义


直接看[修改记录](https://github.com/rayepeng/rayepeng.github.io/commit/999613e1a53b51b667cffa3e3918a907ab7a1c42#diff-544dcd1cb4d05890db2dcf497052df475216a57683c346216e43133407b7ea58)吧

要改的地方有几个：
- 首页文章链接
- 文章下一篇链接
- rss生成链接

同时要修改`scripts/new-post.js` 这个文件

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

> 经验证，本地静态网页生成之后也是不行的









